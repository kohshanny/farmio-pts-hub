import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { formatSGD, formatDate } from '@/lib/format';
import type { Order, Agent } from '@/types/database';
import { Wallet, TrendingUp, ShoppingBag, Clock } from 'lucide-react';
import Link from 'next/link';

export async function AgentOverview({ agentId }: { agentId: string }) {
  const supabase = await createClient();

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single<Agent>();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, customer:customers(*)')
    .eq('agent_id', agentId)
    .order('order_date', { ascending: false })
    .returns<Order[]>();

  const allOrders = orders ?? [];

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.revenue_sgd, 0);
  const totalCommissionEarned = allOrders.reduce((sum, o) => sum + o.commission_amount, 0);
  const commissionPaid = allOrders
    .filter((o) => o.commission_status === 'Paid')
    .reduce((sum, o) => sum + o.commission_amount, 0);
  const commissionPending = totalCommissionEarned - commissionPaid;

  const now = new Date();
  const thisMonthOrders = allOrders.filter((o) => {
    const d = new Date(o.order_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + o.revenue_sgd, 0);
  const monthlyTarget =
    (agent?.monthly_revenue_target_retailer ?? 0) + (agent?.monthly_revenue_target_fnb ?? 0);

  const recentOrders = allOrders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-soft mb-1">Welcome back</p>
        <h1 className="font-display text-2xl md:text-3xl text-primary">{agent?.name ?? 'Your'} overview</h1>
        <p className="text-sm text-ink-soft mt-1">
          A clear view of your orders and what Farmio owes you.
        </p>
      </div>

      {/* Commission trust hero — stacks vertically on mobile */}
      <div className="bg-surface border border-border rounded-2xl p-5 md:p-6">
        <p className="text-xs uppercase tracking-wide text-ink-soft font-medium mb-4">
          Commission ledger
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:border-r sm:border-border sm:pr-6">
            <div className="flex items-center gap-2 text-fresh mb-1">
              <Wallet size={16} />
              <span className="text-xs font-medium uppercase tracking-wide">Paid out</span>
            </div>
            <p className="font-display text-3xl md:text-4xl text-fresh">{formatSGD(commissionPaid)}</p>
            <p className="text-xs text-ink-soft mt-1">Already in your account</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-gold mb-1">
              <Clock size={16} />
              <span className="text-xs font-medium uppercase tracking-wide">Pending</span>
            </div>
            <p className="font-display text-3xl md:text-4xl text-gold">{formatSGD(commissionPending)}</p>
            <p className="text-xs text-ink-soft mt-1">Owed, not yet paid</p>
          </div>
        </div>
        <Link
          href="/commissions"
          className="inline-block mt-4 text-sm text-primary font-medium hover:underline"
        >
          See every order behind these numbers →
        </Link>
      </div>

      {/* Stat cards — stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total revenue"
          value={formatSGD(totalRevenue)}
          sublabel={`${allOrders.length} orders, all time`}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="This month"
          value={formatSGD(thisMonthRevenue)}
          sublabel={monthlyTarget > 0 ? `Target: ${formatSGD(monthlyTarget)}` : `${thisMonthOrders.length} orders so far`}
          accent="fresh"
          icon={<ShoppingBag size={16} />}
        />
        <StatCard
          label="New vs recurring"
          value={`${allOrders.filter((o) => o.order_type === 'New').length} / ${
            allOrders.filter((o) => o.order_type === 'Recurring').length
          }`}
          sublabel="New / Recurring orders"
          icon={<ShoppingBag size={16} />}
        />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-primary">Recent orders</h2>
          <Link href="/orders" className="text-sm text-primary font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="bg-surface border border-border rounded-xl overflow-x-auto">
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
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-soft">
                    No orders logged yet. Once the internal team logs your first sale, it&apos;ll show up here.
                  </td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatDate(order.order_date)}</td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{order.customer?.customer_name ?? '—'}</td>
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
  );
}
