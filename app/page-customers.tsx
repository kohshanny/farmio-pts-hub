import { getCurrentProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/DashboardShell';
import { CustomersTable } from '@/components/CustomersTable';
import { redirect } from 'next/navigation';

export default async function CustomersPage() {
  const { profile, email } = await getCurrentProfile();

  if (profile.role !== 'internal') {
    redirect('/');
  }

  return (
    <DashboardShell role={profile.role} userEmail={email}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl text-primary">Customers</h1>
          <p className="text-sm text-ink-soft mt-1">
            Every customer across all agents — lifetime revenue and when they last ordered.
          </p>
        </div>
        <CustomersTable />
      </div>
    </DashboardShell>
  );
}
