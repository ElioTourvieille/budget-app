import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/jwt.strategy';
import { GenerateInsightDto } from './dto/generate-insight.dto';
import { InsightService } from './insight.service';

@Controller('insights')
@UseGuards(JwtAuthGuard)
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  @Get()
  async generateInsight(
    @Query() query: GenerateInsightDto,
    @Request() req: RequestWithUser,
  ) {
    return this.insightService.generateInsight({ userId: req.user.userId, dto: query });
  }
}
