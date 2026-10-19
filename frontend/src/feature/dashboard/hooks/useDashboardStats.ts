import { useEffect, useState } from 'react';
import { dashboardStatsFetch } from '../services/DashboardStatsFetch';
import type { DashboardStats } from '../types/Dashboard';

export function useDashboardStats(enabled: boolean) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return; // wait for the session before asking the API
        dashboardStatsFetch().then(setStats).catch(e => setError(e.message));
    }, [enabled]);

    return { stats, error };
}
