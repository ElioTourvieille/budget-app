import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class TransferService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── GET ALL ──────────────────────────────────────────────────────

  async getTransfers({ userId }: { userId: string }) {
    return this.prisma.transfer.findMany({
      where: {
        OR: [{ from: { userId } }, { to: { userId } }],
      },
      include: {
        from: { select: { id: true, name: true, color: true, icon: true } },
        to: { select: { id: true, name: true, color: true, icon: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  // ─── CREATE ───────────────────────────────────────────────────────

  async createTransfer({ userId, dto }: { userId: string; dto: CreateTransferDto }) {
    if (dto.fromAccountId === dto.toAccountId) {
      throw new BadRequestException('Le compte source et le compte destination doivent être différents.');
    }

    await this.assertAccountOwnership({ accountId: dto.fromAccountId, userId });
    await this.assertAccountOwnership({ accountId: dto.toAccountId, userId });

    const [transfer] = await this.prisma.$transaction([
      this.prisma.transfer.create({
        data: {
          fromAccount: dto.fromAccountId,
          toAccount: dto.toAccountId,
          amount: dto.amount,
          date: dto.date ?? new Date(),
          note: dto.note,
        },
        include: {
          from: { select: { id: true, name: true, color: true, icon: true } },
          to: { select: { id: true, name: true, color: true, icon: true } },
        },
      }),
      this.prisma.account.update({
        where: { id: dto.fromAccountId },
        data: { balance: { decrement: dto.amount } },
      }),
      this.prisma.account.update({
        where: { id: dto.toAccountId },
        data: { balance: { increment: dto.amount } },
      }),
    ]);

    return transfer;
  }

  // ─── DELETE ───────────────────────────────────────────────────────

  async deleteTransfer({ transferId, userId }: { transferId: string; userId: string }) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: { from: true, to: true },
    });

    if (!transfer) throw new NotFoundException('Virement introuvable.');
    if (transfer.from.userId !== userId && transfer.to.userId !== userId) {
      throw new ForbiddenException();
    }

    await this.prisma.$transaction([
      this.prisma.transfer.delete({ where: { id: transferId } }),
      this.prisma.account.update({
        where: { id: transfer.fromAccount },
        data: { balance: { increment: Number(transfer.amount) } },
      }),
      this.prisma.account.update({
        where: { id: transfer.toAccount },
        data: { balance: { decrement: Number(transfer.amount) } },
      }),
    ]);

    return { message: 'Virement supprimé.' };
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────

  private async assertAccountOwnership({
    accountId,
    userId,
  }: {
    accountId: string;
    userId: string;
  }) {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });

    if (!account) throw new NotFoundException('Compte introuvable.');
    if (account.userId !== userId) throw new ForbiddenException();

    return account;
  }
}
