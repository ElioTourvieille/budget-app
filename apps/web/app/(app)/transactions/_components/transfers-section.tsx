'use client';

import Link from 'next/link';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteTransfer, useTransfers } from '@/lib/queries';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import type { Transfer } from '@/lib/api/types';

export function TransfersSection() {
  const { data, isLoading } = useTransfers();
  const transfers = data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Virements</CardTitle>
        <Link
          href="/transfers/new"
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          <Plus className="size-3.5" />
          Nouveau virement
        </Link>
      </CardHeader>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : transfers.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun virement pour l&apos;instant.</p>
      ) : (
        <div className="space-y-1">
          {transfers.map((t) => (
            <TransferRow key={t.id} transfer={t} />
          ))}
        </div>
      )}
    </Card>
  );
}

function TransferRow({ transfer }: { transfer: Transfer }) {
  const deleteTransfer = useDeleteTransfer();

  function handleDelete() {
    toast('Supprimer ce virement ?', {
      description: 'Les soldes des deux comptes seront ajustés en conséquence.',
      action: {
        label: 'Supprimer',
        onClick: () => deleteTransfer.mutate(transfer.id),
      },
      cancel: {
        label: 'Annuler',
        onClick: () => {},
      },
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 hover:bg-muted/60 transition-colors">
      <div className="min-w-0 flex-1 flex items-center gap-1.5 text-sm">
        <span className="font-medium truncate">{transfer.from.name}</span>
        <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
        <span className="font-medium truncate">{transfer.to.name}</span>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{formatShortDate(transfer.date)}</span>
      <span className="text-sm font-medium tabular-nums shrink-0">{formatCurrency(transfer.amount)}</span>
      <button
        type="button"
        onClick={handleDelete}
        aria-label="Supprimer le virement"
        className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10 shrink-0"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
