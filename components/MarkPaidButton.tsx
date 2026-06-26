'use client';

import { useState } from 'react';
import { markCommissionPaid } from '@/app/actions/mutations';

export function MarkPaidButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await markCommissionPaid(orderId);
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-medium text-primary border border-primary/30 rounded-md px-2.5 py-1 hover:bg-primary hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? 'Marking…' : 'Mark paid'}
    </button>
  );
}
