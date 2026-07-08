import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { BudgetModule } from './budget/budget.module';
import { CategoryModule } from './category/category.module';
import { GoalModule } from './goal/goal.module';
import { InsightModule } from './insight/insight.module';
import { TransferModule } from './transfer/transfer.module';
import { RecurringModule } from './recurring/recurring.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    AccountModule,
    CategoryModule,
    TransactionModule,
    BudgetModule,
    GoalModule,
    InsightModule,
    TransferModule,
    RecurringModule,
  ],
})
export class AppModule {}
