import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react';
import type { Task } from '../types/Task';
import { HOUR_H, HOURS, getWeekStart, getWeekDays, isoToHours, fmtHours, getColIdx, } from '../utils/calendarUtils';
import { weeklyFetch } from '../services/CalendarWeeklyFetch';
import { useAuth } from '../../auth/hooks/useAuth';

export function Calendar() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [weekOffset, setWeekOffset] = useState(0);
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

    useEffect(() => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weeklyFetch(user?.id, weekStart, weekEnd).then((data) => {
            setTasks(data);
        })
    }, [weekOffset, user?.id])

    const handleSelect = (task: Task) =>
        setSelectedTask(prev => (prev?.id === task.id ? null : task));

    return (
        <div className="flex flex-col gap-5 h-full min-h-0">

            {/* ── Header ── */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-main leading-none">Schedule</h1>
                    <p className="text-secondary mt-2">
                        {weekLabel}
                    </p>
                </div>

                <div className="flex items-center gap-3">
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
                    <button className="flex items-center gap-2 bg-accent text-accent-text border-none
                             px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer
                             transition-[filter] duration-150 hover:brightness-110">
                        <Plus className="w-4 h-4" />
                        Add Task
                    </button>
                </div>
            </div>

            {/* ── Calendar card ── */}
            <div className="bg-surface rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">

                {/* Scrollable time grid */}
                <div ref={scrollRef} className="overflow-y-auto flex-1 min-h-0 relative">
                    {/* Day headers: sticky inside the scroller so columns align with the grid */}
                    <div
                        className="grid sticky top-0 z-20 bg-surface"
                        style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}
                    >
                        <div className="py-3" /> 
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
                        className="grid"
                        style={{
                            gridTemplateColumns: '52px repeat(7, 1fr)',
                            height: 24 * HOUR_H,
                        }}
                    >
                        {/* ── Time gutter ── */}
                        <div className="relative bg-surface">
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
                        {weekDays.map((day, colIdx) => {
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
                                                    'bg-progress text-progress-text',
                                                    isSelected
                                                        ? 'ring-2 ring-text-main z-10'
                                                        : 'hover:brightness-110',
                                                ].join(' ')}
                                                style={{
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

            {/* ── Task detail panel ── */}
            {selectedTask && (() => {
                const startH = isoToHours(selectedTask.start_hour);
                const endH = isoToHours(selectedTask.finish_hour);
                const colIdx = getColIdx(selectedTask.date, weekDays);
                return (
                    <div className="bg-surface rounded-2xl p-5 shrink-0 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-progress" />
                                <div>
                                    <h3 className="text-base font-semibold text-text-main m-0 leading-tight">
                                        {selectedTask.name}
                                    </h3>
                                    <div className="flex items-center gap-1 mt-0.5 text-secondary text-xs">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                            {fmtHours(startH)} – {fmtHours(endH)}
                                            {' · '}
                                            {colIdx >= 0 ? weekDays[colIdx].label : selectedTask.date}
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
                            className="bg-background rounded-xl px-4 py-3 text-sm
                           text-text-main resize-none outline-none w-full
                           focus:ring-2 focus:ring-accent
                           transition-shadow duration-150 placeholder:text-secondary/50"
                        />
                    </div>
                );
            })()}
        </div>
    );
}