'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccount, useUpdateAccount } from '@/lib/queries';
import { cn } from '@/lib/utils';

const COLOR_PRESETS = [
  '#4A7C59', '#2563EB', '#7C3AED', '#B45309',
  '#6B7280', '#EF4444', '#10B981', '#F59E0B',
];

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: account, isLoading } = useAccount(params.id);
  const updateAccount = useUpdateAccount();

  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!account) return;
    setName(account.name);
    setBank(account.bank ?? '');
    setColor(account.color ?? undefined);
  }, [account]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateAccount.mutateAsync({
        id: params.id,
        data: { name, bank: bank || undefined, color },
      });
      router.replace('/accounts');
    } catch {
      // Le toast d'erreur est déjà affiché par useUpdateAccount (onError).
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-md mx-auto space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-4 sm:p-6 max-w-md mx-auto text-center py-16">
        <p className="text-sm text-muted-foreground">Compte introuvable.</p>
        <Link
          href="/accounts"
          className="text-sm font-medium text-foreground hover:underline mt-2 inline-block"
        >
          Retour aux comptes
        </Link>
      </div>
    );
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

      <h1 className="text-xl font-semibold mb-1">Modifier le compte</h1>
      <p className="text-sm text-muted-foreground mb-6">{account.name}</p>

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
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          />
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

        <div>
          <span className="block text-sm font-medium mb-1.5">Couleur</span>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                aria-label={`Couleur ${preset}`}
                className={cn(
                  'size-8 rounded-full flex items-center justify-center transition-transform hover:scale-110',
                  color === preset && 'ring-2 ring-offset-2 ring-foreground',
                )}
                style={{ backgroundColor: preset }}
              >
                {color === preset && <Check className="size-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base rounded-xl mt-2"
          disabled={updateAccount.isPending}
        >
          {updateAccount.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Enregistrer'}
        </Button>
      </form>
    </div>
  );
}
