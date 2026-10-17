import { WeeklyTrack } from './WeeklyTrack';
import { useAuth } from '../../auth/hooks/useAuth';

const FACTS = [
  { value: '12', label: 'day streak' },
  { value: '34.5h', label: 'tracked this week' },
  { value: '+5%', label: 'vs last week' },
];

const ACTIVITIES = [
  { label: 'Completed workout', time: '2 hours ago', dotClass: 'bg-accent' },
  { label: 'Read 20 pages', time: '5 hours ago', dotClass: 'bg-study' },
  { label: 'Meditation', time: 'Yesterday', dotClass: 'bg-freetime' },
];

export function Dashboard() {
  const { user } = useAuth();
  const name = user?.email?.split('@')[0] ?? 'Guest';

  return (
    <div className="flex flex-col gap-10 max-w-[1500px]">

      {/* ── Welcome: the week's headline number carries the page ── */}
      <header className="flex flex-col gap-3">
        <p className="text-secondary">Hello, {name}</p>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.02] max-w-3xl text-balance">
          You're at <span className="tabular-nums">85%</span> of this week's goal.
        </h1>
        <ul className="flex flex-wrap gap-x-10 gap-y-3 mt-3 list-none">
          {FACTS.map(({ value, label }) => (
            <li key={label} className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold tabular-nums">{value}</span>
              <span className="text-secondary">{label}</span>
            </li>
          ))}
        </ul>
      </header>

      {/* ── Week + activity ── */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <WeeklyTrack />

        <section className="bg-surface rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6">Recent activity</h2>
          <ul className="list-none flex flex-col gap-5">
            {ACTIVITIES.map(({ label, time, dotClass }) => (
              <li key={label} className="flex gap-4 items-start">
                <span className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${dotClass}`} />
                <div className="flex flex-col">
                  <span className="font-medium">{label}</span>
                  <span className="text-sm text-secondary">{time}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

    </div>
  );
}
