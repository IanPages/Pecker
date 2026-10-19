import { authHeaders } from "../../auth/services/authHeaders";
import { toLocalISODate } from "../../schedule/utils/calendarUtils";
import type { DashboardStats } from "../types/Dashboard";


export async function dashboardStatsFetch(): Promise<DashboardStats> {
    const response = await fetch(`http://localhost:8080/records/stats?today=${toLocalISODate(new Date())}`, {
        method: "GET",
        headers: await authHeaders()
    })

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.detail ? JSON.stringify(data.detail) : "There was an error loading your stats.")
    }
    return response.json()
}
