import { ReactNode } from 'react';
import { Home, Calendar, Target, Settings, PieChart, Activity, User } from 'lucide-react';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">
          <Activity className="icon-large" />
          <span>Tracker</span>
        </div>
        <ul className="nav-links">
          <li className="active"><Home className="icon" /> Overview</li>
          <li><Calendar className="icon" /> Schedule</li>
          <li><Target className="icon" /> Goals</li>
          <li><PieChart className="icon" /> Analytics</li>
        </ul>
        <div className="sidebar-footer">
          <ul>
            <li><Settings className="icon" /> Settings</li>
            <li className="user-profile">
              <div className="avatar"><User className="icon" /></div>
              <span>Profile</span>
            </li>
          </ul>
        </div>
      </nav>
      <main className="main-content">
        <header className="top-bar">
          <h2>Overview</h2>
          <div className="header-actions">
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
