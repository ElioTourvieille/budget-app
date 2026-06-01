'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth.store';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router  = useRouter();
  const register  = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [firstName, setFirstName]       = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, firstName || undefined);
      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.isConflict
            ? 'Un compte avec cet email existe déjà.'
            : err.isValidation
              ? 'Données invalides. Vérifie tes informations.'
              : 'Une erreur s\'est produite. Réessaie.',
        );
      } else {
        setError('Une erreur s\'est produite. Réessaie.');
      }
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Créer un compte</h1>
      <p className="text-sm text-muted-foreground mb-6">Rejoins Klear pour gérer ton budget.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="firstName">
            Prénom{' '}
            <span className="text-muted-foreground font-normal">(optionnel)</span>
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Delphine"
            className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
          />
        </div>

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
          <label className="block text-sm font-medium mb-1.5" htmlFor="password">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
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
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Créer mon compte'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
