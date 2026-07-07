'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGoals } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { GoalCard } from './_components/goal-card';

export default function GoalsPage() {
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  const { data, isLoading } = useGoals({ isCompleted: tab === 'completed' });
  const goals = (data ?? []).filter((g) => g.type !== 'THIRD_PILLAR');

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Épargne</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Objectifs d&apos;épargne et projets financiers
          </p>
        </div>
        <Link href="/goals/new" className={cn(buttonVariants(), 'h-9 px-4 gap-1.5 shrink-0')}>
          <Plus className="size-4" />
          Nouvel objectif
        </Link>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('active')}
          className={cn(
            'h-9 px-4 rounded-lg text-sm font-medium transition-colors',
            tab === 'active' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          En cours
        </button>
        <button
          type="button"
          onClick={() => setTab('completed')}
          className={cn(
            'h-9 px-4 rounded-lg text-sm font-medium transition-colors',
            tab === 'completed' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Atteints
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground mb-4">
            {tab === 'active'
              ? "Aucun objectif en cours."
              : 'Aucun objectif atteint pour le moment.'}
          </p>
          {tab === 'active' && (
            <Link href="/goals/new" className="text-sm font-medium text-foreground hover:underline">
              Crée ton premier objectif
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
