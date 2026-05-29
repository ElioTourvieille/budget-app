import { GoalType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsPositive()
  targetAmount: number;

  @IsOptional()
  @IsPositive()
  monthlyTarget?: number;

  @IsEnum(GoalType)
  type: GoalType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  targetDate?: Date;
}
