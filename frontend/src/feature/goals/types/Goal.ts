export type GoalStatus = 'active' | 'completed' | 'archived';

export interface Goal {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    target_minutes: number;
    category_id: string | null;
    start_date: string;          // "YYYY-MM-DD"
    deadline: string | null;     // "YYYY-MM-DD", null = no deadline
    status: GoalStatus;
    created_at: string;
    categories?: { name: string; color: string } | null;
    // progress, computed by the backend from the linked records
    logged_minutes: number;
    records_count: number;
    last_record_date: string | null;
}

export interface CreateGoal {
    name: string;
    description?: string;
    target_minutes: number;
    category_id?: string;
    start_date: string;
    deadline?: string;
}

export type GoalChanges = Partial<Omit<CreateGoal, 'category_id' | 'deadline'>> & {
    category_id?: string | null;
    deadline?: string | null;
    status?: GoalStatus;
};

export interface GoalCardProps {
    goal: Goal;
    today: string;
    onStatusChange: (goal: Goal, status: GoalStatus) => void;
    onDelete: (goal: Goal) => void;
}
