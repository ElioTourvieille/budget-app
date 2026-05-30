import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '@/lib/api/budgets';
import type { CreateBudgetInput, ListBudgetsParams, UpdateBudgetInput } from '@/lib/api/budgets';
import { queryKeys } from './keys';

export function useBudgets(params?: ListBudgetsParams) {
  return useQuery({
    queryKey: queryKeys.budgets.list(params),
    queryFn:  () => budgetsApi.list(params),
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: queryKeys.budgets.detail(id),
    queryFn:  () => budgetsApi.getById(id),
    enabled:  !!id,
  });
}

export function useBudgetSummary(month: number, year: number) {
  return useQuery({
    queryKey: queryKeys.budgets.summary(month, year),
    queryFn:  () => budgetsApi.summary(month, year),
    enabled:  !!month && !!year,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBudgetInput) => budgetsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetInput }) =>
      budgetsApi.update(id, data),
    onSuccess: (budget) => {
      qc.setQueryData(queryKeys.budgets.detail(budget.id), budget);
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}
