'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateAccount } from '@/lib/queries';
import { ACCOUNT_TYPE_LABELS } from '@/lib/account-visuals';
import type { AccountType } from '@/lib/api/types';

const ACCOUNT_TYPES = Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[];

export default function NewAccountPage() {
  const router = useRouter();
  const createAccount = useCreateAccount();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('CHECKING');
  const [bank, setBank] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createAccount.mutateAsync({ name, type, bank: bank || undefined });
      router.replace('/accounts');
    } catch {
      // Le toast d'erreur est déjà affiché par useCreateAccount (onError).
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <Link
        href="/accounts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Retour aux comptes
      </Link>

      <h1 className="text-xl font-semibold mb-1">Nouveau compte</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Ajoute un compte pour suivre son solde dans Klear.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="name">
            Nom du compte
          </label>
          <input
            id="name"
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Compte courant"
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="type">
            Type de compte
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="bank">
            Banque <span className="text-muted-foreground font-normal">(optionnel)</span>
          </label>
          <input
            id="bank"
            type="text"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="UBS, PostFinance, Neon…"
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base rounded-xl mt-2"
          disabled={createAccount.isPending}
        >
          {createAccount.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Créer le compte'}
        </Button>
      </form>
    </div>
  );
}
