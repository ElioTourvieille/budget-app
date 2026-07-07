'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccounts, useCategories, useCreateTransaction } from '@/lib/queries';
import { cn } from '@/lib/utils';
import type { InsuranceType, TransactionType } from '@/lib/api/types';

const TYPE_LABELS: Record<TransactionType, string> = {
  EXPENSE: 'Dépense',
  INCOME: 'Entrée',
  TRANSFER: 'Virement',
};

const INSURANCE_LABELS: Record<InsuranceType, string> = {
  LAMAL: 'LAMal',
  LCA: 'LCA',
  OTHER: 'Autre',
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewTransactionPage() {
  const router = useRouter();
  const createTransaction = useCreateTransaction();
  const accounts = useAccounts();
  const categories = useCategories();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayIso());
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [isReimbursable, setIsReimbursable] = useState(false);
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('LAMAL');

  const accountOptions = accounts.data?.accounts ?? [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) return;
    try {
      await createTransaction.mutateAsync({
        amount: Number(amount),
        type,
        accountId,
        date,
        categoryId: categoryId || undefined,
        merchant: merchant || undefined,
        description: description || undefined,
        isReimbursable: type === 'EXPENSE' ? isReimbursable : undefined,
        insuranceType: type === 'EXPENSE' && isReimbursable ? insuranceType : undefined,
      });
      router.replace('/transactions');
    } catch {
      // Le toast d'erreur est déjà affiché par useCreateTransaction (onError).
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <Link
        href="/transactions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Retour aux transactions
      </Link>

      <h1 className="text-xl font-semibold mb-1">Nouvelle transaction</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Ajoute une entrée, une dépense ou un virement.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(TYPE_LABELS) as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'h-10 rounded-lg border text-sm font-medium transition-colors',
                type === t
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="amount">
            Montant (CHF)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="accountId">
            Compte
          </label>
          <select
            id="accountId"
            required
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          >
            <option value="" disabled>
              Sélectionner un compte
            </option>
            {accountOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="categoryId">
            Catégorie <span className="text-muted-foreground font-normal">(optionnel)</span>
          </label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          >
            <option value="">Sans catégorie</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="merchant">
            Commerçant <span className="text-muted-foreground font-normal">(optionnel)</span>
          </label>
          <input
            id="merchant"
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="Migros, Coop…"
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="description">
            Description <span className="text-muted-foreground font-normal">(optionnel)</span>
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          />
        </div>

        {type === 'EXPENSE' && (
          <div className="rounded-xl border border-border p-3 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isReimbursable}
                onChange={(e) => setIsReimbursable(e.target.checked)}
                className="size-4 rounded border-border"
              />
              Remboursable par une assurance
            </label>
            {isReimbursable && (
              <select
                value={insuranceType}
                onChange={(e) => setInsuranceType(e.target.value as InsuranceType)}
                className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
              >
                {(Object.keys(INSURANCE_LABELS) as InsuranceType[]).map((i) => (
                  <option key={i} value={i}>
                    {INSURANCE_LABELS[i]}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-base rounded-xl mt-2"
          disabled={createTransaction.isPending || !accountId}
        >
          {createTransaction.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Ajouter la transaction'
          )}
        </Button>
      </form>
    </div>
  );
}
