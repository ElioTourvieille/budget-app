'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccounts, useCategories, useCreateRecurring, useCreateTransaction } from '@/lib/queries';
import { cn } from '@/lib/utils';
import type { Frequency, InsuranceType, TransactionType } from '@/lib/api/types';

type CreatableType = Exclude<TransactionType, 'TRANSFER'>;

const TYPE_LABELS: Record<CreatableType, string> = {
  EXPENSE: 'Dépense',
  INCOME: 'Entrée',
};

const INSURANCE_LABELS: Record<InsuranceType, string> = {
  LAMAL: 'LAMal',
  LCA: 'LCA',
  OTHER: 'Autre',
};

const FREQUENCY_LABELS: Record<Frequency, string> = {
  DAILY: 'Chaque jour',
  WEEKLY: 'Chaque semaine',
  BIWEEKLY: 'Toutes les 2 semaines',
  MONTHLY: 'Chaque mois',
  QUARTERLY: 'Chaque trimestre',
  YEARLY: 'Chaque année',
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewTransactionPage() {
  const router = useRouter();
  const createTransaction = useCreateTransaction();
  const createRecurring = useCreateRecurring();
  const accounts = useAccounts();
  const categories = useCategories();

  const [type, setType] = useState<CreatableType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayIso());
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [isReimbursable, setIsReimbursable] = useState(false);
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('LAMAL');
  const [isRecurringTemplate, setIsRecurringTemplate] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>('MONTHLY');

  const accountOptions = accounts.data?.accounts ?? [];
  const isPending = createTransaction.isPending || createRecurring.isPending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) return;
    try {
      if (isRecurringTemplate) {
        await createRecurring.mutateAsync({
          name: description || merchant || TYPE_LABELS[type],
          accountId,
          type,
          categoryId: categoryId || undefined,
          merchant: merchant || undefined,
          amount: Number(amount),
          frequency,
          nextDate: date,
        });
      } else {
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
      }
      router.replace('/transactions');
    } catch {
      // Le toast d'erreur est déjà affiché par les hooks (onError).
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
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(TYPE_LABELS) as CreatableType[]).map((t) => (
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
        <p className="text-xs text-muted-foreground -mt-2">
          Besoin de déplacer de l&apos;argent entre deux comptes ?{' '}
          <Link href="/transfers/new" className="font-medium text-foreground hover:underline">
            Faire un virement
          </Link>
        </p>

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
          <Select
            value={accountId || null}
            onValueChange={(value) => setAccountId(value ?? '')}
          >
            <SelectTrigger id="accountId">
              <SelectValue placeholder="Sélectionner un compte">
                {(value: string) => accountOptions.find((a) => a.id === value)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {accountOptions.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium" htmlFor="categoryId">
              Catégorie <span className="text-muted-foreground font-normal">(optionnel)</span>
            </label>
            <Link href="/categories" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              Gérer les catégories
            </Link>
          </div>
          <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? '')}>
            <SelectTrigger id="categoryId">
              <SelectValue>
                {(value: string) => (value ? categories.data?.find((c) => c.id === value)?.name : 'Sans catégorie')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sans catégorie</SelectItem>
              {(categories.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="date">
            {isRecurringTemplate ? 'Première échéance' : 'Date'}
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
            {isRecurringTemplate ? (
              'Nom de la récurrence'
            ) : (
              <>
                Description <span className="text-muted-foreground font-normal">(optionnel)</span>
              </>
            )}
          </label>
          <input
            id="description"
            type="text"
            required={isRecurringTemplate}
            placeholder={isRecurringTemplate ? 'Salaire, Loyer, Abonnement…' : undefined}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div className="rounded-xl border border-border p-3 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={isRecurringTemplate}
              onChange={(e) => setIsRecurringTemplate(e.target.checked)}
              className="size-4 rounded border-border"
            />
            Rendre récurrent
          </label>
          {isRecurringTemplate && (
            <>
              <p className="text-xs text-muted-foreground -mt-1">
                Génère automatiquement cette transaction à chaque échéance (salaire, loyer,
                abonnement…), avec possibilité de modifier le montant plus tard.
              </p>
              <Select value={frequency} onValueChange={(value) => value && setFrequency(value)}>
                <SelectTrigger>
                  <SelectValue>{(value: Frequency) => FREQUENCY_LABELS[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((f) => (
                    <SelectItem key={f} value={f}>
                      {FREQUENCY_LABELS[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {type === 'EXPENSE' && !isRecurringTemplate && (
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
              <Select value={insuranceType} onValueChange={(value) => value && setInsuranceType(value)}>
                <SelectTrigger>
                  <SelectValue>{(value: InsuranceType) => INSURANCE_LABELS[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(INSURANCE_LABELS) as InsuranceType[]).map((i) => (
                    <SelectItem key={i} value={i}>
                      {INSURANCE_LABELS[i]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-base rounded-xl mt-2"
          disabled={isPending || !accountId}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isRecurringTemplate ? (
            'Créer la récurrence'
          ) : (
            'Ajouter la transaction'
          )}
        </Button>
      </form>
    </div>
  );
}
