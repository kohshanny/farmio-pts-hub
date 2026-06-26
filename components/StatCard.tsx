import { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  sublabel,
  accent = 'default',
  icon,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: 'default' | 'fresh' | 'gold' | 'clay';
  icon?: ReactNode;
}) {
  const accentStyles: Record<string, string> = {
    default: 'text-primary',
    fresh: 'text-fresh',
    gold: 'text-gold',
    clay: 'text-clay',
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wide text-ink-soft font-medium">{label}</p>
        {icon && <span className="text-ink-soft">{icon}</span>}
      </div>
      <p className={`font-display text-3xl mt-2 ${accentStyles[accent]}`}>{value}</p>
      {sublabel && <p className="text-xs text-ink-soft mt-1">{sublabel}</p>}
    </div>
  );
}
