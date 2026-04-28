import { IsNumber } from 'class-validator';

export class UpdateBalanceDto {
  @IsNumber({}, { message: 'Le solde doit être un nombre.' })
  balance: number;
}