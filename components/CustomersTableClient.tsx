'use client';

import { useState, useMemo } from 'react';
import { formatSGD, formatDate } from '@/lib/format';
import { Search, X } from 'lucide-react';
import type { CustomerRow } from '@/components/CustomersTable';

export function CustomersTableClient({ rows }: { rows: CustomerRow[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const agentName = row.agent_name.toLowerCase();
      const customerName = row.customer_name.toLowerCase();
      return agentName.includes(q) || customerName.includes(q);
    });
  }, [rows, searchQuery]);

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search agent or customer…"
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
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Contact number</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Lifetime revenue</th>
              <th className="px-4 py-3 font-medium">Last order date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  {searchQuery ? `No customers match "${searchQuery}".` : 'No customers yet.'}
                </td>
              </tr>
            )}
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                <td className="px-4 py-3 font-medium whitespace-nowrap">{row.agent_name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.customer_name}</td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                  {row.customer_contact_number ?? '—'}
                </td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.order_count}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatSGD(row.lifetime_revenue)}</td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                  {row.last_order_date ? formatDate(row.last_order_date) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
