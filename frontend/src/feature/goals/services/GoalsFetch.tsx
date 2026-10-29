import { API_URL } from "../../../config";
import { authHeaders } from "../../auth/services/authHeaders";
import type { Goal, GoalStatus } from "../types/Goal";

export async function goalsFetch(status?: GoalStatus): Promise<Goal[]> {
    const response = await fetch(`${API_URL}/goals/${status ? `?status=${status}` : ''}`, {
        headers: await authHeaders()
    })

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.detail ? JSON.stringify(data.detail) : "There was an error loading your goals.")
    }
    return response.json()
}
