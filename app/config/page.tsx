import { getCurrentProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/DashboardShell';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Config, Profile } from '@/types/database';
import { ConfigForm } from '@/components/ConfigForm';
import { PromoteInternalForm } from '@/components/PromoteInternalForm';

export default async function ConfigPage() {
  const { profile, email } = await getCurrentProfile();

  if (profile.role !== 'internal') {
    redirect('/');
  }

  const supabase = await createClient();
  const { data: config } = await supabase.from('config').select('*').single<Config>();
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')
    .order('email')
    .returns<Profile[]>();

  return (
    <DashboardShell role={profile.role} userEmail={email}>
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="font-display text-3xl text-primary">Settings</h1>
          <p className="text-sm text-ink-soft mt-1">
            Global assumptions used across both dashboards, and team access.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-display text-lg text-primary mb-4">Global assumptions</h2>
          <ConfigForm config={config as Config} />
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-display text-lg text-primary mb-1">Internal team access</h2>
          <p className="text-xs text-ink-soft mb-4">
            Grant internal (admin) access to a signed-up account. Be careful — internal accounts
            can see and edit every agent&apos;s data.
          </p>
          <PromoteInternalForm profiles={allProfiles ?? []} />
        </div>
      </div>
    </DashboardShell>
  );
}
