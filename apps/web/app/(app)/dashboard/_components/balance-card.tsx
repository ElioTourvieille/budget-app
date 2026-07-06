'use client';

import Link from 'next/link';
import { CircleDollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ACCOUNT_TYPE_ICONS } from '@/lib/account-visuals';
import type { Account } from '@/lib/api/types';

export function BalanceCard({
  accounts,
  totalBalance,
}: {
  accounts: Account[];
  totalBalance: number;
}) {
  const active = accounts.filter((a) => a.isActive);

  return (
    <Card>
      <div>
        <p className="text-sm text-muted-foreground">Solde consolidé</p>
        <p className="font-heading text-3xl font-bold tracking-tight mt-1">
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {active.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun compte actif.</p>
      ) : (
        <div className="space-y-1">
          {active.map((account) => {
            const Icon = ACCOUNT_TYPE_ICONS[account.type] ?? CircleDollarSign;
            return (
              <div
                key={account.id}
                className="flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 hover:bg-muted/60 transition-colors"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: account.color ? `${account.color}1a` : 'var(--muted)',
                  }}
                >
                  <Icon
                    className="size-4"
                    style={{ color: account.color || 'var(--muted-foreground)' }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{account.name}</p>
                  {account.bank && (
                    <p className="text-xs text-muted-foreground truncate">{account.bank}</p>
                  )}
                </div>
                <p className="text-sm font-medium tabular-nums shrink-0">
                  {formatCurrency(account.balance, account.currency)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/accounts"
        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Voir tous les comptes →
      </Link>
    </Card>
  );
}
