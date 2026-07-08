import type { ListTransactionsParams } from '@/lib/api/transactions';
import type { ListCategoriesParams } from '@/lib/api/categories';
import type { ListAccountsParams } from '@/lib/api/accounts';
import type { ListBudgetsParams } from '@/lib/api/budgets';
import type { ListGoalsParams } from '@/lib/api/goals';
import type { GenerateInsightParams } from '@/lib/api/insights';

export const queryKeys = {
  accounts: {
    all:    ['accounts']                                        as const,
    list:   (p?: ListAccountsParams) => ['accounts', 'list', p] as const,
    detail: (id: string) => ['accounts', id]                    as const,
  },

  categories: {
    all:    ['categories']                                           as const,
    list:   (p?: ListCategoriesParams) => ['categories', 'list', p] as const,
    detail: (id: string) => ['categories', id]                      as const,
  },

  transactions: {
    all:    ['transactions']                                              as const,
    list:   (p?: ListTransactionsParams) => ['transactions', 'list', p]  as const,
    detail: (id: string) => ['transactions', id]                         as const,
  },

  budgets: {
    all:     ['budgets']                                            as const,
    list:    (p?: ListBudgetsParams) => ['budgets', 'list', p]     as const,
    detail:  (id: string) => ['budgets', id]                       as const,
    summary: (month: number, year: number) =>
      ['budgets', 'summary', month, year]                          as const,
  },

  goals: {
    all:    ['goals']                                         as const,
    list:   (p?: ListGoalsParams) => ['goals', 'list', p]    as const,
    detail: (id: string) => ['goals', id]                    as const,
  },

  insights: {
    all:      ['insights']                                          as const,
    generate: (p: GenerateInsightParams) => ['insights', p]        as const,
  },

  transfers: {
    all: ['transfers'] as const,
  },

  recurring: {
    all: ['recurring'] as const,
  },
} as const;
