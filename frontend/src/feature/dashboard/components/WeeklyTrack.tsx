const WEEKLY_DATA = [
  { day: 'Mon', value: 80 },
  { day: 'Tue', value: 65 },
  { day: 'Wed', value: 90 },
  { day: 'Thu', value: 50 },
  { day: 'Fri', value: 100 },
  { day: 'Sat', value: 30 },
  { day: 'Sun', value: 0 },
];

// Monday-first index of today, so the current day carries the accent
const TODAY = (new Date().getDay() + 6) % 7;

export function WeeklyTrack() {
  return (
    <div className="bg-surface rounded-2xl p-6 md:p-8 flex flex-col gap-8 h-full">

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-text-main">This week</h2>
        <button
          className="bg-hover text-text-main px-4 py-2 rounded-full text-sm font-semibold cursor-pointer
                     transition-colors duration-150 hover:bg-text-main hover:text-background"
        >
          View details
        </button>
      </div>

      {/* Bars: one flat column per day, today in the crown red */}
      <div className="flex items-end justify-between gap-2 md:gap-4 h-[220px]">
        {WEEKLY_DATA.map(({ day, value }, i) => (
          <div className="flex flex-col items-center justify-end gap-3 flex-1 h-full" key={day}>
            <span className="text-xs font-semibold tabular-nums text-secondary">{value}%</span>
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
          <div className="text-sm text-secondary">Average completion</div>
          <div className="font-display text-2xl font-extrabold tabular-nums">72%</div>
        </div>
        <div>
          <div className="text-sm text-secondary">Best day</div>
          <div className="font-display text-2xl font-extrabold">Friday</div>
        </div>
      </div>

    </div>
  );
}
