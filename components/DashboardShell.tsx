'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  LogOut,
  ClipboardList,
  Wallet,
  UserCircle,
  Building2,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const agentNav: NavItem[] = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/orders', label: 'My Orders', icon: Receipt },
  { href: '/commissions', label: 'My Commissions', icon: Wallet },
];

const internalNav: NavItem[] = [
  { href: '/', label: 'Team Overview', icon: LayoutDashboard },
  { href: '/entry', label: 'Log Order', icon: ClipboardList },
  { href: '/orders', label: 'All Orders', icon: Receipt },
  { href: '/agents', label: 'Agent Roster', icon: Users },
  { href: '/customers', label: 'Customers', icon: Building2 },
  { href: '/commissions', label: 'Commissions', icon: Wallet },
  { href: '/config', label: 'Settings', icon: Settings },
];

export function DashboardShell({
  role,
  userEmail,
  children,
}: {
  role: 'agent' | 'internal';
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === 'internal' ? internalNav : agentNav;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-primary text-white flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Farmio SG</p>
          <p className="font-display text-xl mt-0.5">PTS Hub</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-white/15 font-medium' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-white/70">
            <UserCircle size={17} />
            <span className="truncate">{userEmail}</span>
          </div>
          <span className="block px-3 mb-2">
            <span className="text-[11px] uppercase tracking-wide text-white/40">
              {role === 'internal' ? 'Internal team' : 'Sales agent'}
            </span>
          </span>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/75 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-bg min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

export function DashboardShell({
  role,
  userEmail,
  children,
}: {
  role: 'agent' | 'internal';
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === 'internal' ? internalNav : agentNav;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-primary text-white flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Farmio SG</p>
          <p className="font-display text-xl mt-0.5">PTS Hub</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-white/15 font-medium' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-white/70">
            <UserCircle size={17} />
            <span className="truncate">{userEmail}</span>
          </div>
          <span className="block px-3 mb-2">
            <span className="text-[11px] uppercase tracking-wide text-white/40">
              {role === 'internal' ? 'Internal team' : 'Sales agent'}
            </span>
          </span>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/75 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-bg min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
