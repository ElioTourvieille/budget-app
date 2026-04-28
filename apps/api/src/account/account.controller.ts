import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Request,
    UseGuards,
  } from '@nestjs/common';
  import { AccountService } from './account.service';
  import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
  import { RequestWithUser } from 'src/auth/jwt.strategy';
  import { CreateAccountDto } from './dto/create-account.dto';
  import { UpdateAccountDto } from './dto/update-account.dto';
  import { UpdateBalanceDto } from './dto/update-balance.dto';
  
  @Controller('accounts')
  @UseGuards(JwtAuthGuard)
  export class AccountController {
    constructor(private readonly accountService: AccountService) {}
  
    @Get()
    async getAccounts(@Request() req: RequestWithUser) {
      return this.accountService.getAccounts({ userId: req.user.userId });
    }
  
    @Get(':id')
    async getAccount(@Param('id') id: string, @Request() req: RequestWithUser) {
      return this.accountService.getAccountById({
        accountId: id,
        userId: req.user.userId,
      });
    }
  
    @Post()
    async createAccount(
      @Body() body: CreateAccountDto,
      @Request() req: RequestWithUser,
    ) {
      return this.accountService.createAccount({
        userId: req.user.userId,
        dto: body,
      });
    }
  
    @Patch(':id')
    async updateAccount(
      @Param('id') id: string,
      @Body() body: UpdateAccountDto,
      @Request() req: RequestWithUser,
    ) {
      return this.accountService.updateAccount({
        accountId: id,
        userId: req.user.userId,
        dto: body,
      });
    }
  
    @Patch(':id/balance')
    async updateBalance(
      @Param('id') id: string,
      @Body() body: UpdateBalanceDto,
      @Request() req: RequestWithUser,
    ) {
      return this.accountService.updateBalance({
        accountId: id,
        userId: req.user.userId,
        dto: body,
      });
    }
  
    @Delete(':id')
    async deleteAccount(
      @Param('id') id: string,
      @Request() req: RequestWithUser,
    ) {
      return this.accountService.deleteAccount({
        accountId: id,
        userId: req.user.userId,
      });
    }
  }