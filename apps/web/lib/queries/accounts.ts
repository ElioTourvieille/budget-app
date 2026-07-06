import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@/lib/api/accounts';
import type { CreateAccountInput, ListAccountsParams, UpdateAccountInput } from '@/lib/api/accounts';
import { queryKeys } from './keys';

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
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}
