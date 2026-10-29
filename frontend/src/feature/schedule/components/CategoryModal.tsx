import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createCategoryRequest } from '../services/CreateCategory';
import { readableTextColor } from '../utils/calendarUtils';

interface CategoryModalProps {
    open: boolean;
    onClose: () => void;
}

const FIELD = 'w-full px-4 py-3 bg-background rounded-xl text-text-main placeholder:text-secondary/60 outline-none focus:ring-2 focus:ring-accent transition-shadow duration-150';
const LABEL = 'text-sm font-medium text-secondary';
const DEFAULT_COLOR = '#22c55e';

// Admin only: the backend rejects it with 403 for anyone else
export function CategoryModal({ open, onClose }: CategoryModalProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState(DEFAULT_COLOR); // <input type="color"> works with '#rrggbb'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    // Start from a clean form each time the modal opens
    useEffect(() => {
        if (!open) return;
        setName(''); setColor(DEFAULT_COLOR); setError(null);
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await createCategoryRequest({ name: name.trim(), color: color.slice(1) });
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
                <h2 className="text-3xl font-extrabold leading-none">New category</h2>
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
                    <label htmlFor="category-name" className={LABEL}>Name</label>
                    <input
                        id="category-name" type="text" required maxLength={80}
                        value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Study, Sport, Work…" className={FIELD}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="category-color" className={LABEL}>Color</label>
                    <div className="flex items-center gap-3">
                        <input
                            id="category-color" type="color"
                            value={color} onChange={(e) => setColor(e.target.value)}
                            className="h-12 w-16 shrink-0 cursor-pointer rounded-xl bg-background p-1 border-none"
                        />
                        {/* Preview with the same colors a task block gets in the calendar */}
                        <span
                            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm truncate"
                            style={{ backgroundColor: color, color: readableTextColor(color.slice(1)) }}
                        >
                            {name.trim() || 'Preview'}
                        </span>
                    </div>
                </div>

                <button
                    type="submit" disabled={loading}
                    className="w-full mt-1 py-3.5 px-4 bg-accent text-accent-text font-semibold rounded-full
                               cursor-pointer hover:brightness-110 transition-[filter] duration-150
                               disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving…' : 'Create category'}
                </button>
            </form>
        </dialog>
    );
}
