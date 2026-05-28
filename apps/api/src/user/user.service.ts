import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById({ userId }: { userId: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        avatarUrl: true,
        createdAt: true,
        // On n'expose jamais le password
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    return user;
  }

  async updateUser({
    userId,
    data,
  }: {
    userId: string;
    data: { firstName?: string; avatarUrl?: string };
  }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return user;
  }
}