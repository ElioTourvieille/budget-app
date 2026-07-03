'use client';

import { useUser } from '@/lib/stores/auth.store';
import { useAccounts } from '@/lib/queries';
import { DashboardContent } from './_components/dashboard-content';
import { DashboardSkeleton } from './_components/dashboard-skeleton';
import { OnboardingEmptyState } from './_components/onboarding-empty-state';

export default function DashboardPage() {
  const user = useUser();
  const accountsQuery = useAccounts();

  if (accountsQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  const accounts = accountsQuery.data?.accounts ?? [];

  if (accounts.length === 0) {
    return <OnboardingEmptyState firstName={user?.firstName} />;
  }

  return (
    <DashboardContent
      firstName={user?.firstName}
      accounts={accounts}
      totalBalance={accountsQuery.data?.totalBalance ?? 0}
    />
  );
}
