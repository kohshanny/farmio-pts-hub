'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function markCommissionPaid(orderId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from('orders')
    .update({ commission_status: 'Paid', commission_paid_date: today })
    .eq('id', orderId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/commissions');
  revalidatePath('/');
  return { success: true };
}

export async function markCommissionsPaidBulk(orderIds: string[]) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from('orders')
    .update({ commission_status: 'Paid', commission_paid_date: today })
    .in('id', orderIds);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/commissions');
  revalidatePath('/');
  return { success: true };
}

interface CreateOrderInput {
  order_date: string;
  agent_id: string;
  customer_id: string;
  payment_method: string;
  revenue_sgd: number;
  products: string;
  order_type: string;
  cac_sgd: number;
  order_status: string;
  commission_amount: number;
  commission_status: string;
}

export async function createOrder(input: CreateOrderInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('orders').insert({
    ...input,
    commission_paid_date: input.commission_status === 'Paid' ? new Date().toISOString().slice(0, 10) : null,
    created_by: user?.id ?? null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/orders');
  revalidatePath('/commissions');
  revalidatePath('/');
  return { success: true };
}

interface UpdateOrderInput {
  order_date?: string;
  payment_method?: string;
  revenue_sgd?: number;
  products?: string;
  order_type?: string;
  cac_sgd?: number;
  order_status?: string;
  commission_amount?: number;
  commission_status?: string;
}

export async function updateOrder(orderId: string, input: UpdateOrderInput) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = { ...input };
  if (input.commission_status === 'Paid') {
    updates.commission_paid_date = new Date().toISOString().slice(0, 10);
  } else if (input.commission_status === 'Pending') {
    updates.commission_paid_date = null;
  }

  const { error } = await supabase.from('orders').update(updates).eq('id', orderId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/orders');
  revalidatePath('/commissions');
  revalidatePath('/');
  return { success: true };
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('orders').delete().eq('id', orderId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/orders');
  revalidatePath('/commissions');
  revalidatePath('/');
  return { success: true };
}

interface CreateCustomerInput {
  customer_name: string;
  customer_contact_number?: string;
  assigned_agent_id: string;
  business_type: string;
}

export async function createCustomer(input: CreateCustomerInput) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .insert(input)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/orders');
  return { success: true, customer: data };
}

export async function updateAgent(agentId: string, updates: Record<string, unknown>) {
  const supabase = await createClient();

  const { error } = await supabase.from('agents').update(updates).eq('id', agentId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/agents');
  revalidatePath(`/agents/${agentId}`);
  return { success: true };
}

export async function createAgent(input: { name: string; phone_number?: string; status: string }) {
  const supabase = await createClient();

  const { error } = await supabase.from('agents').insert(input);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/agents');
  return { success: true };
}

export async function deleteAgent(agentId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('agents').delete().eq('id', agentId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/agents');
  revalidatePath('/');
  return { success: true };
}

export async function linkProfileToAgent(profileId: string, agentId: string | null, role: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ agent_id: agentId, role })
    .eq('id', profileId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/agents');
  revalidatePath('/config');
  return { success: true };
}

export async function updateConfig(updates: Record<string, unknown>) {
  const supabase = await createClient();

  const { error } = await supabase.from('config').update(updates).eq('id', 1);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/config');
  return { success: true };
}
