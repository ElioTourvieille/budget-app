import {
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/prisma/prisma.service';
  import { CreateAccountDto } from './dto/create-account.dto';
  import { UpdateAccountDto } from './dto/update-account.dto';
  import { UpdateBalanceDto } from './dto/update-balance.dto';
  import { QueryAccountDto } from './dto/query-account.dto';

  @Injectable()
  export class AccountService {
    constructor(private readonly prisma: PrismaService) {}

    // ─── GET ALL ──────────────────────────────────────────────────────

    async getAccounts({ userId, query }: { userId: string; query?: QueryAccountDto }) {
      const accounts = await this.prisma.account.findMany({
        where: { userId, ...(query?.includeInactive ? {} : { isActive: true }) },
        orderBy: { createdAt: 'asc' },
      });

      // Le solde consolidé ne compte que les comptes actifs, même si des
      // comptes désactivés sont inclus dans la réponse (includeInactive).
      const totalBalance = accounts
        .filter((acc) => acc.isActive)
        .reduce((sum, acc) => sum + Number(acc.balance), 0);

      return { accounts, totalBalance };
    }
  
    // ─── GET ONE ──────────────────────────────────────────────────────
  
    async getAccountById({
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
  
    // ─── CREATE ───────────────────────────────────────────────────────
  
    async createAccount({
      userId,
      dto,
    }: {
      userId: string;
      dto: CreateAccountDto;
    }) {
      return this.prisma.account.create({
        data: {
          userId,
          name: dto.name,
          type: dto.type,
          bank: dto.bank,
          color: dto.color ?? this.getDefaultColor(dto.type),
          icon: dto.icon ?? this.getDefaultIcon(dto.type),
        },
      });
    }
  
    // ─── UPDATE ───────────────────────────────────────────────────────
  
    async updateAccount({
      accountId,
      userId,
      dto,
    }: {
      accountId: string;
      userId: string;
      dto: UpdateAccountDto;
    }) {
      await this.assertOwnership({ accountId, userId });
  
      return this.prisma.account.update({
        where: { id: accountId },
        data: dto,
      });
    }
  
    // ─── UPDATE BALANCE (solde manuel) ────────────────────────────────
  
    async updateBalance({
      accountId,
      userId,
      dto,
    }: {
      accountId: string;
      userId: string;
      dto: UpdateBalanceDto;
    }) {
      await this.assertOwnership({ accountId, userId });
  
      return this.prisma.account.update({
        where: { id: accountId },
        data: { balance: dto.balance },
      });
    }
  
    // ─── SOFT DELETE ──────────────────────────────────────────────────
  
    async deleteAccount({
      accountId,
      userId,
    }: {
      accountId: string;
      userId: string;
    }) {
      await this.assertOwnership({ accountId, userId });
  
      // Soft delete — on garde l'historique des transactions
      await this.prisma.account.update({
        where: { id: accountId },
        data: { isActive: false },
      });
  
      return { message: 'Compte désactivé avec succès.' };
    }
  
    // ─── PRIVATE ──────────────────────────────────────────────────────
  
    private async assertOwnership({
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
  
    private getDefaultColor(type: string): string {
      const colors: Record<string, string> = {
        CHECKING: '#4A7C59',
        JOINT: '#2563EB',
        SAVINGS: '#7C3AED',
        THIRD_PILLAR: '#B45309',
        CASH: '#6B7280',
        OTHER: '#374151',
      };
      return colors[type] ?? '#374151';
    }
  
    private getDefaultIcon(type: string): string {
      const icons: Record<string, string> = {
        CHECKING: 'wallet',
        JOINT: 'users',
        SAVINGS: 'piggy-bank',
        THIRD_PILLAR: 'shield',
        CASH: 'banknote',
        OTHER: 'circle',
      };
      return icons[type] ?? 'circle';
    }
  }