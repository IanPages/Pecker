import { Link } from 'react-router';
import type { Goal } from '../../goals/types/Goal';
import { fmtDay, goalProgress, paceLabel, type GoalProgress, type PaceKind } from '../../goals/utils/goalProgress';
import { fmtHours } from '../utils/statsFormat';

const MAX_GOALS = 4;

// what needs attention first: late, then behind, then whatever is due soonest; reached goals last
const URGENCY: Record<PaceKind, number> = { overdue: 0, behind: 1, 'on-track': 2, ahead: 2, 'no-deadline': 3, reached: 4, completed: 5 };

function byUrgency(a: { goal: Goal; progress: GoalProgress }, b: { goal: Goal; progress: GoalProgress }) {
    const rank = URGENCY[a.progress.pace] - URGENCY[b.progress.pace];
    if (rank) return rank;
    if (a.progress.pace === 'behind') return a.progress.diffMinutes / a.goal.target_minutes - b.progress.diffMinutes / b.goal.target_minutes;
    return (a.goal.deadline ?? '9999').localeCompare(b.goal.deadline ?? '9999');
}

export function GoalsOverview({ goals, today, error }: { goals: Goal[] | null; today: string; error: string | null }) {
    const active = (goals ?? [])
        .filter(g => g.status === 'active')
        .map(goal => ({ goal, progress: goalProgress(goal, today) }))
        .sort(byUrgency);
    const shown = active.slice(0, MAX_GOALS);
    const hidden = active.length - shown.length;

    return (
        <section className="bg-surface rounded-2xl p-6 md:p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Goals</h2>
                <Link
                    className="bg-hover text-text-main px-4 py-2 rounded-full text-sm font-semibold cursor-pointer
                               transition-colors duration-150 hover:bg-text-main hover:text-background"
                    to="/goals"
                >
                    {hidden > 0 ? `View all (+${hidden})` : 'View all'}
                </Link>
            </div>

            {!goals ? (
                <p className="text-secondary">{error ? "We couldn't load your goals." : 'Loading…'}</p>
            ) : shown.length === 0 ? (
                <p className="text-secondary">
                    No active goals. <Link to="/goals" className="text-text-main font-semibold underline underline-offset-4">Set one</Link> to see how your hours add up against it.
                </p>
            ) : (
                <ul className="list-none grid gap-3 sm:grid-cols-2">
                    {shown.map(({ goal, progress }) => {
                        const pace = paceLabel(progress);
                        // category colors are hex without "#"; goals without one use the progress tone
                        const color = goal.categories ? { backgroundColor: `#${goal.categories.color}` } : undefined;
                        return (
                            <li key={goal.id}>
                                <Link to={`/goals/${goal.id}`}
                                    className="flex flex-col gap-3 p-4 -m-1 rounded-xl no-underline text-text-main hover:bg-hover transition-colors duration-150">
                                    <div className="flex items-start gap-3">
                                        <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 bg-progress" style={color} />
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="font-medium truncate">{goal.name}</span>
                                            <span className="text-sm text-secondary tabular-nums">
                                                {fmtHours(goal.logged_minutes)} of {fmtHours(goal.target_minutes)}
                                                {goal.deadline && ` · due ${fmtDay(goal.deadline)}`}
                                            </span>
                                        </div>
                                        {pace && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${pace.tone}`}>{pace.text}</span>}
                                    </div>
                                    <div
                                        className="h-2 rounded-full bg-hover overflow-hidden"
                                        role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.pct} aria-label={`${goal.name} progress`}
                                    >
                                        <div className="h-full rounded-full bg-progress transition-[width] duration-500" style={{ ...color, width: `${progress.pct}%` }} />
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
