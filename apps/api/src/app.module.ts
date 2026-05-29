import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { BudgetModule } from './budget/budget.module';
import { CategoryModule } from './category/category.module';
import { GoalModule } from './goal/goal.module';
import { InsightModule } from './insight/insight.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    AccountModule,
    CategoryModule,
    TransactionModule,
    BudgetModule,
    GoalModule,
    InsightModule,
  ],
})
export class AppModule {}