import { fetcher } from './client';
import type { Account, AccountsResponse, MessageResponse } from './types';

export type AccountType = 'CHECKING' | 'JOINT' | 'SAVINGS' | 'THIRD_PILLAR' | 'CASH' | 'OTHER';

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  bank?: string;
  color?: string;
  icon?: string;
}

export interface UpdateAccountInput {
  name?: string;
  bank?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface ListAccountsParams {
  includeInactive?: boolean;
}

export const accountsApi = {
  list: (params?: ListAccountsParams) =>
    fetcher.get<AccountsResponse>('/accounts', params),

  getById: (id: string) =>
    fetcher.get<Account>(`/accounts/${id}`),

  create: (data: CreateAccountInput) =>
    fetcher.post<Account>('/accounts', data),

  update: (id: string, data: UpdateAccountInput) =>
    fetcher.patch<Account>(`/accounts/${id}`, data),

  updateBalance: (id: string, balance: number) =>
    fetcher.patch<Account>(`/accounts/${id}/balance`, { balance }),

  delete: (id: string) =>
    fetcher.delete<MessageResponse>(`/accounts/${id}`),
};
