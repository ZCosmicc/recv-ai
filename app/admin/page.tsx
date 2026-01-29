'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Activity, Zap, Search, ChevronRight, Crown } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminPage() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; userId: string; currentTier: string }>({ isOpen: false, userId: '', currentTier: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Fetch Stats
            const statsRes = await fetch('/api/admin/stats');
            if (statsRes.status === 401) {
                router.push('/login');
                return;
            }
            if (statsRes.status === 403) {
                router.push('/'); // Redirect non-admins
                return;
            }
            const statsData = await statsRes.json();
            setStats(statsData);
            setIsAuthorized(true); // Only set authorized if we get past auth checks

            // 2. Fetch Users
            fetchUsers();
        } catch (error) {
            console.error(error);
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (query = '') => {
        const res = await fetch(`/api/admin/users?search=${query}`);
        if (res.ok) {
            const data = await res.json();
            setUsers(data.users || []);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(userSearch);
    };

    const toggleTier = async (userId: string, currentTier: string) => {
        setConfirmModal({ isOpen: true, userId, currentTier });
    };

    const handleConfirmTierChange = async () => {
        const { userId, currentTier } = confirmModal;
        const newTier = currentTier === 'pro' ? 'free' : 'pro';

        setConfirmModal({ isOpen: false, userId: '', currentTier: '' });
        setUpdating(userId);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, tier: newTier })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, tier: newTier } : u));
            }
        } catch (error) {
            console.error('Failed to update tier:', error);
        } finally {
            setUpdating(null);
        }
    };

    // Show loading state while checking authorization
    if (loading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-2xl font-bold mb-2">Loading Admin...</div>
                    <div className="text-gray-500">Verifying access</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-black">
            {/* Nav */}
            <div className="bg-black text-white p-3 sm:p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-2 font-bold text-lg sm:text-xl">
                    <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    ReCV Admin
                </div>
                <button onClick={() => router.push('/')} className="text-xs sm:text-sm font-bold opacity-70 hover:opacity-100 border-2 border-white px-2 py-1">
                    EXIT
                </button>
            </div>

            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
                {/* Stats Grid */}
                <h1 className="text-2xl sm:text-4xl font-extrabold mb-4 sm:mb-8 flex items-center gap-2 sm:gap-4 flex-wrap">
                    Overview <div className="text-xs sm:text-sm font-normal bg-yellow-400 text-black px-2 sm:px-3 py-1 rounded-full border-2 border-black">Live</div>
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard
                        title="Requests (24h)"
                        value={`${stats?.requests24h || 0} / 1000`}
                        icon={<Activity />}
                        meta={`${((stats?.requests24h || 0) / 1000 * 100).toFixed(1)}% Usage`}
                        alert={(stats?.requests24h || 0) > 800}
                    />
                    <StatCard
                        title="Total AI Usage"
                        value={stats?.totalUsage || 0}
                        icon={<Zap />}
                    />
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={<Users />}
                        meta={`+${stats?.newUsers7d || 0} this week`}
                    />
                    <StatCard
                        title="Pro Users"
                        value={stats?.proUsers || 0}
                        icon={<Crown />}
                        meta={`${((stats?.proUsers || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% Conversion`}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* User Management */}
                    <div className="lg:col-span-2 bg-white border-4 border-black shadow-neo p-4 sm:p-6 text-sm sm:text-base">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4 sm:gap-0">
                            <h2 className="text-xl sm:text-2xl font-bold">Users</h2>
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search user..."
                                    className="border-2 border-black p-2 bg-gray-50 flex-1 sm:w-60 text-sm"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                />
                                <button type="submit" className="bg-black text-white p-2 hover:bg-gray-800"><Search className="w-5 h-5" /></button>
                            </form>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-4 border-black">
                                        <th className="p-3 font-extrabold">Email</th>
                                        <th className="p-3 font-extrabold">Tier</th>
                                        <th className="p-3 font-extrabold">Credits Used Today</th>
                                        <th className="p-3 font-extrabold">Joined</th>
                                        <th className="p-3 font-extrabold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user: any) => (
                                        <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{user.email}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-bold border-2 border-black ${user.tier === 'pro' ? 'bg-yellow-400 text-black' : 'bg-gray-200'}`}>
                                                    {user.tier?.toUpperCase() || 'FREE'}
                                                </span>
                                            </td>
                                            <td className="p-3">{user.daily_credits_used || 0}</td>
                                            <td className="p-3 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => toggleTier(user.id, user.tier || 'free')}
                                                    disabled={updating === user.id}
                                                    className="text-xs font-bold underline hover:text-primary transition-colors disabled:opacity-50"
                                                >
                                                    {updating === user.id ? '...' : user.tier === 'pro' ? 'Downgrade' : 'Upgrade to Pro'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Users Widget */}
                    <div className="bg-white border-4 border-black shadow-neo p-4 sm:p-6 h-fit text-sm sm:text-base">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-red-500" /> Top Active (24h)
                        </h2>
                        <ul className="space-y-4">
                            {stats?.topUsers?.map((u: any, i: number) => (
                                <li key={i} className="flex justify-between items-center border-b-2 border-dashed border-gray-200 pb-2">
                                    <div className="truncate w-1/2 font-medium" title={u.email}>{u.email}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">{u.daily_credits_used}</span>
                                        <span className="text-xs text-gray-500">reqs</span>
                                    </div>
                                </li>
                            ))}
                            {(!stats?.topUsers || stats.topUsers.length === 0) && (
                                <div className="text-gray-400 italic">No activity yet</div>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.currentTier === 'pro' ? '⬇️ Downgrade User' : '⬆️ Upgrade to Pro'}
                message={`Are you sure you want to change this user's tier to ${confirmModal.currentTier === 'pro' ? 'FREE' : 'PRO'}?`}
                confirmText={confirmModal.currentTier === 'pro' ? 'Downgrade' : 'Upgrade'}
                onConfirm={handleConfirmTierChange}
                onClose={() => setConfirmModal({ isOpen: false, userId: '', currentTier: '' })}
                isDestructive={confirmModal.currentTier === 'pro'}
            />
        </div>
    );
}

function StatCard({ title, value, icon, meta, alert }: any) {
    return (
        <div className={`bg-white border-4 border-black shadow-neo p-4 sm:p-6 transition-transform hover:-translate-y-1 ${alert ? 'bg-red-50' : ''}`}>
            <div className="flex justify-between items-start mb-2 sm:mb-4">
                <div className="bg-black text-white p-2 sm:p-3 shadow-neo-sm">{React.cloneElement(icon, { size: 20 })}</div>
                {meta && <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 border-2 border-black ${alert ? 'bg-red-500 text-white' : 'bg-yellow-200'}`}>{meta}</span>}
            </div>
            <div className="text-gray-500 font-bold uppercase text-xs sm:text-sm tracking-wider">{title}</div>
            <div className={`text-2xl sm:text-4xl font-extrabold mt-1 truncate ${alert ? 'text-red-600' : 'text-black'}`}>{value}</div>
        </div>
    );
}
