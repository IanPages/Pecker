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
        <div className="min-h-full flex items-center justify-center px-1 py-6">
            <div
                className="w-full max-w-md bg-surface rounded-3xl p-8 md:p-10"
            >

                {/* Título */}
                <h1 className="text-5xl font-extrabold leading-none mb-2">
                    {isLogin ? 'Welcome back.' : 'Join Pecker.'}
                </h1>
                <p className="text-secondary mb-8">
                    {isLogin ? 'Log in to see your week.' : 'Create an account to start tracking.'}
                </p>

                {/* Mensajes de Error o Éxito */}
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-outdoor/25 text-text-main text-sm font-medium">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-progress/20 text-text-main text-sm font-medium">
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
                            className="w-full px-4 py-3 bg-background rounded-xl text-text-main placeholder:text-secondary/60 outline-none focus:ring-2 focus:ring-accent transition-shadow duration-150"
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
                                className="w-full px-4 py-3 bg-background rounded-xl text-text-main placeholder:text-secondary/60 outline-none focus:ring-2 focus:ring-accent transition-shadow duration-150"
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
                            className="w-full px-4 py-3 bg-background rounded-xl text-text-main placeholder:text-secondary/60 outline-none focus:ring-2 focus:ring-accent transition-shadow duration-150"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 px-4 bg-accent text-accent-text font-semibold
                                   rounded-full cursor-pointer hover:brightness-110
                                   transition-[filter] duration-150
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Please wait…' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                {/* Toggle to swap between Login and register */}
                <p className="mt-6 text-center text-sm text-secondary">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="font-semibold text-text-main underline underline-offset-4 decoration-accent decoration-2 cursor-pointer"
                    >
                        {isLogin ? 'Register here' : 'Login here'}
                    </button>
                </p>

            </div>
        </div>
    );
}