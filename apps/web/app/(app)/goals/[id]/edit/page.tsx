'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGoal, useUpdateGoal } from '@/lib/queries';

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: goal, isLoading } = useGoal(params.id);
  const updateGoal = useUpdateGoal();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    if (!goal) return;
    setName(goal.name);
    setTargetAmount(String(goal.targetAmount));
    setMonthlyTarget(goal.monthlyTarget ? String(goal.monthlyTarget) : '');
    setTargetDate(goal.targetDate ? goal.targetDate.slice(0, 10) : '');
    setIcon(goal.icon ?? '');
  }, [goal]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateGoal.mutateAsync({
        id: params.id,
        data: {
          name,
          targetAmount: Number(targetAmount),
          monthlyTarget: monthlyTarget ? Number(monthlyTarget) : undefined,
          targetDate: targetDate || undefined,
          icon: icon || undefined,
        },
      });
      router.replace(`/goals/${params.id}`);
    } catch {
      // Le toast d'erreur est déjà affiché par useUpdateGoal (onError).
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-md mx-auto space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="p-4 sm:p-6 max-w-md mx-auto text-center py-16">
        <p className="text-sm text-muted-foreground">Objectif introuvable.</p>
        <Link href="/goals" className="text-sm font-medium text-foreground hover:underline mt-2 inline-block">
          Retour aux objectifs
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <Link
        href={`/goals/${goal.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Retour à l&apos;objectif
      </Link>

      <h1 className="text-xl font-semibold mb-1">Modifier l&apos;objectif</h1>
      <p className="text-sm text-muted-foreground mb-6">{goal.name}</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="name">
            Nom de l&apos;objectif
          </label>
          <input
            id="name"
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="targetAmount">
            Montant cible (CHF)
          </label>
          <input
            id="targetAmount"
            type="number"
            step="0.01"
            min="0.01"
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
            min="0"
            value={monthlyTarget}
            onChange={(e) => setMonthlyTarget(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="targetDate">
            Date cible <span className="text-muted-foreground font-normal">(optionnel)</span>
          </label>
          <input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="icon">
            Icône <span className="text-muted-foreground font-normal">(emoji, optionnel)</span>
          </label>
          <input
            id="icon"
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={4}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base rounded-xl mt-2"
          disabled={updateGoal.isPending}
        >
          {updateGoal.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Enregistrer'}
        </Button>
      </form>
    </div>
  );
}
