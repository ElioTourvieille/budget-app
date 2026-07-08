'use client';

import { Pause, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteRecurring, useRecurringTransactions, useUpdateRecurring } from '@/lib/queries';
import { cn, formatCurrency, formatShortDate } from '@/lib/utils';
import type { Frequency, RecurringTransaction } from '@/lib/api/types';

const FREQUENCY_LABELS: Record<Frequency, string> = {
  DAILY: 'Chaque jour',
  WEEKLY: 'Chaque semaine',
  BIWEEKLY: 'Toutes les 2 semaines',
  MONTHLY: 'Chaque mois',
  QUARTERLY: 'Chaque trimestre',
  YEARLY: 'Chaque année',
};

export function RecurringSection() {
  const { data, isLoading } = useRecurringTransactions();
  const recurring = data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Récurrences</CardTitle>
      </CardHeader>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : recurring.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune récurrence pour l&apos;instant. Coche « Rendre récurrent » en créant une
          transaction (salaire, loyer, abonnement…).
        </p>
      ) : (
        <div className="space-y-1">
          {recurring.map((r) => (
            <RecurringRow key={r.id} recurring={r} />
          ))}
        </div>
      )}
    </Card>
  );
}

function RecurringRow({ recurring }: { recurring: RecurringTransaction }) {
  const updateRecurring = useUpdateRecurring();
  const deleteRecurring = useDeleteRecurring();
  const isIncome = recurring.type === 'INCOME';

  function handleDelete() {
    toast(`Supprimer la récurrence « ${recurring.name} » ?`, {
      description: 'Les transactions déjà générées sont conservées ; seule la règle est supprimée.',
      action: {
        label: 'Supprimer',
        onClick: () => deleteRecurring.mutate(recurring.id),
      },
      cancel: {
        label: 'Annuler',
        onClick: () => {},
      },
    });
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 hover:bg-muted/60 transition-colors',
        !recurring.isActive && 'opacity-50',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{recurring.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {FREQUENCY_LABELS[recurring.frequency]} · prochaine échéance{' '}
          {formatShortDate(recurring.nextDate)}
        </p>
      </div>
      <span
        className={cn(
          'text-sm font-medium tabular-nums shrink-0',
          isIncome ? 'text-success' : 'text-foreground',
        )}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(recurring.amount)}
      </span>
      <button
        type="button"
        onClick={() =>
          updateRecurring.mutate({ id: recurring.id, data: { isActive: !recurring.isActive } })
        }
        disabled={updateRecurring.isPending}
        aria-label={recurring.isActive ? 'Mettre en pause' : 'Réactiver'}
        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 shrink-0"
      >
        {recurring.isActive ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        aria-label="Supprimer la récurrence"
        className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10 shrink-0"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
