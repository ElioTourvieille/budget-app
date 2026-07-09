'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAccounts,
  useAddContribution,
  useCompleteGoal,
  useDeleteContribution,
  useDeleteGoal,
  useGoal,
} from '@/lib/queries';
import { GOAL_TYPE_ICONS, GOAL_TYPE_LABELS } from '@/lib/goal-visuals';
import { cn, formatCurrency, formatShortDate } from '@/lib/utils';

export default function GoalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: goal, isLoading } = useGoal(params.id);
  const completeGoal = useCompleteGoal();
  const deleteGoal = useDeleteGoal();
  const addContribution = useAddContribution();
  const deleteContribution = useDeleteContribution();
  const accounts = useAccounts();

  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');

  if (isLoading || !goal) {
    return (
      <div className="p-4 sm:p-6 max-w-md mx-auto space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const Icon = GOAL_TYPE_ICONS[goal.type];
  const target = Number(goal.targetAmount);
  const current = Number(goal.currentAmount);

  function handleDelete() {
    toast(`Supprimer « ${goal!.name} » ?`, {
      description: 'Les versements associés seront aussi supprimés.',
      action: {
        label: 'Supprimer',
        onClick: () => {
          deleteGoal.mutate(goal!.id, { onSuccess: () => router.replace('/goals') });
        },
      },
      cancel: { label: 'Annuler', onClick: () => {} },
    });
  }

  function handleDeleteContribution(contributionId: string) {
    toast('Supprimer ce versement ?', {
      description: "Le montant sera retiré du total de l'objectif.",
      action: {
        label: 'Supprimer',
        onClick: () => deleteContribution.mutate({ goalId: goal!.id, contributionId }),
      },
      cancel: { label: 'Annuler', onClick: () => {} },
    });
  }

  async function onAddContribution(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0 || !accountId) return;
    try {
      await addContribution.mutateAsync({ goalId: goal!.id, data: { amount: value, accountId } });
      setAmount('');
    } catch {
      // Le toast d'erreur est déjà affiché par useAddContribution (onError).
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/goals"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Retour aux objectifs
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href={`/goals/${goal.id}/edit`}
            aria-label="Modifier l'objectif"
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
          >
            <Pencil className="size-4" />
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Supprimer l'objectif"
            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
          {goal.icon ? (
            <span className="text-xl leading-none">{goal.icon}</span>
          ) : (
            <Icon className="size-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{goal.name}</h1>
          <p className="text-sm text-muted-foreground">{GOAL_TYPE_LABELS[goal.type]}</p>
        </div>
      </div>

      <Card className={goal.isCompleted ? 'bg-success/10 border-transparent' : undefined}>
        <div className="flex items-center justify-between">
          <span className={cn('text-sm font-semibold', goal.isCompleted && 'text-success')}>
            Progression
          </span>
          <span className={cn('font-heading text-lg font-bold', goal.isCompleted && 'text-success')}>
            {goal.progressPercent}%
          </span>
        </div>
        <div className={cn('h-3 rounded-full overflow-hidden', goal.isCompleted ? 'bg-success/15' : 'bg-muted')}>
          <div
            className={cn('h-full rounded-full transition-all', goal.isCompleted ? 'bg-success' : 'bg-primary')}
            style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
          />
        </div>
        <p className={cn('text-sm', goal.isCompleted ? 'text-success/90' : 'text-muted-foreground')}>
          {formatCurrency(current)} / {formatCurrency(target)} · reste {formatCurrency(goal.remaining)}
        </p>
        {!goal.isCompleted && goal.monthsToTarget != null && (
          <p className="text-sm text-muted-foreground">
            À ce rythme, objectif atteint dans {goal.monthsToTarget} mois
            {goal.estimatedCompletionDate ? ` (${formatShortDate(goal.estimatedCompletionDate)})` : ''}.
          </p>
        )}
        {!goal.isCompleted && goal.isOnTrack !== undefined && goal.isOnTrack !== null && (
          <p className={cn('text-sm font-medium', goal.isOnTrack ? 'text-success' : 'text-warning')}>
            {goal.isOnTrack ? 'En bonne voie pour la date cible' : 'En retard par rapport à la date cible'}
          </p>
        )}
      </Card>

      {!goal.isCompleted && (
        <Button
          variant="outline"
          onClick={() => completeGoal.mutate(goal.id)}
          disabled={completeGoal.isPending}
          className="w-full h-10 gap-2"
        >
          <Check className="size-4" />
          Marquer comme atteint
        </Button>
      )}

      {!goal.isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau versement</CardTitle>
          </CardHeader>
          <form onSubmit={onAddContribution} className="space-y-2">
            <Select value={accountId || null} onValueChange={(value) => setAccountId(value ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Compte à débiter">
                  {(value: string) => accounts.data?.accounts.find((a) => a.id === value)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(accounts.data?.accounts ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Montant CHF"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
              />
              <Button type="submit" disabled={addContribution.isPending || !accountId} className="h-10 px-4">
                {addContribution.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Ajouter'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historique des versements</CardTitle>
        </CardHeader>
        {!goal.contributions || goal.contributions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun versement pour l&apos;instant.</p>
        ) : (
          <div className="space-y-1">
            {goal.contributions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-muted-foreground">{formatShortDate(c.date)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(c.amount)}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteContribution(c.id)}
                    aria-label="Supprimer le versement"
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
