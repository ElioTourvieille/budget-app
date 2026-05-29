import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Goal } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { QueryGoalDto } from './dto/query-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── GET ALL ──────────────────────────────────────────────────────

  async getGoals({ userId, query }: { userId: string; query: QueryGoalDto }) {
    const goals = await this.prisma.goal.findMany({
      where: {
        userId,
        ...(query.type !== undefined && { type: query.type }),
        ...(query.isCompleted !== undefined && { isCompleted: query.isCompleted }),
      },
      orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
    });

    return goals.map((goal) => ({ ...goal, ...this.computeProgress(goal) }));
  }

  // ─── GET ONE ──────────────────────────────────────────────────────

  async getGoalById({ goalId, userId }: { goalId: string; userId: string }) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: { contributions: { orderBy: { date: 'desc' } } },
    });

    if (!goal) throw new NotFoundException('Objectif introuvable.');
    if (goal.userId !== userId) throw new ForbiddenException();

    return { ...goal, ...this.computeProgress(goal) };
  }

  // ─── CREATE ───────────────────────────────────────────────────────

  async createGoal({ userId, dto }: { userId: string; dto: CreateGoalDto }) {
    return this.prisma.goal.create({
      data: {
        userId,
        name: dto.name,
        icon: dto.icon,
        targetAmount: dto.targetAmount,
        monthlyTarget: dto.monthlyTarget,
        type: dto.type,
        targetDate: dto.targetDate,
      },
    });
  }

  // ─── UPDATE ───────────────────────────────────────────────────────

  async updateGoal({
    goalId,
    userId,
    dto,
  }: {
    goalId: string;
    userId: string;
    dto: UpdateGoalDto;
  }) {
    await this.assertOwnership({ goalId, userId });

    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.targetAmount !== undefined && { targetAmount: dto.targetAmount }),
        ...(dto.monthlyTarget !== undefined && { monthlyTarget: dto.monthlyTarget }),
        ...(dto.targetDate !== undefined && { targetDate: dto.targetDate }),
      },
    });
  }

  // ─── MARK COMPLETE ────────────────────────────────────────────────

  async completeGoal({ goalId, userId }: { goalId: string; userId: string }) {
    await this.assertOwnership({ goalId, userId });

    return this.prisma.goal.update({
      where: { id: goalId },
      data: { isCompleted: true },
    });
  }

  // ─── DELETE ───────────────────────────────────────────────────────

  async deleteGoal({ goalId, userId }: { goalId: string; userId: string }) {
    await this.assertOwnership({ goalId, userId });

    await this.prisma.goal.delete({ where: { id: goalId } });

    return { message: 'Objectif supprimé.' };
  }

  // ─── CONTRIBUTIONS ────────────────────────────────────────────────

  async addContribution({
    goalId,
    userId,
    dto,
  }: {
    goalId: string;
    userId: string;
    dto: CreateContributionDto;
  }) {
    const goal = await this.assertOwnership({ goalId, userId });

    const newAmount = Number(goal.currentAmount) + dto.amount;
    const isCompleted = newAmount >= Number(goal.targetAmount);

    const [contribution] = await this.prisma.$transaction([
      this.prisma.goalContribution.create({
        data: {
          goalId,
          amount: dto.amount,
          date: dto.date ?? new Date(),
          note: dto.note,
        },
      }),
      this.prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: newAmount,
          ...(isCompleted && { isCompleted: true }),
        },
      }),
    ]);

    return contribution;
  }

  async deleteContribution({
    goalId,
    contributionId,
    userId,
  }: {
    goalId: string;
    contributionId: string;
    userId: string;
  }) {
    const goal = await this.assertOwnership({ goalId, userId });

    const contribution = await this.prisma.goalContribution.findUnique({
      where: { id: contributionId },
    });

    if (!contribution || contribution.goalId !== goalId) {
      throw new NotFoundException('Contribution introuvable.');
    }

    const newAmount = Math.max(0, Number(goal.currentAmount) - Number(contribution.amount));

    await this.prisma.$transaction([
      this.prisma.goalContribution.delete({ where: { id: contributionId } }),
      this.prisma.goal.update({
        where: { id: goalId },
        data: { currentAmount: newAmount },
      }),
    ]);

    return { message: 'Contribution supprimée.' };
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────

  private async assertOwnership({ goalId, userId }: { goalId: string; userId: string }) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });

    if (!goal) throw new NotFoundException('Objectif introuvable.');
    if (goal.userId !== userId) throw new ForbiddenException();

    return goal;
  }

  private computeProgress(goal: Pick<Goal, 'targetAmount' | 'currentAmount' | 'monthlyTarget' | 'targetDate'>) {
    const target = Number(goal.targetAmount);
    const current = Number(goal.currentAmount);
    const remaining = Math.max(0, target - current);
    const progressPercent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

    const result: {
      progressPercent: number;
      remaining: number;
      monthsToTarget?: number | null;
      estimatedCompletionDate?: Date;
      isOnTrack?: boolean;
    } = { progressPercent, remaining };

    if (goal.monthlyTarget) {
      const monthly = Number(goal.monthlyTarget);
      const monthsToTarget = monthly > 0 ? Math.ceil(remaining / monthly) : null;
      result.monthsToTarget = monthsToTarget;

      if (monthsToTarget !== null) {
        const estimatedDate = new Date();
        estimatedDate.setMonth(estimatedDate.getMonth() + monthsToTarget);
        result.estimatedCompletionDate = estimatedDate;
      }
    }

    if (goal.targetDate && goal.monthlyTarget) {
      const monthsLeft = this.monthsUntil(goal.targetDate);
      const monthly = Number(goal.monthlyTarget);
      const neededMonthly = monthsLeft > 0 ? remaining / monthsLeft : Infinity;
      result.isOnTrack = monthly >= neededMonthly;
    }

    return result;
  }

  private monthsUntil(date: Date): number {
    const now = new Date();
    return (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
  }
}
