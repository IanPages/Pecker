import { API_URL } from "../../../config";
import { authHeaders } from "../../auth/services/authHeaders";
import type { createTask } from "../types/Task";

export async function createTaskRequest(task: createTask): Promise<void> {
    const response = await fetch(`${API_URL}/records/`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(task) // Date -> ISO string
    })

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.detail ? String(data.detail) : "Could not create the task.")
    }
}
