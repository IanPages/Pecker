import { WeeklyTrack } from './WeeklyTrack';
import { CategoryBreakdown } from './CategoryBreakdown';
import { useAuth } from '../../auth/hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { fmtHours, timeAgo } from '../utils/statsFormat';
import { useRecentRecords } from '../hooks/useRecentRecords';
import { GoalsOverview } from './GoalsOverview';
import { useGoals } from '../../goals/hooks/useGoals';
import { toLocalISODate } from '../../schedule/utils/calendarUtils';

export function Dashboard() {
  const { user } = useAuth();
  const name = user?.email?.split('@')[0] ?? 'Guest';
  const { stats, error } = useDashboardStats(!!user?.id);
  const { records, error: recentError } = useRecentRecords(!!user?.id);
  const { goals, error: goalsError } = useGoals(!!user?.id);

  const change = stats?.change_pct;
  const facts = [
    { value: stats ? String(stats.streak) : '–', label: 'day streak' },
    { value: stats ? fmtHours(stats.week_minutes) : '–', label: 'tracked this week' },
    { value: change == null ? '–' : `${change > 0 ? '+' : ''}${change}%`, label: 'vs last week' },
  ];

  return (
    <div className="flex flex-col gap-10 w-full max-w-[1500px] mx-auto">

      {/* ── Welcome: the week's headline number carries the page ── */}
      <header className="flex flex-col gap-3">
        <p className="text-secondary">Hello, {name}</p>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.02] max-w-3xl text-balance">
          {stats
            ? <>You've tracked <span className="tabular-nums">{fmtHours(stats.week_minutes)}</span> this week.</>
            : error ? "We couldn't load your week." : 'Loading your week…'}
        </h1>
        <ul className="flex flex-wrap gap-x-10 gap-y-3 mt-3 list-none">
          {facts.map(({ value, label }) => (
            <li key={label} className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold tabular-nums">{value}</span>
              <span className="text-secondary">{label}</span>
            </li>
          ))}
        </ul>
      </header>

      {/* ── Week + activity ── */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <WeeklyTrack stats={stats} />

        <section className="bg-surface rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6">Recent activity</h2>
          <ul className="list-none flex flex-col gap-5">
            {records?.map(r => (
              <li key={r.id} className="flex gap-4 items-start">
                {/* category color is a hex string without "#"; uncategorised records fall back to the neutral tone */}
                <span
                  className="w-3 h-3 rounded-full mt-1.5 shrink-0 bg-hover"
                  style={r.categories ? { backgroundColor: `#${r.categories.color}` } : undefined}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-sm text-secondary">{timeAgo(r.start_hour)}</span>
                </div>
              </li>
            ))}
          </ul>
          {!records && <p className="text-secondary">{recentError ? "We couldn't load your activity." : 'Loading…'}</p>}
          {records?.length === 0 && <p className="text-secondary">No activity yet.</p>}
        </section>
      </div>

      <GoalsOverview goals={goals} today={toLocalISODate(new Date())} error={goalsError} />

      <CategoryBreakdown stats={stats} />

    </div>
  );
}
