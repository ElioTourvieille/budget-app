import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/jwt.strategy';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { QueryBudgetDto } from './dto/query-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  async getBudgets(
    @Query() query: QueryBudgetDto,
    @Request() req: RequestWithUser,
  ) {
    return this.budgetService.getBudgets({ userId: req.user.userId, query });
  }

  @Get('summary')
  async getSummary(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Request() req: RequestWithUser,
  ) {
    return this.budgetService.getSummary({ userId: req.user.userId, month, year });
  }

  @Get(':id')
  async getBudget(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.budgetService.getBudgetById({ budgetId: id, userId: req.user.userId });
  }

  @Post()
  async createBudget(
    @Body() body: CreateBudgetDto,
    @Request() req: RequestWithUser,
  ) {
    return this.budgetService.createBudget({ userId: req.user.userId, dto: body });
  }

  @Patch(':id')
  async updateBudget(
    @Param('id') id: string,
    @Body() body: UpdateBudgetDto,
    @Request() req: RequestWithUser,
  ) {
    return this.budgetService.updateBudget({
      budgetId: id,
      userId: req.user.userId,
      dto: body,
    });
  }

  @Delete(':id')
  async deleteBudget(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.budgetService.deleteBudget({ budgetId: id, userId: req.user.userId });
  }
}
