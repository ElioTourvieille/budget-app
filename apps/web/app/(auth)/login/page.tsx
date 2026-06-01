'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth.store';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const router  = useRouter();
  const login   = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(
        err instanceof ApiError && err.isUnauthorized
          ? 'Email ou mot de passe incorrect.'
          : 'Une erreur s\'est produite. Réessaie.',
      );
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Bon retour 👋</h1>
      <p className="text-sm text-muted-foreground mb-6">Connecte-toi à ton compte Klear.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.ch"
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium" htmlFor="password">
              Mot de passe
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 pr-10 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base rounded-xl mt-2"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Se connecter'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-medium text-foreground hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
