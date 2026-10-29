import { API_URL } from "../../../config";
import { authHeaders } from "../../auth/services/authHeaders";
import type { Task } from "../../schedule/types/Task";
import type { Goal } from "../types/Goal";

async function getJSON<T>(url: string, fallback: string): Promise<T> {
    const response = await fetch(url, { headers: await authHeaders() })

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(typeof data?.detail === "string" ? data.detail : fallback)
    }
    return response.json()
}

export const goalFetch = (id: string) =>
    getJSON<Goal>(`${API_URL}/goals/${id}`, "There was an error loading this goal.")

// newest first, with the category embedded
export const goalRecordsFetch = (id: string) =>
    getJSON<Task[]>(`${API_URL}/goals/${id}/records`, "There was an error loading this goal's sessions.")
