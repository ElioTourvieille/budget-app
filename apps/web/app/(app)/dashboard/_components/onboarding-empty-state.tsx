import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function OnboardingEmptyState({ firstName }: { firstName?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24 max-w-sm mx-auto min-h-dvh">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
        <Wallet className="size-6 text-primary" />
      </div>
      <h1 className="text-xl font-semibold mb-1.5">
        Bienvenue{firstName ? `, ${firstName}` : ''} 👋
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Ajoute ton premier compte bancaire pour commencer à suivre ton budget avec Klear.
      </p>
      <Link href="/accounts" className={cn(buttonVariants(), 'h-11 px-6 rounded-xl')}>
        Ajouter un compte
      </Link>
    </div>
  );
}
