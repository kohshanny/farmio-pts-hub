'use client';

import { useState } from 'react';
import { linkProfileToAgent } from '@/app/actions/mutations';
import type { Profile } from '@/types/database';
import { useRouter } from 'next/navigation';

export function PromoteInternalForm({ profiles }: { profiles: Profile[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);

  async function handlePromote() {
    if (!selected) return;
    setSaving(true);
    // role = internal, agent_id cleared (set to null isn't supported by this helper signature,
    // so we just pass the agent's current agent_id through as null via empty string handling upstream)
    await linkProfileToAgent(selected, null, 'internal');
    setSaving(false);
    setSelected('');
    router.refresh();
  }

  const candidates = profiles.filter((p) => p.role !== 'internal');

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {profiles
          .filter((p) => p.role === 'internal')
          .map((p) => (
            <p key={p.id} className="text-sm text-fresh">
              ✓ {p.email} — internal access
            </p>
          ))}
      </div>
      {candidates.length === 0 ? (
        <p className="text-sm text-ink-soft">No other accounts to promote yet.</p>
      ) : (
        <div className="flex gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select account…</option>
            {candidates.map((p) => (
              <option key={p.id} value={p.id}>
                {p.email}
              </option>
            ))}
          </select>
          <button
            onClick={handlePromote}
            disabled={!selected || saving}
            className="text-sm bg-primary text-white rounded-lg px-3 py-1.5 hover:bg-primary-soft disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? 'Granting…' : 'Grant internal access'}
          </button>
        </div>
      )}
    </div>
  );
}
