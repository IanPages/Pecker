import { authHeaders } from "../../auth/services/authHeaders";
import type { TaskChanges } from "../types/Task";


export async function updateTask(id, updateTask: TaskChanges) {
    const response = await fetch(`http://localhost:8080/records/${id}`,{
        method: 'PUT',
        headers: await authHeaders(),
        body: JSON.stringify(updateTask)
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        const detail = typeof data?.detail === "string" ? data.detail : JSON.stringify(data?.detail)
        throw new Error(data?.detail ? detail : "There was an error updating this record.")
    }
}