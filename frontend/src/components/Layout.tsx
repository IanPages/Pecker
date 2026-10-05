import { useState, useEffect, type ReactNode } from 'react';
import { Home, Calendar, Target, Settings, PieChart, Activity, User, Sun, Moon, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const NAV_LINKS = [
  { to: '/',          icon: Home,     label: 'Dashboard'  },
  { to: '/schedule',  icon: Calendar, label: 'Schedule'   },
  { to: '/goals',     icon: Target,   label: 'Goals'      },
  { to: '/analytics', icon: PieChart, label: 'Analytics'  },
];

export function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-screen bg-background text-text-main font-['Inter',system-ui,sans-serif] overflow-hidden">

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <nav className={[
        'h-full w-[260px] bg-surface border-r border-border',
        'flex flex-col p-6 transition-all duration-300 shrink-0',
        // Mobile: slide in/out
        'max-md:absolute max-md:z-[100]',
        isSidebarOpen ? 'max-md:translate-x-0 max-md:shadow-[4px_0_24px_rgba(0,0,0,0.2)]' : 'max-md:-translate-x-full',
      ].join(' ')}>

        {/* Logo */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 text-2xl font-bold text-progress">
            <Activity className="w-7 h-7" />
            <span>Pecker</span>
          </div>
          {/* Close button — mobile only */}
          <button
            className="md:hidden bg-transparent border-none text-text-main cursor-pointer p-1"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <ul className="list-none p-0 m-0 flex flex-col gap-1 flex-1">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-lg w-full',
                  'font-medium text-sm no-underline transition-all duration-200',
                  isActive(to)
                    ? 'bg-progress/15 text-progress'
                    : 'text-secondary hover:bg-hover hover:text-text-main',
                ].join(' ')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Sidebar footer */}
        <div className="mt-auto border-t border-border pt-6">
          <ul className="list-none p-0 m-0 flex flex-col gap-1">

            {/* Theme toggle */}
            <li
              onClick={() => setIsDark(!isDark)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
                         text-sm font-medium text-secondary transition-all duration-200
                         hover:bg-hover hover:text-text-main"
            >
              {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </li>

            {/* Settings */}
            <li>
              <Link
                to="/settings"
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-lg w-full',
                  'font-medium text-sm no-underline transition-all duration-200',
                  isActive('/settings')
                    ? 'bg-progress/15 text-progress'
                    : 'text-secondary hover:bg-hover hover:text-text-main',
                ].join(' ')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Settings className="w-5 h-5 shrink-0" />
                Settings
              </Link>
            </li>

            {/* User profile */}
            <li className="flex items-center gap-3 px-4 py-3 mt-1 rounded-lg cursor-pointer
                           text-sm font-medium text-secondary transition-all duration-200
                           hover:bg-hover hover:text-text-main">
              <div className="w-8 h-8 rounded-full bg-progress text-white flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <span>Profile</span>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-20 px-8 flex items-center justify-between
                           bg-background border-b border-border backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden bg-transparent border-none text-text-main cursor-pointer p-2 -ml-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-semibold m-0">Overview</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="bg-progress text-white border-none px-5 py-2.5 rounded-lg
                         font-semibold text-sm cursor-pointer transition-all duration-200
                         hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(128,184,134,0.4)]"
            >
              + Add Entry
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
