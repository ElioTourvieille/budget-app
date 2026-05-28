import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';

@Module({
  imports: [PrismaModule],
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule {}
