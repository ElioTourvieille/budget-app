import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { transactionsApi } from '@/lib/api/transactions';
import type {
  CreateTransactionInput,
  ListTransactionsParams,
  UpdateTransactionInput,
} from '@/lib/api/transactions';
import { ApiError } from '@/lib/api/client';
import { queryKeys } from './keys';

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

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
      // Les budgets summary et le solde des comptes peuvent changer aussi
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Transaction ajoutée');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible d’ajouter la transaction'));
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
      toast.success('Transaction mise à jour');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de mettre à jour la transaction'));
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
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Transaction supprimée');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de supprimer la transaction'));
    },
  });
}
