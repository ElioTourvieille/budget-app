'use client';

import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteTransaction } from '@/lib/queries';
import { cn, formatCurrency, formatShortDate } from '@/lib/utils';
import type { Transaction, TransactionType } from '@/lib/api/types';
import { EditTransactionDialog } from './edit-transaction-dialog';

const TYPE_ICON: Record<TransactionType, typeof ArrowDownLeft> = {
  INCOME: ArrowDownLeft,
  EXPENSE: ArrowUpRight,
  TRANSFER: ArrowLeftRight,
};

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const deleteTransaction = useDeleteTransaction();
  const [editOpen, setEditOpen] = useState(false);
  const Icon = TYPE_ICON[transaction.type];
  const isIncome = transaction.type === 'INCOME';
  const isExpense = transaction.type === 'EXPENSE';

  function handleDelete() {
    toast('Supprimer cette transaction ?', {
      description: 'Le solde du compte associé sera ajusté en conséquence.',
      action: {
        label: 'Supprimer',
        onClick: () => deleteTransaction.mutate(transaction.id),
      },
      cancel: {
        label: 'Annuler',
        onClick: () => {},
      },
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          isIncome ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">
          {transaction.merchant || transaction.description || transaction.category?.name || 'Transaction'}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {transaction.account?.name ?? 'Compte'} · {transaction.category?.name ?? 'Sans catégorie'} ·{' '}
          {formatShortDate(transaction.date)}
        </p>
      </div>

      <p
        className={cn(
          'text-sm font-medium tabular-nums shrink-0',
          isIncome ? 'text-success' : 'text-foreground',
        )}
      >
        {isIncome ? '+' : isExpense ? '-' : ''}
        {formatCurrency(transaction.amount)}
      </p>

      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          aria-label="Modifier la transaction"
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Supprimer la transaction"
          className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <EditTransactionDialog transaction={transaction} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
