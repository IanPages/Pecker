import { authHeaders } from "../../auth/services/authHeaders";
import type { RecentRecord } from "../types/RecentRecord";


export async function recentRecordsFetch(): Promise<RecentRecord[]> {
    const response= await fetch(`http://localhost:8080/records/recent`, {
        method: "GET",
        headers: await authHeaders()
    })

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.detail ? JSON.stringify(data.detail) : "There is an error loading recent records.") 
    }

    return response.json()
}