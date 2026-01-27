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
            if (statsRes.status === 401) return router.push('/login');
            if (statsRes.status === 403) return router.push('/'); // Redirect non-admins
            const statsData = await statsRes.json();
            setStats(statsData);

            // 2. Fetch Users
            fetchUsers();
        } catch (error) {
            console.error(error);
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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-black">
            {/* Nav */}
            <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <LayoutDashboard className="w-6 h-6 text-yellow-400" />
                    ReCV Admin
                </div>
                <button onClick={() => router.push('/')} className="text-sm font-bold opacity-70 hover:opacity-100">
                    Exit
                </button>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Stats Grid */}
                <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-4">
                    Overview <div className="text-sm font-normal bg-yellow-400 text-black px-3 py-1 rounded-full border-2 border-black">Live</div>
                </h1>

                <div className="grid md:grid-cols-4 gap-6">
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

                <div className="grid md:grid-cols-3 gap-8">
                    {/* User Management */}
                    <div className="md:col-span-2 bg-white border-4 border-black shadow-neo p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Users</h2>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Search email..."
                                    className="border-2 border-black p-2 bg-gray-50"
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
                    <div className="bg-white border-4 border-black shadow-neo p-6 h-fit">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
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
        <div className={`bg-white border-4 border-black shadow-neo p-6 transition-transform hover:-translate-y-1 ${alert ? 'bg-red-50' : ''}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="bg-black text-white p-3 shadow-neo-sm">{icon}</div>
                {meta && <span className={`text-xs font-bold px-2 py-1 border-2 border-black ${alert ? 'bg-red-500 text-white' : 'bg-yellow-200'}`}>{meta}</span>}
            </div>
            <div className="text-gray-500 font-bold uppercase text-sm tracking-wider">{title}</div>
            <div className={`text-4xl font-extrabold mt-1 ${alert ? 'text-red-600' : 'text-black'}`}>{value}</div>
        </div>
    );
}
