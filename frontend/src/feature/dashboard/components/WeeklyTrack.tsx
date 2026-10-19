import { Link } from 'react-router';
import type { DashboardStats } from '../types/Dashboard';
import { fmtHours, weekdayName } from '../utils/statsFormat';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Monday-first index of today, so the current day carries the accent
const TODAY = (new Date().getDay() + 6) % 7;

export function WeeklyTrack({ stats }: { stats: DashboardStats | null }) {
  // no goals yet: each bar is relative to the busiest day of the week
  const max = Math.max(1, ...(stats?.days.map(d => d.minutes) ?? []));
  const days = DAY_NAMES.map((day, i) => {
    const minutes = stats?.days[i]?.minutes ?? 0;
    return { day, minutes, value: Math.round(minutes / max * 100) };
  });

  return (
    <div className="bg-surface rounded-2xl p-6 md:p-8 flex flex-col gap-8 h-full">

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-text-main">This week</h2>
        <Link
          className="bg-hover text-text-main px-4 py-2 rounded-full text-sm font-semibold cursor-pointer
                     transition-colors duration-150 hover:bg-text-main hover:text-background"
          to="/schedule"
        >
          View details
        </Link>
      </div>

      {/* Bars: one flat column per day, today in the crown red */}
      <div className="flex items-end justify-between gap-2 md:gap-4 h-[220px]">
        {days.map(({ day, minutes, value }, i) => (
          <div className="flex flex-col items-center justify-end gap-3 flex-1 h-full" key={day}>
            <span className="text-xs font-semibold tabular-nums text-secondary">{minutes ? fmtHours(minutes) : ''}</span>
            <div
              className={[
                'w-full max-w-14 rounded-t-md origin-bottom transition-[height] duration-700 ease-out',
                i === TODAY ? 'bg-accent' : i < TODAY ? 'bg-text-main' : 'bg-hover',
              ].join(' ')}
              style={{ height: `${Math.max(value, 2)}%` }}
            />
            <span className={`text-sm ${i === TODAY ? 'font-semibold text-text-main' : 'text-secondary'}`}>{day}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-10">
        <div>
          <div className="text-sm text-secondary">Daily average</div>
          <div className="font-display text-2xl font-extrabold tabular-nums">{stats ? fmtHours(stats.daily_avg_minutes) : '–'}</div>
        </div>
        <div>
          <div className="text-sm text-secondary">Best day</div>
          <div className="font-display text-2xl font-extrabold">{stats?.best_day ? weekdayName(stats.best_day) : '–'}</div>
        </div>
      </div>

    </div>
  );
}
