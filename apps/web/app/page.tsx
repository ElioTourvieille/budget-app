'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useIsInitialized } from '@/lib/stores/auth.store';
import { SplashScreen } from '@/components/splash-screen';

export default function RootPage() {
  const router          = useRouter();
  const isInitialized   = useIsInitialized();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isInitialized) return;
    router.replace(isAuthenticated ? '/dashboard' : '/login');
  }, [isInitialized, isAuthenticated, router]);

  return <SplashScreen />;
}
