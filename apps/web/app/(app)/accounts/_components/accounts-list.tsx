'use client';

import Link from 'next/link';
import { useDeleteAccount } from '@/lib/queries';
import { AccountRow } from './account-row';
import type { Account } from '@/lib/api/types';

export function AccountsList({ accounts }: { accounts: Account[] }) {
  const deleteAccount = useDeleteAccount();

  const active = accounts.filter((a) => a.isActive);
  const inactive = accounts.filter((a) => !a.isActive);

  function handleDeactivate(id: string) {
    const confirmed = window.confirm(
      'Désactiver ce compte ? Il ne sera plus compté dans ton solde consolidé, mais son historique de transactions est conservé.',
    );
    if (!confirmed) return;
    deleteAccount.mutate(id);
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-muted-foreground mb-4">Aucun compte pour l&apos;instant.</p>
        <Link href="/accounts/new" className="text-sm font-medium text-foreground hover:underline">
          Ajouter ton premier compte
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {active.map((account) => (
          <AccountRow key={account.id} account={account} onDeactivate={handleDeactivate} />
        ))}
      </div>

      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Comptes désactivés
          </p>
          <div className="space-y-3">
            {inactive.map((account) => (
              <AccountRow key={account.id} account={account} onDeactivate={handleDeactivate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
