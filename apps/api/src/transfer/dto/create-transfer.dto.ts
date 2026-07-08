import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  fromAccountId: string;

  @IsString()
  @IsNotEmpty()
  toAccountId: string;

  @IsPositive()
  amount: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsOptional()
  @IsString()
  note?: string;
}
