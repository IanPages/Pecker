import { useState, useEffect, type ReactNode } from 'react';
import { Home, Calendar, Target, Settings, PieChart, Activity, User, Sun, Moon, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
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

  const toggleTheme = () => setIsDark(!isDark);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className={`layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <nav className="sidebar">
        <div className="logo flex justify-between w-full">
          <div className="flex items-center gap-3">
            <Activity className="icon-large" />
            <span>Pecker</span>
          </div>
          <button className="menu-button" onClick={() => setIsSidebarOpen(false)}>
            <X className="icon" />
          </button>
        </div>
        <ul className="nav-links">
          <li className={location.pathname === '/' ? 'active' : ''}><Link to="/" className="flex items-center gap-3"><Home className="icon" /> Dashboard</Link></li>
          <li className={location.pathname === '/schedule' ? 'active' : ''}><Link to="/schedule" className="flex items-center gap-3"><Calendar className="icon" /> Schedule</Link></li>
          <li className={location.pathname === '/goals' ? 'active' : ''}><Link to="/goals" className="flex items-center gap-3"><Target className="icon" /> Goals</Link></li>
          <li className={location.pathname === '/analytics' ? 'active' : ''}><Link to="/analytics" className="flex items-center gap-3"><PieChart className="icon" /> Analytics</Link></li>
        </ul>
        <div className="sidebar-footer">
          <ul>
            <li onClick={toggleTheme} title="Toggle theme">
              {isDark ? <Sun className="icon" /> : <Moon className="icon" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </li>
            <li className={location.pathname === '/settings' ? 'active' : ''}><Link to="/settings" className="flex items-center gap-3"><Settings className="icon" /> Settings</Link></li>
            <li className="user-profile">
              <div className="avatar"><User className="icon" /></div>
              <span>Profile</span>
            </li>
          </ul>
        </div>
      </nav>
      <main className="main-content">
        <header className="top-bar">
          <div className="flex items-center gap-4">
            <button className="menu-button" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="icon" />
            </button>
            <h2>Overview</h2>
          </div>
          <div className="header-actions flex items-center gap-4">

            <button className="btn-primary">+ Add Entry</button>
          </div>
        </header>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
