// ── Constants ────────────────────────────────────────────────────────────────

export const HOUR_H = 56; // px per hour
export const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0 → 23

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

// ── Week helpers ─────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

/** Returns the Monday of the week that is `offset` weeks away from today. */
export function getWeekStart(offset: number): Date {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun … 6 = Sat
    const diff = day === 0 ? -6 : 1 - day; // shift to Monday
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() + diff + offset * 7);
    return monday;
}

/** Returns an array of 5 day descriptors (Mon–Fri) for the given week start. */
export function getWeekDays(weekStart: Date) {
    const today = new Date();
    return DAY_NAMES.map((short, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return {
            short,
            label: DAY_LABELS[i],
            date: String(d.getDate()).padStart(2, '0'),
            month: MONTHS[d.getMonth()],
            year: d.getFullYear(),
            isToday: isSameDay(d, today),
            isoDate: d.toISOString().split('T')[0], // e.g. "2026-10-06"
        };
    });
}

// ── Time helpers ─────────────────────────────────────────────────────────────

/** "2026-10-16T09:30:00+00:00" → 9.5  (hours as decimal) */
export function isoToHours(iso: string): number {
    const d = new Date(iso);
    return d.getHours() + d.getMinutes() / 60;
}

/** 9.5 → "09:30" */
export function fmtHours(h: number): string {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/**
 * Maps a task's `date` ("YYYY-MM-DD") to the column index (0–4) of the
 * current week. Returns -1 if the task falls outside the displayed week.
 */
export function getColIdx(taskDate: string, weekDays: { isoDate: string }[]): number {
    return weekDays.findIndex(d => d.isoDate === taskDate);
}
