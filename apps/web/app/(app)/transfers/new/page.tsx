'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccounts, useCreateTransfer } from '@/lib/queries';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewTransferPage() {
  const router = useRouter();
  const createTransfer = useCreateTransfer();
  const accounts = useAccounts();
  const accountOptions = accounts.data?.accounts ?? [];

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState('');

  const sameAccount = !!fromAccountId && fromAccountId === toAccountId;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || sameAccount) return;
    try {
      await createTransfer.mutateAsync({
        fromAccountId,
        toAccountId,
        amount: Number(amount),
        date,
        note: note || undefined,
      });
      router.replace('/transactions');
    } catch {
      // Le toast d'erreur est déjà affiché par useCreateTransfer (onError).
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

      <h1 className="text-xl font-semibold mb-1">Nouveau virement</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Déplace de l&apos;argent entre deux de tes comptes.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="fromAccountId">
            Compte source
          </label>
          <Select value={fromAccountId || null} onValueChange={(value) => setFromAccountId(value ?? '')}>
            <SelectTrigger id="fromAccountId">
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
          <label className="block text-sm font-medium mb-1.5" htmlFor="toAccountId">
            Compte destination
          </label>
          <Select value={toAccountId || null} onValueChange={(value) => setToAccountId(value ?? '')}>
            <SelectTrigger id="toAccountId">
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
          {sameAccount && (
            <p className="text-xs text-destructive mt-1.5">
              Le compte destination doit être différent du compte source.
            </p>
          )}
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
          <label className="block text-sm font-medium mb-1.5" htmlFor="note">
            Note <span className="text-muted-foreground font-normal">(optionnel)</span>
          </label>
          <input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base rounded-xl mt-2"
          disabled={createTransfer.isPending || !fromAccountId || !toAccountId || sameAccount}
        >
          {createTransfer.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Effectuer le virement'}
        </Button>
      </form>
    </div>
  );
}
