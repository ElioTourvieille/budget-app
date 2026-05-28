import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { QueryBudgetDto } from './dto/query-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── GET ALL ──────────────────────────────────────────────────────

  async getBudgets({
    userId,
    query,
  }: {
    userId: string;
    query: QueryBudgetDto;
  }) {
    return this.prisma.budget.findMany({
      where: {
        userId,
        ...(query.month !== undefined && { month: query.month }),
        ...(query.year !== undefined && { year: query.year }),
      },
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  // ─── SUMMARY (budgets + dépenses réelles) ─────────────────────────

  async getSummary({
    userId,
    month,
    year,
  }: {
    userId: string;
    month: number;
    year: number;
  }) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const summaries = await Promise.all(
      budgets.map(async (budget) => {
        const aggregate = await this.prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: TransactionType.EXPENSE,
            date: { gte: startDate, lt: endDate },
          },
          _sum: { amount: true },
        });

        const spent = Number(aggregate._sum.amount ?? 0);
        const budgeted = Number(budget.amount);

        return {
          ...budget,
          spent,
          remaining: budgeted - spent,
          percentage: budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0,
        };
      }),
    );

    const totalBudgeted = summaries.reduce((s, b) => s + Number(b.amount), 0);
    const totalSpent = summaries.reduce((s, b) => s + b.spent, 0);

    return {
      budgets: summaries,
      totalBudgeted,
      totalSpent,
      totalRemaining: totalBudgeted - totalSpent,
    };
  }

  // ─── GET ONE ──────────────────────────────────────────────────────

  async getBudgetById({ budgetId, userId }: { budgetId: string; userId: string }) {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
      include: { category: true },
    });

    if (!budget) throw new NotFoundException('Budget introuvable.');
    if (budget.userId !== userId) throw new ForbiddenException();

    return budget;
  }

  // ─── CREATE (upsert) ──────────────────────────────────────────────

  async createBudget({ userId, dto }: { userId: string; dto: CreateBudgetDto }) {
    const existing = await this.prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId: dto.categoryId,
          month: dto.month,
          year: dto.year,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Un budget existe déjà pour cette catégorie ce mois-ci. Utilisez PATCH pour le modifier.',
      );
    }

    return this.prisma.budget.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        month: dto.month,
        year: dto.year,
      },
      include: { category: true },
    });
  }

  // ─── UPDATE ───────────────────────────────────────────────────────

  async updateBudget({
    budgetId,
    userId,
    dto,
  }: {
    budgetId: string;
    userId: string;
    dto: UpdateBudgetDto;
  }) {
    await this.assertOwnership({ budgetId, userId });

    return this.prisma.budget.update({
      where: { id: budgetId },
      data: { amount: dto.amount },
      include: { category: true },
    });
  }

  // ─── DELETE ───────────────────────────────────────────────────────

  async deleteBudget({ budgetId, userId }: { budgetId: string; userId: string }) {
    await this.assertOwnership({ budgetId, userId });

    await this.prisma.budget.delete({ where: { id: budgetId } });

    return { message: 'Budget supprimé.' };
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────

  private async assertOwnership({
    budgetId,
    userId,
  }: {
    budgetId: string;
    userId: string;
  }) {
    const budget = await this.prisma.budget.findUnique({ where: { id: budgetId } });

    if (!budget) throw new NotFoundException('Budget introuvable.');
    if (budget.userId !== userId) throw new ForbiddenException();

    return budget;
  }
}
