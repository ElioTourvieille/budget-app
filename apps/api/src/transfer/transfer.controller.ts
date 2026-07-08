import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/jwt.strategy';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Controller('transfers')
@UseGuards(JwtAuthGuard)
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Get()
  async getTransfers(@Request() req: RequestWithUser) {
    return this.transferService.getTransfers({ userId: req.user.userId });
  }

  @Post()
  async createTransfer(@Body() body: CreateTransferDto, @Request() req: RequestWithUser) {
    return this.transferService.createTransfer({ userId: req.user.userId, dto: body });
  }

  @Delete(':id')
  async deleteTransfer(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.transferService.deleteTransfer({ transferId: id, userId: req.user.userId });
  }
}
