import { getCurrentProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/DashboardShell';
import { OrderEntryForm } from '@/components/OrderEntryForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Agent, Customer, Config } from '@/types/database';

export default async function EntryPage() {
  const { profile, email } = await getCurrentProfile();

  if (profile.role !== 'internal') {
    redirect('/');
  }

  const supabase = await createClient();
  const [{ data: agents }, { data: customers }, { data: config }] = await Promise.all([
    supabase.from('agents').select('*').eq('status', 'Active').order('name').returns<Agent[]>(),
    supabase.from('customers').select('*').returns<Customer[]>(),
    supabase.from('config').select('*').single<Config>(),
  ]);

  return (
    <DashboardShell role={profile.role} userEmail={email}>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-3xl text-primary">Log an order</h1>
          <p className="text-sm text-ink-soft mt-1">
            Enter a sale made by a part-time agent. LTV and LTV:CAC are calculated automatically.
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <OrderEntryForm
            agents={agents ?? []}
            customers={customers ?? []}
            config={config as Config}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
