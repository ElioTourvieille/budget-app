'use client';

import { useUser } from '@/lib/stores/auth.store';

export default function DashboardPage() {
  const user = useUser();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">
        Bonjour {user?.firstName ?? 'toi'} 👋
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ton dashboard arrive bientôt.
      </p>
    </div>
  );
}
