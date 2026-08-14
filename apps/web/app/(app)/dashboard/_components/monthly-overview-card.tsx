'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/components/ui/button';
import { useRecurringTransactions, useTransactions } from '@/lib/queries';
import { cn, formatCurrency } from '@/lib/utils';
import type { Frequency, RecurringTransaction } from '@/lib/api/types';

const MONTH_LABELS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function isoFromLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addFrequency(date: Date, frequency: Frequency): Date {
  const d = new Date(date);
  switch (frequency) {
    case 'DAILY':     d.setDate(d.getDate() + 1);      break;
    case 'WEEKLY':    d.setDate(d.getDate() + 7);       break;
    case 'BIWEEKLY':  d.setDate(d.getDate() + 14);      break;
    case 'MONTHLY':   d.setMonth(d.getMonth() + 1);     break;
    case 'QUARTERLY': d.setMonth(d.getMonth() + 3);     break;
    case 'YEARLY':    d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}

// Simule les échéances récurrentes actives qui tomberont d'ici la fin du mois
// mais n'ont pas encore été générées en transactions (le cron ne les crée
// qu'à leur date d'échéance). Permet d'estimer le solde de fin de mois plutôt
// que de se limiter à ce qui est déjà enregistré.
function projectPendingRecurring(
  recurring: RecurringTransaction[] | undefined,
  todayIso: string,
  monthEndIso: string,
) {
  let income = 0;
  let expenses = 0;

  for (const r of recurring ?? []) {
    if (!r.isActive) continue;

    let occurrence = new Date(`${r.nextDate.slice(0, 10)}T12:00:00`);
    const endIso = r.endDate?.slice(0, 10);
    let guard = 0;

    while (isoFromLocal(occurrence) <= monthEndIso && guard < 40) {
      const occurrenceIso = isoFromLocal(occurrence);
      if (endIso && occurrenceIso > endIso) break;
      if (occurrenceIso >= todayIso) {
        if (r.type === 'INCOME') income += Number(r.amount);
        else expenses += Number(r.amount);
      }
      occurrence = addFrequency(occurrence, r.frequency);
      guard++;
    }
  }

  return { income, expenses };
}

export function MonthlyOverviewCard() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const transactions = useTransactions({ month, year });
  const recurring = useRecurringTransactions();

  if (transactions.isLoading || recurring.isLoading) {
    return (
      <Card>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }

  const recordedIncome = transactions.data?.summary.income ?? 0;
  const recordedExpenses = transactions.data?.summary.expenses ?? 0;

  const todayIso = isoFromLocal(now);
  const monthEndIso = isoFromLocal(new Date(year, month, 0));
  const pending = projectPendingRecurring(recurring.data, todayIso, monthEndIso);

  const projectedIncome = recordedIncome + pending.income;
  const projectedExpenses = recordedExpenses + pending.expenses;
  const projectedRemaining = projectedIncome - projectedExpenses;

  const hasData = recordedIncome > 0 || recordedExpenses > 0;

  if (!hasData) {
    return (
      <Card className="bg-accent border-transparent">
        <div>
          <p className="text-sm font-semibold text-accent-foreground">Bilan de {MONTH_LABELS[month - 1]}</p>
          <p className="text-sm text-foreground/80 mt-1">
            Ajoute tes revenus et tes dépenses du mois pour voir ce qu&apos;il te restera à la fin.
          </p>
        </div>
        <Link href="/transactions/new" className={cn(buttonVariants(), 'w-fit h-9 px-4 gap-1.5')}>
          <Plus className="size-4" />
          Ajouter une transaction
        </Link>
      </Card>
    );
  }

  const isPositive = projectedRemaining >= 0;
  const hasPending = pending.income > 0 || pending.expenses > 0;

  return (
    <Card className={cn(isPositive ? 'bg-success/10' : 'bg-destructive/10', 'border-transparent')}>
      <div>
        <p className={cn('text-sm font-semibold', isPositive ? 'text-success' : 'text-destructive')}>
          Bilan de {MONTH_LABELS[month - 1]}
        </p>
        <p
          className={cn(
            'font-heading text-3xl font-bold tracking-tight mt-1',
            isPositive ? 'text-success' : 'text-destructive',
          )}
        >
          {formatCurrency(projectedRemaining)}
        </p>
        <p className="text-sm text-muted-foreground">
          {isPositive ? 'estimé restant à la fin du mois' : 'de déficit estimé à la fin du mois'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Revenus enregistrés</p>
          <p className="text-sm font-semibold text-success tabular-nums">+{formatCurrency(recordedIncome)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Dépenses enregistrées</p>
          <p className="text-sm font-semibold tabular-nums">-{formatCurrency(recordedExpenses)}</p>
        </div>
      </div>

      {isPositive && projectedRemaining > 0 && (
        <div className="rounded-xl bg-background/50 px-4 py-3 text-sm text-success font-medium">
          Tu peux épargner jusqu&apos;à {formatCurrency(projectedRemaining)} ce mois-ci.
        </div>
      )}

      {hasPending && (
        <p className="text-xs text-muted-foreground">
          Inclut les échéances récurrentes prévues d&apos;ici la fin du mois.
        </p>
      )}
    </Card>
  );
}
