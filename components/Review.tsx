import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, ChevronRight, Wand2, Star, TrendingUp, Sparkles, Download, XCircle, Trash2 } from 'lucide-react';
import { CVData, Section } from '../types';
import CVPreview from './CVPreview';
import { downloadPDF } from '../utils/pdf';
import Toast, { ToastType } from './Toast';
import LimitModal from './LimitModal';

interface ReviewProps {
    cvData: CVData;
    setCvData: (data: CVData) => void;
    onNavigate: (step: string) => void;
    sections: Section[];
    selectedTemplate: string | null;
    aiCredits: number;
    setAiCredits: (credits: number) => void;
    tier: 'guest' | 'free' | 'pro';
}

// Mock Data Types
interface ReviewResult {
    score: number;
    summary: string;
    strengths: string[];
    improvements: {
        section: string;
        improvement_type: 'fix' | 'warning' | 'remove';
        feedback: string;
        target_path?: string;
        original?: string;
        suggestion: string;
    }[];
}

export default function Review({ cvData, setCvData, onNavigate, sections, selectedTemplate, aiCredits, setAiCredits, tier }: ReviewProps) {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<ReviewResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());
    const [ignoredItems, setIgnoredItems] = useState<Set<number>>(new Set());
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [showLimitModal, setShowLimitModal] = useState(false);

    // Refinement State
    const [refiningIdx, setRefiningIdx] = useState<number | null>(null);
    const [refineInput, setRefineInput] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    const handleRefineSubmit = async (idx: number, item: any) => {
        if (!refineInput.trim()) return;
        setIsRefining(true);
        try {
            const response = await fetch('/api/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    original_text: item.original,
                    current_suggestion: item.suggestion,
                    user_instruction: refineInput,
                    section_context: item.section
                }),
            });
            const data = await response.json();

            if (data.refined_suggestion) {
                // Update local state
                if (result) {
                    const newImprovements = [...result.improvements];
                    newImprovements[idx] = {
                        ...newImprovements[idx],
                        suggestion: data.refined_suggestion,
                        improvement_type: 'fix', // Upgrade to fix so user can apply it
                        target_path: newImprovements[idx].target_path || item.target_path // Ensure path is preserved
                    };
                    setResult({ ...result, improvements: newImprovements });
                    setRefiningIdx(null);
                    setRefineInput('');
                }
            }
        } catch (e) {
            console.error("Refine failed", e);
        } finally {
            setIsRefining(false);
        }
    };

    const handleApplyFix = (idx: number, path: string | undefined, suggestion: string) => {
        if (!path) return;

        console.log("Applying fix:", { idx, path, suggestion });

        try {
            const newData = JSON.parse(JSON.stringify(cvData)); // Deep clone
            let current: any = newData;
            const parts = path.replace(/\]/g, '').split(/[.\[]/); // "experience[0].description" -> ["experience", "0", "description"]

            let applied = false;

            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (current[part] === undefined) {
                    console.warn(`Path segment '${part}' not found in`, current);
                    setToast({ message: `Could not find field: ${part}`, type: 'error' });
                    return;
                }
                current = current[part];
            }

            const lastPart = parts[parts.length - 1];
            if (lastPart && current) {
                current[lastPart] = suggestion;
                applied = true;
            }

            if (applied) {
                console.log("Fix applied successfully to:", path);
                setCvData(newData);

                const newApplied = new Set(appliedFixes);
                newApplied.add(idx);
                setAppliedFixes(newApplied);
                setToast({ message: 'Fix applied successfully!', type: 'success' });
            } else {
                console.warn("Failed to apply fix. Target reached but invalid:", current, lastPart);
                setToast({ message: 'Failed to apply fix', type: 'error' });
            }

        } catch (e) {
            console.error("Failed to apply fix:", e);
            setToast({ message: 'Error applying fix', type: 'error' });
        }
    };

    const handleAnalyze = async () => {
        // 1. Guest Check -> Must Login
        if (tier === 'guest') {
            window.location.href = '/login'; // Or open a login modal
            return;
        }

        // 2. Credit Check
        if (tier === 'free' && aiCredits <= 0) {
            setShowLimitModal(true);
            return;
        }

        // Pro users: We check 50 limit on backend, but UI should also respect it if we passed it correctly
        if (tier === 'pro' && aiCredits <= 0) {
            setToast({ message: 'Daily pro limit reached (50/day). Please try again tomorrow.', type: 'error' });
            return;
        }

        setAnalyzing(true);
        setError(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvData }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === 'LIMIT_REACHED') {
                    setShowLimitModal(true);
                    throw new Error(data.error); // Stop execution
                }
                throw new Error(data.error || 'Failed to analyze CV');
            }

            setResult(data);
            // Decrement local credits on success to reflect change immediately
            setAiCredits(Math.max(0, aiCredits - 1));

        } catch (err: any) {
            if (err.message !== 'Daily limit reached. Upgrade to Pro for more.') {
                console.error(err);
                setError(err.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setAnalyzing(false);
        }
    };

    if (analyzing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-gray-200 rounded-full animate-spin border-t-primary"></div>
                    <Wand2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold">Analyzing your CV...</h2>
                <p className="text-gray-500">Our AI is checking for formatting, impact, and clarity.</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="bg-white border-4 border-black shadow-neo p-4 md:p-8 max-w-2xl mx-auto text-center mt-6 md:mt-10">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
                    <Star className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Ready to Review?</h2>
                <p className="text-gray-600 mb-8 text-lg">
                    Get an instant AI score and actionable feedback to improve your chances.
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center gap-2 text-left">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => onNavigate('fill')}
                        className="px-6 py-3 font-bold border-2 border-black hover:bg-gray-100 transition-all"
                    >
                        Back to Edit
                    </button>
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="px-8 py-3 font-bold text-white bg-primary border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Wand2 className="w-5 h-5" />
                        {analyzing ? 'Analyzing...' : tier === 'guest' ? 'Log in to Analyze' : `Analyze My CV (${aiCredits} left)`}
                    </button>
                </div>
                <LimitModal
                    isOpen={showLimitModal}
                    onClose={() => setShowLimitModal(false)}
                    tier={tier}
                    mode="ai"
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Score */}
            <div className="bg-white border-4 border-black shadow-neo mb-6 md:mb-8 p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                <div className="relative w-40 h-40 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-gray-200"
                        />
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={440}
                            strokeDashoffset={440 - (440 * result.score) / 100}
                            className={`transition-all duration-1000 ${result.score >= 80 ? 'text-green-500' :
                                result.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                                }`}
                        />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <span className="text-4xl font-black">{result.score}</span>
                        <span className="block text-xs font-bold uppercase text-gray-500">Score</span>
                    </div>
                </div>

                <div className="flex-1 text-left">
                    <h2 className="text-3xl font-bold mb-2">Review Summary</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">{result.summary}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Improvements */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <div className="bg-red-100 p-2 border-2 border-black rounded-lg">
                            <TrendingUp className="w-5 h-5 text-red-600" />
                        </div>
                        Improvements Needed
                    </h3>
                    {result.improvements.map((item, idx) => {
                        if (ignoredItems.has(idx)) return null;

                        return (
                            <div key={idx} className="bg-white border-2 border-black p-4 shadow-neo-sm relative group">
                                <button
                                    onClick={() => {
                                        const newIgnored = new Set(ignoredItems);
                                        newIgnored.add(idx);
                                        setIgnoredItems(newIgnored);
                                    }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                    title="Ignore this suggestion"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>

                                <div className="flex justify-between items-start mb-2 pr-8">
                                    <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded border border-black">
                                        {item.section}
                                    </span>
                                </div>
                                <p className="font-bold mb-2 text-red-600">{item.feedback}</p>

                                {item.original && (
                                    <div className={`mb-3 p-3 border-l-4 ${item.improvement_type === 'warning' ? 'bg-yellow-50 border-yellow-400' : 'bg-red-50 border-red-200'}`}>
                                        <p className="text-xs font-bold text-gray-500 mb-1">ORIGINAL:</p>
                                        <p className={`text-sm text-gray-700 italic opacity-70 ${item.improvement_type === 'fix' || item.improvement_type === 'remove' ? 'line-through decoration-red-400' : ''}`}>"{item.original}"</p>
                                    </div>
                                )}

                                <div className={`p-3 border-l-4 ${item.improvement_type === 'warning' ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'}`}>
                                    <p className={`text-xs font-bold mb-1 flex items-center gap-1 ${item.improvement_type === 'warning' ? 'text-yellow-700' : 'text-green-700'}`}>
                                        {item.improvement_type === 'warning' ? <AlertCircle className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                                        {item.improvement_type === 'warning' ? 'RECOMMENDATION:' : item.improvement_type === 'remove' ? 'REMOVE:' : 'SUGGESTED REWRITE:'}
                                    </p>
                                    <p className="text-sm text-gray-800 font-medium">"{item.suggestion}"</p>

                                    {/* Refinement UI */}
                                    {refiningIdx === idx ? (
                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                            <textarea
                                                value={refineInput}
                                                onChange={(e) => setRefineInput(e.target.value)}
                                                placeholder="E.g., 'Make it shorter', 'Mention I used React', 'Fill placeholder with...'"
                                                className="w-full text-sm p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-black focus:outline-none"
                                                rows={2}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRefineSubmit(idx, item)}
                                                    disabled={isRefining}
                                                    className="flex-1 bg-black text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1"
                                                >
                                                    {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                                    Generate
                                                </button>
                                                <button
                                                    onClick={() => setRefiningIdx(null)}
                                                    className="px-3 bg-gray-200 text-black text-xs font-bold rounded hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setRefiningIdx(idx);
                                                setRefineInput('');
                                            }}
                                            className="mt-2 text-xs font-bold text-gray-500 hover:text-black underline flex items-center gap-1"
                                        >
                                            <Wand2 className="w-3 h-3" />
                                            Refine/Provide Context
                                        </button>
                                    )}
                                </div>

                                {(item.improvement_type === 'fix' || item.improvement_type === 'remove') && item.target_path && !refiningIdx && (
                                    <button
                                        onClick={() => handleApplyFix(idx, item.target_path, item.suggestion)}
                                        disabled={appliedFixes.has(idx)}
                                        className={`mt-4 w-full py-2 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${appliedFixes.has(idx)
                                            ? 'bg-green-600 text-white cursor-default'
                                            : item.improvement_type === 'remove'
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : 'bg-black text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        {appliedFixes.has(idx) ? (
                                            <>
                                                <CheckCircle className="w-3 h-3" />
                                                {item.improvement_type === 'remove' ? 'Removed' : 'Applied'}
                                            </>
                                        ) : (
                                            <>
                                                {item.improvement_type === 'remove' ? <Trash2 className="w-3 h-3" /> : <Wand2 className="w-3 h-3" />}
                                                {item.improvement_type === 'remove' ? 'Remove with AI' : 'Fix with AI'}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Strengths */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <div className="bg-green-100 p-2 border-2 border-black rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        Strengths
                    </h3>
                    <div className="bg-white border-2 border-black p-4 md:p-6 shadow-neo-sm">
                        <ul className="space-y-4">
                            {result.strengths.map((str, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">{str}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-center border-t-4 border-black pt-6 md:pt-8 gap-4 px-4 sm:px-0">
                <button
                    onClick={() => downloadPDF(cvData, 'cv-preview-for-pdf', tier)}
                    className="w-full sm:w-auto px-8 py-3 font-bold text-white bg-green-600 border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Download PDF
                </button>
                <button
                    onClick={() => onNavigate('fill')}
                    className="w-full sm:w-auto px-8 py-3 font-bold text-white bg-black border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Back to Editor
                </button>
            </div>

            {/* Hidden Preview for PDF Generation */}
            <div id="cv-preview-for-pdf" className="hidden">
                <CVPreview
                    cvData={cvData}
                    sections={sections}
                    selectedTemplate={selectedTemplate}
                />
            </div>

            {/* Toast Feedback */}
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
