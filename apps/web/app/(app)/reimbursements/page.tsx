'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactions, useUpdateTransaction } from '@/lib/queries';
import { cn, formatCurrency, formatShortDate } from '@/lib/utils';
import type { Transaction } from '@/lib/api/types';

const INSURANCE_LABELS: Record<string, string> = {
  LAMAL: 'LAMal',
  LCA: 'LCA',
  OTHER: 'Autre',
};

const TABS: { key: 'ALL' | 'PENDING' | 'COMPLETED'; label: string }[] = [
  { key: 'ALL', label: 'Tous' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'COMPLETED', label: 'Remboursé' },
];

export default function ReimbursementsPage() {
  const [tab, setTab] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const pending = useTransactions({ reimbursementStatus: 'PENDING', limit: 100 });
  const completed = useTransactions({ reimbursementStatus: 'COMPLETED', limit: 100 });

  const isLoading = pending.isLoading || completed.isLoading;

  const all = useMemo(() => {
    const items = [...(pending.data?.transactions ?? []), ...(completed.data?.transactions ?? [])];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [pending.data, completed.data]);

  const totalPending = useMemo(() => {
    return (pending.data?.transactions ?? []).reduce((sum, t) => sum + Number(t.amount), 0);
  }, [pending.data]);

  const visible =
    tab === 'ALL' ? all : tab === 'PENDING' ? (pending.data?.transactions ?? []) : (completed.data?.transactions ?? []);

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
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
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
  const isCompleted = (transaction.reimbursementStatus ?? 'PENDING') !== 'PENDING';
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(
    transaction.reimbursedAmount ? String(transaction.reimbursedAmount) : '',
  );

  const reimbursed = Number(transaction.reimbursedAmount ?? 0);
  const shortfall = Math.max(0, Number(transaction.amount) - reimbursed);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (Number.isNaN(value) || value < 0) return;
    updateTransaction.mutate(
      { id: transaction.id, data: { reimbursedAmount: value } },
      { onSuccess: () => setEditing(false) },
    );
  }

  return (
    <Card className="gap-3">
      <div className="flex items-center justify-between gap-3">
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
          <span className="text-sm font-semibold tabular-nums">{formatCurrency(transaction.amount)}</span>
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-semibold',
              isCompleted ? 'bg-success/10 text-success' : 'bg-accent text-accent-foreground',
            )}
          >
            {isCompleted ? 'Remboursé' : 'En attente'}
          </span>
        </div>
      </div>

      {isCompleted && !editing ? (
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Reçu {formatCurrency(reimbursed)}
            {shortfall > 0 ? ` · reste à charge ${formatCurrency(shortfall)}` : ' · remboursé intégralement'}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-medium hover:underline underline-offset-2 shrink-0"
          >
            Modifier
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            autoFocus={editing}
            placeholder="Montant reçu (CHF)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
          <Button type="submit" size="sm" disabled={updateTransaction.isPending} className="h-9 px-3">
            Enregistrer
          </Button>
          {isCompleted && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Annuler
            </button>
          )}
        </form>
      )}
    </Card>
  );
}
