'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, ChevronRight, ChevronLeft, Sparkles, CheckCircle, FileText, Copy, Download, RefreshCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { jsPDF } from 'jspdf';
import Toast, { ToastType } from './Toast';
import PlanCard from './PlanCard'; // Added import

interface CV {
    id: string;
    title: string;
    updated_at: string;
}

interface GeneratedLetter {
    id: string;
    content: string;
    job_title: string;
    company_name: string;
    tone: string;
    created_at: string;
    title: string; // Added title
}

const TONES = ['Professional', 'Enthusiastic', 'Confident', 'Creative'];

export default function CoverLetterWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const coverLetterId = searchParams.get('id');
    const supabase = createClient();
    const { t } = useLanguage();

    // Steps: 0=Select CV, 1=Job Details, 2=Preview
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [cvs, setCvs] = useState<CV[]>([]);
    const [selectedCvId, setSelectedCvId] = useState<string | null>(null);

    // Job Details
    const [title, setTitle] = useState(''); // User defined name for this cover letter
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [keySkills, setKeySkills] = useState('');
    const [tone, setTone] = useState('Professional');
    const [language, setLanguage] = useState<'en' | 'id'>('en'); // New state

    // Result
    const [generatedLetter, setGeneratedLetter] = useState<GeneratedLetter | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // New state for PlanCard
    const [tier, setTier] = useState<'guest' | 'free' | 'pro'>('guest');
    const [aiCredits, setAiCredits] = useState<number>(0);

    // Fetch user's CVs and Profile on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch CVs
            const { data: cvData } = await supabase
                .from('cvs')
                .select('id, title, updated_at')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (cvData) setCvs(cvData);

            // Fetch Profile (tier + credits) - logic from Fill.tsx
            const { data: profile } = await supabase
                .from('profiles')
                .select('tier, daily_credits_used, last_credit_reset')
                .eq('id', user.id)
                .single();

            if (profile) {
                setTier(profile.tier as any);

                // Client-side credit calculation (same as Fill.tsx)
                const now = new Date();
                const lastReset = new Date(profile.last_credit_reset || 0);
                const hoursSinceReset = Math.abs(now.getTime() - lastReset.getTime()) / 36e5;

                const limit = profile.tier === 'pro' ? 50 : 1;
                let currentUsage = profile.daily_credits_used || 0;

                // If > 24h passed, treat as reset (0 usage)
                // Note: The actual DB reset happens on the next API call, but we show 0 here for UI
                if (hoursSinceReset >= 24) {
                    currentUsage = 0;
                }

                setAiCredits(Math.max(0, limit - currentUsage));
            }
        };
        if (coverLetterId) {
            const fetchCoverLetter = async () => {
                const { data, error } = await supabase
                    .from('cover_letters')
                    .select('*')
                    .eq('id', coverLetterId)
                    .single();

                if (data) {
                    setGeneratedLetter({
                        id: data.id,
                        content: data.content || '',
                        job_title: data.job_title,
                        company_name: data.company_name,
                        tone: data.tone,
                        created_at: data.created_at,
                        title: data.title || '' // Added title
                    });

                    // Pre-fill fields
                    setTitle(data.title || '');
                    setJobTitle(data.job_title || '');
                    setCompanyName(data.company_name || '');
                    setJobDescription(data.job_description || '');
                    setTone(data.tone || 'Professional');
                    if (data.cv_id) setSelectedCvId(data.cv_id);

                    // If content exists, go to preview, else step 1 (job details)
                    if (data.content) {
                        setStep(2);
                    } else {
                        setStep(1);
                    }
                }
            };
            fetchCoverLetter();
        }
        fetchInitialData();
    }, [coverLetterId]);

    const handleGenerate = async () => {
        if (!selectedCvId || !jobTitle || !companyName || !jobDescription) {
            setToast({ message: 'Please fill all fields', type: 'error' });
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/api/cover-letter/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: generatedLetter?.id, // Pass ID if it exists
                    cvId: selectedCvId,
                    title: title || `Cover Letter for ${companyName}`,
                    jobTitle,
                    companyName,
                    jobDescription,
                    keySkills,
                    tone,
                    language // Pass language to API
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle partial success (generated but not saved)
                if (data.content) {
                    setGeneratedLetter({
                        id: generatedLetter?.id || '', // Keep existing ID or empty if new
                        content: data.content,
                        title: title || '',
                        job_title: jobTitle,
                        company_name: companyName,
                        tone: tone,
                        created_at: new Date().toISOString()
                    });
                    setStep(2);
                    setToast({ message: 'Letter generated but could not be saved to history. Please download or copy it now.', type: 'error' });
                    setAiCredits(prev => Math.max(0, prev - 1)); // Still decrement as we generated
                    return;
                }
                throw new Error(data.error || 'Generation failed');
            }

            setGeneratedLetter({
                id: data.id,
                content: data.content,
                job_title: data.job_title,
                company_name: data.company_name,
                tone: data.tone,
                created_at: data.created_at,
                title: data.title || title || '' // Added title
            });
            setAiCredits(prev => Math.max(0, prev - 1)); // Decrement credits locally
            setStep(2); // Go to preview
        } catch (error: any) {
            console.error(error);
            setToast({ message: error.message, type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedLetter?.content) return;
        // Strip HTML tags for clipboard text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = generatedLetter.content;
        const text = tempDiv.textContent || tempDiv.innerText || '';

        navigator.clipboard.writeText(text);
        setToast({ message: 'Copied to clipboard!', type: 'success' });
    };

    const downloadPDF = () => {
        if (!generatedLetter) return;
        // Simple PDF generation
        const doc = new jsPDF();
        const splitText = doc.splitTextToSize(doc.getTextDimensions(generatedLetter.content).w > 180 ? generatedLetter.content.replace(/<[^>]+>/g, '\n') : generatedLetter.content.replace(/<[^>]+>/g, '\n'), 180);

        doc.setFontSize(12);
        doc.text(splitText, 15, 20);
        doc.save(`${companyName}_Cover_Letter.pdf`);
        setToast({ message: 'Downloading PDF...', type: 'success' });
    };

    // --- RENDER STEPS ---

    const renderStep1_SelectCV = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    {t.coverLetter.selectCv}
                </h2>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 underline"
                >
                    {t.coverLetter.backToDashboard}
                </button>
            </div>
            <p className="text-gray-600">{t.coverLetter.createDesc}</p>

            {cvs.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                    <p>{t.coverLetter.noCvs}</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {cvs.map(cv => (
                        <div
                            key={cv.id}
                            onClick={() => setSelectedCvId(cv.id)}
                            className={`p-4 border-2 cursor-pointer transition-all ${selectedCvId === cv.id
                                ? 'border-primary bg-primary/5 shadow-neo-sm'
                                : 'border-gray-200 hover:border-black'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold">{cv.title || 'Untitled CV'}</h3>
                                {selectedCvId === cv.id && <CheckCircle className="w-5 h-5 text-primary" />}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Last updated: {new Date(cv.updated_at).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => setStep(1)}
                    disabled={!selectedCvId}
                    className="px-6 py-3 bg-blue-600 text-white font-bold flex items-center gap-2 border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                    {t.coverLetter.nextStep} <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderStep2_JobDetails = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {t.coverLetter.jobDetails}
            </h2>

            <div className="space-y-2">
                <label className="text-sm font-bold">{t.coverLetter.docTitle}</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Google Application Letter"
                    className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold">{t.coverLetter.jobTitle}</label>
                    <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Senior Product Designer"
                        className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold">{t.coverLetter.companyName}</label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold">{t.coverLetter.jobDesc}</label>
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full p-3 border-2 border-black rounded-none h-40 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold">{t.coverLetter.keySkills}</label>
                <input
                    type="text"
                    value={keySkills}
                    onChange={(e) => setKeySkills(e.target.value)}
                    placeholder="e.g. React, TypeScript, Leadership"
                    className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold">{t.coverLetter.tone}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {TONES.map(t => (
                        <button
                            key={t}
                            onClick={() => setTone(t)}
                            className={`p-2 border-2 font-bold text-sm transition-all ${tone === t
                                ? 'bg-blue-600 text-white border-black'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold">{t.coverLetter.language}</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setLanguage('en')}
                        className={`p-2 border-2 font-bold text-sm transition-all ${language === 'en'
                            ? 'bg-blue-600 text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                            }`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setLanguage('id')}
                        className={`p-2 border-2 font-bold text-sm transition-all ${language === 'id'
                            ? 'bg-blue-600 text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                            }`}
                    >
                        Bahasa Indonesia
                    </button>
                </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-between pt-4 gap-4">
                <button
                    onClick={() => setStep(0)}
                    className="w-full md:w-auto px-6 py-3 border-2 border-black font-bold hover:bg-gray-100 transition-colors"
                >
                    {t.coverLetter.back}
                </button>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !jobTitle || !companyName || !jobDescription}
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold flex items-center justify-center gap-2 border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isGenerating ? t.coverLetter.generating : t.coverLetter.generate}
                </button>
            </div>
        </div>
    );

    const renderStep3_Preview = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    {t.coverLetter.previewHandler}
                </h2>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <button
                        onClick={copyToClipboard}
                        className="w-full md:w-auto flex-1 md:flex-none px-4 py-2 border-2 border-black font-bold hover:bg-gray-100 flex items-center justify-center gap-2"
                    >
                        <Copy className="w-4 h-4" /> {t.coverLetter.copy}
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="w-full md:w-auto flex-1 md:flex-none px-4 py-2 bg-primary text-white border-2 border-black font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-neo-sm transition-all flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" /> {t.coverLetter.download}
                    </button>
                </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-8 shadow-sm min-h-[500px] prose max-w-none">
                {/* Dangerously set HTML since backend returns HTML paragraphs */}
                <div dangerouslySetInnerHTML={{ __html: generatedLetter?.content || '' }} />
            </div>

            <div className="flex justify-start pt-4 border-t border-gray-200">
                <button
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-500 font-bold hover:text-blue-600 flex items-center gap-1"
                >
                    <RefreshCcw className="w-3 h-3" /> {t.coverLetter.startOver}
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Progress Stepper & Stats Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                <div className="flex items-center gap-4">
                    {[0, 1, 2].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step === s ? 'bg-primary text-white border-black' :
                                step > s ? 'bg-green-500 text-white border-black' : 'bg-gray-100 text-gray-400 border-gray-200'
                                }`}>
                                {step > s ? <CheckCircle className="w-5 h-5" /> : s + 1}
                            </div>
                            {s < 2 && <div className={`w-12 h-1 bg-gray-200 ${step > s ? 'bg-green-500' : ''}`} />}
                        </div>
                    ))}
                </div>

                {/* AI Credits & Plan Card */}
                {tier !== 'guest' && (
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-50 border-4 border-black shadow-neo px-4 py-2 font-bold text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            AI Credits: <span className="text-purple-600">{aiCredits}</span>
                        </div>
                        <PlanCard tier={tier} />
                    </div>
                )}
            </div>

            <div className="bg-white border-4 border-black p-6 md:p-8 shadow-neo">
                {step === 0 && renderStep1_SelectCV()}
                {step === 1 && renderStep2_JobDetails()}
                {step === 2 && renderStep3_Preview()}
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
