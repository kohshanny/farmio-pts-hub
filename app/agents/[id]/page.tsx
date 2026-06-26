import { getCurrentProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/DashboardShell';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import { formatSGD, formatDate } from '@/lib/format';
import type { Agent, Order, Profile } from '@/types/database';
import { AgentEditForm } from '@/components/AgentEditForm';
import { LinkProfileForm } from '@/components/LinkProfileForm';
import { RevenueChart } from '@/components/RevenueChart';

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile, email } = await getCurrentProfile();

  if (profile.role !== 'internal') {
    redirect('/');
  }

  const supabase = await createClient();
  const { data: agent } = await supabase.from('agents').select('*').eq('id', id).single<Agent>();

  if (!agent) {
    notFound();
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, customer:customers(*)')
    .eq('agent_id', id)
    .order('order_date', { ascending: false })
    .returns<Order[]>();

  const { data: linkedProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('agent_id', id)
    .maybeSingle<Profile>();

  const { data: unlinkedProfiles } = await supabase
    .from('profiles')
    .select('*')
    .is('agent_id', null)
    .returns<Profile[]>();

  const allOrders = orders ?? [];
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.revenue_sgd, 0);
  const commissionPaid = allOrders
    .filter((o) => o.commission_status === 'Paid')
    .reduce((sum, o) => sum + o.commission_amount, 0);
  const commissionPending = allOrders
    .filter((o) => o.commission_status === 'Pending')
    .reduce((sum, o) => sum + o.commission_amount, 0);

  const chartOrders = allOrders.map((o) => ({
    order_date: o.order_date,
    revenue_sgd: o.revenue_sgd,
    order_type: o.order_type,
  }));

  return (
    <DashboardShell role={profile.role} userEmail={email}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl text-primary">{agent.name}</h1>
              <StatusBadge status={agent.status} />
            </div>
            <p className="text-sm text-ink-soft mt-1">{agent.phone_number ?? 'No phone on file'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-ink-soft font-medium">Total revenue</p>
            <p className="font-display text-2xl text-primary mt-1">{formatSGD(totalRevenue)}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-ink-soft font-medium">Commission paid</p>
            <p className="font-display text-2xl text-fresh mt-1">{formatSGD(commissionPaid)}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-ink-soft font-medium">Commission pending</p>
            <p className="font-display text-2xl text-gold mt-1">{formatSGD(commissionPending)}</p>
          </div>
        </div>

        {/* Revenue chart */}
        <RevenueChart orders={chartOrders} />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div>
              <h2 className="font-display text-xl text-primary mb-3">Order history</h2>
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-soft">
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Revenue</th>
                      <th className="px-4 py-3 font-medium">Commission</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-ink-soft">
                          No orders logged for this agent yet.
                        </td>
                      </tr>
                    )}
                    {allOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatDate(order.order_date)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{order.customer?.customer_name ?? '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatSGD(order.revenue_sgd)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatSGD(order.commission_amount)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.commission_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-display text-lg text-primary mb-3">Profile & targets</h3>
              <AgentEditForm agent={agent} />
            </div>

            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-display text-lg text-primary mb-3">Login access</h3>
              {linkedProfile ? (
                <div>
                  <p className="text-sm">
                    Linked to <span className="font-medium">{linkedProfile.email}</span>
                  </p>
                  <p className="text-xs text-ink-soft mt-1">
                    This account can sign in and see {agent.name}&apos;s orders and commissions.
                  </p>
                </div>
              ) : (
                <LinkProfileForm agentId={agent.id} unlinkedProfiles={unlinkedProfiles ?? []} />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
