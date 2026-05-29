import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── GET ALL ──────────────────────────────────────────────────────

  async getCategories({
    userId,
    query,
  }: {
    userId: string;
    query: QueryCategoryDto;
  }) {
    const { isSystem } = query;

    if (isSystem === true) {
      return this.prisma.category.findMany({
        where: { isSystem: true },
        orderBy: { name: 'asc' },
      });
    }

    if (isSystem === false) {
      return this.prisma.category.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
      });
    }

    // Default: catégories système + catégories custom de l'user
    return this.prisma.category.findMany({
      where: { OR: [{ isSystem: true }, { userId }] },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  // ─── GET ONE ──────────────────────────────────────────────────────

  async getCategoryById({
    categoryId,
    userId,
  }: {
    categoryId: string;
    userId: string;
  }) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) throw new NotFoundException('Catégorie introuvable.');
    if (!category.isSystem && category.userId !== userId) throw new ForbiddenException();

    return category;
  }

  // ─── CREATE ───────────────────────────────────────────────────────

  async createCategory({ userId, dto }: { userId: string; dto: CreateCategoryDto }) {
    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name,
        icon: dto.icon,
        color: dto.color,
        isSystem: false,
      },
    });
  }

  // ─── UPDATE ───────────────────────────────────────────────────────

  async updateCategory({
    categoryId,
    userId,
    dto,
  }: {
    categoryId: string;
    userId: string;
    dto: UpdateCategoryDto;
  }) {
    await this.assertCustomOwnership({ categoryId, userId });

    return this.prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  // ─── DELETE ───────────────────────────────────────────────────────

  async deleteCategory({ categoryId, userId }: { categoryId: string; userId: string }) {
    await this.assertCustomOwnership({ categoryId, userId });

    const budgetCount = await this.prisma.budget.count({ where: { categoryId } });

    if (budgetCount > 0) {
      throw new BadRequestException(
        'Cette catégorie est liée à des budgets actifs. Supprimez-les avant de supprimer la catégorie.',
      );
    }

    await this.prisma.category.delete({ where: { id: categoryId } });

    return { message: 'Catégorie supprimée.' };
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────

  private async assertCustomOwnership({
    categoryId,
    userId,
  }: {
    categoryId: string;
    userId: string;
  }) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });

    if (!category) throw new NotFoundException('Catégorie introuvable.');
    if (category.isSystem)
      throw new ForbiddenException('Les catégories système ne peuvent pas être modifiées.');
    if (category.userId !== userId) throw new ForbiddenException();

    return category;
  }
}
