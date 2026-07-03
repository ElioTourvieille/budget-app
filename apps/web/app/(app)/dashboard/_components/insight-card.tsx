'use client';

import { Sparkles, RotateCw } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useInsight } from '@/lib/queries';
import { InsightMarkdown } from './insight-markdown';

export function InsightCard() {
  // staleTime (6h) matches le cache serveur — pas de re-fetch tant que les
  // données sont fraîches. `refetch` ci-dessous revalide sans forcer une
  // régénération côté Claude (pas de `force: true`).
  const { data, isLoading, isFetching, isError, refetch } = useInsight({ type: 'summary' });

  return (
    <Card className="bg-primary text-primary-foreground border-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-primary-foreground">
          <Sparkles className="size-4" />
          Insight du jour
        </CardTitle>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Actualiser l'analyse"
          className="text-primary-foreground/70 hover:text-primary-foreground transition-colors disabled:opacity-40"
        >
          <RotateCw className={isFetching ? 'size-3.5 animate-spin' : 'size-3.5'} />
        </button>
      </CardHeader>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-primary-foreground/15" />
          <Skeleton className="h-4 w-5/6 bg-primary-foreground/15" />
          <Skeleton className="h-4 w-2/3 bg-primary-foreground/15" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-primary-foreground/80">
            L&apos;analyse IA est temporairement indisponible.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-medium underline underline-offset-2 shrink-0"
          >
            Réessayer
          </button>
        </div>
      ) : data ? (
        <div className="[&_strong]:font-semibold [&_p]:text-primary-foreground/90 [&_li]:text-primary-foreground/90 [&_h4]:text-primary-foreground">
          <InsightMarkdown content={data.content} />
        </div>
      ) : (
        <p className="text-sm text-primary-foreground/80">
          Pas encore assez de données pour générer une analyse.
        </p>
      )}
    </Card>
  );
}
