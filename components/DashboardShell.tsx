'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
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
  Menu,
  X,
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

function NavContent({
  nav,
  pathname,
  userEmail,
  role,
  onNavigate,
  onSignOut,
}: {
  nav: NavItem[];
  pathname: string;
  userEmail: string;
  role: string;
  onNavigate?: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="px-6 py-6 border-b border-white/10">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Farmio SG</p>
        <p className="font-display text-xl mt-0.5">PTS Hub</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-white/15 font-medium'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
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
          onClick={onSignOut}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/75 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </>
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const nav = role === 'internal' ? internalNav : agentNav;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 bg-primary text-white flex-col shrink-0">
        <NavContent
          nav={nav}
          pathname={pathname}
          userEmail={userEmail}
          role={role}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile overlay nav */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileNavOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-primary text-white flex flex-col h-full shadow-2xl">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <NavContent
              nav={nav}
              pathname={pathname}
              userEmail={userEmail}
              role={role}
              onNavigate={() => setMobileNavOpen(false)}
              onSignOut={handleSignOut}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-primary text-white shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Farmio SG</p>
            <p className="font-display text-base leading-tight">PTS Hub</p>
          </div>
          <button
            onClick={() => setMobileNavOpen(true)}
            className="text-white/80 hover:text-white p-1"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 bg-bg min-w-0">
          <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
