import { authHeaders } from "../../auth/services/authHeaders";
import type { Category } from "../types/Category";

export async function categoriesFetch(): Promise<Category[]> {
    const response = await fetch("http://localhost:8080/categories/", {
        headers: await authHeaders()
    })

    const data = await response.json()
    if (!response.ok || !Array.isArray(data)) return []
    return data as Category[]
}
