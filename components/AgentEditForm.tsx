'use client';

import { useState } from 'react';
import { updateAgent } from '@/app/actions/mutations';
import type { Agent } from '@/types/database';
import { useRouter } from 'next/navigation';

export function AgentEditForm({ agent }: { agent: Agent }) {
  const router = useRouter();
  const [status, setStatus] = useState(agent.status);
  const [notes, setNotes] = useState(agent.notes ?? '');
  const [revRetailer, setRevRetailer] = useState(String(agent.monthly_revenue_target_retailer));
  const [revFnb, setRevFnb] = useState(String(agent.monthly_revenue_target_fnb));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateAgent(agent.id, {
      status,
      notes,
      monthly_revenue_target_retailer: parseFloat(revRetailer) || 0,
      monthly_revenue_target_fnb: parseFloat(revFnb) || 0,
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium mb-1 text-ink-soft">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Agent['status'])}
          className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1 text-ink-soft">Target — Retail</label>
          <input
            type="number"
            value={revRetailer}
            onChange={(e) => setRevRetailer(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-ink-soft">Target — F&B</label>
          <input
            type="number"
            value={revFnb}
            onChange={(e) => setRevFnb(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-ink-soft">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Coaching notes, follow-up cadence, personality notes…"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-sm bg-primary text-white rounded-lg px-3 py-1.5 hover:bg-primary-soft disabled:opacity-60"
      >
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
      </button>
    </div>
  );
}
