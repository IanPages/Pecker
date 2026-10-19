import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Task } from '../types/Task';
import { HOUR_H, HOURS, getWeekStart, getWeekDays, isoToHours, fmtHours, readableTextColor } from '../utils/calendarUtils';
import { weeklyFetch } from '../services/CalendarWeeklyFetch';
import { useAuth } from '../../auth/hooks/useAuth';
import { TaskModal } from './TaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { updateTask } from '../services/UpdateTask';

// Below lg the week keeps readable columns (96px) and scrolls sideways instead of squeezing 7 days into the screen
const COL_W = 96;
const GUTTER_W = 52;
// Literal so Tailwind can see it: GUTTER_W + 7 * COL_W = 724
const MIN_GRID = 'min-w-[724px] lg:min-w-0';

export function Calendar() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth()

    // Derived from weekOffset – recalculates on every change
    const weekStart = getWeekStart(weekOffset);
    const weekDays = getWeekDays(weekStart);

    const weekLabel = (() => {
        if (weekOffset === 0) return 'This week';
        const first = weekDays[0];
        const last = weekDays[6];
        return `${first.month} ${first.date} – ${last.date}, ${last.year}`;
    })();

    // Scroll to 07:00 on mount
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 7 * HOUR_H;
        }
    }, []);

    // On narrow screens, bring today's column into view (no-op when the whole week fits)
    useEffect(() => {
        const todayIdx = weekDays.findIndex(d => d.isToday);
        if (scrollRef.current && todayIdx > 0) {
            scrollRef.current.scrollLeft = todayIdx * COL_W;
        }
    }, [weekOffset]);

    const loadTasks = () => {
        if (!user?.id) return Promise.resolve(); // wait for the session before asking the API
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return weeklyFetch(weekStart, weekEnd).then(setTasks);
    };

    useEffect(() => {
        loadTasks();
    }, [weekOffset, user?.id])

    const handleSelect = (task: Task) =>
        setSelectedTask(task);

    return (
        <div className="flex flex-col gap-5 h-full min-h-0">

            {/* ── Header ── */}
            <div className="flex flex-wrap items-end justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-main leading-none">Schedule</h1>
                    <p className="text-secondary mt-2">
                        {weekLabel}
                    </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Week nav */}
                    <div className="flex items-center bg-surface rounded-full overflow-hidden">
                        <button
                            onClick={() => setWeekOffset(w => w - 1)}
                            className="px-3.5 py-2.5 text-secondary hover:bg-hover hover:text-text-main
                         transition-colors duration-150 border-none bg-transparent cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-sm font-semibold text-text-main select-none">
                            {weekOffset === 0 ? 'This week' : weekOffset < 0 ? `${Math.abs(weekOffset)}w ago` : `In ${weekOffset}w`}
                        </span>
                        <button
                            onClick={() => setWeekOffset(w => w + 1)}
                            className="px-3.5 py-2.5 text-secondary hover:bg-hover hover:text-text-main
                         transition-colors duration-150 border-none bg-transparent cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add task */}
                    <button onClick={() => setIsModalOpen(true)} aria-label="Add task" className="flex items-center gap-2 bg-accent text-accent-text border-none
                             px-3.5 sm:px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer
                             transition-[filter] duration-150 hover:brightness-110"
                             >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Task</span>
                    </button>
                </div>
            </div>

            {/* ── Calendar card ── */}
            <div className="bg-surface rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">

                {/* Scrollable time grid */}
                <div ref={scrollRef} className="overflow-auto flex-1 min-h-0 relative">
                    {/* Day headers: sticky inside the scroller so columns align with the grid */}
                    <div
                        className={`grid sticky top-0 z-20 bg-surface ${MIN_GRID}`}
                        style={{ gridTemplateColumns: `${GUTTER_W}px repeat(7, 1fr)` }}
                    >
                        <div className="py-3 sticky left-0 z-30 bg-surface" />
                        {weekDays.map((day) => {
                            const isToday = day.isToday;
                            return (
                                <div
                                    key={day.short}
                                    className={`py-3 text-center border-l border-border/60 ${isToday ? 'bg-hover' : ''}`}
                                >
                                    <div className={`text-xs font-semibold mb-1
                      ${isToday ? 'text-text-main' : 'text-secondary'}`}>
                                        {day.short}
                                    </div>
                                    <div className={`text-xl font-bold leading-none
                      ${isToday
                                            ? 'bg-accent text-accent-text w-8 h-8 rounded-full flex items-center justify-center mx-auto'
                                            : 'text-text-main'}`}>
                                        {day.date}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div
                        className={`grid ${MIN_GRID}`}
                        style={{
                            gridTemplateColumns: `${GUTTER_W}px repeat(7, 1fr)`,
                            height: 24 * HOUR_H,
                        }}
                    >
                        {/* ── Time gutter ── */}
                        <div className="sticky left-0 z-10 bg-surface">
                            {HOURS.map(h => (
                                <div
                                    key={h}
                                    className="absolute right-0 flex items-center justify-end pr-2"
                                    style={{ top: h * HOUR_H, height: HOUR_H }}
                                >
                                    <span className="text-[11px] text-secondary font-medium tabular-nums -translate-y-3">
                                        {fmtHours(h)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* ── Day columns ── */}
                        {weekDays.map((day) => {
                            const isToday = day.isToday;
                            const colTasks = tasks.filter(t => t.date === day.isoDate);

                            return (
                                <div
                                    key={day.short}
                                    className={`relative border-l border-border/60 ${isToday ? 'bg-hover' : ''}`}
                                >
                                    {/* Hour lines */}
                                    {HOURS.map(h => (
                                        <div
                                            key={h}
                                            className="absolute left-0 right-0 border-t border-border"
                                            style={{ top: h * HOUR_H }}
                                        />
                                    ))}

                                    {/* Half-hour lines */}
                                    {HOURS.map(h => (
                                        <div
                                            key={`h-${h}`}
                                            className="absolute left-0 right-0 border-t border-border/40"
                                            style={{ top: h * HOUR_H + HOUR_H / 2 }}
                                        />
                                    ))}

                                    {/* Tasks */}
                                    {colTasks.map(task => {
                                        const startH = isoToHours(task.start_hour);
                                        const endH = isoToHours(task.finish_hour);
                                        const durH = endH - startH;
                                        const isSelected = selectedTask?.id === task.id;
                                        return (
                                            <button
                                                key={task.id}
                                                onClick={() => handleSelect(task)}
                                                className={[
                                                    'absolute left-1 right-1 rounded-lg px-2.5 py-1.5 text-left',
                                                    'border-none cursor-pointer transition-[filter,transform] duration-150 overflow-hidden',
                                                    'hover:z-10',
                                                    // fallback green for records without a category; the category color overrides it below
                                                    'bg-progress text-progress-text',
                                                    isSelected
                                                        ? 'ring-2 ring-text-main z-10'
                                                        : 'hover:brightness-110',
                                                ].join(' ')}
                                                style={{
                                                    ...(task.categories && {
                                                        backgroundColor: `#${task.categories.color}`,
                                                        color: readableTextColor(task.categories.color),
                                                    }),
                                                    top: startH * HOUR_H + 2,
                                                    height: Math.max(durH * HOUR_H - 4, 20),
                                                }}
                                            >
                                                <div className="text-[11px] font-semibold opacity-80 tabular-nums">
                                                    {fmtHours(startH)} – {fmtHours(endH)}
                                                </div>
                                                <div className="text-xs font-semibold mt-0.5 leading-snug line-clamp-2">
                                                    {task.name}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <TaskDetailModal
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onSave={async (_id, _changes) => {
                    try {
                        await updateTask(_id, _changes);
                        await loadTasks();
                        setSelectedTask(null);
                    } catch (err) {
                        console.error(err);
                    }
                }}
            />
            <TaskModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={loadTasks} />
        </div>
    );
}