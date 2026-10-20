import type { Goal } from '../types/Goal';
import type { Task } from '../../schedule/types/Task';
import { toLocalISODate } from '../../schedule/utils/calendarUtils';

export interface BurnUpPoint {
    date: string;             // "YYYY-MM-DD"
    logged: number | null;    // cumulative hours, null past the last data day (no future data)
    expected: number | null;  // ideal-pace hours, null without deadline
}

const DAY_MS = 86_400_000;
const parseDay = (iso: string) => new Date(`${iso}T00:00`);
const addDays = (iso: string, n: number) => {
    const d = parseDay(iso);
    d.setDate(d.getDate() + n);
    return toLocalISODate(d);
};
const daysBetween = (from: string, to: string) => Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / DAY_MS);
const minIso = (...d: string[]) => d.reduce((a, b) => (a < b ? a : b));
const maxIso = (...d: string[]) => d.reduce((a, b) => (a > b ? a : b));

/**
 * One point per day, from the goal's start (or its first session, if earlier)
 * to its deadline (or today / the last session, if later). Values are in hours.
 */
export function buildBurnUp(goal: Goal, records: Task[], today: string): BurnUpPoint[] {
    const perDay = new Map<string, number>();
    for (const r of records) perDay.set(r.date, (perDay.get(r.date) ?? 0) + (r.duration_minutes || 0));
    const recordDates = [...perDay.keys()];

    const from = minIso(goal.start_date, ...recordDates);
    const lastData = maxIso(today, ...recordDates);
    const to = maxIso(goal.deadline ?? lastData, lastData, addDays(from, 6)); // at least a week so the axis isn't a sliver
    const totalDays = goal.deadline ? daysBetween(goal.start_date, goal.deadline) + 1 : 0;

    const points: BurnUpPoint[] = [];
    let cumulative = 0;
    for (let date = from; date <= to; date = addDays(date, 1)) {
        cumulative += perDay.get(date) ?? 0;
        const share = Math.min(Math.max((daysBetween(goal.start_date, date) + 1) / totalDays, 0), 1);
        points.push({
            date,
            logged: date <= lastData ? cumulative / 60 : null,
            expected: totalDays ? (goal.target_minutes * share) / 60 : null,
        });
    }
    return points;
}
