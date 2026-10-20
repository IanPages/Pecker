import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Category } from '../types/Category';
import type { Task, TaskChanges } from '../types/Task';
import { categoriesFetch } from '../services/CategoriesFetch';
import type { Goal } from '../../goals/types/Goal';
import { goalsFetch } from '../../goals/services/GoalsFetch';

interface TaskDetailModalProps {
    task: Task | null;          // the modal is open while there is a task
    onClose: () => void;
    onSave: (id: string, changes: TaskChanges) => void;
}

const FIELD = 'w-full px-4 py-3 bg-background rounded-xl text-text-main placeholder:text-secondary/60 outline-none focus:ring-2 focus:ring-accent transition-shadow duration-150';
const LABEL = 'text-sm font-medium text-secondary';

// ISO timestamptz -> "HH:MM" in the user's local time, as <input type="time"> expects
const toTimeInput = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function TaskDetailModal({ task, onClose, onSave }: TaskDetailModalProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);

    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [goalId, setGoalId] = useState('');
    const [date, setDate] = useState('');
    const [start, setStart] = useState('');
    const [finish, setFinish] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (task && !dialog.open) dialog.showModal();
        if (!task && dialog.open) dialog.close();
    }, [task]);

    // Fill the form with the selected task each time a different one is opened
    useEffect(() => {
        if (!task) return;
        setName(task.name);
        setCategoryId(task.category_id ?? '');
        setGoalId(task.goal_id ?? '');
        setDate(task.date);
        setStart(toTimeInput(task.start_hour));
        setFinish(toTimeInput(task.finish_hour));
        setNotes(task.notes ?? '');
        setError(null);
        categoriesFetch().then(setCategories);
        // active goals, plus the record's current one even if it is already completed or archived
        goalsFetch()
            .then((data) => setGoals(data.filter((g) => g.status === 'active' || g.id === task.goal_id)))
            .catch(() => setGoals([]));
    }, [task]);

    const toDate = (day: string, time: string) => new Date(`${day}T${time}`);
    const durationMinutes = Math.round((toDate(date, finish).getTime() - toDate(date, start).getTime()) / 60000);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;
        if (durationMinutes <= 0) {
            setError('The end time must be after the start time.');
            return;
        }
        onSave(task.id, {
            name: name.trim(),
            category_id: categoryId,
            goal_id: goalId || null,
            date,
            start_hour: toDate(date, start),
            finish_hour: toDate(date, finish),
            notes: notes.trim(),
        });
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
                <div>
                    <h2 className="text-3xl font-extrabold leading-none">Task details</h2>
                    {task && (
                        <p className="text-secondary mt-2 tabular-nums">
                            {task.date} · {toTimeInput(task.start_hour)} – {toTimeInput(task.finish_hour)}
                            {task.duration_minutes ? ` · ${task.duration_minutes} min` : ''}
                        </p>
                    )}
                </div>
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
                    <label htmlFor="detail-name" className={LABEL}>Name</label>
                    <input id="detail-name" type="text" required maxLength={255}
                        value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="detail-category" className={LABEL}>Category</label>
                    <select id="detail-category" value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)} className={FIELD}>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="detail-goal" className={LABEL}>Goal (optional)</label>
                    <select id="detail-goal" value={goalId}
                        onChange={(e) => setGoalId(e.target.value)} className={FIELD}>
                        <option value="">No goal</option>
                        {goals.map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="detail-date" className={LABEL}>Date</label>
                        <input id="detail-date" type="date" required value={date}
                            onChange={(e) => setDate(e.target.value)} className={FIELD} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="detail-start" className={LABEL}>Start</label>
                        <input id="detail-start" type="time" required value={start}
                            onChange={(e) => setStart(e.target.value)} className={FIELD} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="detail-finish" className={LABEL}>End</label>
                        <input id="detail-finish" type="time" required value={finish}
                            onChange={(e) => setFinish(e.target.value)} className={FIELD} />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="detail-notes" className={LABEL}>Notes</label>
                    <textarea id="detail-notes" rows={3} value={notes} placeholder="Add notes…"
                        onChange={(e) => setNotes(e.target.value)} className={`${FIELD} resize-none`} />
                </div>

                <div className="flex gap-3 mt-1">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-3.5 px-4 bg-hover text-text-main font-semibold rounded-full cursor-pointer
                                   hover:bg-text-main hover:text-background transition-colors duration-150">
                        Cancel
                    </button>
                    <button type="submit"
                        className="flex-1 py-3.5 px-4 bg-accent text-accent-text font-semibold rounded-full cursor-pointer
                                   hover:brightness-110 transition-[filter] duration-150">
                        Save changes
                    </button>
                </div>
            </form>
        </dialog>
    );
}
