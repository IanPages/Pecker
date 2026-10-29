import { API_URL } from "../../../config";
import { authHeaders } from "../../auth/services/authHeaders";
import type { RecentRecord } from "../types/RecentRecord";


export async function recentRecordsFetch(): Promise<RecentRecord[]> {
    const response= await fetch(`${API_URL}/records/recent`, {
        method: "GET",
        headers: await authHeaders()
    })

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.detail ? JSON.stringify(data.detail) : "There is an error loading recent records.") 
    }

    return response.json()
}