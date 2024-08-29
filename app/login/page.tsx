'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Alert from '../components/Alert';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface AlertState {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState<AlertState | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/dashboard');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                setAlert({ type: 'success', message: 'Login successful! Redirecting...' });
                setTimeout(() => {
                    window.location.reload();
                    router.push('/dashboard');
                }, 1500);
            } else {
                setAlert({ type: 'error', message: data.message || 'Login failed. Please try again.' });
            }
        } catch (error) {
            setAlert({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-700 to-purple-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-2xl transform transition-all hover:scale-105 duration-300">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-sm text-gray-600 mb-8">
                            Sign in to access your account
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit} method="POST">
                        <input type="hidden" name="remember" value="true" />
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div className="mb-4">
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input 
                                        id="email-address" 
                                        name="email" 
                                        type="email" 
                                        autoComplete="email" 
                                        required 
                                        className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pl-10" 
                                        placeholder="Email address" 
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input 
                                        id="password" 
                                        name="password" 
                                        type="password" 
                                        autoComplete="current-password" 
                                        required 
                                        className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pl-10" 
                                        placeholder="Password" 
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input 
                                    id="remember-me" 
                                    name="remember-me" 
                                    type="checkbox" 
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button 
                                type="submit" 
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
                            Don&pos;t have an account? Register
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}