import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, ChevronRight, Wand2, Star, TrendingUp, Sparkles, Download, XCircle, Trash2 } from 'lucide-react';
import { CVData, Section } from '../types';
import CVPagedContent from './CVPagedContent';
import CVPreviewPane from './CVPreviewPane';
import { downloadPDF } from '../utils/pdf';
import Toast, { ToastType } from './Toast';
import LimitModal from './LimitModal';
import { motion } from 'framer-motion';

interface ReviewProps {
    cvData: CVData;
    setCvData: (data: CVData) => void;
    onNavigate: (step: string) => void;
    sections: Section[];
    selectedTemplate: string | null;
    aiCredits: number;
    setAiCredits: (credits: number) => void;
    tier: 'guest' | 'free' | 'pro';
    addToast?: (message: string, type: ToastType) => void;
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
    score_breakdown?: {
        completeness: number;
        impact: number;
        clarity: number;
    };
}

export default function Review({ cvData, setCvData, onNavigate, sections, selectedTemplate, aiCredits, setAiCredits, tier, addToast }: ReviewProps) {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<ReviewResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());
    const [ignoredItems, setIgnoredItems] = useState<Set<number>>(new Set());
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);
    const [showLimitModal, setShowLimitModal] = useState(false);

    const setToast = (toastObj: { message: string; type: ToastType } | null) => {
        if (toastObj && addToast) {
            addToast(toastObj.message, toastObj.type);
        }
    };

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

    const handleApplyFix = (idx: number, path: string | undefined, suggestion: string, improvement_type: string) => {
        if (!path) return;

        console.log("Applying fix:", { idx, path, suggestion, improvement_type });

        try {
            const newData = JSON.parse(JSON.stringify(cvData)); // Deep clone
            const parts = path.replace(/\]/g, '').split(/[.[]/); // "experience[0].description" -> ["experience", "0", "description"]

            let applied = false;

            if (improvement_type === 'remove') {
                // For remove: navigate to the parent array and splice out the element
                // e.g. path = "language[2].value" -> navigate to cvData.language, splice index 2
                // e.g. path = "skills[0].value" -> navigate to cvData.skills, splice index 0
                let arrayRef: any = newData;
                let arrayIndex = -1;

                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    const nextIsIndex = i + 1 < parts.length && /^\d+$/.test(parts[i + 1]);
                    if (nextIsIndex) {
                        // part is the array name, parts[i+1] is the numeric index
                        arrayRef = arrayRef[part];
                        arrayIndex = parseInt(parts[i + 1], 10);
                        // We found the array and index, stop here
                        break;
                    }
                    if (/^\d+$/.test(part)) {
                        // This is the index itself, the parent was already navigated
                        arrayIndex = parseInt(part, 10);
                        break;
                    }
                    if (arrayRef[part] === undefined) break;
                    arrayRef = arrayRef[part];
                }

                if (Array.isArray(arrayRef) && arrayIndex >= 0 && arrayIndex < arrayRef.length) {
                    arrayRef.splice(arrayIndex, 1);
                    applied = true;
                } else {
                    // Fallback: if path doesn't have array, try setting to empty string
                    console.warn('Remove: could not locate array element, falling back to empty string', path);
                    let current: any = newData;
                    for (let i = 0; i < parts.length - 1; i++) {
                        if (current[parts[i]] === undefined) { break; }
                        current = current[parts[i]];
                    }
                    const lastPart = parts[parts.length - 1];
                    if (lastPart && current) { current[lastPart] = ''; applied = true; }
                }
            } else {
                // For fix: navigate to the target and set the suggestion value
                let current: any = newData;

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
                    if (typeof current[lastPart] === 'object' && current[lastPart] !== null && 'value' in current[lastPart]) {
                        current[lastPart].value = suggestion;
                    } else {
                        current[lastPart] = suggestion;
                    }
                    applied = true;
                }
            }

            if (applied) {
                console.log("Fix applied successfully to:", path);
                setCvData(newData);

                const newApplied = new Set(appliedFixes);
                newApplied.add(idx);
                setAppliedFixes(newApplied);
                setToast({ message: improvement_type === 'remove' ? 'Item removed successfully!' : 'Fix applied successfully!', type: 'success' });
            } else {
                console.warn("Failed to apply fix. Target reached but invalid.");
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4 text-center">
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
            <div className="bg-white border-4 border-black shadow-neo p-4 md:p-8 max-w-2xl mx-4 sm:mx-auto text-center mt-6 md:mt-10 mb-8">
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
                    <motion.button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        whileHover={analyzing ? {} : { x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                        whileTap={analyzing ? {} : { scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="px-8 py-3 font-bold text-white bg-primary border-2 border-black shadow-neo flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Wand2 className="w-5 h-5" />
                        {analyzing ? 'Analyzing...' : tier === 'guest' ? 'Log in to Analyze' : `Analyze My CV (${aiCredits} left)`}
                    </motion.button>
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
        <div className="py-8 px-4 sm:px-0 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Panel - Analysis */}
                <div className="flex-1 space-y-6 lg:max-w-[800px]">
                    {/* Header / Score */}
                    <div className="bg-white border-4 border-black shadow-neo p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
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
                    
                    {result.score_breakdown && (
                        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
                            <div className="bg-gray-50 border-2 border-black rounded p-2 text-center shadow-neo-sm">
                                <span className="block text-lg font-black text-black">{result.score_breakdown.completeness}<span className="text-sm font-bold text-gray-400">/30</span></span>
                                <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-600">Completeness</span>
                            </div>
                            <div className="bg-gray-50 border-2 border-black rounded p-2 text-center shadow-neo-sm">
                                <span className="block text-lg font-black text-black">{result.score_breakdown.impact}<span className="text-sm font-bold text-gray-400">/40</span></span>
                                <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-600">Impact</span>
                            </div>
                            <div className="bg-gray-50 border-2 border-black rounded p-2 text-center shadow-neo-sm">
                                <span className="block text-lg font-black text-black">{result.score_breakdown.clarity}<span className="text-sm font-bold text-gray-400">/30</span></span>
                                <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-600">Clarity</span>
                            </div>
                        </div>
                    )}
                </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Improvements */}
                        <div className="space-y-4 lg:col-span-1">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <div className="bg-red-100 p-2 border-2 border-black rounded-lg">
                            <TrendingUp className="w-5 h-5 text-red-600" />
                        </div>
                        Improvements Needed
                    </h3>
                    {result.improvements.map((item, idx) => {
                        if (ignoredItems.has(idx)) return null;

                        return (
                            <div key={idx} 
                                 className="bg-white border-2 border-black p-4 shadow-neo-sm relative group transition-transform duration-200 hover:-translate-y-1 hover:shadow-neo"
                                 onMouseEnter={() => setHoveredPath(item.target_path || null)}
                                 onMouseLeave={() => setHoveredPath(null)}
                            >
                                <button
                                    onClick={() => {
                                        const newIgnored = new Set(ignoredItems);
                                        newIgnored.add(idx);
                                        setIgnoredItems(newIgnored);
                                    }}
                                    className="absolute top-2 right-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
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
                                        onClick={() => handleApplyFix(idx, item.target_path, item.suggestion, item.improvement_type)}
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
            </div>

                {/* Right Panel - Sticky Preview (Desktop) */}
                <div className="hidden lg:block lg:w-[450px] xl:w-[500px] sticky top-8 self-start border-4 border-black shadow-neo bg-white p-4">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 border-b-4 border-black pb-2 text-primary">
                        <Wand2 className="w-5 h-5 text-purple-600" /> Live Preview
                    </h3>
                    <div className="bg-gray-100 p-2 rounded-lg -mx-2 -mb-2 overflow-hidden">
                        <CVPreviewPane
                            cvData={cvData}
                            sections={sections}
                            selectedTemplate={selectedTemplate}
                            tier={tier}
                            highlightedPath={hoveredPath}
                            suggestedPaths={result.improvements.filter((_, idx) => !ignoredItems.has(idx) && _.target_path).map(i => i.target_path as string)}
                            pageIdPrefix="desktop-preview"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Preview Panel (Bottom Stack) */}
            <div className="lg:hidden mt-8 border-4 border-black shadow-neo bg-white p-4">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2 border-b-4 border-black pb-2 text-primary">
                    <Wand2 className="w-5 h-5 text-purple-600" /> Live Preview
                </h3>
                <div className="bg-gray-100 p-2 rounded-lg -mx-2 -mb-2 overflow-hidden">
                    <CVPreviewPane
                        cvData={cvData}
                        sections={sections}
                        selectedTemplate={selectedTemplate}
                        tier={tier}
                        highlightedPath={hoveredPath}
                        suggestedPaths={result.improvements.filter((_, idx) => !ignoredItems.has(idx) && _.target_path).map(i => i.target_path as string)}
                        pageIdPrefix="mobile-preview"
                    />
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-center border-t-4 border-black pt-6 md:pt-8 gap-4 px-4 sm:px-0">
                <motion.button
                    onClick={() => downloadPDF(cvData, undefined, tier)}
                    whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="w-full sm:w-auto px-8 py-3 font-bold text-white bg-green-600 border-2 border-black shadow-neo flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Download PDF
                </motion.button>
                <motion.button
                    onClick={() => onNavigate('fill')}
                    whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="w-full sm:w-auto px-8 py-3 font-bold text-white bg-black border-2 border-black shadow-neo flex items-center justify-center gap-2"
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Back to Editor
                </motion.button>
            </div>

            {/* Off-screen paginated pages for PDF generation — NOT display:none, must stay in layout */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: 0,
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
            >
                <CVPagedContent
                    cvData={cvData}
                    sections={sections}
                    selectedTemplate={selectedTemplate}
                    tier={tier}
                    pageIdPrefix="pdf-page"
                />
            </div>
        </div>
    );
}
