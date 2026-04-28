import { TransactionType, InsuranceType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsNumber({}, { message: 'Le montant doit être un nombre.' })
  @Min(0.01, { message: 'Le montant doit être supérieur à 0.' })
  amount: number;

  @IsEnum(TransactionType, { message: 'Type de transaction invalide.' })
  type: TransactionType;

  @IsString()
  accountId: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  merchant?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString({}, { message: 'La date est invalide.' })
  date: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurringId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // ─── Remboursement assurance ───────────────────────────────
  @IsOptional()
  @IsBoolean()
  isReimbursable?: boolean;

  @IsOptional()
  @IsEnum(InsuranceType, { message: 'Type d\'assurance invalide.' })
  insuranceType?: InsuranceType;
}