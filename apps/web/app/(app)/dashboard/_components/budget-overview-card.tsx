'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency } from '@/lib/utils';
import type { BudgetSummary } from '@/lib/api/types';

const MONTH_LABELS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function progressColor(pct: number) {
  if (pct > 100) return 'bg-destructive';
  if (pct >= 80) return 'bg-warning';
  return 'bg-success';
}

export function BudgetOverviewCard({
  summary,
  isLoading,
  month,
}: {
  summary?: BudgetSummary;
  isLoading: boolean;
  month: number;
  year: number;
}) {
  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-4 w-40" />
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const budgets = summary?.budgets ?? [];
  const top = [...budgets].sort((a, b) => b.percentage - a.percentage).slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budgets — {MONTH_LABELS[month - 1]}</CardTitle>
        <Link
          href="/transactions"
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Détail →
        </Link>
      </CardHeader>

      {top.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun budget défini pour ce mois.
        </p>
      ) : (
        <div className="space-y-4">
          {top.map((b) => (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1.5 text-sm gap-2">
                <span className="font-medium flex items-center gap-1.5 min-w-0 truncate">
                  {b.category.icon && <span className="shrink-0">{b.category.icon}</span>}
                  <span className="truncate">{b.category.name}</span>
                </span>
                <span className="text-muted-foreground tabular-nums shrink-0">
                  {formatCurrency(b.spent)} / {formatCurrency(Number(b.amount))}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', progressColor(b.percentage))}
                  style={{ width: `${Math.min(100, b.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
