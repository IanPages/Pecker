import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Task {
    id: number;
    title: string;
    notes: string;
    color: string;       // Tailwind bg class
    textColor: string;   // Tailwind text class
    ringColor: string;   // Tailwind ring class
    startHour: number;   // 0–23
    durationH: number;   // hours
    dayIdx: number;      // 0 = Mon … 4 = Fri
}

// ── Constants ──────────────────────────────────────────────────────────────
const HOUR_H = 56; // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0 → 23

const WEEK_DAYS = [
    { short: 'Mon', label: 'Monday', date: '05', month: 'Oct' },
    { short: 'Tue', label: 'Tuesday', date: '06', month: 'Oct' },
    { short: 'Wed', label: 'Wednesday', date: '07', month: 'Oct' },
    { short: 'Thu', label: 'Thursday', date: '08', month: 'Oct' },
    { short: 'Fri', label: 'Friday', date: '09', month: 'Oct' },
];

const TODAY_IDX = 0;

const INITIAL_TASKS: Task[] = [
    { id: 1, title: 'Meeting with HR · DISA', notes: 'Discuss onboarding and team structure.', color: 'bg-freetime', textColor: 'text-text-main', ringColor: 'ring-freetime', startHour: 9, durationH: 1, dayIdx: 0 },
    { id: 2, title: 'Frontend development', notes: 'Work on the Pecker dashboard UI.', color: 'bg-study', textColor: 'text-text-main', ringColor: 'ring-study', startHour: 10, durationH: 2, dayIdx: 0 },
    { id: 3, title: 'Read a book', notes: 'Continue "Atomic Habits" — chapter 4.', color: 'bg-study', textColor: 'text-text-main', ringColor: 'ring-study', startHour: 12, durationH: 1, dayIdx: 0 },
    { id: 4, title: 'Gym session', notes: 'Leg day: squats, lunges, leg press.', color: 'bg-progress', textColor: 'text-white', ringColor: 'ring-progress', startHour: 14, durationH: 1, dayIdx: 0 },
    { id: 5, title: 'Lunch', notes: 'Meal prep bowl from Sunday batch cook.', color: 'bg-outdoor', textColor: 'text-text-main', ringColor: 'ring-outdoor', startHour: 13, durationH: 1, dayIdx: 0 },
    { id: 6, title: 'Team standup', notes: 'Daily sync — 15 min.', color: 'bg-freetime', textColor: 'text-text-main', ringColor: 'ring-freetime', startHour: 9, durationH: 1, dayIdx: 1 },
    { id: 7, title: 'Code review', notes: 'Review PRs from the backend team.', color: 'bg-study', textColor: 'text-text-main', ringColor: 'ring-study', startHour: 11, durationH: 2, dayIdx: 2 },
    { id: 8, title: 'Evening run', notes: '5k easy pace around the park.', color: 'bg-progress', textColor: 'text-white', ringColor: 'ring-progress', startHour: 18, durationH: 1, dayIdx: 3 },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (h: number) => `${String(h).padStart(2, '0')}:00`;

// ── Component ──────────────────────────────────────────────────────────────
export function Calendar() {
    const [tasks] = useState<Task[]>(INITIAL_TASKS);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to 07:00 on mount
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 7 * HOUR_H;
        }
    }, []);

    const handleSelect = (task: Task) =>
        setSelectedTask(prev => (prev?.id === task.id ? null : task));

    return (
        <div className="flex flex-col gap-5 h-full min-h-0">

            {/* ── Header ── */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-text-main m-0 leading-tight">Schedule</h2>
                    <p className="text-secondary text-sm m-0 mt-0.5">
                        {weekOffset === 0 ? 'Oct 5 – 9, 2026' : `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Week nav */}
                    <div className="flex items-center bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => setWeekOffset(w => w - 1)}
                            className="px-3 py-2 text-secondary hover:bg-hover hover:text-text-main
                         transition-colors duration-150 border-none bg-transparent cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-text-main select-none">
                            {weekOffset === 0 ? 'This week' : weekOffset < 0 ? `${Math.abs(weekOffset)}w ago` : `In ${weekOffset}w`}
                        </span>
                        <button
                            onClick={() => setWeekOffset(w => w + 1)}
                            className="px-3 py-2 text-secondary hover:bg-hover hover:text-text-main
                         transition-colors duration-150 border-none bg-transparent cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add task */}
                    <button className="flex items-center gap-2 bg-progress text-white border-none
                             px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer
                             transition-all duration-200 shadow-sm
                             hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(128,184,134,0.45)]">
                        <Plus className="w-4 h-4" />
                        Add Task
                    </button>
                </div>
            </div>

            {/* ── Calendar card ── */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm">

                {/* Day headers */}
                <div
                    className="grid border-b border-border shrink-0 bg-surface"
                    style={{ gridTemplateColumns: '52px repeat(5, 1fr)' }}
                >
                    <div className="py-3 border-r border-border" /> {/* gutter */}
                    {WEEK_DAYS.map((day, i) => {
                        const isToday = i === TODAY_IDX;
                        return (
                            <div
                                key={day.short}
                                className={`py-3 text-center border-l border-border
                  ${isToday ? 'bg-progress/[0.06]' : ''}`}
                            >
                                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1
                  ${isToday ? 'text-progress' : 'text-secondary'}`}>
                                    {day.short}
                                </div>
                                <div className={`text-xl font-bold leading-none
                  ${isToday
                                        ? 'bg-progress text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto'
                                        : 'text-text-main'}`}>
                                    {day.date}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Scrollable time grid */}
                <div ref={scrollRef} className="overflow-y-auto flex-1 min-h-0 relative">
                    <div
                        className="grid"
                        style={{
                            gridTemplateColumns: '52px repeat(5, 1fr)',
                            height: 24 * HOUR_H,
                        }}
                    >
                        {/* ── Time gutter ── */}
                        <div className="relative border-r border-border bg-surface/80">
                            {HOURS.map(h => (
                                <div
                                    key={h}
                                    className="absolute right-0 flex items-center justify-end pr-2"
                                    style={{ top: h * HOUR_H, height: HOUR_H }}
                                >
                                    <span className="text-[10px] text-secondary/70 font-medium -translate-y-3">
                                        {fmt(h)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* ── Day columns ── */}
                        {WEEK_DAYS.map((day, colIdx) => {
                            const isToday = colIdx === TODAY_IDX;
                            const colTasks = tasks.filter(t => t.dayIdx === colIdx);

                            return (
                                <div
                                    key={day.short}
                                    className={`relative border-l border-border/50
                    ${isToday ? 'bg-progress/[0.025]' : ''}`}
                                >
                                    {/* Hour lines */}
                                    {HOURS.map(h => (
                                        <div
                                            key={h}
                                            className="absolute left-0 right-0 border-t border-border/40"
                                            style={{ top: h * HOUR_H }}
                                        />
                                    ))}

                                    {/* Half-hour lines */}
                                    {HOURS.map(h => (
                                        <div
                                            key={`h-${h}`}
                                            className="absolute left-0 right-0 border-t border-border/20 border-dashed"
                                            style={{ top: h * HOUR_H + HOUR_H / 2 }}
                                        />
                                    ))}

                                    {/* Tasks */}
                                    {colTasks.map(task => (
                                        <button
                                            key={task.id}
                                            onClick={() => handleSelect(task)}
                                            className={[
                                                'absolute left-1 right-1 rounded-xl px-2.5 py-1.5 text-left',
                                                'border-none cursor-pointer transition-all duration-200 overflow-hidden',
                                                'hover:scale-[1.02] hover:shadow-lg hover:z-10',
                                                task.color,
                                                selectedTask?.id === task.id
                                                    ? `ring-2 ${task.ringColor} scale-[1.02] shadow-lg z-10`
                                                    : 'opacity-90 hover:opacity-100',
                                            ].join(' ')}
                                            style={{
                                                top: task.startHour * HOUR_H + 2,
                                                height: task.durationH * HOUR_H - 4,
                                            }}
                                        >
                                            <div className={`text-[10px] font-semibold opacity-60 ${task.textColor}`}>
                                                {fmt(task.startHour)} – {fmt(task.startHour + task.durationH)}
                                            </div>
                                            <div className={`text-xs font-semibold mt-0.5 leading-snug line-clamp-2 ${task.textColor}`}>
                                                {task.title}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Task detail panel ── */}
            {selectedTask && (
                <div className="bg-surface border border-border rounded-2xl p-5 shrink-0
                        shadow-sm flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedTask.color}`} />
                            <div>
                                <h3 className="text-base font-semibold text-text-main m-0 leading-tight">
                                    {selectedTask.title}
                                </h3>
                                <div className="flex items-center gap-1 mt-0.5 text-secondary text-xs">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                        {fmt(selectedTask.startHour)} – {fmt(selectedTask.startHour + selectedTask.durationH)}
                                        {' · '}
                                        {WEEK_DAYS[selectedTask.dayIdx].label}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedTask(null)}
                            className="text-secondary hover:text-text-main bg-transparent border-none
                         cursor-pointer p-1 rounded-lg hover:bg-hover transition-colors duration-150"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <textarea
                        defaultValue={selectedTask.notes}
                        rows={2}
                        placeholder="Add notes…"
                        className="bg-background border border-border rounded-xl px-4 py-3 text-sm
                       text-text-main resize-none outline-none w-full
                       focus:ring-2 focus:ring-progress/40 focus:border-progress/40
                       transition-all duration-200 placeholder:text-secondary/50"
                    />
                </div>
            )}
        </div>
    );
}