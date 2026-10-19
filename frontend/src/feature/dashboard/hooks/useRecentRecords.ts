import { useEffect, useState } from "react";
import { recentRecordsFetch } from "../services/RecentRecordsFetch";
import type { RecentRecord } from "../types/RecentRecord";

export function useRecentRecords(enabled: boolean) {
    const [records, setRecords] = useState<RecentRecord[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;
        recentRecordsFetch().then(setRecords).catch(e => setError(e.message));

    },[enabled])

    return {records, error};
}