'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAccounts,
  useAddContribution,
  useCreateGoal,
  useGoal,
  useGoals,
} from '@/lib/queries';
import { formatCurrency, formatShortDate } from '@/lib/utils';

const CURRENT_YEAR = new Date().getFullYear();
const PLAFOND_2026 = 7258;

export default function ThirdPillarPage() {
  const list = useGoals({ type: 'THIRD_PILLAR', isCompleted: false });
  const goalId = list.data?.[0]?.id;
  const detail = useGoal(goalId ?? '');

  if (list.isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!goalId) {
    return <CreateThirdPillarGoal />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">3e pilier A</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Prévoyance liée {CURRENT_YEAR}</p>
      </div>

      {detail.isLoading || !detail.data ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : (
        <ThirdPillarDetail goal={detail.data} />
      )}
    </div>
  );
}

function ThirdPillarDetail({ goal }: { goal: NonNullable<ReturnType<typeof useGoal>['data']> }) {
  const addContribution = useAddContribution();
  const accounts = useAccounts();
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');

  const target = Number(goal.targetAmount);
  const current = Number(goal.currentAmount);
  const remaining = Math.max(0, target - current);

  let recommendedMonthly: number | null = null;
  if (goal.targetDate) {
    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    const monthsLeft = Math.max(
      1,
      (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth()),
    );
    recommendedMonthly = remaining / monthsLeft;
  }

  async function onAddContribution(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0 || !accountId) return;
    try {
      await addContribution.mutateAsync({ goalId: goal.id, data: { amount: value, accountId } });
      setAmount('');
    } catch {
      // Le toast d'erreur est déjà affiché par useAddContribution (onError).
    }
  }

  return (
    <>
      <Card className="bg-success/10 border-transparent">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-success">Progression {CURRENT_YEAR}</span>
          <span className="font-heading text-lg font-bold text-success">
            {goal.progressPercent}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-success/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
          />
        </div>
        <p className="text-sm text-success/90">
          {formatCurrency(current)} / {formatCurrency(target)} · reste {formatCurrency(remaining)}
        </p>
        {recommendedMonthly !== null && remaining > 0 && (
          <div className="rounded-xl bg-background/50 px-4 py-3 text-sm text-success">
            Verse {formatCurrency(recommendedMonthly)}/mois pour atteindre le plafond avant le{' '}
            {formatShortDate(goal.targetDate!)}.
          </div>
        )}
      </Card>

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
                <span className="text-sm font-semibold tabular-nums">{formatCurrency(c.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

function CreateThirdPillarGoal() {
  const createGoal = useCreateGoal();
  const [targetAmount, setTargetAmount] = useState(String(PLAFOND_2026));
  const [monthlyTarget, setMonthlyTarget] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createGoal.mutateAsync({
        name: `3e pilier A ${CURRENT_YEAR}`,
        type: 'THIRD_PILLAR',
        targetAmount: Number(targetAmount),
        monthlyTarget: monthlyTarget ? Number(monthlyTarget) : undefined,
        targetDate: `${CURRENT_YEAR}-12-31`,
      });
    } catch {
      // Le toast d'erreur est déjà affiché par useCreateGoal (onError).
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-1">3e pilier A</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Suis ta progression vers le plafond légal {CURRENT_YEAR}.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="targetAmount">
            Plafond annuel (CHF)
          </label>
          <input
            id="targetAmount"
            type="number"
            step="1"
            required
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="monthlyTarget">
            Versement mensuel visé <span className="text-muted-foreground font-normal">(optionnel)</span>
          </label>
          <input
            id="monthlyTarget"
            type="number"
            step="0.01"
            placeholder="Ex. 588"
            value={monthlyTarget}
            onChange={(e) => setMonthlyTarget(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <Button type="submit" className="w-full h-11 gap-2" disabled={createGoal.isPending}>
          {createGoal.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Plus className="size-4" />
              Créer le suivi 3e pilier A
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
