'use client';

import { useState } from 'react';
import { linkProfileToAgent } from '@/app/actions/mutations';
import type { Profile } from '@/types/database';
import { useRouter } from 'next/navigation';

export function LinkProfileForm({
  agentId,
  unlinkedProfiles,
}: {
  agentId: string;
  unlinkedProfiles: Profile[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleLink() {
    if (!selected) return;
    setSaving(true);
    await linkProfileToAgent(selected, agentId, 'agent');
    setSaving(false);
    router.refresh();
  }

  if (unlinkedProfiles.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        No account is waiting to be linked. Once this agent creates an account on the login page,
        it&apos;ll appear here to connect.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-soft">
        Connect an existing sign-up to this agent so they can see their orders and commissions.
      </p>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">Select account…</option>
        {unlinkedProfiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.email}
          </option>
        ))}
      </select>
      <button
        onClick={handleLink}
        disabled={!selected || saving}
        className="text-sm bg-primary text-white rounded-lg px-3 py-1.5 hover:bg-primary-soft disabled:opacity-50"
      >
        {saving ? 'Linking…' : 'Link account'}
      </button>
    </div>
  );
}
