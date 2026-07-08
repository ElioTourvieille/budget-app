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
import { RecurringService } from './recurring.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/jwt.strategy';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';

@Controller('recurring-transactions')
@UseGuards(JwtAuthGuard)
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get()
  async getRecurring(@Request() req: RequestWithUser) {
    return this.recurringService.getRecurring({ userId: req.user.userId });
  }

  @Post()
  async createRecurring(
    @Body() body: CreateRecurringDto,
    @Request() req: RequestWithUser,
  ) {
    return this.recurringService.createRecurring({
      userId: req.user.userId,
      dto: body,
    });
  }

  @Patch(':id')
  async updateRecurring(
    @Param('id') id: string,
    @Body() body: UpdateRecurringDto,
    @Request() req: RequestWithUser,
  ) {
    return this.recurringService.updateRecurring({
      recurringId: id,
      userId: req.user.userId,
      dto: body,
    });
  }

  @Delete(':id')
  async deleteRecurring(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.recurringService.deleteRecurring({
      recurringId: id,
      userId: req.user.userId,
    });
  }

  // Déclenchement manuel (ex: bouton "Générer maintenant"), scopé à l'utilisateur courant.
  @Post('process-due')
  async processDue(@Request() req: RequestWithUser) {
    return this.recurringService.generateDueTransactions({
      userId: req.user.userId,
    });
  }
}
