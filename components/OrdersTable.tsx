import { createClient } from '@/lib/supabase/server';
import { OrdersTableClient } from '@/components/OrdersTableClient';
import type { Order } from '@/types/database';

export async function OrdersTable({
  agentId,
  showAgentColumn = false,
  isInternal = false,
}: {
  agentId?: string;
  showAgentColumn?: boolean;
  isInternal?: boolean;
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

  return (
    <OrdersTableClient
      orders={orders ?? []}
      showAgentColumn={showAgentColumn}
      isInternal={isInternal}
    />
  );
}
