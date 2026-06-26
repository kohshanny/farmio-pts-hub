export type AgentStatus = 'Active' | 'Inactive';
export type BusinessType = 'F&B' | 'Hawker' | 'Minimart' | 'Catering' | 'Childcare' | 'Other';
export type RelationshipStatus = 'Active' | 'Lost' | 'Won';
export type PaymentMethod = 'Credit' | 'PayNow' | 'COD';
export type OrderType = 'New' | 'Recurring';
export type OrderStatus = 'Paid' | 'Pending' | 'Cancelled';
export type CommissionStatus = 'Pending' | 'Paid';
export type UserRole = 'agent' | 'internal';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  agent_id: string | null;
  created_at: string;
}

export interface Agent {
  id: string;
  name: string;
  phone_number: string | null;
  status: AgentStatus;
  start_date: string | null;
  notes: string | null;
  monthly_lead_target: number;
  monthly_conversion_target: number;
  monthly_revenue_target_retailer: number;
  monthly_revenue_target_fnb: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_name: string;
  customer_contact_number: string | null;
  assigned_agent_id: string | null;
  business_type: BusinessType | null;
  relationship_status: RelationshipStatus;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_date: string;
  agent_id: string;
  customer_id: string;
  payment_method: PaymentMethod | null;
  revenue_sgd: number;
  products: string | null;
  order_type: OrderType;
  cac_sgd: number;
  order_status: OrderStatus;
  commission_amount: number;
  commission_status: CommissionStatus;
  commission_paid_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined fields (populated via select with joins)
  agent?: Agent;
  customer?: Customer;
}

export interface Config {
  id: number;
  ltv_multiplier_fnb: number;
  ltv_multiplier_retailer: number;
  target_conversion_rate: number;
  aov_target_retailer: number;
  aov_target_fnb: number;
  orders_per_month_target_retailer: number;
  orders_per_month_target_fnb: number;
  default_commission_standard: number;
  default_commission_retailer: number;
  updated_at: string;
}

export function estLtv(order: { revenue_sgd: number }, customer: { business_type: BusinessType | null } | null, config: Config): number {
  const isRetailer = customer?.business_type === 'Minimart' || customer?.business_type === 'Catering';
  const multiplier = isRetailer ? config.ltv_multiplier_retailer : config.ltv_multiplier_fnb;
  return order.revenue_sgd * multiplier;
}

export function ltvCacRatio(ltv: number, cac: number): number | null {
  if (!cac || cac === 0) return null;
  return ltv / cac;
}
