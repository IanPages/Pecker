export function WeeklyTrack() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Dummy data for visual representation
  const weeklyData = [
    { day: 'Mon', value: 80, active: true },
    { day: 'Tue', value: 65, active: true },
    { day: 'Wed', value: 90, active: true },
    { day: 'Thu', value: 50, active: true },
    { day: 'Fri', value: 100, active: true },
    { day: 'Sat', value: 30, active: false },
    { day: 'Sun', value: 0, active: false },
  ];

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <h3 className="m-0 text-[1.2rem]">Weekly Overview</h3>
        <button className="bg-transparent text-[var(--text-secondary)] border border-[var(--border-color)] px-4 py-1.5 rounded-lg font-medium cursor-pointer transition-all duration-200 ease-in-out hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">
          View Details
        </button>
      </div>
      
      <div className="h-[240px] flex items-end pb-2.5 border-b border-dashed border-[var(--border-color)] mb-4">
        <div className="flex justify-between w-full h-full items-end">
          {weeklyData.map((data, index) => (
            <div className="flex flex-col items-center gap-3 flex-1" key={index}>
              <div className="w-[20px] sm:w-[32px] h-[180px] bg-[var(--bg-hover)] rounded-lg relative overflow-hidden">
                <div 
                  className={`absolute bottom-0 left-0 w-full rounded-lg transition-all duration-700 ease-in-out ${data.active ? 'bg-gradient-to-b from-[var(--brand-color)] to-[#6366f1] shadow-[0_0_10px_var(--brand-color-alpha)]' : 'bg-[var(--text-secondary)] opacity-30'}`} 
                  style={{ height: `${data.value}%` }}
                ></div>
              </div>
              <span className="text-[0.85rem] text-[var(--text-secondary)] font-medium">{data.day}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-[0.85rem] text-[var(--text-secondary)]">Average Completion</div>
          <div className="text-[1.2rem] font-semibold text-[var(--text-primary)]">72%</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[0.85rem] text-[var(--text-secondary)]">Best Day</div>
          <div className="text-[1.2rem] font-semibold text-[var(--text-primary)]">Friday</div>
        </div>
      </div>
    </div>
  );
}
