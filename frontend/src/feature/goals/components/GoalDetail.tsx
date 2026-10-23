import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Archive, ArrowLeft, Check, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useGoal } from '../hooks/useGoal';
import { updateGoal } from '../services/UpdateGoal';
import { deleteGoal } from '../services/DeleteGoal';
import { goalProgress, fmtDay, type GoalProgress } from '../utils/goalProgress';
import { fmtHours } from '../../dashboard/utils/statsFormat';
import { toLocalISODate } from '../../schedule/utils/calendarUtils';
import type { GoalStatus } from '../types/Goal';
import type { Task } from '../../schedule/types/Task';
import { BurnUpChart } from './BurnUpChart';
import { GoalModal } from './GoalModal';

const ACTION = 'flex items-center gap-2 bg-hover text-text-main border-none px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-150 hover:bg-text-main hover:text-background';

const time = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const weekday = (iso: string) => new Date(`${iso}T00:00`).toLocaleDateString('en-US', { weekday: 'short' });

/** Monday of the week a "YYYY-MM-DD" falls in */
function weekStart(iso: string) {
    const d = new Date(`${iso}T00:00`);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return toLocalISODate(d);
}

// records come newest first, so groups come out newest week first too
function groupByWeek(records: Task[]) {
    const weeks = new Map<string, { minutes: number; records: Task[] }>();
    for (const r of records) {
        const key = weekStart(r.date);
        const week = weeks.get(key) ?? { minutes: 0, records: [] };
        week.minutes += r.duration_minutes || 0;
        week.records.push(r);
        weeks.set(key, week);
    }
    return [...weeks.entries()].map(([start, w]) => ({ start, ...w }));
}

function paceFact(p: GoalProgress): { value: string; label: string } {
    switch (p.pace) {
        case 'completed': return { value: 'Done', label: 'goal completed' };
        case 'reached': return { value: 'Done', label: 'target reached' };
        case 'ahead': return { value: `+${fmtHours(p.diffMinutes)}`, label: 'ahead of pace' };
        case 'on-track': return { value: 'On track', label: 'with the ideal pace' };
        case 'behind': return { value: `−${fmtHours(-p.diffMinutes)}`, label: 'behind pace' };
        case 'overdue': return { value: fmtHours(p.remainingMinutes), label: 'left, past deadline' };
        case 'no-deadline': return { value: fmtHours(p.remainingMinutes), label: 'to go' };
    }
}

export function GoalDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { goal, records, error, reload } = useGoal(id, !!user?.id);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const today = toLocalISODate(new Date());
    const weeks = useMemo(() => groupByWeek(records ?? []), [records]);

    if (!goal || !records) {
        return <p className="text-secondary">{error ?? 'Loading…'}</p>;
    }

    const progress = goalProgress(goal, today);
    const pace = paceFact(progress);
    const color = goal.categories ? { backgroundColor: `#${goal.categories.color}` } : undefined;
    const avgSession = goal.records_count ? goal.logged_minutes / goal.records_count : 0;

    const facts = [
        { value: `${progress.pct}%`, label: `of ${fmtHours(goal.target_minutes)}` },
        pace,
        progress.neededPerWeekMinutes != null
            ? { value: fmtHours(progress.neededPerWeekMinutes), label: 'per week to finish on time' }
            : { value: String(goal.records_count), label: goal.records_count === 1 ? 'session' : 'sessions' },
        { value: avgSession ? fmtHours(avgSession) : '–', label: 'average session' },
    ];

    const handleStatus = async (status: GoalStatus) => {
        setActionError(null);
        try {
            await updateGoal(goal.id, { status });
            reload();
        } catch (e: any) {
            setActionError(e.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${goal.name}"? Its sessions will be kept, just no longer linked to a goal.`)) return;
        try {
            await deleteGoal(goal.id);
            navigate('/goals');
        } catch (e: any) {
            setActionError(e.message);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-[1500px] mx-auto">
            <Link to="/goals" className="flex items-center gap-2 text-secondary hover:text-text-main no-underline text-sm font-medium self-start transition-colors duration-150">
                <ArrowLeft className="w-4 h-4" /> Goals
            </Link>

            <header className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-col gap-2 min-w-0">
                        <p className="flex items-center gap-2 text-secondary text-sm">
                            <span className="w-2.5 h-2.5 rounded-full bg-progress shrink-0" style={color} />
                            {goal.categories?.name ?? 'No category'}
                            {' · '}
                            {goal.deadline ? `${fmtDay(goal.start_date)} – ${fmtDay(goal.deadline)}` : `Since ${fmtDay(goal.start_date)}`}
                            {goal.status !== 'active' && <span className="ml-1 px-2 py-0.5 rounded-full bg-hover text-text-main text-xs font-semibold capitalize">{goal.status}</span>}
                        </p>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.02] text-balance">
                            {fmtHours(goal.logged_minutes)} <span className="text-secondary">of {fmtHours(goal.target_minutes)}</span>
                        </h1>
                        <p className="text-xl font-semibold">{goal.name}</p>
                        {goal.description && <p className="text-secondary max-w-2xl">{goal.description}</p>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button type="button" className={ACTION} onClick={() => setIsEditOpen(true)}><Pencil className="w-4 h-4" />Edit</button>
                        {goal.status === 'active' ? (
                            <>
                                <button type="button" className={ACTION} onClick={() => handleStatus('completed')}><Check className="w-4 h-4" />Complete</button>
                                <button type="button" className={ACTION} onClick={() => handleStatus('archived')} aria-label="Archive" title="Archive"><Archive className="w-4 h-4" /></button>
                            </>
                        ) : (
                            <button type="button" className={ACTION} onClick={() => handleStatus('active')}><RotateCcw className="w-4 h-4" />Reactivate</button>
                        )}
                        <button type="button" className={ACTION} onClick={handleDelete} aria-label="Delete" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>

                <ul className="flex flex-wrap gap-x-10 gap-y-3 list-none">
                    {facts.map(({ value, label }) => (
                        <li key={label} className="flex items-baseline gap-2">
                            <span className="font-display text-2xl font-extrabold">{value}</span>
                            <span className="text-secondary">{label}</span>
                        </li>
                    ))}
                </ul>
            </header>

            {actionError && (
                <div className="p-3 rounded-xl bg-outdoor/25 text-text-main text-sm font-medium">{actionError}</div>
            )}

            <section className="bg-surface rounded-2xl p-6 md:p-8 flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Progress over time</h2>
                <BurnUpChart goal={goal} records={records} today={today} />
            </section>

            <section className="bg-surface rounded-2xl p-6 md:p-8 flex flex-col gap-6">
                <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-xl font-semibold">Sessions</h2>
                    <span className="text-secondary text-sm tabular-nums">{goal.records_count} total</span>
                </div>

                {weeks.length === 0 && (
                    <p className="text-secondary">No sessions yet. Link a task to this goal from the Schedule to start tracking it.</p>
                )}

                {weeks.map(week => (
                    <div key={week.start} className="flex flex-col gap-1">
                        <div className="flex items-baseline justify-between gap-4 pb-2">
                            <h3 className="text-sm font-semibold text-secondary">Week of {fmtDay(week.start)}</h3>
                            <span className="text-sm font-semibold tabular-nums">{fmtHours(week.minutes)}</span>
                        </div>
                        <ul className="list-none flex flex-col">
                            {week.records.map(r => (
                                <li key={r.id} className="flex items-center gap-4 py-2.5 px-3 -mx-3 rounded-lg hover:bg-hover transition-colors duration-150">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-hover"
                                        style={r.categories ? { backgroundColor: `#${r.categories.color}` } : undefined} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate">{r.name}</span>
                                        <span className="text-sm text-secondary tabular-nums">
                                            {weekday(r.date)}, {fmtDay(r.date)} · {time(r.start_hour)}–{time(r.finish_hour)}
                                        </span>
                                    </div>
                                    <span className="ml-auto tabular-nums font-semibold">{fmtHours(r.duration_minutes || 0)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>

            <GoalModal open={isEditOpen} onClose={() => setIsEditOpen(false)} onSaved={reload} goal={goal} />
        </div>
    );
}
