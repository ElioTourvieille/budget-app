'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  Home,
  Wallet,
  Plus,
  ArrowLeftRight,
  Target,
  Receipt,
  Landmark,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useUser } from '@/lib/stores/auth.store';

type NavItem = { href: string; icon: React.ComponentType<{ className?: string }>; label: string };

const desktopNavItems: NavItem[] = [
  { href: '/dashboard',       icon: Home,           label: 'Tableau de bord' },
  { href: '/accounts',        icon: Wallet,         label: 'Comptes'         },
  { href: '/transactions',    icon: ArrowLeftRight, label: 'Transactions'    },
  { href: '/goals',           icon: Target,         label: 'Épargne'         },
  { href: '/reimbursements',  icon: Receipt,        label: 'Remboursements'  },
  { href: '/third-pillar',    icon: Landmark,       label: '3e pilier A'     },
  { href: '/recommendations', icon: Sparkles,       label: 'Recommandations' },
];

const mobileNavItems: (NavItem | null)[] = [
  { href: '/dashboard',    icon: Home,           label: 'Accueil'      },
  { href: '/accounts',     icon: Wallet,         label: 'Comptes'      },
  null,
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/goals',        icon: Target,         label: 'Épargne'      },
];

function KlarLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="size-[18px] shrink-0 bg-primary"
        style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
      />
      <span className="font-heading font-bold text-xl text-sidebar-foreground">Klear</span>
    </div>
  );
}

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
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-sidebar z-40">
        <div className="px-6 py-5">
          <KlarLogo />
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {desktopNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
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
            className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            Transaction
          </Link>
        </div>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="size-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-medium text-sidebar-foreground shrink-0">
              {(user?.firstName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.firstName ?? user?.email}
              </p>
              {user?.firstName && (
                <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors p-1 rounded"
              aria-label="Se déconnecter"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom nav ───────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around h-full max-w-lg mx-auto px-2">
          {mobileNavItems.map((item) => {
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
