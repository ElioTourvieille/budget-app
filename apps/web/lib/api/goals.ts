import { fetcher } from './client';
import type { Goal, GoalContribution, GoalType, MessageResponse } from './types';

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
  type: GoalType;
  icon?: string;
  monthlyTarget?: number;
  targetDate?: string;
}

export interface UpdateGoalInput {
  name?: string;
  icon?: string;
  targetAmount?: number;
  monthlyTarget?: number;
  targetDate?: string;
}

export interface ListGoalsParams {
  type?: GoalType;
  isCompleted?: boolean;
}

export interface CreateContributionInput {
  amount: number;
  accountId: string;
  date?: string;
  note?: string;
}

export const goalsApi = {
  list: (params?: ListGoalsParams) =>
    fetcher.get<Goal[]>('/goals', params),

  getById: (id: string) =>
    fetcher.get<Goal>(`/goals/${id}`),

  create: (data: CreateGoalInput) =>
    fetcher.post<Goal>('/goals', data),

  update: (id: string, data: UpdateGoalInput) =>
    fetcher.patch<Goal>(`/goals/${id}`, data),

  complete: (id: string) =>
    fetcher.patch<Goal>(`/goals/${id}/complete`),

  delete: (id: string) =>
    fetcher.delete<MessageResponse>(`/goals/${id}`),

  addContribution: (goalId: string, data: CreateContributionInput) =>
    fetcher.post<GoalContribution>(`/goals/${goalId}/contributions`, data),

  deleteContribution: (goalId: string, contributionId: string) =>
    fetcher.delete<MessageResponse>(`/goals/${goalId}/contributions/${contributionId}`),
};
