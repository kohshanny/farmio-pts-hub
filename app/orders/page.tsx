import { getCurrentProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/DashboardShell';
import { OrdersTable } from '@/components/OrdersTable';

export default async function OrdersPage() {
  const { profile, email } = await getCurrentProfile();
  const isInternal = profile.role === 'internal';

  return (
    <DashboardShell role={profile.role} userEmail={email}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl text-primary">
            {isInternal ? 'All orders' : 'My orders'}
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            {isInternal
              ? 'Every order logged across all part-time agents.'
              : "Every order you've made, in one place. This list is read-only — if something looks off, flag it to the internal team."}
          </p>
        </div>
        <OrdersTable
          agentId={isInternal ? undefined : profile.agent_id ?? undefined}
          showAgentColumn={isInternal}
        />
      </div>
    </DashboardShell>
  );
}
