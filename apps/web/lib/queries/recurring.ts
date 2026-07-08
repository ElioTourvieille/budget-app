import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { recurringApi } from '@/lib/api/recurring';
import type { CreateRecurringInput, UpdateRecurringInput } from '@/lib/api/recurring';
import { ApiError } from '@/lib/api/client';
import { queryKeys } from './keys';

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function useRecurringTransactions() {
  return useQuery({
    queryKey: queryKeys.recurring.all,
    queryFn:  () => recurringApi.list(),
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecurringInput) => recurringApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.recurring.all });
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Récurrence créée');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de créer la récurrence'));
    },
  });
}

export function useUpdateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecurringInput }) =>
      recurringApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.recurring.all });
      toast.success('Récurrence mise à jour');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de mettre à jour la récurrence'));
    },
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recurringApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.recurring.all });
      toast.success('Récurrence supprimée');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de supprimer la récurrence'));
    },
  });
}
