import { useCallback, useEffect, useState } from 'react';
import { goalFetch, goalRecordsFetch } from '../services/GoalFetch';
import type { Goal } from '../types/Goal';
import type { Task } from '../../schedule/types/Task';

export function useGoal(id: string | undefined, enabled: boolean) {
    const [goal, setGoal] = useState<Goal | null>(null);
    const [records, setRecords] = useState<Task[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(() => {
        if (!id) return;
        Promise.all([goalFetch(id), goalRecordsFetch(id)])
            .then(([g, r]) => { setGoal(g); setRecords(r); })
            .catch(e => setError(e.message));
    }, [id]);

    useEffect(() => {
        if (!enabled) return; // wait for the session before asking the API
        reload();
    }, [enabled, reload]);

    return { goal, records, error, reload };
}
