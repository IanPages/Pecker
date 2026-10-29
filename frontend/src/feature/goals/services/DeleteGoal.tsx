import { API_URL } from "../../../config";
import { authHeaders } from "../../auth/services/authHeaders";

export async function deleteGoal(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/goals/${id}`, {
        method: "DELETE",
        headers: await authHeaders()
    })

    if (!response.ok) throw new Error("There was an error deleting this goal.")
}
