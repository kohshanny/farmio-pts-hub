'use client';

import { useState, useMemo } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatSGD, formatDate } from '@/lib/format';
import { updateOrder, deleteOrder } from '@/app/actions/mutations';
import type { Order } from '@/types/database';
import { Pencil, Trash2, X, Check, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

function EditOrderModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const router = useRouter();
  const [orderDate, setOrderDate] = useState(order.order_date);
  const [revenue, setRevenue] = useState(String(order.revenue_sgd));
  const [products, setProducts] = useState(order.products ?? '');
  const [orderType, setOrderType] = useState(order.order_type);
  const [paymentMethod, setPaymentMethod] = useState(order.payment_method ?? 'PayNow');
  const [cac, setCac] = useState(String(order.cac_sgd));
  const [orderStatus, setOrderStatus] = useState(order.order_status);
  const [commissionAmount, setCommissionAmount] = useState(String(order.commission_amount));
  const [commissionStatus, setCommissionStatus] = useState(order.commission_status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateOrder(order.id, {
      order_date: orderDate,
      revenue_sgd: parseFloat(revenue) || 0,
      products,
      order_type: orderType,
      payment_method: paymentMethod,
      cac_sgd: parseFloat(cac) || 0,
      order_status: orderStatus,
      commission_amount: parseFloat(commissionAmount) || 0,
      commission_status: commissionStatus,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.error ?? 'Failed to save');
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg text-primary">Edit order</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-primary">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-ink-soft">Date</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-ink-soft">Revenue (SGD)</label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-ink-soft">Products</label>
            <input
              type="text"
              value={products}
              onChange={(e) => setProducts(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-ink-soft">Order type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as 'New' | 'Recurring')}
                className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option>New</option>
                <option>Recurring</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-ink-soft">Payment method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'Credit' | 'PayNow' | 'COD')}
                className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option>PayNow</option>
                <option>Credit</option>
                <option>COD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-ink-soft">CAC (SGD)</label>
              <input
                type="number"
                value={cac}
                onChange={(e) => setCac(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-ink-soft">Commission (SGD)</label>
              <input
                type="number"
                value={commissionAmount}
                onChange={(e) => setCommissionAmount(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-ink-soft">Order status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as 'Paid' | 'Pending' | 'Cancelled')}
                className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option>Paid</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-ink-soft">Commission status</label>
            <select
              value={commissionStatus}
              onChange={(e) => setCommissionStatus(e.target.value as 'Pending' | 'Paid')}
              className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option>Pending</option>
              <option>Paid</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-clay bg-clay-soft rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-soft disabled:opacity-60"
          >
            <Check size={14} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            onClick={onClose}
            className="text-sm text-ink-soft border border-border rounded-lg px-4 py-2 hover:bg-bg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteOrderConfirm({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteOrder(order.id);
    setDeleting(false);
    if (!result.success) {
      setError(result.error ?? 'Failed to delete');
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-sm">
        <div className="px-6 py-5 space-y-3">
          <h2 className="font-display text-lg text-primary">Delete order?</h2>
          <p className="text-sm text-ink-soft">
            This will permanently delete the order for{' '}
            <span className="font-medium text-primary">
              {order.customer?.customer_name ?? 'this customer'}
            </span>{' '}
            on {formatDate(order.order_date)} ({formatSGD(order.revenue_sgd)}). This cannot be
            undone, and any commission tied to it will be removed too.
          </p>
          {error && (
            <p className="text-sm text-clay bg-clay-soft rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-clay text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Yes, delete'}
          </button>
          <button
            onClick={onClose}
            className="text-sm text-ink-soft border border-border rounded-lg px-4 py-2 hover:bg-bg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrdersTableClient({
  orders,
  showAgentColumn = false,
  isInternal = false,
}: {
  orders: Order[];
  showAgentColumn?: boolean;
  isInternal?: boolean;
}) {
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) => {
      const agentName = order.agent?.name?.toLowerCase() ?? '';
      const customerName = order.customer?.customer_name?.toLowerCase() ?? '';
      return agentName.includes(q) || customerName.includes(q);
    });
  }, [orders, searchQuery]);

  return (
    <>
      {editingOrder && (
        <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} />
      )}
      {deletingOrder && (
        <DeleteOrderConfirm order={deletingOrder} onClose={() => setDeletingOrder(null)} />
      )}

      {/* Search bar */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={showAgentColumn ? 'Search agent or customer…' : 'Search customer…'}
          className="w-full rounded-lg border border-border bg-bg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-primary"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-x-auto">
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
              {isInternal && <th className="px-4 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 && (
              <tr>
                <td
                  colSpan={showAgentColumn ? (isInternal ? 10 : 9) : isInternal ? 9 : 8}
                  className="px-4 py-10 text-center text-ink-soft"
                >
                  {searchQuery ? `No orders match "${searchQuery}".` : 'No orders yet.'}
                </td>
              </tr>
            )}
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatDate(order.order_date)}</td>
                {showAgentColumn && (
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{order.agent?.name ?? '—'}</td>
                )}
                <td className="px-4 py-3 whitespace-nowrap">{order.customer?.customer_name ?? '—'}</td>
                <td className="px-4 py-3 text-ink-soft max-w-[200px] truncate" title={order.products ?? ''}>
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
                {isInternal && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="text-ink-soft hover:text-primary transition-colors"
                        title="Edit order"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingOrder(order)}
                        className="text-ink-soft hover:text-clay transition-colors"
                        title="Delete order"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
