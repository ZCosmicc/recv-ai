'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/Navbar';
import ConfirmModal from '@/components/ConfirmModal';
import LimitModal from '@/components/LimitModal';
import PlanCard from '@/components/PlanCard';
import { Plus, FileText, Trash2, Edit2, MoreVertical, Loader2, Check, X, Lock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SlideIn from '@/components/SlideIn';

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
    const { t } = useLanguage();
    const [cvs, setCvs] = useState<CV[]>([]);
    const [coverLetters, setCoverLetters] = useState<any[]>([]); // New state for cover letters
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [activeTab, setActiveTab] = useState<'cv' | 'cover-letter'>('cv'); // Tab state

    // Limit Modal State
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

    // Rename State
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');

    // Delete State
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingType, setDeletingType] = useState<'cv' | 'cover-letter'>('cv');

    // Account Deletion State
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

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

            // Fetch Cover Letters
            const { data: clData } = await supabase
                .from('cover_letters')
                .select('*')
                .order('created_at', { ascending: false });
            setCoverLetters(clData || []);

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
                        projects: [],
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

    const handleCreateCoverLetter = () => {
        if (!profile) return;
        const limit = profile.tier === 'pro' ? 4 : 1;

        if (coverLetters.length >= limit) {
            // Re-using the limit modal. 
            // Ideally we might want to tell the modal it's for CLs, but basic "Limit Reached" works.
            // We'll set a state to indicate context if needed, but for now just open it.
            setIsLimitModalOpen(true);
            return;
        }
        router.push('/cover-letter/create');
    };

    const handleDeleteClick = (id: string, type: 'cv' | 'cover-letter', e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingId(id);
        setDeletingType(type);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;

        if (deletingType === 'cv') {
            const { error } = await supabase.from('cvs').delete().eq('id', deletingId);
            if (!error) {
                setCvs(cvs.filter(c => c.id !== deletingId));
            }
        } else {
            const { error } = await supabase.from('cover_letters').delete().eq('id', deletingId);
            if (!error) {
                setCoverLetters(coverLetters.filter(c => c.id !== deletingId));
            }
        }
        setDeletingId(null);
    };

    const startRenaming = (e: React.MouseEvent, item: CV | any, type: 'cv' | 'cover-letter') => {
        e.stopPropagation();
        setRenamingId(item.id);
        setNewTitle(type === 'cv' ? item.title : (item.title || 'Untitled'));
    };

    const handleRename = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!renamingId) return;

        // Determine if it was a CV or CL based on which array contains the renamingId
        const isCV = cvs.find(c => c.id === renamingId);
        const isCL = coverLetters.find(c => c.id === renamingId);

        if (isCV) {
            const { error } = await supabase.from('cvs').update({ title: newTitle }).eq('id', renamingId);
            if (!error) {
                setCvs(cvs.map(c => c.id === renamingId ? { ...c, title: newTitle } : c));
            }
        } else if (isCL) {
            const { error } = await supabase.from('cover_letters').update({ title: newTitle }).eq('id', renamingId);
            if (!error) {
                setCoverLetters(coverLetters.map(c => c.id === renamingId ? { ...c, title: newTitle } : c));
            }
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

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        setDeletingAccount(true);
        setDeleteAccountError(null);
        try {
            const res = await fetch('/api/account', { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                setDeleteAccountError(data.error || 'Failed to delete account.');
                setDeletingAccount(false);
                return;
            }
            // Clear local data and redirect
            localStorage.clear();
            await supabase.auth.signOut();
            router.push('/');
        } catch {
            setDeleteAccountError('Something went wrong. Please try again.');
            setDeletingAccount(false);
        }
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

    const clLimit = profile?.tier === 'pro' ? 4 : 1;
    const isCLLimitReached = coverLetters.length >= clLimit;
    const isProAndCLLimitReached = profile?.tier === 'pro' && isCLLimitReached;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">{t.dashboard.title}</h1>
                        <p className="text-sm sm:text-base text-gray-600">{t.dashboard.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <PlanCard tier={profile?.tier || 'guest'} />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b-2 border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('cv')}
                        className={`pb-2 px-4 font-bold transition-all ${activeTab === 'cv'
                            ? 'border-b-4 border-blue-600 text-black'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        My CVs
                    </button>
                    <button
                        onClick={() => setActiveTab('cover-letter')}
                        className={`pb-2 px-4 font-bold transition-all ${activeTab === 'cover-letter'
                            ? 'border-b-4 border-blue-600 text-black'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Cover Letters
                    </button>
                </div>

                {/* Content Area */}
                {activeTab === 'cv' ? (
                    <>
                        {/* CV List */}
                        <div className="flex justify-end mb-4">
                            <motion.button
                                onClick={handleCreateCV}
                                disabled={creating || isProAndLimitReached}
                                whileHover={isProAndLimitReached ? {} : { x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                whileTap={isProAndLimitReached ? {} : { scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border-2 border-black shadow-neo font-bold text-sm sm:text-base flex-1 sm:flex-none ${isProAndLimitReached
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                                    : 'bg-primary text-white'
                                    }`}
                            >
                                {creating ? <Loader2 className="animate-spin w-4 h-4" /> : isLimitReached && !isProAndLimitReached ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                                {isProAndLimitReached ? t.dashboard.limitReached : t.dashboard.createNew}
                            </motion.button>
                        </div>

                        {cvs.length === 0 ? (
                            <div className="bg-white border-4 border-black shadow-neo p-6 sm:p-8 md:p-12 text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold mb-2">{t.dashboard.emptyState.title}</h2>
                                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">{t.dashboard.emptyState.desc}</p>
                                <motion.button
                                    onClick={handleCreateCV}
                                    whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className="bg-primary text-white px-6 sm:px-8 py-2 sm:py-3 border-2 border-black shadow-neo font-bold text-sm sm:text-base w-full sm:w-auto"
                                >
                                    {t.dashboard.emptyState.button}
                                </motion.button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cvs.map((cv, index) => (
                                    <SlideIn key={cv.id} delay={index * 0.1}>
                                        <motion.div
                                            onClick={() => handleEditCV(cv.id)}
                                            whileHover={{ y: -4 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                            className="bg-white border-4 border-black p-6 shadow-neo cursor-pointer group relative h-full flex flex-col"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center border-2 border-black">
                                                <FileText className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => startRenaming(e, cv, 'cv')}
                                                    className="text-gray-400 hover:text-black p-2"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(cv.id, 'cv', e)}
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
                                                <motion.button onClick={handleRename} whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="bg-green-500 text-white p-1 border-2 border-black shadow-neo-sm">
                                                    <Check className="w-3 h-3" />
                                                </motion.button>
                                                <motion.button onClick={cancelRenaming} whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="bg-red-500 text-white p-1 border-2 border-black shadow-neo-sm">
                                                    <X className="w-3 h-3" />
                                                </motion.button>
                                            </div>
                                        ) : (
                                            <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors truncate">{cv.title}</h3>
                                        )}
                                        <p className="text-sm text-gray-500">{t.dashboard.lastUpdated} {formatDate(cv.updated_at)}</p>
                                    </motion.div>
                                    </SlideIn>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Cover Letter List */}
                        <div className="flex justify-end mb-4">
                            <motion.button
                                onClick={handleCreateCoverLetter}
                                disabled={isProAndCLLimitReached}
                                whileHover={isProAndCLLimitReached ? {} : { x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                whileTap={isProAndCLLimitReached ? {} : { scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border-2 border-black shadow-neo font-bold text-sm sm:text-base flex-1 sm:flex-none ${isProAndCLLimitReached
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                                    : 'bg-primary text-white'
                                    }`}
                            >
                                {isCLLimitReached && !isProAndCLLimitReached ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                                {isProAndCLLimitReached ? t.dashboard.limitReached : t.coverLetter.newButton}
                            </motion.button>
                        </div>

                        {coverLetters.length === 0 ? (
                            <div className="bg-white border-4 border-black shadow-neo p-6 sm:p-8 md:p-12 text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold mb-2">{t.coverLetter.noCvs}</h2>
                                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">{t.coverLetter.createDesc}</p>
                                <motion.button
                                    onClick={handleCreateCoverLetter}
                                    whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 border-2 border-black shadow-neo font-bold text-sm sm:text-base w-full sm:w-auto"
                                >
                                    {t.coverLetter.createTitle}
                                </motion.button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {coverLetters.map((cl, index) => (
                                    <SlideIn key={cl.id} delay={index * 0.1}>
                                        <motion.div
                                            onClick={() => router.push(`/cover-letter/create?id=${cl.id}`)}
                                            whileHover={{ y: -4 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                            className="bg-white border-4 border-black p-6 shadow-neo cursor-pointer group relative h-full flex flex-col"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center border-2 border-black">
                                                    <FileText className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => startRenaming(e, cl, 'cover-letter')}
                                                        className="text-gray-400 hover:text-black p-2"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteClick(cl.id, 'cover-letter', e)}
                                                        className="text-gray-400 hover:text-red-500 p-2"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {renamingId === cl.id ? (
                                                <div className="flex items-center gap-2 mb-1" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={newTitle}
                                                        onChange={(e) => setNewTitle(e.target.value)}
                                                        className="border-2 border-black px-2 py-1 text-sm w-full font-bold"
                                                        autoFocus
                                                    />
                                                    <motion.button onClick={handleRename} whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="bg-green-500 text-white p-1 border-2 border-black shadow-neo-sm">
                                                        <Check className="w-3 h-3" />
                                                    </motion.button>
                                                    <motion.button onClick={cancelRenaming} whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="bg-red-500 text-white p-1 border-2 border-black shadow-neo-sm">
                                                        <X className="w-3 h-3" />
                                                    </motion.button>
                                                </div>
                                            ) : (
                                                <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition-colors truncate">{cl.title || cl.job_title || 'Untitled Position'}</h3>
                                            )}
                                            <p className="text-sm font-semibold text-gray-700 mb-2 truncate">{cl.company_name}</p>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold px-2 py-0.5 border border-black rounded bg-primary/10 text-blue-700 border-blue-200">{cl.tone}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-auto">Created {formatDate(cl.created_at)}</p>
                                        </motion.div>
                                    </SlideIn>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Danger Zone */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 pb-10">
                <div className="border-2 border-red-300 bg-red-50 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h2 className="text-base font-extrabold text-red-700 uppercase tracking-wide">Danger Zone</h2>
                    </div>
                    <p className="text-sm text-red-600 mb-4">
                        Permanently delete your account and all associated data — CVs, cover letters, and support tickets. This action <strong>cannot be undone</strong>.
                    </p>
                    <button
                        onClick={() => { setShowDeleteAccount(true); setDeleteConfirmText(''); setDeleteAccountError(null); }}
                        className="px-4 py-2 border-2 border-red-600 text-red-600 font-bold text-sm hover:bg-red-600 hover:text-white transition-colors"
                    >
                        Delete My Account
                    </button>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 cursor-pointer" onClick={() => setShowDeleteAccount(false)} />
                    <div className="relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                            <h2 className="text-xl font-extrabold">Delete Account</h2>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">This will permanently delete:</p>
                        <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4 list-disc">
                            <li>Your account and login access</li>
                            <li>All your CVs</li>
                            <li>All your cover letters</li>
                            <li>All your support tickets</li>
                        </ul>
                        <p className="text-sm font-bold mb-2">Type <span className="font-mono bg-gray-100 px-1">DELETE</span> to confirm:</p>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="w-full border-2 border-black p-2 text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        {deleteAccountError && (
                            <p className="text-sm text-red-600 mb-3 font-medium">{deleteAccountError}</p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteAccount(false)}
                                className="flex-1 py-2 border-2 border-black font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                                className="flex-1 py-2 bg-red-600 text-white font-bold text-sm border-2 border-red-600 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {deletingAccount ? 'Deleting...' : 'Yes, delete everything'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={confirmDelete}
                title={deletingType === 'cv' ? t.dashboard.confirmDelete.title : t.coverLetter.deleteTitle}
                message={deletingType === 'cv' ? t.dashboard.confirmDelete.message : t.coverLetter.deleteMessage}
                confirmText={t.dashboard.confirmDelete.button}
                isDestructive={true}
            />

            <LimitModal
                isOpen={isLimitModalOpen}
                onClose={() => setIsLimitModalOpen(false)}
                tier={profile?.tier || 'guest'}
                mode="cv"
            />
        </div>
    );
}
