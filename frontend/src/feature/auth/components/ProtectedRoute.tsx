import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute — only accessible when the user IS logged in.
 * If no session exists, redirects to the home page.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();

    // While Supabase resolves the session don't flash a redirect
    if (loading) return null;

    if (!session) return <Navigate to="/" replace />;

    return <>{children}</>;
}