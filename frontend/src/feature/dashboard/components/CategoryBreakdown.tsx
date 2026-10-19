import type { DashboardStats } from '../types/Dashboard';
import { fmtHours } from '../utils/statsFormat';

// category colors are hex without "#"; uncategorised falls back to the neutral tone
const swatch = (color: string | null) => (color ? { backgroundColor: `#${color}` } : undefined);

export function CategoryBreakdown({ stats }: { stats: DashboardStats | null }) {
  const categories = stats?.by_category ?? [];
  const total = categories.reduce((sum, c) => sum + c.minutes, 0);

  return (
    <section className="bg-surface rounded-2xl p-6 md:p-8 flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Time by category</h2>

      {!stats ? (
        <p className="text-secondary">Loading…</p>
      ) : total === 0 ? (
        <p className="text-secondary">Nothing tracked this week yet.</p>
      ) : (
        <>
          {/* One stacked bar: each segment is that category's share of the week */}
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
            {categories.map(c => (
              <div
                key={c.name}
                className="bg-hover h-full"
                style={{ ...swatch(c.color), width: `${(c.minutes / total) * 100}%` }}
                title={`${c.name} · ${fmtHours(c.minutes)}`}
              />
            ))}
          </div>

          <ul className="list-none grid gap-x-10 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map(c => (
              <li key={c.name} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0 bg-hover" style={swatch(c.color)} />
                <span className="font-medium truncate">{c.name}</span>
                <span className="ml-auto tabular-nums text-secondary">
                  {fmtHours(c.minutes)} · {Math.round((c.minutes / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
