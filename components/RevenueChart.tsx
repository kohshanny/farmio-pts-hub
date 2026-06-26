'use client';

import { useState, useMemo } from 'react';

interface OrderSlice {
  order_date: string;
  revenue_sgd: number;
  order_type: 'New' | 'Recurring';
}

type Timeframe = 'this_month' | 'last_month' | 'last_3_months' | 'lifetime';

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  this_month: 'This month',
  last_month: 'Last month',
  last_3_months: 'Last 3 months',
  lifetime: 'Lifetime',
};

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(key: string) {
  const [year, month] = key.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}

function formatSGD(value: number) {
  return `$${value.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function RevenueChart({ orders }: { orders: OrderSlice[] }) {
  const [timeframe, setTimeframe] = useState<Timeframe>('last_3_months');

  const now = new Date();

  const filteredOrders = useMemo(() => {
    const thisMonthKey = getMonthKey(now);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = getMonthKey(lastMonth);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const threeMonthsAgoKey = getMonthKey(threeMonthsAgo);

    return orders.filter((o) => {
      const key = getMonthKey(new Date(o.order_date));
      if (timeframe === 'this_month') return key === thisMonthKey;
      if (timeframe === 'last_month') return key === lastMonthKey;
      if (timeframe === 'last_3_months') return key >= threeMonthsAgoKey;
      return true; // lifetime
    });
  }, [orders, timeframe]);

  // Group by month
  const monthMap = useMemo(() => {
    const map = new Map<string, { new: number; recurring: number }>();
    filteredOrders.forEach((o) => {
      const key = getMonthKey(new Date(o.order_date));
      const existing = map.get(key) ?? { new: 0, recurring: 0 };
      if (o.order_type === 'New') {
        map.set(key, { ...existing, new: existing.new + o.revenue_sgd });
      } else {
        map.set(key, { ...existing, recurring: existing.recurring + o.revenue_sgd });
      }
    });
    // Sort keys chronologically
    return new Map([...map.entries()].sort());
  }, [filteredOrders]);

  const months = [...monthMap.entries()];
  const maxValue = Math.max(...months.map(([, v]) => v.new + v.recurring), 1);

  const totalNew = filteredOrders
    .filter((o) => o.order_type === 'New')
    .reduce((s, o) => s + o.revenue_sgd, 0);
  const totalRecurring = filteredOrders
    .filter((o) => o.order_type === 'Recurring')
    .reduce((s, o) => s + o.revenue_sgd, 0);
  const total = totalNew + totalRecurring;

  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl text-primary">Revenue over time</h2>
          <p className="text-xs text-ink-soft mt-0.5">New vs recurring revenue by month</p>
        </div>

        {/* Timeframe tabs */}
        <div className="flex gap-1 bg-bg border border-border rounded-lg p-1">
          {(Object.keys(TIMEFRAME_LABELS) as Timeframe[]).map((key) => (
            <button
              key={key}
              onClick={() => setTimeframe(key)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                timeframe === key
                  ? 'bg-surface shadow-sm font-medium text-primary border border-border'
                  : 'text-ink-soft hover:text-primary'
              }`}
            >
              {TIMEFRAME_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
          <span className="text-xs text-ink-soft">New</span>
          <span className="text-xs font-medium text-primary">{formatSGD(totalNew)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-fresh inline-block" />
          <span className="text-xs text-ink-soft">Recurring</span>
          <span className="text-xs font-medium text-fresh">{formatSGD(totalRecurring)}</span>
        </div>
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
          <span className="text-xs text-ink-soft">Total</span>
          <span className="text-xs font-semibold">{formatSGD(total)}</span>
        </div>
      </div>

      {/* Chart */}
      {months.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-ink-soft">
          No orders in this period.
        </div>
      ) : (
        <div className="space-y-2">
          {/* Bars */}
          <div className="flex items-end gap-3 h-48">
            {months.map(([key, val]) => {
              const newPct = (val.new / maxValue) * 100;
              const recurringPct = (val.recurring / maxValue) * 100;
              const totalVal = val.new + val.recurring;

              return (
                <div key={key} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center mb-1 pointer-events-none">
                    <div className="bg-primary text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-md">
                      <div className="font-medium">{formatSGD(totalVal)}</div>
                      {val.new > 0 && (
                        <div className="text-white/70">New: {formatSGD(val.new)}</div>
                      )}
                      {val.recurring > 0 && (
                        <div className="text-white/70">Recurring: {formatSGD(val.recurring)}</div>
                      )}
                    </div>
                  </div>

                  {/* Stacked bar */}
                  <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: '160px' }}>
                    {val.recurring > 0 && (
                      <div
                        className="w-full bg-fresh rounded-t-sm transition-all duration-300"
                        style={{ height: `${recurringPct}%` }}
                      />
                    )}
                    {val.new > 0 && (
                      <div
                        className="w-full bg-primary transition-all duration-300"
                        style={{
                          height: `${newPct}%`,
                          borderRadius: val.recurring > 0 ? '0' : '2px 2px 0 0',
                        }}
                      />
                    )}
                    {/* Base line */}
                    <div className="w-full h-px bg-border" />
                  </div>

                  {/* Month label */}
                  <span className="text-[11px] text-ink-soft mt-1 text-center truncate w-full">
                    {formatMonthLabel(key)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Y-axis hint */}
          <div className="flex justify-between text-[10px] text-ink-soft pt-1 border-t border-border">
            <span>$0</span>
            <span>{formatSGD(maxValue / 2)}</span>
            <span>{formatSGD(maxValue)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
