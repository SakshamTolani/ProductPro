'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

interface AlertState {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}

interface UserStats {
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    pendingRequests: number;
}

interface User {
    email: string;
    role: string;
}

interface StatCardProps {
    title: string;
    value: number;
    color: string;
    textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, textColor }) => (
    <div className={`${color} p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg`}>
        <p className={`text-xl font-semibold mb-2 ${textColor}`}>{title}</p>
        <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
    </div>
);

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [alert, setAlert] = useState<AlertState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const [profileResponse, statsResponse] = await Promise.all([
                    fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/user/stats', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (profileResponse.ok && statsResponse.ok) {
                    const profileData: User = await profileResponse.json();
                    const statsData: UserStats = await statsResponse.json();
                    setUser(profileData);
                    setStats(statsData);
                } else {
                    throw new Error('Failed to fetch data');
                }
            } catch (error) {
                console.error('Error:', error);
                setAlert({ type: 'error', message: 'Failed to load profile data' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (isLoading) return <Loader />;
    if (!user || !stats) return <div className="text-center text-xl text-red-600 mt-10">Failed to load profile</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
                <div className="px-8 py-10">
                    <h1 className="text-4xl font-bold mb-6 text-gray-800 border-b pb-4">Profile</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-lg text-gray-600">Email</p>
                            <p className="text-xl font-semibold text-gray-800">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-lg text-gray-600">Role</p>
                            <p className="text-xl font-semibold text-gray-800 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <h2 className="text-3xl font-semibold mb-6 text-gray-800">Statistics</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <StatCard title="Total Requests" value={stats.totalRequests} color="bg-blue-100" textColor="text-blue-800" />
                        <StatCard title="Approved Requests" value={stats.approvedRequests} color="bg-green-100" textColor="text-green-800" />
                        <StatCard title="Rejected Requests" value={stats.rejectedRequests} color="bg-red-100" textColor="text-red-800" />
                        <StatCard title="Pending Requests" value={stats.pendingRequests} color="bg-yellow-100" textColor="text-yellow-800" />
                    </div>
                    {user.role === 'team_member' && (
                        <Link href="/profile/my-submissions" className="mt-8 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            View My Submissions
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}