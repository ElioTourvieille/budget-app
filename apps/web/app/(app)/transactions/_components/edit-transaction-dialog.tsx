'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories, useUpdateTransaction } from '@/lib/queries';
import type { Transaction } from '@/lib/api/types';

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const categories = useCategories();
  const updateTransaction = useUpdateTransaction();

  const [amount, setAmount] = useState(String(transaction.amount));
  const [merchant, setMerchant] = useState(transaction.merchant ?? '');
  const [description, setDescription] = useState(transaction.description ?? '');
  const [categoryId, setCategoryId] = useState(transaction.category?.id ?? '');
  const [date, setDate] = useState(toDateInput(transaction.date));

  // Re-synchronise les champs si on rouvre le dialog sur une transaction différente.
  useEffect(() => {
    if (!open) return;
    setAmount(String(transaction.amount));
    setMerchant(transaction.merchant ?? '');
    setDescription(transaction.description ?? '');
    setCategoryId(transaction.category?.id ?? '');
    setDate(toDateInput(transaction.date));
  }, [open, transaction]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        data: {
          amount: value,
          merchant: merchant || undefined,
          description: description || undefined,
          categoryId: categoryId || undefined,
          date,
        },
      });
      onOpenChange(false);
    } catch {
      // Le toast d'erreur est déjà affiché par useUpdateTransaction (onError).
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Viewport>
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card border border-border p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-base font-semibold">Modifier la transaction</Dialog.Title>
              <Dialog.Close
                aria-label="Fermer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="edit-amount">
                  Montant (CHF)
                </label>
                <input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="edit-merchant">
                  Commerçant <span className="text-muted-foreground font-normal">(optionnel)</span>
                </label>
                <input
                  id="edit-merchant"
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="Migros, Coop…"
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="edit-description">
                  Description <span className="text-muted-foreground font-normal">(optionnel)</span>
                </label>
                <input
                  id="edit-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="edit-categoryId">
                  Catégorie
                </label>
                <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? '')}>
                  <SelectTrigger id="edit-categoryId">
                    <SelectValue>
                      {(value: string) =>
                        value ? categories.data?.find((c) => c.id === value)?.name : 'Sans catégorie'
                      }
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
                <label className="block text-sm font-medium mb-1.5" htmlFor="edit-date">
                  Date
                </label>
                <input
                  id="edit-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base rounded-xl mt-2"
                disabled={updateTransaction.isPending}
              >
                {updateTransaction.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
