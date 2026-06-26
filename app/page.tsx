import { getCurrentProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/DashboardShell';
import { AgentOverview } from '@/components/AgentOverview';
import { InternalOverview } from '@/components/InternalOverview';

export default async function HomePage() {
  const { profile, email } = await getCurrentProfile();

  return (
    <DashboardShell role={profile.role} userEmail={email}>
      {profile.role === 'internal' ? (
        <InternalOverview />
      ) : profile.agent_id ? (
        <AgentOverview agentId={profile.agent_id} />
      ) : (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <h1 className="font-display text-2xl text-primary mb-2">Almost there</h1>
          <p className="text-sm text-ink-soft max-w-md mx-auto">
            Your account isn&apos;t linked to an agent profile yet. Ask an internal team member to
            link your account in the Agent Roster so you can see your orders and commissions.
          </p>
        </div>
      )}
    </DashboardShell>
  );
}
