import { fetcher } from './client';
import type { MessageResponse, Transfer } from './types';

export interface CreateTransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date?: string;
  note?: string;
}

export const transfersApi = {
  list: () => fetcher.get<Transfer[]>('/transfers'),

  create: (data: CreateTransferInput) => fetcher.post<Transfer>('/transfers', data),

  delete: (id: string) => fetcher.delete<MessageResponse>(`/transfers/${id}`),
};
