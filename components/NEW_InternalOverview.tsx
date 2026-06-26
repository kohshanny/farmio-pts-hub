import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/StatCard';
import { RevenueChart } from '@/components/RevenueChart';
import { formatSGD } from '@/lib/format';
import type { Order, Agent } from '@/types/database';
import { TrendingUp, Users, Wallet, Target } from 'lucide-react';
import Link from 'next/link';

export async function InternalOverview() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, agent:agents(*), customer:customers(*)')
    .order('order_date', { ascending: false })
    .returns<Order[]>();

  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .order('name')
    .returns<Agent[]>();

  const allOrders = orders ?? [];
  const allAgents = agents ?? [];
  const activeAgents = allAgents.filter((a) => a.status === 'Active');

  const lifetimeRevenue = allOrders.reduce((sum, o) => sum + o.revenue_sgd, 0);
  const commissionOwed = allOrders
    .filter((o) => o.commission_status === 'Pending')
    .reduce((sum, o) => sum + o.commission_amount, 0);

  // Leaderboard
  const leaderboard = allAgents
    .map((agent) => {
      const agentOrders = allOrders.filter((o) => o.agent_id === agent.id);
      const revenue = agentOrders.reduce((sum, o) => sum + o.revenue_sgd, 0);
      const commissionPending = agentOrders
        .filter((o) => o.commission_status === 'Pending')
        .reduce((sum, o) => sum + o.commission_amount, 0);
      const commissionPaid = agentOrders
        .filter((o) => o.commission_status === 'Paid')
        .reduce((sum, o) => sum + o.commission_amount, 0);
      const target = agent.monthly_revenue_target_retailer + agent.monthly_revenue_target_fnb;
      return { agent, revenue, commissionPending, commissionPaid, orderCount: agentOrders.length, target };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Slim order slice for the chart (client component can't receive full Order objects with joined fields)
  const chartOrders = allOrders.map((o) => ({
    order_date: o.order_date,
    revenue_sgd: o.revenue_sgd,
    order_type: o.order_type,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-soft mb-1">Internal team</p>
          <h1 className="font-display text-3xl text-primary">Team overview</h1>
          <p className="text-sm text-ink-soft mt-1">All part-time agents, at a glance.</p>
        </div>
        <Link
          href="/entry"
          className="bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors"
        >
          + Log order
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Lifetime revenue"
          value={formatSGD(lifetimeRevenue)}
          sublabel={`${allOrders.length} orders, all time`}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Active agents"
          value={`${activeAgents.length}`}
          sublabel={`of ${allAgents.length} total`}
          icon={<Users size={16} />}
        />
        <StatCard
          label="Commission owed"
          value={formatSGD(commissionOwed)}
          sublabel="Pending across all agents"
          accent="gold"
          icon={<Wallet size={16} />}
        />
      </div>

      {/* Revenue chart */}
      <RevenueChart orders={chartOrders} />

      {/* Agent leaderboard */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-primary">Agent leaderboard</h2>
          <Link href="/agents" className="text-sm text-primary font-medium hover:underline">
            Full roster →
          </Link>
        </div>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
                <th className="px-4 py-3 font-medium">vs Target</th>
                <th className="px-4 py-3 font-medium">Commission paid</th>
                <th className="px-4 py-3 font-medium">Commission owed</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(({ agent, revenue, commissionPending, commissionPaid, orderCount, target }) => (
                <tr key={agent.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                  <td className="px-4 py-3">
                    <Link href={`/agents/${agent.id}`} className="font-medium hover:text-primary hover:underline">
                      {agent.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{orderCount}</td>
                  <td className="px-4 py-3">{formatSGD(revenue)}</td>
                  <td className="px-4 py-3">
                    {target > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <Target size={13} className="text-ink-soft" />
                        <span className={revenue >= target ? 'text-fresh' : 'text-ink-soft'}>
                          {Math.round((revenue / target) * 100)}%
                        </span>
                      </span>
                    ) : (
                      <span className="text-ink-soft">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-fresh">{formatSGD(commissionPaid)}</td>
                  <td className="px-4 py-3 text-gold">{formatSGD(commissionPending)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
