'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Account, Category, TransactionType } from '@/lib/api/types';

const TYPE_LABELS: Record<TransactionType, string> = {
  EXPENSE: 'Dépense',
  INCOME: 'Entrée',
  TRANSFER: 'Virement',
};

const triggerClass = 'w-auto min-w-40';

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
      <Select value={type} onValueChange={(value) => onTypeChange(value ?? '')}>
        <SelectTrigger className={triggerClass}>
          <SelectValue>{(value: TransactionType | '') => (value ? TYPE_LABELS[value] : 'Tous les types')}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tous les types</SelectItem>
          {(Object.keys(TYPE_LABELS) as TransactionType[]).map((t) => (
            <SelectItem key={t} value={t}>
              {TYPE_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={accountId} onValueChange={(value) => onAccountChange(value ?? '')}>
        <SelectTrigger className={triggerClass}>
          <SelectValue>
            {(value: string) => (value ? accounts.find((a) => a.id === value)?.name : 'Tous les comptes')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tous les comptes</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryId} onValueChange={(value) => onCategoryChange(value ?? '')}>
        <SelectTrigger className={triggerClass}>
          <SelectValue>
            {(value: string) => (value ? categories.find((c) => c.id === value)?.name : 'Toutes les catégories')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Toutes les catégories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
