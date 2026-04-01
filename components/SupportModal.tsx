'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X, Bug, CreditCard, User, Lightbulb, MessageCircle, CheckCircle, Upload, ImageIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail?: string;
}

type Category = 'bug' | 'payment' | 'account' | 'feature' | 'other';
type View = 'category' | 'details' | 'success';

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'bug', label: 'Bug Report', icon: <Bug className="w-5 h-5" />, description: 'Something is broken' },
    { id: 'payment', label: 'Payment Issue', icon: <CreditCard className="w-5 h-5" />, description: 'Billing or Pro access' },
    { id: 'account', label: 'Account Problem', icon: <User className="w-5 h-5" />, description: 'Login or data issues' },
    { id: 'feature', label: 'Feature Request', icon: <Lightbulb className="w-5 h-5" />, description: 'Suggest an improvement' },
    { id: 'other', label: 'Other', icon: <MessageCircle className="w-5 h-5" />, description: 'Something else' },
];

export default function SupportModal({ isOpen, onClose, userEmail }: SupportModalProps) {
    const [view, setView] = useState<View>('category');
    const [category, setCategory] = useState<Category | null>(null);
    const [email, setEmail] = useState(userEmail || '');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetAndClose = () => {
        setView('category');
        setCategory(null);
        setEmail(userEmail || '');
        setSubject('');
        setDescription('');
        setScreenshot(null);
        setScreenshotPreview(null);
        setError(null);
        onClose();
    };

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Screenshot must be under 5MB.');
            return;
        }
        setError(null);
        setScreenshot(file);
        setScreenshotPreview(URL.createObjectURL(file));
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;
        setError(null);
        setSubmitting(true);

        try {
            let screenshotUrl = '';

            // Upload screenshot if provided
            if (screenshot) {
                setUploading(true);
                const formData = new FormData();
                formData.append('file', screenshot);
                const uploadRes = await fetch('/api/support/upload', { method: 'POST', body: formData });
                const uploadData = await uploadRes.json();
                setUploading(false);

                if (!uploadRes.ok) {
                    setError(uploadData.error || 'Screenshot upload failed.');
                    setSubmitting(false);
                    return;
                }
                screenshotUrl = uploadData.url;
            }

            // Submit ticket
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, category, subject, description, screenshot_url: screenshotUrl }),
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.error === 'rate_limited') {
                    setError(data.message);
                } else {
                    setError(data.error || 'Failed to submit ticket. Please try again.');
                }
                setSubmitting(false);
                return;
            }

            setView('success');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetAndClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-4 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-4 border-black bg-black text-white">
                    <div className="flex items-center gap-2 font-bold">
                        <MessageCircle className="w-5 h-5 text-yellow-400" />
                        <span>Contact Support</span>
                    </div>
                    <button onClick={resetAndClose} className="hover:bg-white/20 p-1 transition-colors rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* View: Category */}
                {view === 'category' && (
                    <div className="p-5">
                        <p className="text-sm text-gray-600 mb-4 font-medium">What can we help you with?</p>
                        <div className="grid grid-cols-1 gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setCategory(cat.id); setView('details'); }}
                                    className="flex items-center gap-3 p-3 border-2 border-black hover:bg-yellow-400 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-left group"
                                >
                                    <span className="text-black">{cat.icon}</span>
                                    <div>
                                        <div className="font-bold text-sm">{cat.label}</div>
                                        <div className="text-xs text-gray-500 group-hover:text-gray-700">{cat.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* View: Details */}
                {view === 'details' && (
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
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

                        {/* Screenshot upload */}
                        <div>
                            <label className="block text-xs font-bold mb-1">Screenshot <span className="text-gray-400 font-normal">(optional, max 5MB)</span></label>
                            {screenshotPreview ? (
                                <div className="relative border-2 border-black p-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-32 object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                                        className="absolute top-1 right-1 bg-black text-white p-0.5 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed cursor-pointer p-6 text-center transition-colors ${isDragging ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 hover:border-black hover:bg-gray-50'}`}
                                >
                                    <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-500">Drag & drop or <span className="underline font-bold">click to browse</span></p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 bg-red-50 border-2 border-red-300 text-red-700 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="w-full py-3 bg-black text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading screenshot...' : submitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>
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
                        <button
                            onClick={resetAndClose}
                            className="w-full py-3 bg-yellow-400 text-black font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
