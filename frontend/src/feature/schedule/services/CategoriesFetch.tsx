import { API_URL } from "../../../config";
import { authHeaders } from "../../auth/services/authHeaders";
import type { Category } from "../types/Category";

export async function categoriesFetch(): Promise<Category[]> {
    const response = await fetch(`${API_URL}/categories/`, {
        headers: await authHeaders()
    })

    const data = await response.json()
    if (!response.ok || !Array.isArray(data)) return []
    return data as Category[]
}
