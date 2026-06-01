'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Plus, ArrowLeftRight, Target, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useUser } from '@/lib/stores/auth.store';

type NavItem = { href: string; icon: React.ComponentType<{ className?: string }>; label: string };

const navItems: (NavItem | null)[] = [
  { href: '/dashboard',    icon: Home,             label: 'Accueil'       },
  { href: '/accounts',     icon: Wallet,           label: 'Comptes'       },
  null,
  { href: '/transactions', icon: ArrowLeftRight,   label: 'Transactions'  },
  { href: '/goals',        icon: Target,           label: 'Épargne'       },
];

export function AppNav() {
  const pathname   = usePathname();
  const router     = useRouter();
  const user       = useUser();
  const logout     = useAuthStore((s) => s.logout);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-border z-40">
        <div className="px-6 py-5 border-b border-border">
          <span className="text-xl font-bold tracking-tight">Klear</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item, i) => {
            if (!item) return null;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="size-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3">
          <Link
            href="/transactions/new"
            className="flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            <Plus className="size-4" />
            Ajouter
          </Link>
        </div>

        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
              {(user?.firstName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName ?? user?.email}
              </p>
              {user?.firstName && (
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
              aria-label="Se déconnecter"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom nav ───────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-border z-40">
        <div className="flex items-center justify-around h-full max-w-lg mx-auto px-2">
          {navItems.map((item, i) => {
            if (!item) {
              return (
                <Link
                  key="add"
                  href="/transactions/new"
                  className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground shadow-md"
                  aria-label="Ajouter une transaction"
                >
                  <Plus className="size-5" />
                </Link>
              );
            }

            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <item.icon className="size-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
