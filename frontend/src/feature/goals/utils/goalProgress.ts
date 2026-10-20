import type { Goal } from '../types/Goal';
import { fmtHours } from '../../dashboard/utils/statsFormat';

const DAY_MS = 86_400_000;
// "YYYY-MM-DD" parsed as local midnight; new Date("YYYY-MM-DD") would be UTC
const parseDay = (iso: string) => new Date(`${iso}T00:00`);
const daysBetween = (from: string, to: string) => Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / DAY_MS);

export type PaceKind = 'completed' | 'reached' | 'ahead' | 'on-track' | 'behind' | 'overdue' | 'no-deadline';

export interface GoalProgress {
    pct: number;                    // 0-100, capped
    remainingMinutes: number;
    pace: PaceKind;
    diffMinutes: number;            // logged - expected by today; positive = ahead
    daysLeft: number | null;        // including today, null without deadline
    neededPerWeekMinutes: number | null; // to finish exactly on the deadline
}

// Within this share of the target the goal counts as on track rather than ahead/behind
const ON_TRACK_TOLERANCE = 0.05;

export function goalProgress(goal: Goal, today: string): GoalProgress {
    const { logged_minutes: logged, target_minutes: target } = goal;
    const remainingMinutes = Math.max(target - logged, 0);
    const base = { pct: Math.min(Math.round((logged / target) * 100), 100), remainingMinutes };

    if (goal.status === 'completed') return { ...base, pace: 'completed', diffMinutes: 0, daysLeft: null, neededPerWeekMinutes: null };
    if (remainingMinutes === 0) return { ...base, pace: 'reached', diffMinutes: 0, daysLeft: null, neededPerWeekMinutes: null };
    if (!goal.deadline) return { ...base, pace: 'no-deadline', diffMinutes: 0, daysLeft: null, neededPerWeekMinutes: null };

    const totalDays = daysBetween(goal.start_date, goal.deadline) + 1;
    const elapsed = Math.min(Math.max(daysBetween(goal.start_date, today) + 1, 0), totalDays);
    const diffMinutes = Math.round(logged - (target * elapsed) / totalDays);
    const daysLeft = daysBetween(today, goal.deadline) + 1;

    if (daysLeft <= 0) return { ...base, pace: 'overdue', diffMinutes, daysLeft: 0, neededPerWeekMinutes: null };

    const pace = Math.abs(diffMinutes) <= target * ON_TRACK_TOLERANCE ? 'on-track' : diffMinutes > 0 ? 'ahead' : 'behind';
    // a goal that starts in the future only has the days from its start to work with
    const workDays = Math.min(daysLeft, totalDays);
    return { ...base, pace, diffMinutes, daysLeft, neededPerWeekMinutes: Math.round((remainingMinutes / workDays) * 7) };
}

/** "2026-12-31" -> "Dec 31" (adds the year when it is not the current one) */
export function fmtDay(iso: string) {
    const d = parseDay(iso);
    return d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
        ...(d.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }),
    });
}

/** "YYYY-MM-DD" relative to today -> "today" / "yesterday" / "3 days ago" */
export function fmtDaysAgo(iso: string, today: string) {
    const days = daysBetween(iso, today);
    if (days <= 0) return 'today';
    return days === 1 ? 'yesterday' : `${days} days ago`;
}

// Good news reads green, falling behind reads in the accent; neutral states stay quiet
export function paceLabel(p: GoalProgress): { text: string; tone: string } | null {
    switch (p.pace) {
        case 'completed': return { text: 'Completed', tone: 'bg-progress/15 text-progress' };
        case 'reached':   return { text: 'Target reached', tone: 'bg-progress/15 text-progress' };
        case 'ahead':     return { text: `${fmtHours(p.diffMinutes)} ahead`, tone: 'bg-progress/15 text-progress' };
        case 'on-track':  return { text: 'On track', tone: 'bg-progress/15 text-progress' };
        case 'behind':    return { text: `${fmtHours(-p.diffMinutes)} behind`, tone: 'bg-accent/15 text-accent' };
        case 'overdue':   return { text: 'Past deadline', tone: 'bg-accent/15 text-accent' };
        case 'no-deadline': return null;
    }
}
