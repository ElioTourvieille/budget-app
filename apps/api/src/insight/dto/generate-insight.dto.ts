import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum InsightType {
  SUMMARY = 'summary',
  SPENDING = 'spending',
  BUDGET = 'budget',
  GOALS = 'goals',
}

export class GenerateInsightDto {
  @IsEnum(InsightType)
  type: InsightType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  force?: boolean;
}
