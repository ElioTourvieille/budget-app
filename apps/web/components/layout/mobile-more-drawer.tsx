'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Drawer } from '@base-ui/react/drawer';
import { MoreHorizontal, Wallet, Receipt, Landmark, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const MORE_ITEMS = [
  { href: '/accounts',        icon: Wallet,   label: 'Comptes'         },
  { href: '/reimbursements',  icon: Receipt,  label: 'Remboursements'  },
  { href: '/third-pillar',    icon: Landmark, label: '3e pilier A'     },
  { href: '/recommendations', icon: Sparkles, label: 'Recommandations' },
];

export function MobileMoreDrawer({ isActive }: { isActive: (href: string) => boolean }) {
  const [open, setOpen] = useState(false);
  const highlighted = MORE_ITEMS.some((item) => isActive(item.href));

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger
        className={cn(
          'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
          highlighted ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        <MoreHorizontal className="size-5" />
        <span className="text-[10px] font-medium">Plus</span>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Viewport>
          <Drawer.Popup className="fixed bottom-0 inset-x-0 z-50 rounded-t-2xl bg-card border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
            <div className="space-y-1">
              {MORE_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60',
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
