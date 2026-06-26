'use client';

import { useState } from 'react';
import { updateConfig } from '@/app/actions/mutations';
import type { Config } from '@/types/database';
import { useRouter } from 'next/navigation';

export function ConfigForm({ config }: { config: Config }) {
  const router = useRouter();
  const [values, setValues] = useState({
    ltv_multiplier_fnb: config.ltv_multiplier_fnb,
    ltv_multiplier_retailer: config.ltv_multiplier_retailer,
    target_conversion_rate: config.target_conversion_rate,
    aov_target_retailer: config.aov_target_retailer,
    aov_target_fnb: config.aov_target_fnb,
    orders_per_month_target_retailer: config.orders_per_month_target_retailer,
    orders_per_month_target_fnb: config.orders_per_month_target_fnb,
    default_commission_standard: config.default_commission_standard,
    default_commission_retailer: config.default_commission_retailer,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  }

  async function handleSave() {
    setSaving(true);
    await updateConfig(values);
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  const fields: { key: keyof typeof values; label: string; step?: string }[] = [
    { key: 'ltv_multiplier_fnb', label: 'LTV multiplier — F&B', step: '0.01' },
    { key: 'ltv_multiplier_retailer', label: 'LTV multiplier — Retailer', step: '0.01' },
    { key: 'target_conversion_rate', label: 'Target conversion rate', step: '0.01' },
    { key: 'aov_target_retailer', label: 'AOV target — Retailer (SGD)' },
    { key: 'aov_target_fnb', label: 'AOV target — F&B (SGD)' },
    { key: 'orders_per_month_target_retailer', label: 'Orders/month target — Retailer' },
    { key: 'orders_per_month_target_fnb', label: 'Orders/month target — F&B' },
    { key: 'default_commission_standard', label: 'Default commission — standard (SGD)' },
    { key: 'default_commission_retailer', label: 'Default commission — retailer (SGD)' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium mb-1 text-ink-soft">{f.label}</label>
            <input
              type="number"
              step={f.step ?? '1'}
              value={values[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-sm bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-soft disabled:opacity-60"
      >
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save assumptions'}
      </button>
    </div>
  );
}
