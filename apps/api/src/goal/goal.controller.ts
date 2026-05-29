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
import { CreateContributionDto } from './dto/create-contribution.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { QueryGoalDto } from './dto/query-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalService } from './goal.service';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Get()
  async getGoals(@Query() query: QueryGoalDto, @Request() req: RequestWithUser) {
    return this.goalService.getGoals({ userId: req.user.userId, query });
  }

  @Get(':id')
  async getGoal(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.goalService.getGoalById({ goalId: id, userId: req.user.userId });
  }

  @Post()
  async createGoal(@Body() body: CreateGoalDto, @Request() req: RequestWithUser) {
    return this.goalService.createGoal({ userId: req.user.userId, dto: body });
  }

  @Patch(':id')
  async updateGoal(
    @Param('id') id: string,
    @Body() body: UpdateGoalDto,
    @Request() req: RequestWithUser,
  ) {
    return this.goalService.updateGoal({ goalId: id, userId: req.user.userId, dto: body });
  }

  @Patch(':id/complete')
  async completeGoal(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.goalService.completeGoal({ goalId: id, userId: req.user.userId });
  }

  @Delete(':id')
  async deleteGoal(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.goalService.deleteGoal({ goalId: id, userId: req.user.userId });
  }

  @Post(':id/contributions')
  async addContribution(
    @Param('id') id: string,
    @Body() body: CreateContributionDto,
    @Request() req: RequestWithUser,
  ) {
    return this.goalService.addContribution({
      goalId: id,
      userId: req.user.userId,
      dto: body,
    });
  }

  @Delete(':id/contributions/:contributionId')
  async deleteContribution(
    @Param('id') id: string,
    @Param('contributionId') contributionId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.goalService.deleteContribution({
      goalId: id,
      contributionId,
      userId: req.user.userId,
    });
  }
}
