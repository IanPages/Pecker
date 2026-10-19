import { useState, useEffect, type ReactNode } from 'react';
import { Home, LogOut, Calendar, Target, Settings, PieChart, Activity, User, Sun, Moon, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { logoutUser } from '../../auth/services/authApi';
import { useAuth } from '../../auth/hooks/useAuth';


interface LayoutProps {
  children: ReactNode;
}

const NAV_LINKS = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/analytics', icon: PieChart, label: 'Analytics' },
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

  const { user } = useAuth();

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

  const handleLogout = async () => {
    await logoutUser();
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-screen bg-background text-text-main overflow-hidden">

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[90] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <nav className={[
        'h-full w-[240px] bg-surface',
        'flex flex-col p-5 transition-transform duration-300 ease-out shrink-0',
        // Mobile: slide in/out
        'max-md:absolute max-md:z-[100]',
        isSidebarOpen ? 'max-md:translate-x-0 max-md:shadow-[4px_0_24px_rgba(0,0,0,0.25)]' : 'max-md:-translate-x-full',
      ].join(' ')}>

        {/* Logo */}
        <div className="flex items-center justify-between mb-10 px-1">
          <div className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight text-text-main">
            <Activity className="w-6 h-6 text-accent" />
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
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-md w-full',
                  'font-medium text-sm no-underline transition-colors duration-150',
                  isActive(to)
                    ? 'bg-text-main text-background'
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
        <div className="mt-auto pt-4">
          <ul className="list-none p-0 m-0 flex flex-col gap-1">

            {/* Theme toggle */}
            <li
              onClick={() => setIsDark(!isDark)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-md cursor-pointer
                         text-sm font-medium text-secondary transition-colors duration-150
                         hover:bg-hover hover:text-text-main"
            >
              {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </li>

            {/* Settings */}
            {user && (
              <li>
                <Link
                  to="/settings"
                  className={[
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-md w-full',
                    'font-medium text-sm no-underline transition-colors duration-150',
                    isActive('/settings')
                      ? 'bg-text-main text-background'
                      : 'text-secondary hover:bg-hover hover:text-text-main',
                  ].join(' ')}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Settings className="w-5 h-5 shrink-0" />
                  Settings
                </Link>
              </li>
            )}

            {/* User profile */}
            <li>
              <Link
                to={user ? "/profile" : "/login"}
                className={[
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-md w-full',
                  'font-medium text-sm no-underline transition-colors duration-150',
                  isActive(user ? "/profile" : "/login")
                    ? 'bg-text-main text-background'
                    : 'text-secondary hover:bg-hover hover:text-text-main',
                ].join(' ')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <User className="w-5 h-5 shrink-0" />
                {user ? 'Profile' : 'Login | Register'}
              </Link>
            </li>

            {/* Logged User | Logout */}
            {user && (
              <li
                onClick={() => logoutUser()}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md cursor-pointer
                         text-sm font-medium text-secondary transition-colors duration-150
                         hover:bg-hover hover:text-text-main"
              >
                {<LogOut className="w-5 h-5 shrink-0" />}
                Logout
              </li>
            )}

          </ul>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar — hamburger button */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-surface shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="bg-transparent border-none text-text-main cursor-pointer p-1 rounded-lg hover:bg-hover transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 font-display text-base font-extrabold text-text-main">
            <Activity className="w-5 h-5 text-accent" />
            <span>Pecker</span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 px-5 py-6 md:px-10 md:py-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
