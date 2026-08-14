'use client';

import { useBudgetSummary, useGoals, useTransactions } from '@/lib/queries';
import type { Account } from '@/lib/api/types';
import { BalanceCard } from './balance-card';
import { BudgetOverviewCard } from './budget-overview-card';
import { GoalsCard } from './goals-card';
import { MonthlyOverviewCard } from './monthly-overview-card';
import { RecentTransactionsCard } from './recent-transactions-card';
import { InsightCard } from './insight-card';

// Ne monte qu'une fois qu'on sait que l'utilisateur a au moins un compte —
// évite de déclencher les fetchs (dont l'insight IA, coûteux) pour un
// utilisateur qui va atterrir sur l'onboarding.
export function DashboardContent({
  firstName,
  accounts,
  totalBalance,
}: {
  firstName?: string | null;
  accounts: Account[];
  totalBalance: number;
}) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const budgetsQuery = useBudgetSummary(month, year);
  const goalsQuery = useGoals({ isCompleted: false });
  const transactionsQuery = useTransactions({ limit: 6 });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Bonjour {firstName ?? 'toi'} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Voici où tu en es ce mois-ci.</p>
      </div>

      <MonthlyOverviewCard />

      <InsightCard />

      <div className="grid gap-4 lg:grid-cols-2">
        <BalanceCard accounts={accounts} totalBalance={totalBalance} />
        <BudgetOverviewCard
          summary={budgetsQuery.data}
          isLoading={budgetsQuery.isLoading}
          month={month}
          year={year}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentTransactionsCard
          transactions={transactionsQuery.data?.transactions}
          isLoading={transactionsQuery.isLoading}
        />
        <GoalsCard goals={goalsQuery.data} isLoading={goalsQuery.isLoading} />
      </div>
    </div>
  );
}
