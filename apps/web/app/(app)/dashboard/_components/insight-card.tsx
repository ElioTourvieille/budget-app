'use client';

import Link from 'next/link';
import { Sparkles, RotateCw, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useInsight } from '@/lib/queries';

// Extrait la première phrase descriptive du markdown (saute titres/tableaux)
// pour un aperçu compact sur le dashboard — l'analyse complète reste sur /recommendations.
function extractPreview(content: string): string {
  const line = content
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('---'));

  return (line ?? '').replace(/\*\*(.*?)\*\*/g, '$1');
}

export function InsightCard() {
  // staleTime (6h) matches le cache serveur — pas de re-fetch tant que les
  // données sont fraîches. `refetch` ci-dessous revalide sans forcer une
  // régénération côté Claude (pas de `force: true`).
  const { data, isLoading, isFetching, isError, refetch } = useInsight({ type: 'summary' });
  const preview = data ? extractPreview(data.content) : '';

  return (
    <Card className="bg-accent border-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-accent-foreground">
          <Sparkles className="size-4" />
          Insight du jour
        </CardTitle>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Actualiser l'analyse"
          className="text-accent-foreground/60 hover:text-accent-foreground transition-colors disabled:opacity-40"
        >
          <RotateCw className={isFetching ? 'size-3.5 animate-spin' : 'size-3.5'} />
        </button>
      </CardHeader>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
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
        <>
          <p className="text-sm text-foreground/80 line-clamp-2">{preview}</p>
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent-foreground hover:underline underline-offset-2 w-fit"
          >
            Voir l&apos;analyse complète
            <ArrowRight className="size-3.5" />
          </Link>
        </>
      ) : (
        <p className="text-sm text-foreground/70">
          Pas encore assez de données pour générer une analyse.
        </p>
      )}
    </Card>
  );
}
