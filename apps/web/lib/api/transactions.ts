import { fetcher } from './client';
import type {
  Transaction,
  TransactionsResponse,
  TransactionType,
  InsuranceType,
  ReimbursementStatus,
  MessageResponse,
} from './types';

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  accountId: string;
  date: string;
  categoryId?: string;
  merchant?: string;
  description?: string;
  isRecurring?: boolean;
  recurringId?: string;
  notes?: string;
  isReimbursable?: boolean;
  insuranceType?: InsuranceType;
}

export interface UpdateTransactionInput {
  amount?: number;
  categoryId?: string;
  merchant?: string;
  description?: string;
  date?: string;
  notes?: string;
  isReimbursable?: boolean;
  insuranceType?: InsuranceType;
  reimbursementStatus?: ReimbursementStatus;
  reimbursedAmount?: number;
  reimbursedAt?: string;
}

export interface ListTransactionsParams {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  reimbursementStatus?: ReimbursementStatus;
  dateFrom?: string;
  dateTo?: string;
  month?: number;
  year?: number;
  limit?: number;
  offset?: number;
}

export const transactionsApi = {
  list: (params?: ListTransactionsParams) =>
    fetcher.get<TransactionsResponse>('/transactions', params),

  getById: (id: string) =>
    fetcher.get<Transaction>(`/transactions/${id}`),

  create: (data: CreateTransactionInput) =>
    fetcher.post<Transaction>('/transactions', data),

  update: (id: string, data: UpdateTransactionInput) =>
    fetcher.patch<Transaction>(`/transactions/${id}`, data),

  delete: (id: string) =>
    fetcher.delete<MessageResponse>(`/transactions/${id}`),
};
