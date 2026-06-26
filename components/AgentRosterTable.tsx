'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatSGD } from '@/lib/format';
import { updateAgent, deleteAgent } from '@/app/actions/mutations';
import type { Agent } from '@/types/database';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function EditAgentModal({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(agent.name);
  const [phone, setPhone] = useState(agent.phone_number ?? '');
  const [status, setStatus] = useState(agent.status);
  const [revRetailer, setRevRetailer] = useState(String(agent.monthly_revenue_target_retailer));
  const [revFnb, setRevFnb] = useState(String(agent.monthly_revenue_target_fnb));
  const [notes, setNotes] = useState(agent.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name) return;
    setSaving(true);
    const result = await updateAgent(agent.id, {
      name,
      phone_number: phone || null,
      status,
      monthly_revenue_target_retailer: parseFloat(revRetailer) || 0,
      monthly_revenue_target_fnb: parseFloat(revFnb) || 0,
      notes: notes || null,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.error ?? 'Failed to save');
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg text-primary">Edit agent</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-primary">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-ink-soft">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-ink-soft">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Optional"
              />
            </div>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-ink-soft">Target — Retail (SGD)</label>
              <input
                type="number"
                value={revRetailer}
                onChange={(e) => setRevRetailer(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-ink-soft">Target — F&B (SGD)</label>
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
              placeholder="Coaching notes, personality notes…"
            />
          </div>
          {error && (
            <p className="text-sm text-clay bg-clay-soft rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving || !name}
            className="flex items-center gap-1.5 bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-soft disabled:opacity-60"
          >
            <Check size={14} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            onClick={onClose}
            className="text-sm text-ink-soft border border-border rounded-lg px-4 py-2 hover:bg-bg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAgentConfirm({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteAgent(agent.id);
    setDeleting(false);
    if (!result.success) {
      setError(result.error ?? 'Failed to delete');
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-sm">
        <div className="px-6 py-5 space-y-3">
          <h2 className="font-display text-lg text-primary">Delete agent?</h2>
          <p className="text-sm text-ink-soft">
            This will permanently delete <span className="font-medium text-primary">{agent.name}</span> and cannot be undone. Orders linked to this agent cannot be deleted — you must reassign or remove them first.
          </p>
          {error && (
            <p className="text-sm text-clay bg-clay-soft rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-clay text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Yes, delete'}
          </button>
          <button
            onClick={onClose}
            className="text-sm text-ink-soft border border-border rounded-lg px-4 py-2 hover:bg-bg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function AgentRosterTable({
  agents,
  revenueByAgent,
}: {
  agents: Agent[];
  revenueByAgent: Map<string, number>;
}) {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);

  return (
    <>
      {editingAgent && (
        <EditAgentModal agent={editingAgent} onClose={() => setEditingAgent(null)} />
      )}
      {deletingAgent && (
        <DeleteAgentConfirm agent={deletingAgent} onClose={() => setDeletingAgent(null)} />
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total revenue</th>
              <th className="px-4 py-3 font-medium">Monthly target</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/agents/${agent.id}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {agent.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">{agent.phone_number ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={agent.status} />
                </td>
                <td className="px-4 py-3">{formatSGD(revenueByAgent.get(agent.id) ?? 0)}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {agent.monthly_revenue_target_retailer + agent.monthly_revenue_target_fnb > 0
                    ? formatSGD(
                        agent.monthly_revenue_target_retailer + agent.monthly_revenue_target_fnb
                      )
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingAgent(agent)}
                      className="text-ink-soft hover:text-primary transition-colors"
                      title="Edit agent"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingAgent(agent)}
                      className="text-ink-soft hover:text-clay transition-colors"
                      title="Delete agent"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
