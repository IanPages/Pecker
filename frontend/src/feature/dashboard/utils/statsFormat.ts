/** 2070 -> "34.5h" */
export const fmtHours = (minutes: number) => `${Math.round(minutes / 6) / 10}h`;

/** "2026-10-23" -> "Friday" (parsed as local time, new Date("YYYY-MM-DD") would be UTC) */
export const weekdayName = (isoDate: string) =>
    new Date(`${isoDate}T00:00`).toLocaleDateString('en-US', { weekday: 'long' });

/** ISO timestamp -> "5 minutes ago" / "2 hours ago" / "Yesterday" / "3 days ago" */
export function timeAgo(iso: string) {
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Yesterday' : `${days} days ago`;
}
