'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Bug, CreditCard, User, Lightbulb, MessageCircle, CheckCircle, ImageIcon, ExternalLink, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SlideIn from './SlideIn';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail?: string;
}

type Category = 'bug' | 'payment' | 'account' | 'feature' | 'other';
type View = 'category' | 'details' | 'success';

interface ScreenshotItem {
    id: string;
    file: File;
    preview: string;
    status: 'uploading' | 'done' | 'error';
    url: string;
}

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'bug', label: 'Bug Report', icon: <Bug className="w-5 h-5" />, description: 'Something is broken' },
    { id: 'payment', label: 'Payment Issue', icon: <CreditCard className="w-5 h-5" />, description: 'Billing or Pro access' },
    { id: 'account', label: 'Account Problem', icon: <User className="w-5 h-5" />, description: 'Login or data issues' },
    { id: 'feature', label: 'Feature Request', icon: <Lightbulb className="w-5 h-5" />, description: 'Suggest an improvement' },
    { id: 'other', label: 'Other', icon: <MessageCircle className="w-5 h-5" />, description: 'Something else' },
];

const MAX_SCREENSHOTS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function SupportModal({ isOpen, onClose, userEmail }: SupportModalProps) {
    const [view, setView] = useState<View>('category');
    const [category, setCategory] = useState<Category | null>(null);
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync email when userEmail prop loads (async session)
    useEffect(() => {
        if (userEmail) setEmail(userEmail);
    }, [userEmail]);

    const resetAndClose = () => {
        setView('category');
        setCategory(null);
        setEmail(userEmail || '');
        setSubject('');
        setDescription('');
        setScreenshots([]);
        setError(null);
        setLightboxUrl(null);
        onClose();
    };

    const uploadFile = async (item: ScreenshotItem): Promise<string> => {
        const formData = new FormData();
        formData.append('file', item.file);
        const res = await fetch('/api/support/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        return data.url as string;
    };

    const addFiles = useCallback((files: FileList | File[]) => {
        const fileArr = Array.from(files);
        const remaining = MAX_SCREENSHOTS - screenshots.length;
        if (remaining <= 0) return;

        const toAdd = fileArr.slice(0, remaining);
        const newItems: ScreenshotItem[] = [];

        for (const file of toAdd) {
            if (!file.type.startsWith('image/')) {
                setError(`"${file.name}" is not an image file.`);
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                setError(`"${file.name}" exceeds 5MB limit.`);
                continue;
            }
            const id = `${Date.now()}-${Math.random()}`;
            newItems.push({
                id,
                file,
                preview: URL.createObjectURL(file),
                status: 'uploading',
                url: '',
            });
        }

        if (newItems.length === 0) return;
        setError(null);
        setScreenshots(prev => [...prev, ...newItems]);

        // Upload each file immediately
        for (const item of newItems) {
            uploadFile(item)
                .then(url => {
                    setScreenshots(prev =>
                        prev.map(s => s.id === item.id ? { ...s, status: 'done', url } : s)
                    );
                })
                .catch(() => {
                    setScreenshots(prev =>
                        prev.map(s => s.id === item.id ? { ...s, status: 'error' } : s)
                    );
                });
        }
    }, [screenshots.length]);

    const removeScreenshot = (id: string) => {
        setScreenshots(prev => {
            const item = prev.find(s => s.id === id);
            if (item) URL.revokeObjectURL(item.preview);
            return prev.filter(s => s.id !== id);
        });
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    }, [addFiles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;

        // Check if any are still uploading
        const stillUploading = screenshots.some(s => s.status === 'uploading');
        if (stillUploading) {
            setError('Please wait for screenshots to finish uploading.');
            return;
        }

        const validUrls = screenshots.filter(s => s.status === 'done').map(s => s.url);
        const screenshot_urls = validUrls;

        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    category,
                    subject,
                    description,
                    screenshot_urls,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.error === 'rate_limited') {
                    setError(data.message);
                } else if (data.details) {
                    const firstError = Object.values(data.details).flat()[0] as string;
                    setError(firstError || 'Invalid input. Please check your fields.');
                } else {
                    setError(data.error || 'Failed to submit. Please try again.');
                }
                return;
            }

            setView('success');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Lightbox */}
            {lightboxUrl && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 cursor-pointer" onClick={() => setLightboxUrl(null)}>
                    <button className="absolute top-4 right-4 bg-white border-2 border-black p-1 z-10" onClick={() => setLightboxUrl(null)}>
                        <X className="w-5 h-5" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lightboxUrl} alt="Screenshot preview" className="max-w-full max-h-full object-contain" onClick={e => e.stopPropagation()} />
                </div>
            )}

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer" onClick={resetAndClose} />

                {/* Modal */}
                <SlideIn className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b-4 border-black bg-black text-white flex-shrink-0">
                        <div className="flex items-center gap-2 font-bold">
                            <MessageCircle className="w-5 h-5 text-yellow-400" />
                            <span>Contact Support</span>
                        </div>
                        <button onClick={resetAndClose} className="hover:bg-white/20 p-1 transition-colors rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {/* View: Category */}
                        {view === 'category' && (
                            <div className="p-5">
                                <p className="text-sm text-gray-600 mb-4 font-medium">What can we help you with?</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <motion.button
                                            key={cat.id}
                                            onClick={() => { setCategory(cat.id); setView('details'); }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                            className="flex items-center gap-3 p-3 border-2 border-black hover:bg-yellow-400 transition-colors text-left group"
                                        >
                                            <span className="text-black">{cat.icon}</span>
                                            <div>
                                                <div className="font-bold text-sm">{cat.label}</div>
                                                <div className="text-xs text-gray-500 group-hover:text-gray-700">{cat.description}</div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* View: Details */}
                        {view === 'details' && (
                            <form onSubmit={handleSubmit} id="support-form" className="p-5 space-y-4">
                                {/* Category breadcrumb */}
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setView('category')} className="text-xs text-gray-500 hover:text-black underline">
                                        ← Back
                                    </button>
                                    <span className="text-xs font-bold bg-yellow-400 border border-black px-2 py-0.5">
                                        {CATEGORIES.find(c => c.id === category)?.label}
                                    </span>
                                </div>

                                {/* Email (only show if not logged in) */}
                                {!userEmail && (
                                    <div>
                                        <label className="block text-xs font-bold mb-1">Your Email *</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            placeholder="you@example.com"
                                            className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        />
                                    </div>
                                )}

                                {/* Subject */}
                                <div>
                                    <label className="block text-xs font-bold mb-1">Subject * <span className="text-gray-400 font-normal">({subject.length}/100)</span></label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value.slice(0, 100))}
                                        required
                                        placeholder="Brief summary of the issue"
                                        className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-bold mb-1">Description * <span className="text-gray-400 font-normal">({description.length}/1000)</span></label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value.slice(0, 1000))}
                                        required
                                        rows={4}
                                        placeholder="Describe the issue in detail..."
                                        className="w-full border-2 border-black p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>

                                {/* Screenshots */}
                                <div>
                                    <label className="block text-xs font-bold mb-2">
                                        Screenshots <span className="text-gray-400 font-normal">(optional, up to {MAX_SCREENSHOTS}, max 5MB each)</span>
                                    </label>

                                    <div className="flex gap-2 flex-wrap">
                                        {/* Existing thumbnails */}
                                        {screenshots.map(s => (
                                            <div key={s.id} className="relative w-16 h-16 border-2 border-black overflow-hidden flex-shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={s.preview} alt="screenshot" className="w-full h-full object-cover" />

                                                {/* Upload overlay */}
                                                {s.status === 'uploading' && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                    </div>
                                                )}

                                                {/* Error overlay */}
                                                {s.status === 'error' && (
                                                    <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center">
                                                        <X className="w-5 h-5 text-white" />
                                                    </div>
                                                )}

                                                {/* Done — hover shows actions */}
                                                {s.status === 'done' && (
                                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center gap-1 opacity-0 hover:opacity-100 group">
                                                        <button
                                                            type="button"
                                                            onClick={() => setLightboxUrl(s.preview)}
                                                            className="bg-white p-0.5 border border-black"
                                                            title="View full"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* X button always visible */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeScreenshot(s.id)}
                                                    className="absolute top-0 right-0 bg-black text-white w-4 h-4 flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                                                >
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add more button */}
                                        {screenshots.length < MAX_SCREENSHOTS && (
                                            <div
                                                onDrop={handleDrop}
                                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`w-16 h-16 border-2 border-dashed flex-shrink-0 cursor-pointer flex flex-col items-center justify-center transition-colors ${isDragging ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 hover:border-black hover:bg-gray-50'}`}
                                            >
                                                <ImageIcon className="w-5 h-5 text-gray-400" />
                                                <span className="text-[10px] text-gray-400 mt-0.5">Add</span>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {screenshots.length === 0 && (
                                        <p className="text-xs text-gray-400 mt-1">Drag & drop or click the box above</p>
                                    )}
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="p-3 bg-red-50 border-2 border-red-300 text-red-700 text-sm font-medium">
                                        {error}
                                    </div>
                                )}
                            </form>
                        )}

                        {/* View: Success */}
                        {view === 'success' && (
                            <div className="p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <CheckCircle className="w-16 h-16 text-green-500" />
                                </div>
                                <h3 className="text-xl font-extrabold mb-2">Thanks for reaching out!</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                    We've received your report and will look into it. Expect to see updates within <strong>2–7 days</strong>.
                                </p>
                                <Link
                                    href="/changelog"
                                    onClick={resetAndClose}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-black underline hover:text-yellow-600 transition-colors mb-6"
                                >
                                    See what we've been fixing lately <ExternalLink className="w-3 h-3" />
                                </Link>
                                <motion.button
                                    onClick={resetAndClose}
                                    whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className="w-full py-3 bg-yellow-400 text-black font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    Close
                                </motion.button>
                            </div>
                        )}
                    </div>

                    {/* Submit button pinned at bottom for details view */}
                    {view === 'details' && (
                        <div className="p-4 border-t-2 border-gray-100 flex-shrink-0">
                            <motion.button
                                type="submit"
                                form="support-form"
                                disabled={submitting}
                                whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,0.3)' }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="w-full py-3 bg-black text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Submitting...' : 'Submit Ticket'}
                            </motion.button>
                        </div>
                    )}
                </SlideIn>
            </div>
        </>
    );
}
