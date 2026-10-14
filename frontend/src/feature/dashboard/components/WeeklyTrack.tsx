const WEEKLY_DATA = [
  { day: 'Mon', value: 80,  active: true  },
  { day: 'Tue', value: 65,  active: true  },
  { day: 'Wed', value: 90,  active: true  },
  { day: 'Thu', value: 50,  active: true  },
  { day: 'Fri', value: 100, active: true  },
  { day: 'Sat', value: 30,  active: false },
  { day: 'Sun', value: 0,   active: false },
];

export function WeeklyTrack() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 h-full">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="m-0 text-lg font-semibold text-text-main">Weekly Overview</h3>
        <button
          className="bg-transparent text-secondary border border-border px-4 py-1.5 rounded-lg
                     font-medium cursor-pointer transition-all duration-200
                     hover:bg-hover hover:text-text-main"
        >
          View Details
        </button>
      </div>

      {/* Bar chart */}
      <div className="h-[240px] flex items-end pb-2.5 border-b border-dashed border-border mb-4">
        <div className="flex justify-between w-full h-full items-end">
          {WEEKLY_DATA.map((data) => (
            <div className="flex flex-col items-center gap-3 flex-1" key={data.day}>
              {/* Bar track */}
              <div className="w-5 sm:w-8 h-[180px] bg-hover rounded-lg relative overflow-hidden">
                {/* Fill */}
                <div
                  className={[
                    'absolute bottom-0 left-0 w-full rounded-lg transition-all duration-700 ease-in-out',
                    data.active
                      ? 'bg-gradient-to-b from-progress to-[#6366f1] shadow-[0_0_10px_rgba(128,184,134,0.4)]'
                      : 'bg-secondary opacity-30',
                  ].join(' ')}
                  style={{ height: `${data.value}%` }}
                />
              </div>
              <span className="text-xs text-secondary font-medium">{data.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-xs text-secondary">Average Completion</div>
          <div className="text-lg font-semibold text-text-main">72%</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs text-secondary">Best Day</div>
          <div className="text-lg font-semibold text-text-main">Friday</div>
        </div>
      </div>

    </div>
  );
}
