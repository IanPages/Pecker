import type { RegUser, LogUser } from "../types/authUsers"
import { supabase } from "./supabase"

export async function registerUser(user: RegUser) {

    const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
            data: {
                username: user.username
            }
        }
    })

    if (error) {
        console.error('Error while registering', error.message)
        return null
    }


    console.log('SESSION RESPONSE: ', data.session)
    console.log('USER RESPONSE: ', data.user)
    console.log('User successfully registered', data.user)
    return data
}

export async function loginUser(user: LogUser) {

    const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
    })

    if (error) {
        console.error('Error while logging in', error.message)
        return null
    }

    console.log('SESSION RESPONSE: ', data.session)
    console.log('USER RESPONSE: ', data.user)
    console.log('User successfully logged in', data.user)
    return data.session
}

export async function logoutUser() {
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Error while logging out', error.message)
        return null
    }

    console.log('User successfully logged out')
    return true
}
