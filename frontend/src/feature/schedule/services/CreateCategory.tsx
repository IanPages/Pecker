import { API_URL } from "../../../config";
import { authHeaders } from "../../auth/services/authHeaders";

// color goes without '#', the backend expects exactly 6 hex chars
export async function createCategoryRequest(category: { name: string; color: string }): Promise<void> {
    const response = await fetch(`${API_URL}/categories/`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(category)
    })

    if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.detail ? String(data.detail) : "Could not create the category.")
    }
}
