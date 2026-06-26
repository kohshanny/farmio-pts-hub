import { getCurrentProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/DashboardShell';
import { CommissionsView } from '@/components/CommissionsView';

export default async function CommissionsPage() {
  const { profile, email } = await getCurrentProfile();
  const isInternal = profile.role === 'internal';

  return (
    <DashboardShell role={profile.role} userEmail={email}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl text-primary">
            {isInternal ? 'Commission management' : 'My commissions'}
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            {isInternal
              ? 'Every commission owed across the team, oldest pending first.'
              : 'Every dollar Farmio owes you, and exactly where it stands.'}
          </p>
        </div>
        <CommissionsView
          agentId={isInternal ? undefined : profile.agent_id ?? undefined}
          isInternal={isInternal}
        />
      </div>
    </DashboardShell>
  );
}
