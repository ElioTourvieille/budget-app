import {
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { Prisma } from '@prisma/client';
  import { PrismaService } from 'src/prisma/prisma.service';
  import { CreateTransactionDto } from './dto/create-transaction.dto';
  import { UpdateTransactionDto } from './dto/update-transaction.dto';
  import { QueryTransactionDto } from './dto/query-transaction.dto';
  
  @Injectable()
  export class TransactionService {
    constructor(private readonly prisma: PrismaService) {}
  
    // ─── GET ALL (avec filtres) ───────────────────────────────────────
  
    async getTransactions({
      userId,
      query,
    }: {
      userId: string;
      query: QueryTransactionDto;
    }) {
      const where: Prisma.TransactionWhereInput = {
        userId,
        ...(query.accountId && { accountId: query.accountId }),
        ...(query.categoryId && { categoryId: query.categoryId }),
        ...(query.type && { type: query.type }),
        ...(query.reimbursementStatus && {
          reimbursementStatus: query.reimbursementStatus,
        }),
        // Filtre par mois/année
        ...(query.month &&
          query.year && {
            date: {
              gte: new Date(query.year, query.month - 1, 1),
              lt: new Date(query.year, query.month, 1),
            },
          }),
        // Filtre par range de dates
        ...(!query.month &&
          query.dateFrom && {
            date: {
              gte: new Date(query.dateFrom),
              ...(query.dateTo && { lte: new Date(query.dateTo) }),
            },
          }),
      };
  
      const [transactions, total] = await Promise.all([
        this.prisma.transaction.findMany({
          where,
          include: {
            category: true,
            account: { select: { id: true, name: true, color: true, icon: true } },
          },
          orderBy: { date: 'desc' },
          take: query.limit,
          skip: query.offset,
        }),
        this.prisma.transaction.count({ where }),
      ]);
  
      // Calcul du résumé du mois
      const summary = await this.getMonthlySummary({ userId, where });
  
      return { transactions, total, summary };
    }
  
    // ─── GET ONE ──────────────────────────────────────────────────────
  
    async getTransactionById({
      transactionId,
      userId,
    }: {
      transactionId: string;
      userId: string;
    }) {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { category: true, account: true },
      });
  
      if (!transaction) throw new NotFoundException('Transaction introuvable.');
      if (transaction.userId !== userId) throw new ForbiddenException();
  
      return transaction;
    }
  
    // ─── CREATE ───────────────────────────────────────────────────────
  
    async createTransaction({
      userId,
      dto,
    }: {
      userId: string;
      dto: CreateTransactionDto;
    }) {
      // Vérifie que le compte appartient à l'utilisateur
      await this.assertAccountOwnership({
        accountId: dto.accountId,
        userId,
      });
  
      const transaction = await this.prisma.transaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          categoryId: dto.categoryId,
          amount: dto.amount,
          type: dto.type,
          merchant: dto.merchant,
          description: dto.description,
          date: new Date(dto.date),
          isRecurring: dto.isRecurring ?? false,
          recurringId: dto.recurringId,
          notes: dto.notes,
          isReimbursable: dto.isReimbursable ?? false,
          insuranceType: dto.insuranceType,
          reimbursementStatus: dto.isReimbursable ? 'PENDING' : null,
        },
        include: { category: true, account: true },
      });
  
      // Met à jour le solde du compte
      await this.updateAccountBalance({
        accountId: dto.accountId,
        amount: dto.amount,
        type: dto.type,
      });
  
      return transaction;
    }
  
    // ─── UPDATE ───────────────────────────────────────────────────────
  
    async updateTransaction({
      transactionId,
      userId,
      dto,
    }: {
      transactionId: string;
      userId: string;
      dto: UpdateTransactionDto;
    }) {
      const existing = await this.assertOwnership({ transactionId, userId });
  
      // Si on marque comme remboursé complètement
      const reimbursementStatus =
        dto.reimbursedAmount &&
        dto.reimbursedAmount >= Number(existing.amount)
          ? 'COMPLETED'
          : dto.reimbursementStatus;
  
      return this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          ...dto,
          date: dto.date ? new Date(dto.date) : undefined,
          reimbursedAt: dto.reimbursedAt ? new Date(dto.reimbursedAt) : undefined,
          reimbursementStatus,
        },
        include: { category: true, account: true },
      });
    }
  
    // ─── DELETE ───────────────────────────────────────────────────────
  
    async deleteTransaction({
      transactionId,
      userId,
    }: {
      transactionId: string;
      userId: string;
    }) {
      const transaction = await this.assertOwnership({ transactionId, userId });
  
      await this.prisma.transaction.delete({ where: { id: transactionId } });
  
      // Annule l'effet sur le solde du compte
      await this.updateAccountBalance({
        accountId: transaction.accountId,
        amount: Number(transaction.amount),
        type: transaction.type,
        reverse: true,
      });
  
      return { message: 'Transaction supprimée.' };
    }
  
    // ─── REMBOURSEMENTS EN ATTENTE ────────────────────────────────────
  
    async getPendingReimbursements({ userId }: { userId: string }) {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          isReimbursable: true,
          reimbursementStatus: { in: ['PENDING', 'PARTIAL'] },
        },
        include: { category: true, account: true },
        orderBy: { date: 'desc' },
      });
  
      const totalPending = transactions.reduce((sum, t) => {
        const reimbursed = Number(t.reimbursedAmount ?? 0);
        return sum + (Number(t.amount) - reimbursed);
      }, 0);
  
      return { transactions, totalPending };
    }
  
    // ─── IMPORT CSV ───────────────────────────────────────────────────
  
    async importFromCsv({
      userId,
      accountId,
      csvContent,
    }: {
      userId: string;
      accountId: string;
      csvContent: string;
    }) {
      await this.assertAccountOwnership({ accountId, userId });
  
      const rows = this.parseCsv(csvContent);
      const created = [];
      const skipped = [];
  
      for (const row of rows) {
        // Vérifie les doublons (même date + même montant + même merchant)
        const duplicate = await this.prisma.transaction.findFirst({
          where: {
            userId,
            accountId,
            amount: Math.abs(row.amount),
            date: row.date,
            merchant: row.merchant,
          },
        });
  
        if (duplicate) {
          skipped.push(row);
          continue;
        }
  
        const transaction = await this.prisma.transaction.create({
          data: {
            userId,
            accountId,
            amount: Math.abs(row.amount),
            type: row.amount < 0 ? 'EXPENSE' : 'INCOME',
            merchant: row.merchant,
            description: row.description,
            date: row.date,
          },
        });
  
        created.push(transaction);
      }
  
      // Recalcule le solde du compte depuis toutes les transactions
      await this.recalculateAccountBalance({ accountId });
  
      return {
        imported: created.length,
        skipped: skipped.length,
        transactions: created,
      };
    }
  
    // ─── PRIVATE ──────────────────────────────────────────────────────
  
    private async getMonthlySummary({
      userId,
      where,
    }: {
      userId: string;
      where: Prisma.TransactionWhereInput;
    }) {
      const transactions = await this.prisma.transaction.findMany({
        where: { ...where, userId },
        select: { amount: true, type: true },
      });
  
      const income = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);
  
      const expenses = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);
  
      return {
        income,
        expenses,
        remaining: income - expenses,
      };
    }
  
    private async updateAccountBalance({
      accountId,
      amount,
      type,
      reverse = false,
    }: {
      accountId: string;
      amount: number;
      type: string;
      reverse?: boolean;
    }) {
      const isIncome = type === 'INCOME';
      const shouldAdd = reverse ? !isIncome : isIncome;
  
      await this.prisma.account.update({
        where: { id: accountId },
        data: {
          balance: shouldAdd
            ? { increment: amount }
            : { decrement: amount },
        },
      });
    }
  
    private async recalculateAccountBalance({
      accountId,
    }: {
      accountId: string;
    }) {
      const transactions = await this.prisma.transaction.findMany({
        where: { accountId },
        select: { amount: true, type: true },
      });
  
      const balance = transactions.reduce((sum, t) => {
        return t.type === 'INCOME'
          ? sum + Number(t.amount)
          : sum - Number(t.amount);
      }, 0);
  
      await this.prisma.account.update({
        where: { id: accountId },
        data: { balance },
      });
    }
  
    private parseCsv(csvContent: string) {
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(';').map((h) => h.trim().toLowerCase());
  
      return lines.slice(1).map((line) => {
        const values = line.split(';').map((v) => v.trim().replace(/"/g, ''));
  
        // Format BCGE & Neon — on normalise les deux
        // BCGE:  date;description;montant
        // Neon:  date;merchant;amount;description
        const raw: Record<string, string> = {};
        headers.forEach((h, i) => (raw[h] = values[i]));
  
        const amount = parseFloat(
          (raw['montant'] || raw['amount'] || '0').replace(',', '.'),
        );
        const dateRaw = raw['date'] || raw['datum'] || '';
        const date = new Date(dateRaw);
  
        return {
          date,
          amount,
          merchant: raw['merchant'] || raw['beneficiaire'] || raw['description'] || '',
          description: raw['description'] || raw['details'] || '',
        };
      });
    }
  
    private async assertOwnership({
      transactionId,
      userId,
    }: {
      transactionId: string;
      userId: string;
    }) {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
      });
  
      if (!transaction) throw new NotFoundException('Transaction introuvable.');
      if (transaction.userId !== userId) throw new ForbiddenException();
  
      return transaction;
    }
  
    private async assertAccountOwnership({
      accountId,
      userId,
    }: {
      accountId: string;
      userId: string;
    }) {
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });
  
      if (!account) throw new NotFoundException('Compte introuvable.');
      if (account.userId !== userId) throw new ForbiddenException();
  
      return account;
    }
  }