export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Paid: 'bg-fresh-soft text-fresh',
    Pending: 'bg-gold-soft text-gold',
    Cancelled: 'bg-clay-soft text-clay',
    Active: 'bg-fresh-soft text-fresh',
    Inactive: 'bg-border text-ink-soft',
    Lost: 'bg-clay-soft text-clay',
    Won: 'bg-fresh-soft text-fresh',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status] ?? 'bg-border text-ink-soft'
      }`}
    >
      {status}
    </span>
  );
}
