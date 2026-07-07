'use client';

import type { Account, Category, TransactionType } from '@/lib/api/types';

const TYPE_LABELS: Record<TransactionType, string> = {
  EXPENSE: 'Dépense',
  INCOME: 'Entrée',
  TRANSFER: 'Virement',
};

const selectClass =
  'px-3 py-2 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all';

export function TransactionsFilters({
  type,
  onTypeChange,
  accountId,
  onAccountChange,
  categoryId,
  onCategoryChange,
  accounts,
  categories,
}: {
  type: TransactionType | '';
  onTypeChange: (v: TransactionType | '') => void;
  accountId: string;
  onAccountChange: (v: string) => void;
  categoryId: string;
  onCategoryChange: (v: string) => void;
  accounts: Account[];
  categories: Category[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value as TransactionType | '')}
        className={selectClass}
      >
        <option value="">Tous les types</option>
        {(Object.keys(TYPE_LABELS) as TransactionType[]).map((t) => (
          <option key={t} value={t}>
            {TYPE_LABELS[t]}
          </option>
        ))}
      </select>

      <select value={accountId} onChange={(e) => onAccountChange(e.target.value)} className={selectClass}>
        <option value="">Tous les comptes</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <select value={categoryId} onChange={(e) => onCategoryChange(e.target.value)} className={selectClass}>
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
