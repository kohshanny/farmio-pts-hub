import { createClient } from '@/lib/supabase/server';
import { CustomersTableClient } from '@/components/CustomersTableClient';
import type { Customer, Order, Agent } from '@/types/database';

export interface CustomerRow {
  id: string;
  customer_name: string;
  customer_contact_number: string | null;
  agent_name: string;
  lifetime_revenue: number;
  last_order_date: string | null;
  order_count: number;
}

export async function CustomersTable() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from('customers')
    .select('*, agent:agents(*)')
    .returns<(Customer & { agent: Agent | null })[]>();

  const { data: orders } = await supabase
    .from('orders')
    .select('customer_id, revenue_sgd, order_date')
    .returns<Pick<Order, 'customer_id' | 'revenue_sgd' | 'order_date'>[]>();

  const allCustomers = customers ?? [];
  const allOrders = orders ?? [];

  // Aggregate revenue + last order date per customer from the orders table,
  // rather than trusting potentially-stale stored columns.
  const statsByCustomer = new Map<string, { revenue: number; lastDate: string | null; count: number }>();

  for (const order of allOrders) {
    const existing = statsByCustomer.get(order.customer_id) ?? { revenue: 0, lastDate: null, count: 0 };
    existing.revenue += order.revenue_sgd;
    existing.count += 1;
    if (!existing.lastDate || order.order_date > existing.lastDate) {
      existing.lastDate = order.order_date;
    }
    statsByCustomer.set(order.customer_id, existing);
  }

  const rows: CustomerRow[] = allCustomers.map((c) => {
    const stats = statsByCustomer.get(c.id) ?? { revenue: 0, lastDate: null, count: 0 };
    return {
      id: c.id,
      customer_name: c.customer_name,
      customer_contact_number: c.customer_contact_number ?? null,
      agent_name: c.agent?.name ?? '—',
      lifetime_revenue: stats.revenue,
      last_order_date: stats.lastDate,
      order_count: stats.count,
    };
  });

  // Highest lifetime revenue first
  rows.sort((a, b) => b.lifetime_revenue - a.lifetime_revenue);

  return <CustomersTableClient rows={rows} />;
}
