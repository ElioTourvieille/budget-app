import { fetcher } from './client';
import type { Budget, BudgetSummary, MessageResponse } from './types';

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetInput {
  amount: number;
}

export interface ListBudgetsParams {
  month?: number;
  year?: number;
}

export const budgetsApi = {
  list: (params?: ListBudgetsParams) =>
    fetcher.get<Budget[]>('/budgets', params),

  summary: (month: number, year: number) =>
    fetcher.get<BudgetSummary>('/budgets/summary', { month, year }),

  getById: (id: string) =>
    fetcher.get<Budget>(`/budgets/${id}`),

  create: (data: CreateBudgetInput) =>
    fetcher.post<Budget>('/budgets', data),

  update: (id: string, data: UpdateBudgetInput) =>
    fetcher.patch<Budget>(`/budgets/${id}`, data),

  delete: (id: string) =>
    fetcher.delete<MessageResponse>(`/budgets/${id}`),
};
