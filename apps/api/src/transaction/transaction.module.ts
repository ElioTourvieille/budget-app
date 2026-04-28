import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [
    MulterModule.register({ storage: undefined }),
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}