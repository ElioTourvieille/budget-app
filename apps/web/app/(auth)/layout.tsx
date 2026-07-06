'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useIsInitialized } from '@/lib/stores/auth.store';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isInitialized = useIsInitialized();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isInitialized, isAuthenticated, router]);

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="size-[22px] shrink-0 bg-primary"
            style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
          />
          <span className="font-heading text-3xl font-bold tracking-tight">Klear</span>
        </div>
        <p className="text-sm text-muted-foreground">Ton assistant budget personnel</p>
      </div>

      <div className="w-full max-w-[420px] bg-card sm:rounded-2xl sm:shadow-sm sm:border sm:border-border p-8">
        {children}
      </div>
    </div>
  );
}
