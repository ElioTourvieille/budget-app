'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useIsInitialized } from '@/lib/stores/auth.store';
import { AppNav } from '@/components/layout/nav';
import { SplashScreen } from '@/components/splash-screen';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isInitialized = useIsInitialized();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated) {
    return <SplashScreen />;
  }

  return (
    <div>
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0 min-h-dvh">
        {children}
      </main>
    </div>
  );
}
