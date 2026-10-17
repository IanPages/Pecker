import { authHeaders } from "../../auth/services/authHeaders";
import { toLocalISODate } from "../utils/calendarUtils";
import type { Task } from "../types/Task";


export async function weeklyFetch(startDate: Date, endDate: Date): Promise<Task[]> {

    const response = await fetch(`http://localhost:8080/records/weekly/${toLocalISODate(startDate)}/${toLocalISODate(endDate)}`, {
        method: "GET",
        headers: await authHeaders()
    })

    const data = await response.json()

    // Backend may return {detail: '...'} on 404 / empty – treat as no tasks
    if (!response.ok || !Array.isArray(data)) return []

    console.log(data)
    return data as Task[]
}