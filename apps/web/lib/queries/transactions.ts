import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api/transactions';
import type {
  CreateTransactionInput,
  ListTransactionsParams,
  UpdateTransactionInput,
} from '@/lib/api/transactions';
import { queryKeys } from './keys';

export function useTransactions(params?: ListTransactionsParams) {
  return useQuery({
    queryKey: queryKeys.transactions.list(params),
    queryFn:  () => transactionsApi.list(params),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id),
    queryFn:  () => transactionsApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionInput) => transactionsApi.create(data),
    onSuccess: () => {
      // Invalide toutes les listes (plusieurs filtres possibles en cache)
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
      // Les budgets summary peuvent changer aussi
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
      transactionsApi.update(id, data),
    onSuccess: (transaction) => {
      qc.setQueryData(queryKeys.transactions.detail(transaction.id), transaction);
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}
