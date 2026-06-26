import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/StatusBadge';
import { formatSGD, formatDate } from '@/lib/format';
import type { Order } from '@/types/database';

export async function OrdersTable({
  agentId,
  showAgentColumn = false,
}: {
  agentId?: string;
  showAgentColumn?: boolean;
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

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-soft">
            <th className="px-4 py-3 font-medium">Date</th>
            {showAgentColumn && <th className="px-4 py-3 font-medium">Agent</th>}
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Products</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Revenue</th>
            <th className="px-4 py-3 font-medium">Commission</th>
            <th className="px-4 py-3 font-medium">Order status</th>
            <th className="px-4 py-3 font-medium">Commission status</th>
          </tr>
        </thead>
        <tbody>
          {allOrders.length === 0 && (
            <tr>
              <td colSpan={showAgentColumn ? 9 : 8} className="px-4 py-10 text-center text-ink-soft">
                No orders yet.
              </td>
            </tr>
          )}
          {allOrders.map((order) => (
            <tr key={order.id} className="border-b border-border last:border-0 hover:bg-bg/60">
              <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatDate(order.order_date)}</td>
              {showAgentColumn && (
                <td className="px-4 py-3 font-medium whitespace-nowrap">{order.agent?.name ?? '—'}</td>
              )}
              <td className="px-4 py-3 whitespace-nowrap">{order.customer?.customer_name ?? '—'}</td>
              <td className="px-4 py-3 text-ink-soft max-w-[220px] truncate" title={order.products ?? ''}>
                {order.products ?? '—'}
              </td>
              <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{order.order_type}</td>
              <td className="px-4 py-3 whitespace-nowrap">{formatSGD(order.revenue_sgd)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{formatSGD(order.commission_amount)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={order.order_status} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.commission_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
