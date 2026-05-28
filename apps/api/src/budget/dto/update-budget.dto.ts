import { IsPositive } from 'class-validator';

export class UpdateBudgetDto {
  @IsPositive()
  amount: number;
}
