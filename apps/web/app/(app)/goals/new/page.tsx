'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateGoal } from '@/lib/queries';
import { GOAL_TYPE_LABELS, SELECTABLE_GOAL_TYPES } from '@/lib/goal-visuals';
import type { GoalType } from '@/lib/api/types';

export default function NewGoalPage() {
  const router = useRouter();
  const createGoal = useCreateGoal();

  const [name, setName] = useState('');
  const [type, setType] = useState<GoalType>('VACATION');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createGoal.mutateAsync({
        name,
        type,
        targetAmount: Number(targetAmount),
        monthlyTarget: monthlyTarget ? Number(monthlyTarget) : undefined,
        targetDate: targetDate || undefined,
        icon: icon || undefined,
      });
      router.replace('/goals');
    } catch {
      // Le toast d'erreur est déjà affiché par useCreateGoal (onError).
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <Link
        href="/goals"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Retour aux objectifs
      </Link>

      <h1 className="text-xl font-semibold mb-1">Nouvel objectif</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Définis un objectif d&apos;épargne et suis ta progression.
      </p>

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
            placeholder="Vacances au Japon"
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="type">
            Type
          </label>
          <Select value={type} onValueChange={(value) => value && setType(value)}>
            <SelectTrigger id="type">
              <SelectValue>{(value: GoalType) => GOAL_TYPE_LABELS[value]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SELECTABLE_GOAL_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {GOAL_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            placeholder="3000"
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
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
            placeholder="200"
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
            placeholder="✈️"
            maxLength={4}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base rounded-xl mt-2"
          disabled={createGoal.isPending}
        >
          {createGoal.isPending ? <Loader2 className="size-4 animate-spin" /> : "Créer l'objectif"}
        </Button>
      </form>
    </div>
  );
}
