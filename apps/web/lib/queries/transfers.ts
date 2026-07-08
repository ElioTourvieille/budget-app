import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { transfersApi } from '@/lib/api/transfers';
import type { CreateTransferInput } from '@/lib/api/transfers';
import { ApiError } from '@/lib/api/client';
import { queryKeys } from './keys';

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function useTransfers() {
  return useQuery({
    queryKey: queryKeys.transfers.all,
    queryFn:  () => transfersApi.list(),
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransferInput) => transfersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transfers.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Virement effectué');
    },
    onError: (err) => {
      toast.error(errorMessage(err, "Impossible d'effectuer le virement"));
    },
  });
}

export function useDeleteTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transfersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transfers.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Virement supprimé');
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Impossible de supprimer le virement'));
    },
  });
}
