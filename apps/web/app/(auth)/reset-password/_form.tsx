'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api';

export function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token');

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [done, setDone]                 = useState(false);

  async function onRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authApi.resetPasswordRequest(email);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.isNotFound
          ? 'Aucun compte trouvé avec cet email.'
          : 'Une erreur s\'est produite. Réessaie.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await authApi.resetPassword(token!, password);
      setDone(true);
      setTimeout(() => router.replace('/login'), 2000);
    } catch (err) {
      setError(
        err instanceof ApiError && err.isUnauthorized
          ? 'Ce lien est invalide ou a expiré.'
          : 'Une erreur s\'est produite. Réessaie.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  // ── Success states ─────────────────────────────────────

  if (done && !token) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="size-12 mx-auto mb-4 text-success" />
        <h1 className="text-xl font-semibold mb-2">Email envoyé !</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Vérifie ta boîte mail. Le lien est valable 30 minutes.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-foreground hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  if (done && token) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="size-12 mx-auto mb-4 text-success" />
        <h1 className="text-xl font-semibold mb-2">Mot de passe mis à jour !</h1>
        <p className="text-sm text-muted-foreground">
          Redirection vers la connexion…
        </p>
      </div>
    );
  }

  // ── Step 2: new password ────────────────────────────────

  if (token) {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-1">Nouveau mot de passe</h1>
        <p className="text-sm text-muted-foreground mb-6">Choisis un nouveau mot de passe.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="password">
              Nouveau mot de passe
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
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="confirm">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all placeholder:text-muted-foreground"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base rounded-xl mt-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Réinitialiser'}
          </Button>
        </form>
      </div>
    );
  }

  // ── Step 1: request reset ───────────────────────────────

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Mot de passe oublié ?</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Saisis ton email et on t&apos;envoie un lien de réinitialisation.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onRequestReset} className="space-y-4">
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

        <Button
          type="submit"
          className="w-full h-11 text-base rounded-xl mt-2"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Envoyer le lien'}
        </Button>
      </form>

      <p className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
