export interface DashboardStats {
    streak: number;
    week_minutes: number;
    last_week_minutes: number;
    change_pct: number | null;   // null when last week has no tracked time
    daily_avg_minutes: number;
    best_day: string | null;     // "YYYY-MM-DD", null on an empty week
    days: { date: string; minutes: number }[]; // Monday first
    by_category: { name: string; color: string | null; minutes: number }[]; // this week, biggest first; color null = uncategorised
}