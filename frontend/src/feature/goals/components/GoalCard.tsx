import { Link } from 'react-router-dom';
import { Archive, Check, RotateCcw, Trash2 } from 'lucide-react';
import { fmtDay, fmtDaysAgo, goalProgress, paceLabel } from '../utils/goalProgress';
import { fmtHours } from '../../dashboard/utils/statsFormat';
import type { GoalCardProps } from '../types/Goal';

const ICON_BUTTON = 'text-secondary hover:text-text-main hover:bg-hover bg-transparent border-none cursor-pointer p-1.5 rounded-full transition-colors duration-150';

export function GoalCard({ goal, today, onStatusChange, onDelete }: GoalCardProps) {
    const progress = goalProgress(goal, today);
    const pace = paceLabel(progress);
    // category colors are hex without "#"; goals without one use the progress tone
    const color = goal.categories ? { backgroundColor: `#${goal.categories.color}` } : undefined;

    return (
        <article className="relative bg-surface rounded-2xl p-6 flex flex-col gap-5 transition-colors duration-150 hover:bg-hover/60">
            <header className="flex items-start gap-3">
                <span className="w-3 h-3 rounded-full mt-2 shrink-0 bg-progress" style={color} />
                <div className="flex flex-col min-w-0 flex-1">
                    <h2 className="text-xl font-semibold truncate">
                        {/* stretched link: the whole card opens the goal, the action buttons sit above it */}
                        <Link to={`/goals/${goal.id}`} className="text-text-main no-underline after:absolute after:inset-0 after:rounded-2xl">
                            {goal.name}
                        </Link>
                    </h2>
                    <p className="text-sm text-secondary">
                        {goal.deadline
                            ? <>Due {fmtDay(goal.deadline)}{progress.daysLeft ? ` · ${progress.daysLeft} day${progress.daysLeft === 1 ? '' : 's'} left` : ''}</>
                            : `Since ${fmtDay(goal.start_date)} · no deadline`}
                    </p>
                </div>
                <div className="relative z-10 flex -mr-1.5 -mt-1 shrink-0">
                    {goal.status === 'active' ? (
                        <>
                            <button type="button" className={ICON_BUTTON} onClick={() => onStatusChange(goal, 'completed')} aria-label="Mark as completed" title="Mark as completed">
                                <Check className="w-4 h-4" />
                            </button>
                            <button type="button" className={ICON_BUTTON} onClick={() => onStatusChange(goal, 'archived')} aria-label="Archive" title="Archive">
                                <Archive className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button type="button" className={ICON_BUTTON} onClick={() => onStatusChange(goal, 'active')} aria-label="Reactivate" title="Reactivate">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                    <button type="button" className={ICON_BUTTON} onClick={() => onDelete(goal)} aria-label="Delete" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {goal.description && <p className="text-secondary line-clamp-2 -mt-2">{goal.description}</p>}

            <div className="flex flex-col gap-2.5 mt-auto">
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-display text-3xl font-extrabold tabular-nums">{fmtHours(goal.logged_minutes)}</span>
                    <span className="text-secondary tabular-nums">of {fmtHours(goal.target_minutes)}</span>
                    {pace && <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${pace.tone}`}>{pace.text}</span>}
                </div>

                <div
                    className="h-2.5 rounded-full bg-hover overflow-hidden"
                    role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.pct} aria-label={`${goal.name} progress`}
                >
                    <div className="h-full rounded-full bg-progress transition-[width] duration-500" style={{ ...color, width: `${progress.pct}%` }} />
                </div>

                <p className="text-sm text-secondary tabular-nums flex flex-wrap gap-x-3">
                    <span>{progress.pct}%</span>
                    {progress.neededPerWeekMinutes != null && <span>{fmtHours(progress.neededPerWeekMinutes)}/week to finish on time</span>}
                    <span className="ml-auto">
                        {goal.records_count
                            ? `${goal.records_count} session${goal.records_count === 1 ? '' : 's'} · last ${fmtDaysAgo(goal.last_record_date!, today)}`
                            : 'No sessions yet'}
                    </span>
                </p>
            </div>
        </article>
    );
}
