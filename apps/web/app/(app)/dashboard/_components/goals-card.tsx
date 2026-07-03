'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency } from '@/lib/utils';
import type { Goal } from '@/lib/api/types';

export function GoalsCard({ goals, isLoading }: { goals?: Goal[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-4 w-32" />
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const active = goals ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objectifs d&apos;épargne</CardTitle>
        <Link
          href="/goals"
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Tout voir →
        </Link>
      </CardHeader>

      {active.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun objectif en cours.{' '}
          <Link href="/goals" className="font-medium text-foreground hover:underline">
            Crée ton premier objectif
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {active.slice(0, 4).map((goal) => (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-1.5 text-sm gap-2">
                <span className="font-medium flex items-center gap-1.5 min-w-0 truncate">
                  <span className="text-base leading-none shrink-0">{goal.icon || '🎯'}</span>
                  <span className="truncate">{goal.name}</span>
                </span>
                <span className="text-muted-foreground tabular-nums shrink-0">
                  {goal.progressPercent}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground gap-2">
                <span>Reste {formatCurrency(goal.remaining)}</span>
                {goal.isOnTrack !== undefined && goal.isOnTrack !== null && (
                  <span className={cn('shrink-0', goal.isOnTrack ? 'text-success' : 'text-warning')}>
                    {goal.isOnTrack ? 'En bonne voie' : 'En retard'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
