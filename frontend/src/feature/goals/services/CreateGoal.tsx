import { authHeaders } from "../../auth/services/authHeaders";
import type { CreateGoal } from "../types/Goal";

export async function createGoalRequest(goal: CreateGoal): Promise<void> {
    const response = await fetch("http://localhost:8080/goals/", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(goal)
    })

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        const detail = typeof data?.detail === "string" ? data.detail : JSON.stringify(data?.detail)
        throw new Error(data?.detail ? detail : "Could not create the goal.")
    }
}
