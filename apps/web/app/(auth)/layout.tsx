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
    <div className="min-h-dvh bg-[#f5f0e6] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-3xl font-bold tracking-tight">Klear</span>
        <p className="mt-1 text-sm text-muted-foreground">Ton assistant budget personnel</p>
      </div>

      <div className="w-full max-w-[420px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-border p-8">
        {children}
      </div>
    </div>
  );
}
