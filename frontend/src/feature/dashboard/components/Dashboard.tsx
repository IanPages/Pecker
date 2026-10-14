import { WeeklyTrack } from './WeeklyTrack.tsx';
import { Target, TrendingUp, Zap, Clock } from 'lucide-react';

const STATS = [
  {
    title: 'Weekly Goal',
    value: '85%',
    footer: { text: '+5% from last week', icon: <TrendingUp size={16} />, positive: true },
    icon: <Target className="w-5 h-5" />,
    iconClass: 'bg-progress/15 text-progress',
  },
  {
    title: 'Current Streak',
    value: '12 Days',
    footer: { text: 'Keep it up!', positive: false },
    icon: <Zap className="w-5 h-5" />,
    iconClass: 'bg-amber-500/10 text-amber-500',
  },
  {
    title: 'Hours Tracked',
    value: '34.5h',
    footer: { text: 'This week', positive: false },
    icon: <Clock className="w-5 h-5" />,
    iconClass: 'bg-blue-500/10 text-blue-500',
  },
];

const ACTIVITIES = [
  { label: 'Completed workout', time: '2 hours ago', dotClass: 'bg-emerald-500' },
  { label: 'Read 20 pages',     time: '5 hours ago', dotClass: 'bg-blue-500'    },
  { label: 'Meditation',        time: 'Yesterday',   dotClass: 'bg-amber-500'   },
];

export function Dashboard() {
  return (
    <div className="flex flex-col gap-8">

      {/* ── Welcome ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1
            className="text-4xl font-bold m-0 mb-2"
            style={{
              background: 'linear-gradient(135deg, var(--color-text-main) 0%, var(--color-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Hello, User! 👋
          </h1>
          <p className="text-secondary text-lg m-0">
            Here's what's happening with your goals today.
          </p>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {STATS.map(({ title, value, footer, icon, iconClass }) => (
          <div
            key={title}
            className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4
                       shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-200
                       hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <span className="text-secondary font-medium text-sm">{title}</span>
              <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${iconClass}`}>
                {icon}
              </div>
            </div>

            {/* Value */}
            <div className="text-[2.2rem] font-bold text-text-main leading-none">{value}</div>

            {/* Footer */}
            <div className={`flex items-center gap-2 text-sm ${footer.positive ? 'text-emerald-500' : 'text-secondary'}`}>
              {footer.icon}
              <span>{footer.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid: WeeklyTrack + Side panel ── */}
      <div className="grid grid-cols-[2fr_1fr] gap-6 lg:grid-cols-[2fr_1fr] max-lg:grid-cols-1">

        {/* Weekly tracker */}
        <div>
          <WeeklyTrack />
        </div>

        {/* Recent activity panel */}
        <div className="bg-surface border border-border rounded-2xl p-6 h-full">
          <h3 className="m-0 mb-6 text-lg font-semibold text-text-main">Recent Activity</h3>
          <ul className="list-none p-0 m-0 flex flex-col gap-5">
            {ACTIVITIES.map(({ label, time, dotClass }) => (
              <li key={label} className="flex gap-4">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotClass}`} />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-text-main text-sm">{label}</span>
                  <span className="text-xs text-secondary">{time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}
