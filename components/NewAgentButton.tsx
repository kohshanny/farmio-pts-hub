'use client';

import { useState } from 'react';
import { createAgent } from '@/app/actions/mutations';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export function NewAgentButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name) return;
    setSaving(true);
    await createAgent({ name, phone_number: phone || undefined, status: 'Active' });
    setSaving(false);
    setOpen(false);
    setName('');
    setPhone('');
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors"
      >
        <Plus size={15} /> Add agent
      </button>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-end gap-3 shadow-sm">
      <div>
        <label className="block text-xs font-medium mb-1 text-ink-soft">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Agent name"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-ink-soft">Phone (optional)</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="65 9000 0000"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving || !name}
        className="bg-primary text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-primary-soft disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button onClick={() => setOpen(false)} className="text-sm text-ink-soft px-2 py-1.5">
        Cancel
      </button>
    </div>
  );
}
