import { useState, useEffect, type ReactNode } from 'react';
import { Home, LogOut, LogIn, Calendar, Target, Activity, Sun, Moon, Menu, X } from 'lucide-react';
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
];

const ICON_BUTTON = 'flex items-center justify-center w-10 h-10 rounded-full bg-transparent border-none cursor-pointer ' +
  'text-secondary hover:bg-hover hover:text-text-main transition-colors duration-150 no-underline';

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // nested routes (/goals/:id) keep their section highlighted
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const logo = (
    <Link to="/" className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight text-text-main no-underline">
      <Activity className="w-6 h-6 text-accent" />
      <span>Pecker</span>
    </Link>
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-text-main overflow-hidden">

      {/* ── Desktop header ── */}
      <header className="max-md:hidden grid grid-cols-[1fr_auto_1fr] items-center px-8 py-3 bg-surface shrink-0">
        {logo}

        <nav aria-label="Main">
          <ul className="list-none p-0 m-0 flex items-center gap-1">
            {NAV_LINKS.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={isActive(to) ? 'page' : undefined}
                  className={[
                    'flex items-center gap-2 px-4 py-2 rounded-full',
                    'font-medium text-sm no-underline transition-colors duration-150',
                    isActive(to)
                      ? 'bg-text-main text-background'
                      : 'text-secondary hover:bg-hover hover:text-text-main',
                  ].join(' ')}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className={ICON_BUTTON}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {user ? (
            <button onClick={() => logoutUser()} aria-label="Log out" title="Log out" className={ICON_BUTTON}>
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <Link to="/login" aria-label="Log in" title="Log in" className={ICON_BUTTON}>
              <LogIn className="w-5 h-5" />
            </Link>
          )}
        </div>
      </header>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-surface shrink-0">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="bg-transparent border-none text-text-main cursor-pointer p-1 rounded-lg hover:bg-hover transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 font-display text-base font-extrabold text-text-main">
          <Activity className="w-5 h-5 text-accent" />
          <span>Pecker</span>
        </div>
      </header>

      {/* Mobile overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-90 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <nav
        aria-label="Main"
        className={[
          'md:hidden fixed top-0 left-0 z-100 h-full w-60 bg-surface',
          'flex flex-col p-5 transition-transform duration-300 ease-out',
          isMenuOpen ? 'translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.25)]' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between mb-10 px-1">
          {logo}
          <button
            className="bg-transparent border-none text-text-main cursor-pointer p-1"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ul className="list-none p-0 m-0 flex flex-col gap-1 flex-1">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <Link
                to={to}
                aria-current={isActive(to) ? 'page' : undefined}
                className={[
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-md w-full',
                  'font-medium text-sm no-underline transition-colors duration-150',
                  isActive(to)
                    ? 'bg-text-main text-background'
                    : 'text-secondary hover:bg-hover hover:text-text-main',
                ].join(' ')}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="list-none p-0 m-0 flex flex-col gap-1 pt-4">
          <li>
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-md w-full bg-transparent border-none cursor-pointer
                         text-sm font-medium text-secondary transition-colors duration-150
                         hover:bg-hover hover:text-text-main"
            >
              {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </li>
          <li>
            {user ? (
              <button
                onClick={() => logoutUser()}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md w-full bg-transparent border-none cursor-pointer
                           text-sm font-medium text-secondary transition-colors duration-150
                           hover:bg-hover hover:text-text-main"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md w-full no-underline
                           text-sm font-medium text-secondary transition-colors duration-150
                           hover:bg-hover hover:text-text-main"
              >
                <LogIn className="w-5 h-5 shrink-0" />
                Login | Register
              </Link>
            )}
          </li>
        </ul>
      </nav>

      {/* ── Page content ── */}
      <main className="flex-1 px-5 py-6 md:px-10 md:py-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
