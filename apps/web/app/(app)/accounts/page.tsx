'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccounts } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { AccountsList } from './_components/accounts-list';

export default function AccountsPage() {
  const { data, isLoading } = useAccounts({ includeInactive: true });
  const activeCount = data?.accounts.filter((a) => a.isActive).length ?? 0;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Comptes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? 'Chargement…' : `${activeCount} compte${activeCount > 1 ? 's' : ''} actif${activeCount > 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/accounts/new" className={cn(buttonVariants(), 'h-9 px-4 gap-1.5 shrink-0')}>
          <Plus className="size-4" />
          Nouveau compte
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <AccountsList accounts={data?.accounts ?? []} />
      )}
    </div>
  );
}
