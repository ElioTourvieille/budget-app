'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/lib/queries';
import type { Category } from '@/lib/api/types';

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');

  const systemCategories = (data ?? []).filter((c) => c.isSystem);
  const customCategories = (data ?? []).filter((c) => !c.isSystem);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory.mutateAsync({ name: name.trim(), icon: icon || undefined });
      setName('');
      setIcon('');
    } catch {
      // Le toast d'erreur est déjà affiché par useCreateCategory (onError).
    }
  }

  function handleDelete(category: Category) {
    toast(`Supprimer « ${category.name} » ?`, {
      description: 'Les transactions liées perdront cette catégorie (elle devient "Sans catégorie").',
      action: {
        label: 'Supprimer',
        onClick: () => deleteCategory.mutate(category.id),
      },
      cancel: {
        label: 'Annuler',
        onClick: () => {},
      },
    });
  }

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto space-y-6">
      <Link
        href="/transactions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Retour aux transactions
      </Link>

      <div>
        <h1 className="text-xl font-semibold">Catégories</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Catégorise tes transactions pour mieux suivre tes dépenses.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <div className="w-14 shrink-0">
          <label className="block text-sm font-medium mb-1.5" htmlFor="icon">
            Icône
          </label>
          <input
            id="icon"
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🎨"
            maxLength={4}
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm text-center outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1.5" htmlFor="name">
            Nouvelle catégorie
          </label>
          <input
            id="name"
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cadeaux"
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>
        <Button type="submit" disabled={createCategory.isPending} className="h-10 px-3 shrink-0">
          {createCategory.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Mes catégories
            </p>
            {customCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune catégorie perso pour l&apos;instant.</p>
            ) : (
              <div className="space-y-1.5">
                {customCategories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="text-base leading-none shrink-0">{c.icon || '🏷️'}</span>
                    <span className="text-sm font-medium flex-1 min-w-0 truncate">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      aria-label="Supprimer la catégorie"
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Catégories système
            </p>
            <div className="space-y-1.5">
              {systemCategories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 opacity-80"
                >
                  <span className="text-base leading-none shrink-0">{c.icon || '🏷️'}</span>
                  <span className="text-sm font-medium flex-1 min-w-0 truncate">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
