import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * GuestRoute — only accessible when the user is NOT logged in.
 * If a session exists, redirects to the home page.
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();

    // While Supabase resolves the session don't flash a redirect
    if (loading) return null;

    if (session) return <Navigate to="/" replace />;

    return <>{children}</>;
}
