'use client';

import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency, formatShortDate } from '@/lib/utils';
import type { Transaction, TransactionType } from '@/lib/api/types';

const TYPE_ICON: Record<TransactionType, typeof ArrowDownLeft> = {
  INCOME: ArrowDownLeft,
  EXPENSE: ArrowUpRight,
  TRANSFER: ArrowLeftRight,
};

export function RecentTransactionsCard({
  transactions,
  isLoading,
}: {
  transactions?: Transaction[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-4 w-40" />
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const items = transactions ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dernières transactions</CardTitle>
        <Link
          href="/transactions"
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Tout voir →
        </Link>
      </CardHeader>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune transaction pour l&apos;instant.{' '}
          <Link href="/transactions/new" className="font-medium text-foreground hover:underline">
            Ajoute la première
          </Link>
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((t) => {
            const Icon = TYPE_ICON[t.type];
            const isIncome = t.type === 'INCOME';
            const isExpense = t.type === 'EXPENSE';
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 hover:bg-muted/60 transition-colors"
              >
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    isIncome ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {t.merchant || t.description || t.category?.name || 'Transaction'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t.category?.name ?? 'Sans catégorie'} · {formatShortDate(t.date)}
                  </p>
                </div>
                <p
                  className={cn(
                    'text-sm font-medium tabular-nums shrink-0',
                    isIncome ? 'text-success' : 'text-foreground',
                  )}
                >
                  {isIncome ? '+' : isExpense ? '-' : ''}
                  {formatCurrency(t.amount)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
