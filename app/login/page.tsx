'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === 'sign_in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push('/');
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setMessage(
        'Account created. A new account starts with agent-level access — an internal team member needs to grant internal access and link your agent profile before you can see other agents\u2019 data.'
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-2">Farmio SG</p>
          <h1 className="font-display text-3xl text-primary">PTS Hub</h1>
          <p className="text-sm text-ink-soft mt-2">Sales orders and commissions, in one place.</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex gap-1 mb-6 bg-bg rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMode('sign_in')}
              className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
                mode === 'sign_in' ? 'bg-surface shadow-sm font-medium text-primary' : 'text-ink-soft'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('sign_up')}
              className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
                mode === 'sign_up' ? 'bg-surface shadow-sm font-medium text-primary' : 'text-ink-soft'
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="you@farmio.sg"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-clay bg-clay-soft rounded-lg px-3 py-2">{error}</p>
            )}
            {message && (
              <p className="text-sm text-primary bg-fresh-soft rounded-lg px-3 py-2">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
            >
              {loading ? 'Please wait…' : mode === 'sign_in' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-xs text-ink-soft text-center mt-6">
          Internal team members: ask an existing admin to grant access after you sign up.
        </p>
      </div>
    </div>
  );
}
