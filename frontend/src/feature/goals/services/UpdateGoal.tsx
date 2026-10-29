import { API_URL } from "../../../config";
import { authHeaders } from "../../auth/services/authHeaders";
import type { GoalChanges } from "../types/Goal";

export async function updateGoal(id: string, changes: GoalChanges): Promise<void> {
    const response = await fetch(`${API_URL}/goals/${id}`, {
        method: "PUT",
        headers: await authHeaders(),
        body: JSON.stringify(changes)
    })

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        const detail = typeof data?.detail === "string" ? data.detail : JSON.stringify(data?.detail)
        throw new Error(data?.detail ? detail : "There was an error updating this goal.")
    }
}
