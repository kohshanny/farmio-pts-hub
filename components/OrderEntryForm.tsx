'use client';

import { useState, useMemo } from 'react';
import { createOrder, createCustomer } from '@/app/actions/mutations';
import type { Agent, Customer, Config, BusinessType } from '@/types/database';
import { estLtv, ltvCacRatio } from '@/types/database';
import { formatSGD } from '@/lib/format';
import { Plus, Check } from 'lucide-react';

const businessTypes: BusinessType[] = ['F&B', 'Hawker', 'Minimart', 'Catering', 'Childcare', 'Other'];

export function OrderEntryForm({
  agents,
  customers,
  config,
}: {
  agents: Agent[];
  customers: Customer[];
  config: Config;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const [agentId, setAgentId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerType, setNewCustomerType] = useState<BusinessType>('F&B');

  const [orderDate, setOrderDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState('PayNow');
  const [revenue, setRevenue] = useState('');
  const [products, setProducts] = useState('');
  const [orderType, setOrderType] = useState('New');
  const [cac, setCac] = useState(String(config.default_commission_standard));
  const [orderStatus, setOrderStatus] = useState('Paid');
  const [commissionAmount, setCommissionAmount] = useState(String(config.default_commission_standard));
  const [commissionStatus, setCommissionStatus] = useState('Pending');

  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(customers);

  const agentCustomers = useMemo(
    () => localCustomers.filter((c) => c.assigned_agent_id === agentId),
    [localCustomers, agentId]
  );

  const selectedCustomer = localCustomers.find((c) => c.id === customerId) ?? null;
  const revenueNum = parseFloat(revenue) || 0;
  const cacNum = parseFloat(cac) || 0;
  const ltv = estLtv({ revenue_sgd: revenueNum }, selectedCustomer, config);
  const ratio = ltvCacRatio(ltv, cacNum);

  async function handleAddCustomer() {
    if (!newCustomerName || !agentId) return;
    const result = await createCustomer({
      customer_name: newCustomerName,
      customer_contact_number: newCustomerPhone || undefined,
      assigned_agent_id: agentId,
      business_type: newCustomerType,
    });
    if (result.success && result.customer) {
      setLocalCustomers((prev) => [...prev, result.customer as Customer]);
      setCustomerId(result.customer.id);
      setShowNewCustomer(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
    } else {
      setError(result.error ?? 'Could not add customer');
    }
  }

  async function handleSubmit(e: React.FormEvent, andAddAnother: boolean) {
    e.preventDefault();
    setError(null);

    if (!agentId || !customerId || !revenue) {
      setError('Agent, customer, and revenue are required.');
      return;
    }

    setSaving(true);
    const result = await createOrder({
      order_date: orderDate,
      agent_id: agentId,
      customer_id: customerId,
      payment_method: paymentMethod,
      revenue_sgd: revenueNum,
      products,
      order_type: orderType,
      cac_sgd: cacNum,
      order_status: orderStatus,
      commission_amount: parseFloat(commissionAmount) || 0,
      commission_status: commissionStatus,
    });
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? 'Something went wrong saving this order.');
      return;
    }

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);

    if (andAddAnother) {
      setRevenue('');
      setProducts('');
      setOrderDate(today);
    } else {
      setAgentId('');
      setCustomerId('');
      setRevenue('');
      setProducts('');
      setOrderDate(today);
      setOrderType('New');
      setOrderStatus('Paid');
      setCommissionStatus('Pending');
    }
  }

  return (
    <form className="space-y-6">
      {/* Date + Agent — stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Date</label>
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Agent *</label>
          <select
            value={agentId}
            onChange={(e) => {
              setAgentId(e.target.value);
              setCustomerId('');
            }}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select agent…</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Customer *</label>
        {!showNewCustomer ? (
          <div className="flex gap-2">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              disabled={!agentId}
              className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            >
              <option value="">{agentId ? 'Select customer…' : 'Select an agent first'}</option>
              {agentCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewCustomer(true)}
              disabled={!agentId}
              className="flex items-center gap-1 text-sm border border-border rounded-lg px-3 py-2 hover:bg-bg disabled:opacity-50 whitespace-nowrap"
            >
              <Plus size={14} /> New
            </button>
          </div>
        ) : (
          <div className="border border-border rounded-lg p-3 space-y-2 bg-bg">
            <input
              placeholder="Customer / business name"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                placeholder="Contact number (optional)"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <select
                value={newCustomerType}
                onChange={(e) => setNewCustomerType(e.target.value as BusinessType)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {businessTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCustomer}
                className="text-sm bg-primary text-white rounded-lg px-3 py-1.5 hover:bg-primary-soft"
              >
                Add customer
              </button>
              <button
                type="button"
                onClick={() => setShowNewCustomer(false)}
                className="text-sm text-ink-soft px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment / Revenue / Order type — stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Payment method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>PayNow</option>
            <option>Credit</option>
            <option>COD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Revenue (SGD) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Order type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>New</option>
            <option>Recurring</option>
          </select>
        </div>
      </div>

      {/* Products */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Products / order details</label>
        <textarea
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          rows={2}
          placeholder="e.g. 2 x Triple Bundle; 50 pcs Quail Egg"
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* CAC / Commission / Order status / Commission status — 2-col on mobile, 4-col on md+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">CAC (SGD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={cac}
            onChange={(e) => setCac(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Commission (SGD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={commissionAmount}
            onChange={(e) => setCommissionAmount(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Order status</label>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>Paid</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Commission status</label>
          <select
            value={commissionStatus}
            onChange={(e) => setCommissionStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>Pending</option>
            <option>Paid</option>
          </select>
        </div>
      </div>

      {/* Live LTV preview */}
      {revenueNum > 0 && (
        <div className="bg-gold-soft border border-gold/20 rounded-lg px-4 py-3 flex flex-wrap gap-4 md:gap-8 text-sm">
          <div>
            <span className="text-ink-soft">Est. LTV: </span>
            <span className="font-medium">{formatSGD(ltv)}</span>
          </div>
          <div>
            <span className="text-ink-soft">LTV : CAC ratio: </span>
            <span className="font-medium">{ratio ? `${ratio.toFixed(1)}x` : '—'}</span>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-clay bg-clay-soft rounded-lg px-3 py-2">{error}</p>}
      {justSaved && (
        <p className="text-sm text-fresh bg-fresh-soft rounded-lg px-3 py-2 flex items-center gap-1.5">
          <Check size={15} /> Order saved.
        </p>
      )}

      {/* Buttons — stack on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={saving}
          className="bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary-soft transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save & add another'}
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          disabled={saving}
          className="border border-border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-bg transition-colors disabled:opacity-60"
        >
          Save & close
        </button>
      </div>
    </form>
  );
}
