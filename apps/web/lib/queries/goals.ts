import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { goalsApi } from '@/lib/api/goals';
import type { CreateContributionInput, CreateGoalInput, ListGoalsParams, UpdateGoalInput } from '@/lib/api/goals';
import { ApiError } from '@/lib/api/client';
import { queryKeys } from './keys';

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function useGoals(params?: ListGoalsParams) {
  return useQuery({
    queryKey: queryKeys.goals.list(params),
    queryFn:  () => goalsApi.list(params),
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: queryKeys.goals.detail(id),
    queryFn:  () => goalsApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoalInput) => goalsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
      toast.success('Objectif créé');
    },
    onError: (err) => {
      toast.error(errorMessage(err, "Impossible de créer l'objectif"));
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalInput }) =>
      goalsApi.update(id, data),
    onSuccess: (goal) => {
      qc.setQueryData(queryKeys.goals.detail(goal.id), goal);
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}

export function useCompleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.complete(id),
    onSuccess: (goal) => {
      qc.setQueryData(queryKeys.goals.detail(goal.id), goal);
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}

export function useAddContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: CreateContributionInput }) =>
      goalsApi.addContribution(goalId, data),
    onSuccess: (_contribution, { goalId }) => {
      // Refresh the goal detail to get updated currentAmount + progress
      qc.invalidateQueries({ queryKey: queryKeys.goals.detail(goalId) });
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
      toast.success('Versement ajouté');
    },
    onError: (err) => {
      toast.error(errorMessage(err, "Impossible d'ajouter le versement"));
    },
  });
}

export function useDeleteContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, contributionId }: { goalId: string; contributionId: string }) =>
      goalsApi.deleteContribution(goalId, contributionId),
    onSuccess: (_result, { goalId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.goals.detail(goalId) });
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}
