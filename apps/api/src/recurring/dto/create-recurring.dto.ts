import { Frequency } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateRecurringDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  accountId: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsIn(['INCOME', 'EXPENSE'], {
    message: "Une récurrence ne peut être qu'une entrée ou une dépense.",
  })
  type: 'INCOME' | 'EXPENSE';

  @IsOptional()
  @IsString()
  merchant?: string;

  @IsPositive()
  amount: number;

  @IsEnum(Frequency)
  frequency: Frequency;

  @IsDateString()
  nextDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
