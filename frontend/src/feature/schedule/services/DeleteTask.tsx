import { authHeaders } from "../../auth/services/authHeaders";

export async function deleteTask(id: string) {
    const response = await fetch(`http://localhost:8080/records/${id}`, {
        method: 'DELETE',
        headers: await authHeaders()
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.detail ? String(data.detail) : "There was an error deleting this record.")
    }
}
