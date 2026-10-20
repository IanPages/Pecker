import { useCallback, useEffect, useState } from 'react';
import { goalsFetch } from '../services/GoalsFetch';
import type { Goal } from '../types/Goal';

export function useGoals(enabled: boolean) {
    const [goals, setGoals] = useState<Goal[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(() => {
        goalsFetch().then(setGoals).catch(e => setError(e.message));
    }, []);

    useEffect(() => {
        if (!enabled) return; // wait for the session before asking the API
        reload();
    }, [enabled, reload]);

    return { goals, error, reload };
}
