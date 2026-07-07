import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accountsApi } from '@/lib/api/accounts';
import type { CreateAccountInput, ListAccountsParams, UpdateAccountInput } from '@/lib/api/accounts';
import { ApiError } from '@/lib/api/client';
import { queryKeys } from './keys';

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function useAccounts(params?: ListAccountsParams) {
  return useQuery({
    queryKey: queryKeys.accounts.list(params),
    queryFn:  () => accountsApi.list(params),
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn:  () => accountsApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccountInput) => accountsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Compte créé');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de créer le compte'));
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountInput }) =>
      accountsApi.update(id, data),
    onSuccess: (account) => {
      qc.setQueryData(queryKeys.accounts.detail(account.id), account);
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Compte mis à jour');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de mettre à jour le compte'));
    },
  });
}

export function useUpdateAccountBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, balance }: { id: string; balance: number }) =>
      accountsApi.updateBalance(id, balance),
    onSuccess: (account) => {
      qc.setQueryData(queryKeys.accounts.detail(account.id), account);
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Solde mis à jour');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de mettre à jour le solde'));
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Compte désactivé');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de désactiver le compte'));
    },
  });
}
