import { supabase } from "./supabase"

// Supabase owns the session (and refreshes the token when it expires), so ask it instead of localStorage
export async function authHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession()
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token ?? ""}`
    }
}
