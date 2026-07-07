'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, EyeOff, RotateCcw, Check, X, CircleDollarSign } from 'lucide-react';
import { useUpdateAccount, useUpdateAccountBalance } from '@/lib/queries';
import { ACCOUNT_TYPE_ICONS, ACCOUNT_TYPE_LABELS } from '@/lib/account-visuals';
import { cn, formatCurrency } from '@/lib/utils';
import type { Account } from '@/lib/api/types';

export function AccountRow({
  account,
  onDeactivate,
}: {
  account: Account;
  onDeactivate: (account: Account) => void;
}) {
  const Icon = ACCOUNT_TYPE_ICONS[account.type] ?? CircleDollarSign;
  const updateBalance = useUpdateAccountBalance();
  const updateAccount = useUpdateAccount();

  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(account.balance);

  function startEdit() {
    setBalanceInput(account.balance);
    setEditingBalance(true);
  }

  function saveBalance() {
    const value = Number(balanceInput);
    if (Number.isNaN(value)) return;
    updateBalance.mutate(
      { id: account.id, balance: value },
      { onSuccess: () => setEditingBalance(false) },
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-border p-4',
        !account.isActive && 'opacity-60',
      )}
    >
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: account.color ? `${account.color}1a` : 'var(--muted)' }}
      >
        <Icon className="size-5" style={{ color: account.color || 'var(--muted-foreground)' }} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{account.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {ACCOUNT_TYPE_LABELS[account.type]}
          {account.bank ? ` · ${account.bank}` : ''}
        </p>
      </div>

      {editingBalance ? (
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            step="0.01"
            autoFocus
            value={balanceInput}
            onChange={(e) => setBalanceInput(e.target.value)}
            className="w-28 px-2 py-1.5 rounded-lg bg-input-background border border-border text-sm text-right outline-none focus:ring-2 focus:ring-ring/40"
          />
          <button
            type="button"
            onClick={saveBalance}
            disabled={updateBalance.isPending}
            aria-label="Confirmer le solde"
            className="text-success hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            <Check className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setEditingBalance(false)}
            aria-label="Annuler"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="text-sm font-medium tabular-nums shrink-0 hover:underline underline-offset-2"
        >
          {formatCurrency(account.balance, account.currency)}
        </button>
      )}

      <div className="flex items-center gap-1 shrink-0 border-l border-border pl-3 ml-1">
        <Link
          href={`/accounts/${account.id}/edit`}
          aria-label="Modifier le compte"
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
        >
          <Pencil className="size-4" />
        </Link>
        {account.isActive ? (
          <button
            type="button"
            onClick={() => onDeactivate(account)}
            aria-label="Désactiver le compte"
            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
          >
            <EyeOff className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => updateAccount.mutate({ id: account.id, data: { isActive: true } })}
            disabled={updateAccount.isPending}
            aria-label="Réactiver le compte"
            className="text-muted-foreground hover:text-success transition-colors p-1.5 rounded-lg hover:bg-success/10 disabled:opacity-40"
          >
            <RotateCcw className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
