
export interface Task {
    id: string;
    name: string;
    user_id: string;
    category_id: string;
    date: string;
    start_hour: string;
    finish_hour: string;
    notes: string;
    duration_minutes: number;
    created_at: string;
}