import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { type Category } from '../types/Category';
import { type createTask } from '../types/Task';
import { categoriesFetch } from '../services/CategoriesFetch';
import { createTaskRequest } from '../services/CreateTask';
import { type Goal } from '../../goals/types/Goal';
import { goalsFetch } from '../../goals/services/GoalsFetch';

interface TaskModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

const FIELD = 'w-full px-4 py-3 bg-background rounded-xl text-text-main placeholder:text-secondary/60 outline-none focus:ring-2 focus:ring-accent transition-shadow duration-150';
const LABEL = 'text-sm font-medium text-secondary';

const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Native <dialog>: gives focus trap, Esc to close and a backdrop for free
export function TaskModal({ open, onClose, onCreated }: TaskModalProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);

    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [goalId, setGoalId] = useState('');
    const [date, setDate] = useState(todayISO());
    const [start, setStart] = useState('09:00');
    const [finish, setFinish] = useState('10:00');
    const [notes, setNotes] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    // Load categories each time the modal opens, and start from a clean form
    useEffect(() => {
        if (!open) return;
        categoriesFetch().then((data) => {
            setCategories(data);
            setCategoryId((current) => current || data[0]?.id || '');
        });
        goalsFetch('active').then(setGoals).catch(() => setGoals([])); // goals are optional, the form works without them
        setName(''); setNotes(''); setGoalId(''); setError(null); setDate(todayISO());
    }, [open]);

    // Picking a goal suggests its category; the user can still change it afterwards
    const handleGoalChange = (id: string) => {
        setGoalId(id);
        const goal = goals.find((g) => g.id === id);
        if (goal?.category_id) setCategoryId(goal.category_id);
    };

    // Local date + time -> Date (sent as ISO, so Postgres stores the right instant in timestamptz)
    const toDate = (day: string, time: string) => new Date(`${day}T${time}`);
    const durationMinutes = Math.round((toDate(date, finish).getTime() - toDate(date, start).getTime()) / 60000);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (durationMinutes <= 0) {
            setError('The end time must be after the start time.');
            return;
        }

        const task: createTask = {
            name: name.trim(),
            category_id: categoryId,
            goal_id: goalId || undefined,
            date,
            start_hour: toDate(date, start),
            finish_hour: toDate(date, finish),
            notes: notes.trim() || undefined,
            duration_minutes: durationMinutes,
        };

        setLoading(true);
        try {
            await createTaskRequest(task);
            onCreated();
            onClose();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => { if (e.target === ref.current) onClose(); }} // click on backdrop
            className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-surface text-text-main p-8
                       backdrop:bg-black/60 open:animate-[modal-in_180ms_ease-out]"
        >
            <div className="flex items-start justify-between gap-4 mb-6">
                <h2 className="text-3xl font-extrabold leading-none">New task</h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="text-secondary hover:text-text-main hover:bg-hover bg-transparent border-none
                               cursor-pointer p-1.5 rounded-full transition-colors duration-150"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-xl bg-outdoor/25 text-text-main text-sm font-medium">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="task-name" className={LABEL}>Name</label>
                    <input
                        id="task-name" type="text" required maxLength={255}
                        value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="What are you doing?" className={FIELD}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="task-category" className={LABEL}>Category</label>
                    <select
                        id="task-category" required
                        value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                        className={FIELD}
                    >
                        {categories.length === 0 && <option value="">No categories yet</option>}
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="task-goal" className={LABEL}>Goal (optional)</label>
                    <select id="task-goal" value={goalId}
                        onChange={(e) => handleGoalChange(e.target.value)} className={FIELD}>
                        <option value="">No goal</option>
                        {goals.map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="task-date" className={LABEL}>Date</label>
                        <input id="task-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={FIELD} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="task-start" className={LABEL}>Start</label>
                        <input id="task-start" type="time" required value={start} onChange={(e) => setStart(e.target.value)} className={FIELD} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="task-finish" className={LABEL}>End</label>
                        <input id="task-finish" type="time" required value={finish} onChange={(e) => setFinish(e.target.value)} className={FIELD} />
                    </div>
                </div>

                <p className="text-sm text-secondary tabular-nums -mt-2">
                    {durationMinutes > 0 ? `Duration: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}min` : 'Duration: –'}
                </p>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="task-notes" className={LABEL}>Notes (optional)</label>
                    <textarea
                        id="task-notes" rows={3}
                        value={notes} onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes…" className={`${FIELD} resize-none`}
                    />
                </div>

                <button
                    type="submit" disabled={loading || !categoryId}
                    className="w-full mt-1 py-3.5 px-4 bg-accent text-accent-text font-semibold rounded-full
                               cursor-pointer hover:brightness-110 transition-[filter] duration-150
                               disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving…' : 'Create task'}
                </button>
            </form>
        </dialog>
    );
}
