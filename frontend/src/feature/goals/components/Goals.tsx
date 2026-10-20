import { useState } from 'react';
import { Plus, Search, Target } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useGoals } from '../hooks/useGoals';
import { updateGoal } from '../services/UpdateGoal';
import { deleteGoal } from '../services/DeleteGoal';
import { toLocalISODate } from '../../schedule/utils/calendarUtils';
import { fmtHours } from '../../dashboard/utils/statsFormat';
import type { Goal, GoalStatus } from '../types/Goal';
import { GoalCard } from './GoalCard';
import { GoalModal } from './GoalModal';

const TABS: { status: GoalStatus; label: string }[] = [
    { status: 'active', label: 'Active' },
    { status: 'completed', label: 'Completed' },
    { status: 'archived', label: 'Archived' },
];

const EMPTY: Record<GoalStatus, string> = {
    active: 'No active goals. Create one and start logging sessions towards it.',
    completed: 'No completed goals yet.',
    archived: 'Nothing archived.',
};

// case and accent insensitive, so "programacion" finds "Programación"
const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

export function Goals() {
    const { user } = useAuth();
    const { goals, error, reload } = useGoals(!!user?.id);
    const [tab, setTab] = useState<GoalStatus>('active');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);

    const today = toLocalISODate(new Date());
    const matching = goals?.filter(g => normalize(g.name).includes(normalize(query))) ?? [];
    const visible = matching.filter(g => g.status === tab);
    const active = goals?.filter(g => g.status === 'active') ?? [];
    const activeMinutes = active.reduce((sum, g) => sum + g.logged_minutes, 0);

    const handleStatusChange = async (goal: Goal, status: GoalStatus) => {
        setActionError(null);
        try {
            await updateGoal(goal.id, { status });
            reload();
        } catch (e: any) {
            setActionError(e.message);
        }
    };

    const handleDelete = async (goal: Goal) => {
        // records stay, they are only unlinked from the goal (on delete set null)
        if (!window.confirm(`Delete "${goal.name}"? Its sessions will be kept, just no longer linked to a goal.`)) return;
        setActionError(null);
        try {
            await deleteGoal(goal.id);
            reload();
        } catch (e: any) {
            setActionError(e.message);
        }
    };

    return (
        <div className="flex flex-col gap-8 max-w-[1500px]">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-main leading-none">Goals</h1>
                    <p className="text-secondary mt-2 tabular-nums">
                        {goals
                            ? `${active.length} active · ${fmtHours(activeMinutes)} logged towards them`
                            : error ? "We couldn't load your goals." : 'Loading…'}
                    </p>
                </div>
                <button onClick={() => setIsModalOpen(true)} aria-label="New goal" className="flex items-center gap-2 bg-accent text-accent-text border-none
                         px-3.5 sm:px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer
                         transition-[filter] duration-150 hover:brightness-110"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New goal</span>
                </button>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1 bg-surface rounded-full p-1" role="tablist">
                {TABS.map(({ status, label }) => {
                    // counts follow the search, so it shows which tab holds the matches
                    const count = goals ? matching.filter(g => g.status === status).length : 0;
                    return (
                        <button
                            key={status} role="tab" aria-selected={tab === status}
                            onClick={() => setTab(status)}
                            className={[
                                'px-4 py-2 rounded-full text-sm font-medium border-none cursor-pointer transition-colors duration-150',
                                tab === status ? 'bg-text-main text-background' : 'bg-transparent text-secondary hover:text-text-main',
                            ].join(' ')}
                        >
                            {label}{count ? <span className="tabular-nums opacity-70"> {count}</span> : null}
                        </button>
                    );
                })}
            </div>

            <label className="relative w-full sm:w-72">
                <span className="sr-only">Search goals</span>
                <Search className="w-4 h-4 text-secondary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search goals…"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-full text-sm text-text-main placeholder:text-secondary/60
                               outline-none focus:ring-2 focus:ring-accent transition-shadow duration-150"
                />
            </label>
            </div>

            {actionError && (
                <div className="p-3 rounded-xl bg-outdoor/25 text-text-main text-sm font-medium">{actionError}</div>
            )}

            {goals && visible.length === 0 && (
                <div className="bg-surface rounded-2xl p-10 flex flex-col items-center text-center gap-3">
                    <Target className="w-8 h-8 text-secondary" />
                    <p className="text-secondary max-w-sm">{query.trim() ? `No ${tab} goals match "${query.trim()}".` : EMPTY[tab]}</p>
                </div>
            )}

            {visible.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map(goal => (
                        <GoalCard key={goal.id} goal={goal} today={today} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <GoalModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSaved={reload} />
        </div>
    );
}
