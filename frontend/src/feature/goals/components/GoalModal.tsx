import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { type Category } from '../../schedule/types/Category';
import { categoriesFetch } from '../../schedule/services/CategoriesFetch';
import { toLocalISODate } from '../../schedule/utils/calendarUtils';
import { type CreateGoal, type Goal } from '../types/Goal';
import { createGoalRequest } from '../services/CreateGoal';
import { updateGoal } from '../services/UpdateGoal';

interface GoalModalProps {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    goal?: Goal;            // given = edit that goal, absent = create a new one
}

const FIELD = 'w-full px-4 py-3 bg-background rounded-xl text-text-main placeholder:text-secondary/60 outline-none focus:ring-2 focus:ring-accent transition-shadow duration-150';
const LABEL = 'text-sm font-medium text-secondary';

// Native <dialog>: gives focus trap, Esc to close and a backdrop for free
export function GoalModal({ open, onClose, onSaved, goal }: GoalModalProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [targetHours, setTargetHours] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [startDate, setStartDate] = useState(toLocalISODate(new Date()));
    const [deadline, setDeadline] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    // Load categories each time the modal opens, and fill the form from the goal being edited (or start clean)
    useEffect(() => {
        if (!open) return;
        categoriesFetch().then(setCategories);
        setName(goal?.name ?? '');
        setDescription(goal?.description ?? '');
        setTargetHours(goal ? String(goal.target_minutes / 60) : '');
        setCategoryId(goal?.category_id ?? '');
        setStartDate(goal?.start_date ?? toLocalISODate(new Date()));
        setDeadline(goal?.deadline ?? '');
        setError(null);
    }, [open, goal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // the user thinks in hours, the API stores minutes like records do
        const targetMinutes = Math.round(Number(targetHours) * 60);
        if (!(targetMinutes > 0)) {
            setError('The target must be greater than 0 hours.');
            return;
        }
        if (deadline && deadline < startDate) {
            setError('The deadline cannot be before the start date.');
            return;
        }

        setLoading(true);
        try {
            if (goal) {
                // null clears the optional fields the user emptied
                await updateGoal(goal.id, {
                    name: name.trim(),
                    description: description.trim(),
                    target_minutes: targetMinutes,
                    category_id: categoryId || null,
                    start_date: startDate,
                    deadline: deadline || null,
                });
            } else {
                const newGoal: CreateGoal = {
                    name: name.trim(),
                    description: description.trim() || undefined,
                    target_minutes: targetMinutes,
                    category_id: categoryId || undefined,
                    start_date: startDate,
                    deadline: deadline || undefined,
                };
                await createGoalRequest(newGoal);
            }
            onSaved();
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
                <h2 className="text-3xl font-extrabold leading-none">{goal ? 'Edit goal' : 'New goal'}</h2>
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
                    <label htmlFor="goal-name" className={LABEL}>Name</label>
                    <input
                        id="goal-name" type="text" required maxLength={120}
                        value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="What do you want to achieve?" className={FIELD}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="goal-target" className={LABEL}>Target (hours)</label>
                        <input
                            id="goal-target" type="number" required min={0.5} step={0.5} inputMode="decimal"
                            value={targetHours} onChange={(e) => setTargetHours(e.target.value)}
                            placeholder="200" className={`${FIELD} tabular-nums`}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="goal-category" className={LABEL}>Category (optional)</label>
                        <select
                            id="goal-category"
                            value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                            className={FIELD}
                        >
                            <option value="">No category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="goal-start" className={LABEL}>Start date</label>
                        <input id="goal-start" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className={FIELD} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="goal-deadline" className={LABEL}>Deadline (optional)</label>
                        <input id="goal-deadline" type="date" min={startDate} value={deadline} onChange={(e) => setDeadline(e.target.value)} className={FIELD} />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="goal-description" className={LABEL}>Description (optional)</label>
                    <textarea
                        id="goal-description" rows={3}
                        value={description} onChange={(e) => setDescription(e.target.value)}
                        placeholder="Why does this matter? What counts as done?" className={`${FIELD} resize-none`}
                    />
                </div>

                <button
                    type="submit" disabled={loading}
                    className="w-full mt-1 py-3.5 px-4 bg-accent text-accent-text font-semibold rounded-full
                               cursor-pointer hover:brightness-110 transition-[filter] duration-150
                               disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving…' : goal ? 'Save changes' : 'Create goal'}
                </button>
            </form>
        </dialog>
    );
}
