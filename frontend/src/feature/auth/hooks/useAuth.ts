import { useState, useEffect } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [jwt, setJwt] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error while fetching session ', error.message);
            }

            setSession(session);
            setJwt(session?.access_token || null);
            setLoading(false);
        }

        getSession();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setJwt(session?.access_token || null);
                setLoading(false);
            }
        );
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { session, jwt, loading, user: session?.user || null }
}