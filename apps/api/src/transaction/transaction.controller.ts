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
    UploadedFile,
    UseGuards,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { TransactionService } from './transaction.service';
  import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
  import { RequestWithUser } from 'src/auth/jwt.strategy';
  import { CreateTransactionDto } from './dto/create-transaction.dto';
  import { UpdateTransactionDto } from './dto/update-transaction.dto';
  import { QueryTransactionDto } from './dto/query-transaction.dto';
  
  @Controller('transactions')
  @UseGuards(JwtAuthGuard)
  export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}
  
    @Get()
    async getTransactions(
      @Query() query: QueryTransactionDto,
      @Request() req: RequestWithUser,
    ) {
      return this.transactionService.getTransactions({
        userId: req.user.userId,
        query,
      });
    }
  
    @Get('reimbursements/pending')
    async getPendingReimbursements(@Request() req: RequestWithUser) {
      return this.transactionService.getPendingReimbursements({
        userId: req.user.userId,
      });
    }
  
    @Get(':id')
    async getTransaction(
      @Param('id') id: string,
      @Request() req: RequestWithUser,
    ) {
      return this.transactionService.getTransactionById({
        transactionId: id,
        userId: req.user.userId,
      });
    }
  
    @Post()
    async createTransaction(
      @Body() body: CreateTransactionDto,
      @Request() req: RequestWithUser,
    ) {
      return this.transactionService.createTransaction({
        userId: req.user.userId,
        dto: body,
      });
    }
  
    @Post('import/csv')
    @UseInterceptors(FileInterceptor('file'))
    async importCsv(
      @UploadedFile() file: Express.Multer.File,
      @Body('accountId') accountId: string,
      @Request() req: RequestWithUser,
    ) {
      const csvContent = file.buffer.toString('utf-8');
      return this.transactionService.importFromCsv({
        userId: req.user.userId,
        accountId,
        csvContent,
      });
    }
  
    @Patch(':id')
    async updateTransaction(
      @Param('id') id: string,
      @Body() body: UpdateTransactionDto,
      @Request() req: RequestWithUser,
    ) {
      return this.transactionService.updateTransaction({
        transactionId: id,
        userId: req.user.userId,
        dto: body,
      });
    }
  
    @Delete(':id')
    async deleteTransaction(
      @Param('id') id: string,
      @Request() req: RequestWithUser,
    ) {
      return this.transactionService.deleteTransaction({
        transactionId: id,
        userId: req.user.userId,
      });
    }
  }