import { fetcher } from './client';
import type { Frequency, MessageResponse, RecurringTransaction, TransactionType } from './types';

export interface CreateRecurringInput {
  name: string;
  accountId: string;
  categoryId?: string;
  type: Exclude<TransactionType, 'TRANSFER'>;
  merchant?: string;
  amount: number;
  frequency: Frequency;
  nextDate: string;
  endDate?: string;
}

export interface UpdateRecurringInput {
  name?: string;
  categoryId?: string;
  merchant?: string;
  amount?: number;
  frequency?: Frequency;
  endDate?: string;
  isActive?: boolean;
}

export const recurringApi = {
  list: () => fetcher.get<RecurringTransaction[]>('/recurring-transactions'),

  create: (data: CreateRecurringInput) =>
    fetcher.post<RecurringTransaction>('/recurring-transactions', data),

  update: (id: string, data: UpdateRecurringInput) =>
    fetcher.patch<RecurringTransaction>(`/recurring-transactions/${id}`, data),

  delete: (id: string) => fetcher.delete<MessageResponse>(`/recurring-transactions/${id}`),
};
