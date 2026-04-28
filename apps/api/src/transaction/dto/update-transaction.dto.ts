import { InsuranceType, ReimbursementStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  merchant?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isReimbursable?: boolean;

  @IsOptional()
  @IsEnum(InsuranceType)
  insuranceType?: InsuranceType;

  @IsOptional()
  @IsEnum(ReimbursementStatus)
  reimbursementStatus?: ReimbursementStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reimbursedAmount?: number;

  @IsOptional()
  @IsDateString()
  reimbursedAt?: string;
}