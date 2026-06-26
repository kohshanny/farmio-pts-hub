import { getCurrentProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/DashboardShell';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AgentRosterTable } from '@/components/AgentRosterTable';
import { NewAgentButton } from '@/components/NewAgentButton';
import type { Agent, Order } from '@/types/database';

export default async function AgentsPage() {
  const { profile, email } = await getCurrentProfile();

  if (profile.role !== 'internal') {
    redirect('/');
  }

  const supabase = await createClient();
  const { data: agents } = await supabase.from('agents').select('*').order('name').returns<Agent[]>();
  const { data: orders } = await supabase.from('orders').select('agent_id, revenue_sgd').returns<Order[]>();

  const revenueByAgentRaw = new Map<string, number>();
  (orders ?? []).forEach((o) => {
    revenueByAgentRaw.set(o.agent_id, (revenueByAgentRaw.get(o.agent_id) ?? 0) + o.revenue_sgd);
  });

  // Convert to plain object for client component
  const revenueByAgent = new Map(revenueByAgentRaw);

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

        <AgentRosterTable agents={agents ?? []} revenueByAgent={revenueByAgent} />
      </div>
    </DashboardShell>
  );
}
