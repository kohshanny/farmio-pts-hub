import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/StatusBadge';
import { StatCard } from '@/components/StatCard';
import { formatSGD, formatDate } from '@/lib/format';
import type { Order } from '@/types/database';
import { Wallet, Clock } from 'lucide-react';
import { MarkPaidButton } from '@/components/MarkPaidButton';

export async function CommissionsView({
  agentId,
  isInternal,
}: {
  agentId?: string;
  isInternal: boolean;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select('*, agent:agents(*), customer:customers(*)')
    .order('order_date', { ascending: false });

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  const { data: orders } = await query.returns<Order[]>();
  const allOrders = orders ?? [];

  const totalEarned = allOrders.reduce((sum, o) => sum + o.commission_amount, 0);
  const paid = allOrders.filter((o) => o.commission_status === 'Paid').reduce((sum, o) => sum + o.commission_amount, 0);
  const pending = totalEarned - paid;

  // For internal view, sort pending-first, oldest first, so nothing slips through
  const sortedOrders = isInternal
    ? [...allOrders].sort((a, b) => {
        if (a.commission_status !== b.commission_status) {
          return a.commission_status === 'Pending' ? -1 : 1;
        }
        return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
      })
    : allOrders;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total commission" value={formatSGD(totalEarned)} sublabel="All time" />
        <StatCard
          label="Paid out"
          value={formatSGD(paid)}
          accent="fresh"
          icon={<Wallet size={16} />}
        />
        <StatCard
          label="Pending"
          value={formatSGD(pending)}
          accent="gold"
          icon={<Clock size={16} />}
        />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-soft">
              {isInternal && <th className="px-4 py-3 font-medium">Agent</th>}
              <th className="px-4 py-3 font-medium">Order date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Revenue</th>
              <th className="px-4 py-3 font-medium">Commission</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date paid</th>
              {isInternal && <th className="px-4 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 && (
              <tr>
                <td colSpan={isInternal ? 8 : 6} className="px-4 py-10 text-center text-ink-soft">
                  No commissions on record yet.
                </td>
              </tr>
            )}
            {sortedOrders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                {isInternal && (
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{order.agent?.name ?? '—'}</td>
                )}
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatDate(order.order_date)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{order.customer?.customer_name ?? '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatSGD(order.revenue_sgd)}</td>
                <td className="px-4 py-3 font-medium whitespace-nowrap">{formatSGD(order.commission_amount)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.commission_status} />
                </td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatDate(order.commission_paid_date)}</td>
                {isInternal && (
                  <td className="px-4 py-3">
                    {order.commission_status === 'Pending' && <MarkPaidButton orderId={order.id} />}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
