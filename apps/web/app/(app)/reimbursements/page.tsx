'use client';

import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactions, useUpdateTransaction } from '@/lib/queries';
import { cn, formatCurrency, formatShortDate } from '@/lib/utils';
import type { ReimbursementStatus, Transaction } from '@/lib/api/types';

const INSURANCE_LABELS: Record<string, string> = {
  LAMAL: 'LAMal',
  LCA: 'LCA',
  OTHER: 'Autre',
};

const STATUS_LABELS: Record<ReimbursementStatus, string> = {
  PENDING: 'En attente',
  PARTIAL: 'Partiel',
  COMPLETED: 'Remboursé',
};

const STATUS_TINT: Record<ReimbursementStatus, string> = {
  PENDING: 'bg-accent text-accent-foreground',
  PARTIAL: 'bg-secondary text-secondary-foreground',
  COMPLETED: 'bg-success/10 text-success',
};

const NEXT_STATUS: Record<ReimbursementStatus, ReimbursementStatus | null> = {
  PENDING: 'PARTIAL',
  PARTIAL: 'COMPLETED',
  COMPLETED: null,
};

const NEXT_STATUS_LABEL: Record<ReimbursementStatus, string> = {
  PENDING: 'Marquer partiel',
  PARTIAL: 'Marquer remboursé',
  COMPLETED: '',
};

const TABS: { key: 'ALL' | ReimbursementStatus; label: string }[] = [
  { key: 'ALL', label: 'Tous' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'PARTIAL', label: 'Partiel' },
  { key: 'COMPLETED', label: 'Remboursé' },
];

export default function ReimbursementsPage() {
  const [tab, setTab] = useState<'ALL' | ReimbursementStatus>('ALL');

  const pending = useTransactions({ reimbursementStatus: 'PENDING', limit: 100 });
  const partial = useTransactions({ reimbursementStatus: 'PARTIAL', limit: 100 });
  const completed = useTransactions({ reimbursementStatus: 'COMPLETED', limit: 100 });

  const isLoading = pending.isLoading || partial.isLoading || completed.isLoading;

  const all = useMemo(() => {
    const items = [
      ...(pending.data?.transactions ?? []),
      ...(partial.data?.transactions ?? []),
      ...(completed.data?.transactions ?? []),
    ];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [pending.data, partial.data, completed.data]);

  const totalPending = useMemo(() => {
    return [...(pending.data?.transactions ?? []), ...(partial.data?.transactions ?? [])].reduce(
      (sum, t) => sum + (Number(t.amount) - Number(t.reimbursedAmount ?? 0)),
      0,
    );
  }, [pending.data, partial.data]);

  const visible = tab === 'ALL' ? all : tab === 'PENDING' ? (pending.data?.transactions ?? []) : tab === 'PARTIAL' ? (partial.data?.transactions ?? []) : (completed.data?.transactions ?? []);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Remboursements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">LAMal · LCA</p>
        </div>
        {!isLoading && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">En attente</p>
            <p className="font-heading text-lg font-bold text-accent-foreground">
              {formatCurrency(totalPending)}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
              tab === t.key
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/70',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">Aucune transaction à rembourser ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((t) => (
            <ReimbursementRow key={t.id} transaction={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReimbursementRow({ transaction }: { transaction: Transaction }) {
  const updateTransaction = useUpdateTransaction();
  const status = transaction.reimbursementStatus ?? 'PENDING';
  const next = NEXT_STATUS[status];

  return (
    <Card className="flex-row items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">
          {transaction.description || transaction.merchant || 'Transaction'}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {formatShortDate(transaction.date)}
          {transaction.insuranceType ? ` · ${INSURANCE_LABELS[transaction.insuranceType]}` : ''}
          {transaction.category ? ` · ${transaction.category.name}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(transaction.amount)}
        </span>
        <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', STATUS_TINT[status])}>
          {STATUS_LABELS[status]}
        </span>
        {next && (
          <button
            type="button"
            onClick={() =>
              updateTransaction.mutate({
                id: transaction.id,
                data: { reimbursementStatus: next },
              })
            }
            disabled={updateTransaction.isPending}
            className="flex items-center gap-1 text-xs font-medium text-secondary-foreground hover:underline underline-offset-2 disabled:opacity-40 whitespace-nowrap"
          >
            {NEXT_STATUS_LABEL[status]}
            <ArrowRight className="size-3" />
          </button>
        )}
      </div>
    </Card>
  );
}
