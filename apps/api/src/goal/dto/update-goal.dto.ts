import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsPositive()
  targetAmount?: number;

  @IsOptional()
  @IsPositive()
  monthlyTarget?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  targetDate?: Date;
}
