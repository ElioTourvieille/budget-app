import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Frequency } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';

@Injectable()
export class RecurringService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── GET ALL ──────────────────────────────────────────────────────

  async getRecurring({ userId }: { userId: string }) {
    return this.prisma.recurringTransaction.findMany({
      where: { userId },
      include: {
        account: { select: { id: true, name: true, color: true, icon: true } },
        category: true,
      },
      orderBy: [{ isActive: 'desc' }, { nextDate: 'asc' }],
    });
  }

  // ─── CREATE ───────────────────────────────────────────────────────

  async createRecurring({
    userId,
    dto,
  }: {
    userId: string;
    dto: CreateRecurringDto;
  }) {
    await this.assertAccountOwnership({ accountId: dto.accountId, userId });

    const created = await this.prisma.recurringTransaction.create({
      data: {
        userId,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        type: dto.type,
        name: dto.name,
        merchant: dto.merchant,
        amount: dto.amount,
        frequency: dto.frequency,
        nextDate: new Date(dto.nextDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });

    // Si la première échéance est déjà passée (ou aujourd'hui), génère
    // tout de suite la transaction correspondante plutôt que d'attendre le cron.
    await this.generateDueTransactions({ userId });

    return this.prisma.recurringTransaction.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        account: { select: { id: true, name: true, color: true, icon: true } },
        category: true,
      },
    });
  }

  // ─── UPDATE ───────────────────────────────────────────────────────

  async updateRecurring({
    recurringId,
    userId,
    dto,
  }: {
    recurringId: string;
    userId: string;
    dto: UpdateRecurringDto;
  }) {
    await this.assertOwnership({ recurringId, userId });

    return this.prisma.recurringTransaction.update({
      where: { id: recurringId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.merchant !== undefined && { merchant: dto.merchant }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.frequency !== undefined && { frequency: dto.frequency }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: {
        account: { select: { id: true, name: true, color: true, icon: true } },
        category: true,
      },
    });
  }

  // ─── DELETE ───────────────────────────────────────────────────────

  async deleteRecurring({
    recurringId,
    userId,
  }: {
    recurringId: string;
    userId: string;
  }) {
    await this.assertOwnership({ recurringId, userId });

    // Les transactions déjà générées sont conservées (recurringId passe à null,
    // cf. relation optionnelle Transaction.recurring dans le schéma).
    await this.prisma.recurringTransaction.delete({
      where: { id: recurringId },
    });

    return { message: 'Transaction récurrente supprimée.' };
  }

  // ─── GÉNÉRATION AUTOMATIQUE ───────────────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron() {
    await this.generateDueTransactions();
  }

  async generateDueTransactions({ userId }: { userId?: string } = {}) {
    const due = await this.prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextDate: { lte: new Date() },
        ...(userId && { userId }),
      },
    });

    let generated = 0;

    for (const recurring of due) {
      let cursor = new Date(recurring.nextDate);
      let iterations = 0;

      // Rattrape les échéances manquées (ex : app arrêtée plusieurs jours),
      // plafonné pour éviter toute boucle infinie en cas de config invalide.
      while (cursor.getTime() <= Date.now() && iterations < 24) {
        await this.prisma.transaction.create({
          data: {
            userId: recurring.userId,
            accountId: recurring.accountId,
            categoryId: recurring.categoryId,
            amount: recurring.amount,
            type: recurring.type,
            description: recurring.name,
            merchant: recurring.merchant,
            date: cursor,
            isRecurring: true,
            recurringId: recurring.id,
          },
        });

        await this.prisma.account.update({
          where: { id: recurring.accountId },
          data: {
            balance:
              recurring.type === 'INCOME'
                ? { increment: recurring.amount }
                : { decrement: recurring.amount },
          },
        });

        generated += 1;
        cursor = this.advance(cursor, recurring.frequency);
        iterations += 1;
      }

      const isPastEnd = !!recurring.endDate && cursor > recurring.endDate;

      await this.prisma.recurringTransaction.update({
        where: { id: recurring.id },
        data: {
          nextDate: cursor,
          ...(isPastEnd && { isActive: false }),
        },
      });
    }

    return { generated };
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────

  private advance(date: Date, frequency: Frequency): Date {
    const next = new Date(date);
    switch (frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'BIWEEKLY':
        next.setDate(next.getDate() + 14);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }

  private async assertOwnership({
    recurringId,
    userId,
  }: {
    recurringId: string;
    userId: string;
  }) {
    const recurring = await this.prisma.recurringTransaction.findUnique({
      where: { id: recurringId },
    });

    if (!recurring)
      throw new NotFoundException('Transaction récurrente introuvable.');
    if (recurring.userId !== userId) throw new ForbiddenException();

    return recurring;
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
