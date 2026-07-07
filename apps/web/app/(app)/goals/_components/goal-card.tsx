'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useDeleteGoal } from '@/lib/queries';
import { GOAL_TYPE_ICONS, GOAL_TYPE_LABELS } from '@/lib/goal-visuals';
import { cn, formatCurrency } from '@/lib/utils';
import type { Goal } from '@/lib/api/types';

export function GoalCard({ goal }: { goal: Goal }) {
  const deleteGoal = useDeleteGoal();
  const Icon = GOAL_TYPE_ICONS[goal.type];

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    toast(`Supprimer « ${goal.name} » ?`, {
      description: 'Les versements associés seront aussi supprimés.',
      action: {
        label: 'Supprimer',
        onClick: () => deleteGoal.mutate(goal.id),
      },
      cancel: {
        label: 'Annuler',
        onClick: () => {},
      },
    });
  }

  return (
    <Link
      href={`/goals/${goal.id}`}
      className="block rounded-2xl border border-border p-4 hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          {goal.icon ? (
            <span className="text-lg leading-none">{goal.icon}</span>
          ) : (
            <Icon className="size-4.5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{goal.name}</p>
          <p className="text-xs text-muted-foreground truncate">{GOAL_TYPE_LABELS[goal.type]}</p>
        </div>
        <span className="text-sm font-semibold tabular-nums shrink-0">{goal.progressPercent}%</span>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Supprimer l'objectif"
          className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10 shrink-0"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground gap-2">
        <span>
          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
        </span>
        {goal.isOnTrack !== undefined && goal.isOnTrack !== null && (
          <span className={cn('shrink-0', goal.isOnTrack ? 'text-success' : 'text-warning')}>
            {goal.isOnTrack ? 'En bonne voie' : 'En retard'}
          </span>
        )}
      </div>
    </Link>
  );
}
