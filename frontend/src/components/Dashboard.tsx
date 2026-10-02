import { WeeklyTrack } from './WeeklyTrack.tsx';
import { Target, TrendingUp, Zap, Clock } from 'lucide-react';
import '../styles/Dashboard.css';

export function Dashboard() {
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Hello, User! 👋</h1>
          <p>Here's what's happening with your goals today.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Weekly Goal</span>
            <div className="stat-icon-wrapper"><Target className="stat-icon" /></div>
          </div>
          <div className="stat-value">85%</div>
          <div className="stat-footer text-positive">
            <TrendingUp size={16} /> <span>+5% from last week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Current Streak</span>
            <div className="stat-icon-wrapper warning"><Zap className="stat-icon" /></div>
          </div>
          <div className="stat-value">12 Days</div>
          <div className="stat-footer">Keep it up!</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Hours Tracked</span>
            <div className="stat-icon-wrapper info"><Clock className="stat-icon" /></div>
          </div>
          <div className="stat-value">34.5h</div>
          <div className="stat-footer">This week</div>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="weekly-track-wrapper">
          <WeeklyTrack />
        </div>

        <div className="side-panel">
          <div className="panel-card">
            <h3>Recent Activity</h3>
            <ul className="activity-list">
              <li>
                <div className="activity-dot positive"></div>
                <div className="activity-content">
                  <span className="activity-name">Completed workout</span>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </li>
              <li>
                <div className="activity-dot info"></div>
                <div className="activity-content">
                  <span className="activity-name">Read 20 pages</span>
                  <span className="activity-time">5 hours ago</span>
                </div>
              </li>
              <li>
                <div className="activity-dot warning"></div>
                <div className="activity-content">
                  <span className="activity-name">Meditation</span>
                  <span className="activity-time">Yesterday</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
