'use client';

import { useState } from 'react';
import { RotateCw, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useInsight } from '@/lib/queries';
import { InsightMarkdown } from '@/components/insight-markdown';
import { cn } from '@/lib/utils';
import type { InsightType } from '@/lib/api/types';

const TABS: { key: InsightType; label: string }[] = [
  { key: 'summary',  label: "Vue d'ensemble" },
  { key: 'spending', label: 'Dépenses'        },
  { key: 'budget',   label: 'Budget'          },
  { key: 'goals',    label: 'Objectifs'       },
];

export default function RecommendationsPage() {
  const [type, setType] = useState<InsightType>('summary');
  const { data, isLoading, isFetching, isError, refetch } = useInsight({ type });

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Recommandations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Analyses générées par IA à partir de tes données financières.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
              type === t.key
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/70',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="bg-accent border-transparent">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-accent-foreground">
            <Sparkles className="size-4" />
            {TABS.find((t) => t.key === type)?.label}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Régénérer l'analyse"
            className="text-accent-foreground/60 hover:text-accent-foreground transition-colors disabled:opacity-40"
          >
            <RotateCw className={isFetching ? 'size-3.5 animate-spin' : 'size-3.5'} />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-foreground/70">
              L&apos;analyse IA est temporairement indisponible.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs font-medium text-accent-foreground underline underline-offset-2 shrink-0"
            >
              Réessayer
            </button>
          </div>
        ) : data ? (
          <div className="[&_strong]:font-semibold [&_h4]:text-accent-foreground">
            <InsightMarkdown content={data.content} />
          </div>
        ) : (
          <p className="text-sm text-foreground/70">
            Pas encore assez de données pour générer une analyse.
          </p>
        )}
      </Card>
    </div>
  );
}
