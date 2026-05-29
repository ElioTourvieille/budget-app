import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/jwt.strategy';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getCategories(
    @Query() query: QueryCategoryDto,
    @Request() req: RequestWithUser,
  ) {
    return this.categoryService.getCategories({ userId: req.user.userId, query });
  }

  @Get(':id')
  async getCategory(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.categoryService.getCategoryById({ categoryId: id, userId: req.user.userId });
  }

  @Post()
  async createCategory(
    @Body() body: CreateCategoryDto,
    @Request() req: RequestWithUser,
  ) {
    return this.categoryService.createCategory({ userId: req.user.userId, dto: body });
  }

  @Patch(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
    @Request() req: RequestWithUser,
  ) {
    return this.categoryService.updateCategory({
      categoryId: id,
      userId: req.user.userId,
      dto: body,
    });
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.categoryService.deleteCategory({ categoryId: id, userId: req.user.userId });
  }
}
