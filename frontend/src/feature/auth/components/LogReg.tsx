import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/authApi';

export function LogReg() {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setLoading(true);

        try {
            if (isLogin) {
                await loginUser(email, password);
            } else {
                await registerUser(email, password, username);
                setSuccessMsg('Registered successfully. Please check your email to confirm your account.');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setSuccessMsg(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div
                className="w-full max-w-md bg-surface border border-border rounded-2xl p-8
                           shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200"
            >

                {/* Título */}
                <h2
                    className="text-3xl font-bold text-center mb-8"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-text-main) 0%, var(--color-progress) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {isLogin ? 'Login' : 'Register'}
                </h2>

                {/* Mensajes de Error o Éxito */}
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-outdoor/20 text-outdoor border border-outdoor/30 text-sm font-medium">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-progress/15 text-progress border border-progress/30 text-sm font-medium">
                        {successMsg}
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-secondary"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl
                                       text-text-main placeholder:text-secondary/50 outline-none
                                       focus:border-progress focus:ring-2 focus:ring-progress/20
                                       transition-all duration-200"
                        />
                    </div>

                    {!isLogin && (
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="username"
                                className="text-sm font-medium text-secondary"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Pecker"
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl
                                           text-text-main placeholder:text-secondary/50 outline-none
                                           focus:border-progress focus:ring-2 focus:ring-progress/20
                                           transition-all duration-200"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-secondary"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            minLength={6}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl
                                       text-text-main placeholder:text-secondary/50 outline-none
                                       focus:border-progress focus:ring-2 focus:ring-progress/20
                                       transition-all duration-200"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-1 py-2.5 px-4 bg-progress text-progress-text font-semibold
                                   rounded-xl shadow-[0_2px_12px_rgba(128,184,134,0.3)]
                                   hover:shadow-[0_4px_18px_rgba(128,184,134,0.45)] hover:-translate-y-0.5
                                   focus:outline-none focus:ring-2 focus:ring-progress/40
                                   transition-all duration-200
                                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                {/* Toggle to swap between Login and register */}
                <p className="mt-6 text-center text-sm text-secondary">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="font-semibold text-progress hover:text-text-main transition-colors duration-200 focus:outline-none"
                    >
                        {isLogin ? 'Register here' : 'Login here'}
                    </button>
                </p>

            </div>
        </div>
    );
}