import { getCurrentProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/DashboardShell';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import { formatSGD } from '@/lib/format';
import type { Agent, Order } from '@/types/database';
import Link from 'next/link';
import { NewAgentButton } from '@/components/NewAgentButton';

export default async function AgentsPage() {
  const { profile, email } = await getCurrentProfile();

  if (profile.role !== 'internal') {
    redirect('/');
  }

  const supabase = await createClient();
  const { data: agents } = await supabase.from('agents').select('*').order('name').returns<Agent[]>();
  const { data: orders } = await supabase.from('orders').select('agent_id, revenue_sgd').returns<Order[]>();

  const revenueByAgent = new Map<string, number>();
  (orders ?? []).forEach((o) => {
    revenueByAgent.set(o.agent_id, (revenueByAgent.get(o.agent_id) ?? 0) + o.revenue_sgd);
  });

  return (
    <DashboardShell role={profile.role} userEmail={email}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-primary">Agent roster</h1>
            <p className="text-sm text-ink-soft mt-1">All part-time sales agents, active and inactive.</p>
          </div>
          <NewAgentButton />
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total revenue</th>
                <th className="px-4 py-3 font-medium">Monthly target</th>
              </tr>
            </thead>
            <tbody>
              {(agents ?? []).map((agent) => (
                <tr key={agent.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                  <td className="px-4 py-3">
                    <Link href={`/agents/${agent.id}`} className="font-medium hover:text-primary hover:underline">
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
                      ? formatSGD(agent.monthly_revenue_target_retailer + agent.monthly_revenue_target_fnb)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
