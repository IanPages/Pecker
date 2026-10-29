import { API_URL } from "../../../config";
import { authHeaders } from "../../auth/services/authHeaders";

export async function deleteTask(id: string) {
    const response = await fetch(`${API_URL}/records/${id}`, {
        method: 'DELETE',
        headers: await authHeaders()
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.detail ? String(data.detail) : "There was an error deleting this record.")
    }
}
