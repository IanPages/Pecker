import { useAuth } from '../../auth/hooks/useAuth';
import { Dashboard } from '../../dashboard/components/Dashboard';
import { LandingPage } from '../../landing/components/LandingPage';

/**
 * HomeRoute — renders Dashboard for authenticated users,
 * and LandingPage for guests. No redirect needed.
 */
export function HomeRoute() {
    const { session, loading } = useAuth();

    if (loading) return null; // avoid flash while Supabase resolves

    return session ? <Dashboard /> : <LandingPage />;
}
