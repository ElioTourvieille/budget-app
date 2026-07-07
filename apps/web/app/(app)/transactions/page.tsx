'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccounts, useCategories, useTransactions } from '@/lib/queries';
import { cn, formatCurrency } from '@/lib/utils';
import { TransactionsFilters } from './_components/transactions-filters';
import { TransactionRow } from './_components/transaction-row';
import type { TransactionType } from '@/lib/api/types';

const PAGE_SIZE = 30;

export default function TransactionsPage() {
  const [type, setType] = useState<TransactionType | ''>('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const accounts = useAccounts();
  const categories = useCategories();
  const { data, isLoading } = useTransactions({
    type: type || undefined,
    accountId: accountId || undefined,
    categoryId: categoryId || undefined,
    limit,
  });

  const transactions = data?.transactions ?? [];
  const hasMore = data ? transactions.length < data.total : false;

  function resetPage() {
    setLimit(PAGE_SIZE);
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? 'Chargement…'
              : `${data?.total ?? 0} transaction${(data?.total ?? 0) > 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/transactions/new" className={cn(buttonVariants(), 'h-9 px-4 gap-1.5 shrink-0')}>
          <Plus className="size-4" />
          Nouvelle transaction
        </Link>
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Entrées</p>
            <p className="text-sm font-semibold text-success tabular-nums">
              {formatCurrency(data.summary.income)}
            </p>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Dépenses</p>
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(data.summary.expenses)}</p>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Solde net</p>
            <p
              className={cn(
                'text-sm font-semibold tabular-nums',
                data.summary.remaining >= 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {formatCurrency(data.summary.remaining)}
            </p>
          </div>
        </div>
      )}

      <TransactionsFilters
        type={type}
        onTypeChange={(v) => {
          setType(v);
          resetPage();
        }}
        accountId={accountId}
        onAccountChange={(v) => {
          setAccountId(v);
          resetPage();
        }}
        categoryId={categoryId}
        onCategoryChange={(v) => {
          setCategoryId(v);
          resetPage();
        }}
        accounts={accounts.data?.accounts ?? []}
        categories={categories.data ?? []}
      />

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground mb-4">
            Aucune transaction ne correspond à ces filtres.
          </p>
          <Link href="/transactions/new" className="text-sm font-medium text-foreground hover:underline">
            Ajouter une transaction
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <TransactionRow key={t.id} transaction={t} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Charger plus
          </button>
        </div>
      )}
    </div>
  );
}
