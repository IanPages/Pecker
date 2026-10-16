import type { Task } from "../types/Task";

const toISODate = (d: Date) => d.toISOString().slice(0, 10); // "YYYY-MM-DD"

export async function weeklyFetch(userId: string | undefined, startDate: Date, endDate: Date): Promise<Task[]> {

    const response = await fetch(`http://localhost:8080/records/weekly/${userId}/${toISODate(startDate)}/${toISODate(endDate)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })

    const data = await response.json()

    // Backend may return {detail: '...'} on 404 / empty – treat as no tasks
    if (!response.ok || !Array.isArray(data)) return []

    console.log(data)
    return data as Task[]
}