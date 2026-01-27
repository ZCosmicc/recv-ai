'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/Navbar';
import ConfirmModal from '@/components/ConfirmModal';
import LimitModal from '@/components/LimitModal';
import PlanCard from '@/components/PlanCard';
import { Plus, FileText, Trash2, Edit2, MoreVertical, Loader2, Check, X, Lock } from 'lucide-react';

interface CV {
    id: string;
    title: string;
    updated_at: string;
    data: any;
}

interface Profile {
    tier: 'guest' | 'pro';
}

export default function Dashboard() {
    const router = useRouter();
    const supabase = createClient();
    const [cvs, setCvs] = useState<CV[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Limit Modal State
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

    // Rename State
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');

    // Delete State
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                router.push('/login');
                return;
            }

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('tier')
                .eq('id', user.id)
                .single();
            setProfile(profileData || { tier: 'guest' });

            // Fetch CVs
            const { data: cvsData } = await supabase
                .from('cvs')
                .select('*')
                .order('updated_at', { ascending: false });
            setCvs(cvsData || []);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleCreateCV = async () => {
        if (!profile) return;
        const limit = profile.tier === 'pro' ? 4 : 1;

        if (cvs.length >= limit) {
            setIsLimitModalOpen(true);
            return;
        }

        setCreating(true);
        // Create a new empty CV
        const { data, error } = await supabase
            .from('cvs')
            .insert([
                {
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    title: 'Untitled CV',
                    data: {
                        personal: { name: '', email: '', phone: '', location: '', customFields: [] },
                        summary: '',
                        experience: [],
                        education: [],
                        skills: [],
                        certification: [],
                        language: []
                    }
                }
            ])
            .select()
            .single();

        if (data) {
            router.push(`/?id=${data.id}`);
        }
        setCreating(false);
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        const { error } = await supabase.from('cvs').delete().eq('id', deletingId);
        if (!error) {
            setCvs(cvs.filter(c => c.id !== deletingId));
        }
        setDeletingId(null);
    };

    const startRenaming = (e: React.MouseEvent, cv: CV) => {
        e.stopPropagation();
        setRenamingId(cv.id);
        setNewTitle(cv.title);
    };

    const handleRename = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!renamingId) return;

        const { error } = await supabase.from('cvs').update({ title: newTitle }).eq('id', renamingId);

        if (!error) {
            setCvs(cvs.map(c => c.id === renamingId ? { ...c, title: newTitle } : c));
        }
        setRenamingId(null);
    };

    const cancelRenaming = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRenamingId(null);
    };

    const handleEditCV = (id: string) => {
        router.push(`/?id=${id}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        const isYesterday = date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) {
            return `Today at ${timeStr}`;
        } else if (isYesterday) {
            return `Yesterday at ${timeStr}`;
        } else {
            return `${date.toLocaleDateString()} at ${timeStr}`;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="animate-spin w-10 h-10 text-primary" />
            </div>
        );
    }

    const limit = profile?.tier === 'pro' ? 4 : 1;
    const isLimitReached = cvs.length >= limit;
    const isProAndLimitReached = profile?.tier === 'pro' && isLimitReached;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto w-full p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
                        <p className="text-gray-600">Manage your resumes</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <PlanCard tier={profile?.tier || 'guest'} />
                        <button
                            onClick={handleCreateCV}
                            disabled={creating || isProAndLimitReached}
                            className={`flex items-center gap-2 px-6 py-3 border-2 border-black shadow-neo transition-all font-bold ${isProAndLimitReached
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                                : 'bg-primary text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                                }`}
                        >
                            {creating ? <Loader2 className="animate-spin w-4 h-4" /> : isLimitReached && !isProAndLimitReached ? <Lock className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isProAndLimitReached ? 'Limit Reached' : 'Create New CV'}
                        </button>
                    </div>
                </div>

                {cvs.length === 0 ? (
                    <div className="bg-white border-4 border-black shadow-neo p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No CVs yet</h2>
                        <p className="text-gray-600 mb-8">Create your first professional resume today.</p>
                        <button
                            onClick={handleCreateCV}
                            className="bg-primary text-white px-8 py-3 border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
                        >
                            Create CV
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cvs.map(cv => (
                            <div
                                key={cv.id}
                                onClick={() => handleEditCV(cv.id)}
                                className="bg-white border-4 border-black p-6 shadow-neo hover:-translate-y-1 transition-transform cursor-pointer group relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-primary/10 flex items-center justify-center border-2 border-black">
                                        <FileText className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => startRenaming(e, cv)}
                                            className="text-gray-400 hover:text-black p-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(cv.id, e)}
                                            className="text-gray-400 hover:text-red-500 p-2"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {renamingId === cv.id ? (
                                    <div className="flex items-center gap-2 mb-1" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="border-2 border-black px-2 py-1 text-sm w-full font-bold"
                                            autoFocus
                                        />
                                        <button onClick={handleRename} className="bg-green-500 text-white p-1 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                                            <Check className="w-3 h-3" />
                                        </button>
                                        <button onClick={cancelRenaming} className="bg-red-500 text-white p-1 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors truncate">{cv.title}</h3>
                                )}
                                <p className="text-sm text-gray-500">Last updated: {formatDate(cv.updated_at)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={confirmDelete}
                title="Delete CV"
                message="Are you sure you want to delete this CV? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />

            <LimitModal
                isOpen={isLimitModalOpen}
                onClose={() => setIsLimitModalOpen(false)}
                tier={profile?.tier || 'guest'}
            />
        </div>
    );
}
