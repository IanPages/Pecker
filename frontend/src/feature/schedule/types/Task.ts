
export interface Task {
    id: string;
    name: string;
    user_id: string;
    category_id: string;
    goal_id: string | null;
    date: string;
    start_hour: string;
    finish_hour: string;
    notes: string;
    duration_minutes: number;
    created_at: string;
    categories?: { name: string; color: string } | null; // embedded by the weekly/recent endpoints
}

export interface createTask {
    name: string;
    category_id: string;
    goal_id?: string;      // omitted = not linked to any goal
    date: string;          // "YYYY-MM-DD" -> Postgres date
    start_hour: Date;      // serialised as ISO 8601 -> timestamptz
    finish_hour: Date;
    notes?: string;
    duration_minutes: number; // derived in the form; not part of the backend RecordCreate yet
}

export interface TaskChanges {
    name: string;
    category_id: string;
    goal_id: string | null; // null unlinks the record from its goal
    date: string;
    start_hour: Date;
    finish_hour: Date;
    notes: string;
}