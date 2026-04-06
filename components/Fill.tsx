'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
    ChevronLeft, Trash2, Info, GripVertical, X, Plus, Sparkles, Download, Menu, Crown, Lock, Loader2, Check
} from 'lucide-react';
import LimitModal from './LimitModal';
import SlideIn from './SlideIn';
import { CVData, Section } from '../types';
import CVPreviewPane from './CVPreviewPane';
import CVPagedContent from './CVPagedContent';
import { downloadPDF } from '../utils/pdf';
import { templates } from './CVPreview';
import Navbar from './Navbar';
import PlanCard from './PlanCard';
import { motion, AnimatePresence, Reorder, LayoutGroup } from 'framer-motion';

interface FillProps {
    cvData: CVData;
    setCvData: (data: CVData) => void;
    sections: Section[];
    aiCredits: number;
    setAiCredits: (credits: number) => void;
    selectedTemplate: string | null;
    setSelectedTemplate: (id: string) => void;
    onNavigate: (step: string) => void;
    onClearData: () => void;
    isCloud?: boolean;
    onSave?: () => void;
    isSaving?: boolean;
    tier?: 'guest' | 'free' | 'pro';
    addToast: (message: string, type: import('./Toast').ToastType, duration?: number, action?: { label: string; onClick: () => void }) => string;
    removeToast: (id: string) => void;
}

const Tooltip = ({ id, text }: { id: string; text: string }) => {
    const [active, setActive] = useState(false);
    return (
        <div className="relative inline-block">
            <button
                type="button"
                onMouseEnter={() => setActive(true)}
                onMouseLeave={() => setActive(false)}
                onClick={() => setActive(!active)}
                className="text-blue-500 hover:text-blue-700 ml-1"
            >
                <Info className="w-4 h-4 inline" />
            </button>
            {active && (
                <div className="absolute z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg -top-2 left-6">
                    {text}
                    <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                </div>
            )}
        </div>
    );
};

export default function Fill({
    cvData,
    setCvData,
    sections,
    aiCredits,
    setAiCredits,
    selectedTemplate,
    setSelectedTemplate,
    onNavigate,
    onClearData,
    isCloud,
    onSave,
    isSaving,
    tier = 'guest',
    addToast,
    removeToast,
}: FillProps) {
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [activeSection, setActiveSection] = useState('contact');
    const [draggingSection, setDraggingSection] = useState<string | null>(null);

    // --- Undo Delete ---
    const pendingDeleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeUndoToastIdRef = useRef<string | null>(null);
    // Keep a ref that always points to the latest cvData so the undo callback
    // (which is a frozen closure passed to addToast) can read the current state.
    const cvDataRef = useRef(cvData);
    cvDataRef.current = cvData;
    // Stores only the deleted item info — no snapshot
    const pendingDeleteRef = useRef<{
        field: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item: any;
        idx: number;
        label: string;
    } | null>(null);

    const handleUndoDelete = React.useCallback(() => {
        const pd = pendingDeleteRef.current;
        if (!pd) return;
        if (pendingDeleteTimerRef.current) clearTimeout(pendingDeleteTimerRef.current);
        // Read the CURRENT cvData (not a snapshot) and splice the item back in
        const currentData = cvDataRef.current;
        let newCvData: CVData;
        if (pd.field === 'customFields') {
            const arr = [...currentData.personal.customFields];
            arr.splice(pd.idx, 0, pd.item);
            newCvData = { ...currentData, personal: { ...currentData.personal, customFields: arr } };
        } else {
            const arr = [...(currentData[pd.field as keyof CVData] as unknown[])];
            arr.splice(pd.idx, 0, pd.item);
            newCvData = { ...currentData, [pd.field]: arr };
        }
        setCvData(newCvData);
        pendingDeleteRef.current = null;
        if (activeUndoToastIdRef.current) {
            removeToast(activeUndoToastIdRef.current);
            activeUndoToastIdRef.current = null;
        }
        pendingDeleteTimerRef.current = null;
    }, [setCvData, removeToast]);

    const handleSoftDelete = (field: string, item: unknown, idx: number, label: string) => {
        if (pendingDeleteTimerRef.current) clearTimeout(pendingDeleteTimerRef.current);
        // Dismiss any previous undo toast immediately
        if (activeUndoToastIdRef.current) {
            removeToast(activeUndoToastIdRef.current);
            activeUndoToastIdRef.current = null;
        }
        // Remove immediately from cvData
        let newCvData: CVData;
        if (field === 'customFields') {
            newCvData = { ...cvData, personal: { ...cvData.personal, customFields: cvData.personal.customFields.filter((_, i) => i !== idx) } };
        } else {
            const arr = cvData[field as keyof CVData] as unknown[];
            newCvData = { ...cvData, [field]: arr.filter((_, i) => i !== idx) };
        }
        setCvData(newCvData);
        // Store deleted item in ref (undo reads current cvData from cvDataRef)
        pendingDeleteRef.current = { field, item, idx, label };
        // Open 5s undo window
        const toastId = addToast(
            `${label} deleted.`,
            'error',
            5000,
            { label: 'Undo', onClick: handleUndoDelete }
        );
        activeUndoToastIdRef.current = toastId;
        pendingDeleteTimerRef.current = setTimeout(() => {
            pendingDeleteRef.current = null;
            activeUndoToastIdRef.current = null;

        }, 5000);
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTemplateId = e.target.value;
        const template = templates.find(t => t.id === newTemplateId);

        if (template?.isPremium && tier !== 'pro') {
            setShowLimitModal(true);
            return;
        }

        setSelectedTemplate(newTemplateId);
    };



    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar onNavigate={onNavigate} />

            <div className="flex-1 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2">Fill Your CV</h1>
                            <p className="text-black font-medium text-sm md:text-base">Complete each section below</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* AI Credits Card */}
                            <div className="bg-purple-50 border-4 border-black shadow-neo px-4 py-2 font-bold text-sm flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                AI Credits: <span className="text-purple-600">{aiCredits}</span>
                            </div>

                            {/* Plan Card */}
                            <PlanCard tier={tier} />

                            {isCloud && (
                                <div className="bg-white border-4 border-black shadow-neo px-4 py-2 font-bold text-sm flex items-center gap-2">
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                            <span className="text-gray-500">Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-green-600">Saved</span>
                                        </>
                                    )}
                                </div>
                            )}
                            <motion.button
                                onClick={onClearData}
                                whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="px-6 py-2 text-white bg-red-500 font-bold border-4 border-black shadow-neo-sm flex items-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                Clear
                            </motion.button>
                        </div>
                    </div>
                    <SlideIn delay={0.1}>
                    <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
                        <div className="order-1 space-y-6">
                            <button
                                onClick={() => onNavigate('sections')}
                                className="flex items-center gap-2 text-primary hover:text-blue-700 font-bold mb-4"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Back to Sections
                            </button>

                            {sections.find(s => s.id === 'personal' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-4 md:p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h2 className="text-xl text-black font-bold">Personal Info</h2>
                                        <Tooltip id="personal-info" text="Your contact information. Use professional details that employers can use to reach you." />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <label className="text-sm font-bold text-black">Full Name</label>
                                                <Tooltip id="name-tip" text="Use your full name as it appears on official documents" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                value={cvData.personal.name}
                                                onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, name: e.target.value } })}
                                                className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:shadow-neo-sm transition-all"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <label className="text-sm font-bold text-black">Email</label>
                                                <Tooltip id="email-tip" text="Use a professional email address" />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder="john.doe@email.com"
                                                value={cvData.personal.email}
                                                onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, email: e.target.value } })}
                                                className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:shadow-neo-sm transition-all"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <label className="text-sm font-bold text-black">Phone</label>
                                                <Tooltip id="phone-tip" text="Include country code for international applications" />
                                            </div>
                                            <input
                                                type="tel"
                                                placeholder="+62 812-3456-7890"
                                                value={cvData.personal.phone}
                                                onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, phone: e.target.value } })}
                                                className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:shadow-neo-sm transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-black block mb-1">Location</label>
                                            <input
                                                type="text"
                                                placeholder="Location (optional)"
                                                value={cvData.personal.location}
                                                onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, location: e.target.value } })}
                                                className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:shadow-neo-sm transition-all"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <div className="flex items-center gap-1 mb-2">
                                                <label className="text-sm font-bold text-black">Custom Fields</label>
                                                <Tooltip id="custom-tip" text="Add LinkedIn, GitHub, Portfolio, or other professional links" />
                                            </div>
                                            <AnimatePresence initial={false}>
                                            {cvData.personal.customFields.map((field, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                                    className="mb-2"
                                                >
                                                    {/* Mobile: stacked. sm+: side-by-side row */}
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Label"
                                                                value={field.label}
                                                                onChange={(e) => {
                                                                    const newFields = [...cvData.personal.customFields];
                                                                    newFields[idx].label = e.target.value;
                                                                    setCvData({ ...cvData, personal: { ...cvData.personal, customFields: newFields } });
                                                                }}
                                                                className="w-full px-4 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Value"
                                                                value={field.value}
                                                                onChange={(e) => {
                                                                    const newFields = [...cvData.personal.customFields];
                                                                    newFields[idx].value = e.target.value;
                                                                    setCvData({ ...cvData, personal: { ...cvData.personal, customFields: newFields } });
                                                                }}
                                                                className="w-full px-4 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => handleSoftDelete('customFields', field, idx, 'Custom field')}
                                                            className="text-red-500 font-bold border-2 border-transparent hover:border-black p-1 mt-1 flex-shrink-0"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            </AnimatePresence>

                                            {cvData.personal.customFields.length < 2 && (
                                                <button
                                                    onClick={() => {
                                                        setCvData({
                                                            ...cvData,
                                                            personal: {
                                                                ...cvData.personal,
                                                                customFields: [...cvData.personal.customFields, { id: crypto.randomUUID(), label: '', value: '' }]
                                                            }
                                                        });
                                                    }}
                                                    className="text-primary hover:text-blue-700 text-sm font-bold"
                                                >
                                                    + Add Custom Field
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {sections.find(s => s.id === 'summary' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-4 md:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl text-black font-bold">Summary</h2>
                                            <Tooltip id="summary-tip" text="Keep it brief - 2-3 sentences highlighting your strengths and goals" />
                                        </div>
                                        <span className={`text-sm font-bold ${cvData.summary.length > 500 ? 'text-red-600' : cvData.summary.length > 400 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                            {cvData.summary.length}/500
                                        </span>
                                    </div>
                                    <textarea
                                        placeholder="e.g., Experienced software engineer with 5+ years building scalable web applications..."
                                        value={cvData.summary}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 500) {
                                                setCvData({ ...cvData, summary: e.target.value });
                                            }
                                        }}
                                        rows={4}
                                        className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:shadow-neo-sm transition-all"
                                    />
                                </div>
                            )}

                            {sections.find(s => s.id === 'experience' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-4 md:p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                        <h2 className="text-xl text-gray-900 font-semibold">Experience</h2>
                                        <Tooltip id="exp-tip" text="List work experience in reverse chronological order. Use bullet points and quantify achievements." />
                                    </div>
                                    <div className="space-y-4">
                                        <LayoutGroup id="experience-section">
                                        <Reorder.Group axis="y" values={cvData.experience} onReorder={(reordered) => setCvData({ ...cvData, experience: reordered })} className="flex flex-col gap-4">
                                        <AnimatePresence initial={false}>
                                        {cvData.experience.map((exp, idx) => (
                                            <Reorder.Item
                                                key={exp.id || idx}
                                                value={exp}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                                layout={draggingSection === 'experience' ? true : undefined}
                                                onDragStart={() => setDraggingSection('experience')}
                                                onDragEnd={() => setDraggingSection(null)}
                                                className="p-4 border-2 border-black space-y-3 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors bg-white relative"
                                            >
                                                <div className="flex gap-2">
                                                    <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0 cursor-grab active:cursor-grabbing hover:text-gray-600" />
                                                    <div className="flex-1 space-y-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Job Title"
                                                            value={exp.title}
                                                            onChange={(e) => {
                                                                const newExp = [...cvData.experience];
                                                                newExp[idx].title = e.target.value;
                                                                setCvData({ ...cvData, experience: newExp });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Company"
                                                            value={exp.company}
                                                            onChange={(e) => {
                                                                const newExp = [...cvData.experience];
                                                                newExp[idx].company = e.target.value;
                                                                setCvData({ ...cvData, experience: newExp });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                type="month"
                                                                value={exp.startDate}
                                                                onChange={(e) => {
                                                                    const newExp = [...cvData.experience];
                                                                    newExp[idx].startDate = e.target.value;
                                                                    setCvData({ ...cvData, experience: newExp });
                                                                }}
                                                                className="px-3 py-2 border-2 border-black rounded-none text-sm bg-white focus:outline-none focus:shadow-neo-sm"
                                                            />
                                                            <input
                                                                type="month"
                                                                value={exp.endDate}
                                                                onChange={(e) => {
                                                                    const newExp = [...cvData.experience];
                                                                    newExp[idx].endDate = e.target.value;
                                                                    setCvData({ ...cvData, experience: newExp });
                                                                }}
                                                                disabled={exp.current}
                                                                className="px-3 py-2 border-2 border-black rounded-none text-sm bg-white focus:outline-none focus:shadow-neo-sm"
                                                            />
                                                        </div>
                                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                                            <input
                                                                type="checkbox"
                                                                checked={exp.current}
                                                                onChange={(e) => {
                                                                    const newExp = [...cvData.experience];
                                                                    newExp[idx].current = e.target.checked;
                                                                    if (e.target.checked) newExp[idx].endDate = '';
                                                                    setCvData({ ...cvData, experience: newExp });
                                                                }}
                                                            />
                                                            Currently working here
                                                        </label>
                                                        {/* Bullet point toolbar */}
                                                        {(() => {
                                                            const BULLETS = [
                                                                { label: 'None', char: '' },
                                                                { label: '•', char: '•' },
                                                                { label: '–', char: '–' },
                                                                { label: '▸', char: '▸' },
                                                                { label: '✓', char: '✓' },
                                                            ];
                                                            // Detect current bullet from first non-empty line
                                                            const firstLine = exp.description.split('\n').find(l => l.trim());
                                                            const activeBullet = BULLETS.find(b => b.char && firstLine?.trimStart().startsWith(b.char))?.char ?? '';

                                                            const applyBullet = (char: string) => {
                                                                const lines = exp.description.split('\n');
                                                                const newLines = lines.map(line => {
                                                                    const stripped = line.trimStart().replace(/^[•–▸✓]\s*/, '');
                                                                    return stripped ? (char ? `${char} ${stripped}` : stripped) : '';
                                                                });
                                                                const newExp = [...cvData.experience];
                                                                newExp[idx].description = newLines.join('\n');
                                                                setCvData({ ...cvData, experience: newExp });
                                                            };

                                                            return (
                                                                <div className="flex items-center gap-1 mb-1">
                                                                    <span className="text-xs text-gray-500 mr-1">Bullet:</span>
                                                                    {BULLETS.map(b => (
                                                                        <button
                                                                            key={b.label}
                                                                            type="button"
                                                                            onClick={() => applyBullet(b.char)}
                                                                            title={b.char ? `Use ${b.label} bullets` : 'No bullets'}
                                                                            className={`px-2 py-0.5 text-xs border font-mono transition-all ${activeBullet === b.char ? 'border-black bg-black text-white font-bold' : 'border-gray-300 bg-white text-gray-700 hover:border-black'}`}
                                                                        >
                                                                            {b.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })()}
                                                        <textarea
                                                            placeholder="Description... (press Enter for new line, bullet auto-added)"
                                                            value={exp.description}
                                                            onChange={(e) => {
                                                                const newExp = [...cvData.experience];
                                                                newExp[idx].description = e.target.value;
                                                                setCvData({ ...cvData, experience: newExp });
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key !== 'Enter') return;
                                                                // Detect active bullet from first non-empty line
                                                                const BULLET_CHARS = ['•', '–', '▸', '✓'];
                                                                const firstLine = exp.description.split('\n').find(l => l.trim());
                                                                const activeBullet = BULLET_CHARS.find(b => firstLine?.trimStart().startsWith(b));
                                                                if (!activeBullet) return; // no auto-insert needed
                                                                e.preventDefault();
                                                                const ta = e.currentTarget;
                                                                const start = ta.selectionStart;
                                                                const end = ta.selectionEnd;
                                                                const val = ta.value;
                                                                const insertion = `\n${activeBullet} `;
                                                                const newVal = val.slice(0, start) + insertion + val.slice(end);
                                                                const newExp = [...cvData.experience];
                                                                newExp[idx].description = newVal;
                                                                setCvData({ ...cvData, experience: newExp });
                                                                // Restore cursor after state update
                                                                requestAnimationFrame(() => {
                                                                    ta.selectionStart = ta.selectionEnd = start + insertion.length;
                                                                });
                                                            }}
                                                            rows={4}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                    </div>
                                                    <button
                                                    onClick={() => handleSoftDelete('experience', exp, idx, 'Experience')}
                                                        className="text-red-500"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                        </AnimatePresence>
                                        </Reorder.Group>
                                        </LayoutGroup>
                                        <button
                                            onClick={() => setCvData({ ...cvData, experience: [...cvData.experience, { id: crypto.randomUUID(), title: '', company: '', startDate: '', endDate: '', description: '', current: false }] })}
                                            className="w-full p-3 border-2 border-dashed border-black rounded-none hover:bg-primary hover:text-white transition-colors font-bold text-black"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add Experience
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sections.find(s => s.id === 'education' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-4 md:p-6">
                                    <h2 className="text-xl text-gray-900 font-semibold mb-4">Education</h2>
                                    <div className="space-y-4">
                                        <LayoutGroup id="education-section">
                                        <Reorder.Group axis="y" values={cvData.education} onReorder={(reordered) => setCvData({ ...cvData, education: reordered })} className="flex flex-col gap-4">
                                        <AnimatePresence initial={false}>
                                        {cvData.education.map((edu, idx) => (
                                            <Reorder.Item
                                                key={edu.id || idx}
                                                value={edu}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                                layout={draggingSection === 'education' ? true : undefined}
                                                onDragStart={() => setDraggingSection('education')}
                                                onDragEnd={() => setDraggingSection(null)}
                                                className="p-4 border-2 border-black space-y-3 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors bg-white relative"
                                            >
                                                <div className="flex gap-2">
                                                    <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0 cursor-grab active:cursor-grabbing hover:text-gray-600" />
                                                    <div className="flex-1 space-y-3">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <select
                                                                value={edu.degree}
                                                                onChange={(e) => {
                                                                    const newEdu = [...cvData.education];
                                                                    newEdu[idx].degree = e.target.value;
                                                                    setCvData({ ...cvData, education: newEdu });
                                                                }}
                                                                className="px-3 py-2 border rounded text-sm bg-white"
                                                            >
                                                                <option value="">Select Degree</option>
                                                                <option value="High School">High School</option>
                                                                <option value="Associate Degree">Associate</option>
                                                                <option value="Bachelor's Degree">Bachelor's</option>
                                                                <option value="Master's Degree">Master's</option>
                                                                <option value="Doctorate (PhD)">PhD</option>
                                                            </select>
                                                            <input
                                                                type="text"
                                                                placeholder="Major"
                                                                value={edu.major}
                                                                onChange={(e) => {
                                                                    const newEdu = [...cvData.education];
                                                                    newEdu[idx].major = e.target.value;
                                                                    setCvData({ ...cvData, education: newEdu });
                                                                }}
                                                                className="px-3 py-2 border-2 border-black rounded-none text-sm bg-white focus:outline-none focus:shadow-neo-sm"
                                                            />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Institution"
                                                            value={edu.institution}
                                                            onChange={(e) => {
                                                                const newEdu = [...cvData.education];
                                                                newEdu[idx].institution = e.target.value;
                                                                setCvData({ ...cvData, education: newEdu });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                        <input
                                                            type="month"
                                                            value={edu.year}
                                                            onChange={(e) => {
                                                                const newEdu = [...cvData.education];
                                                                newEdu[idx].year = e.target.value;
                                                                setCvData({ ...cvData, education: newEdu });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                    </div>
                                                    <button
                                                    onClick={() => handleSoftDelete('education', edu, idx, 'Education')}
                                                        className="text-red-500"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                        </AnimatePresence>
                                        </Reorder.Group>
                                        </LayoutGroup>
                                        <button
                                            onClick={() => setCvData({ ...cvData, education: [...cvData.education, { id: crypto.randomUUID(), degree: '', major: '', institution: '', year: '' }] })}
                                            className="w-full p-3 border-2 border-dashed border-black rounded-none hover:bg-primary hover:text-white transition-colors font-bold text-black"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add Education
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sections.find(s => s.id === 'skills' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-4 md:p-6">
                                    <h2 className="text-xl text-gray-900 font-semibold mb-4">Skills</h2>
                                    <div className="space-y-3">
                                        <LayoutGroup id="skills-section">
                                        <Reorder.Group axis="y" values={cvData.skills} onReorder={(reordered) => setCvData({ ...cvData, skills: reordered })} className="flex flex-col gap-3">
                                        <AnimatePresence initial={false}>
                                        {cvData.skills.map((skill, idx) => (
                                            <Reorder.Item
                                                key={skill.id || idx}
                                                value={skill}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                                layout={draggingSection === 'skills' ? true : undefined}
                                                onDragStart={() => setDraggingSection('skills')}
                                                onDragEnd={() => setDraggingSection(null)}
                                                className="flex gap-2 cursor-grab active:cursor-grabbing hover:bg-gray-100 p-2 border-2 border-transparent hover:border-gray-200 transition-colors bg-white relative"
                                            >
                                                <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0 cursor-grab active:cursor-grabbing hover:text-gray-600" />
                                                <input
                                                    type="text"
                                                    placeholder="Skill"
                                                    value={skill.value}
                                                    onChange={(e) => {
                                                        const newSkills = [...cvData.skills];
                                                        newSkills[idx] = { ...newSkills[idx], value: e.target.value };
                                                        setCvData({ ...cvData, skills: newSkills });
                                                    }}
                                                    className="flex-1 px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                />
                                                <button
                                                    onClick={() => handleSoftDelete('skills', skill, idx, 'Skill')}
                                                    className="text-red-500"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </Reorder.Item>
                                        ))}
                                        </AnimatePresence>
                                        </Reorder.Group>
                                        </LayoutGroup>
                                        <button
                                            onClick={() => setCvData({ ...cvData, skills: [...cvData.skills, { id: crypto.randomUUID(), value: '' }] })}
                                            className="w-full p-3 border-2 border-dashed border-black rounded-none hover:bg-primary hover:text-white transition-colors font-bold text-black"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add Skill
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sections.find(s => s.id === 'projects' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-4 md:p-6">
                                    <h2 className="text-xl text-gray-900 font-semibold mb-4">Projects</h2>
                                    <div className="space-y-4">
                                        <LayoutGroup id="projects-section">
                                        <Reorder.Group axis="y" values={cvData.projects || []} onReorder={(reordered) => setCvData({ ...cvData, projects: reordered })} className="flex flex-col gap-4">
                                        <AnimatePresence initial={false}>
                                        {(cvData.projects || []).map((project, idx) => (
                                            <Reorder.Item
                                                key={project.id || idx}
                                                value={project}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                                layout={draggingSection === 'projects' ? true : undefined}
                                                onDragStart={() => setDraggingSection('projects')}
                                                onDragEnd={() => setDraggingSection(null)}
                                                className="p-4 border-2 border-black space-y-3 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors bg-white relative"
                                            >
                                                <div className="flex gap-2">
                                                    <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0 cursor-grab active:cursor-grabbing hover:text-gray-600" />
                                                    <div className="flex-1 space-y-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Project Title"
                                                            value={project.title}
                                                            onChange={(e) => {
                                                                const newProjects = [...cvData.projects];
                                                                newProjects[idx].title = e.target.value;
                                                                setCvData({ ...cvData, projects: newProjects });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                        <textarea
                                                            placeholder="Description..."
                                                            value={project.description}
                                                            onChange={(e) => {
                                                                const newProjects = [...cvData.projects];
                                                                newProjects[idx].description = e.target.value;
                                                                setCvData({ ...cvData, projects: newProjects });
                                                            }}
                                                            rows={3}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Technologies (e.g., React, Node.js, MongoDB)"
                                                            value={project.technologies}
                                                            onChange={(e) => {
                                                                const newProjects = [...cvData.projects];
                                                                newProjects[idx].technologies = e.target.value;
                                                                setCvData({ ...cvData, projects: newProjects });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                        <input
                                                            type="url"
                                                            placeholder="Link (optional)"
                                                            value={project.link}
                                                            onChange={(e) => {
                                                                const newProjects = [...cvData.projects];
                                                                newProjects[idx].link = e.target.value;
                                                                setCvData({ ...cvData, projects: newProjects });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                    </div>
                                                    <button
                                                    onClick={() => handleSoftDelete('projects', project, idx, 'Project')}
                                                        className="text-red-500"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                        </AnimatePresence>
                                        </Reorder.Group>
                                        </LayoutGroup>
                                        <button
                                            onClick={() => setCvData({ ...cvData, projects: [...(cvData.projects || []), { id: crypto.randomUUID(), title: '', description: '', technologies: '', link: '' }] })}
                                            className="w-full p-3 border-2 border-dashed border-black rounded-none hover:bg-primary hover:text-white transition-colors font-bold text-black"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add Project
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sections.find(s => s.id === 'certification' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-4 md:p-6">
                                    <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                                    <div className="space-y-3">
                                        <LayoutGroup id="certification-section">
                                        <Reorder.Group axis="y" values={cvData.certification} onReorder={(reordered) => setCvData({ ...cvData, certification: reordered })} className="flex flex-col gap-3">
                                        <AnimatePresence initial={false}>
                                        {cvData.certification.map((cert, idx) => (
                                            <Reorder.Item
                                                key={cert.id || idx}
                                                value={cert}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                                layout={draggingSection === 'certification' ? true : undefined}
                                                onDragStart={() => setDraggingSection('certification')}
                                                onDragEnd={() => setDraggingSection(null)}
                                                className="flex gap-2 cursor-grab active:cursor-grabbing hover:bg-gray-100 p-2 border-2 border-transparent hover:border-gray-200 transition-colors bg-white relative"
                                            >
                                                <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0 cursor-grab active:cursor-grabbing hover:text-gray-600" />
                                                <input
                                                    type="text"
                                                    placeholder="Certification"
                                                    value={cert.value}
                                                    onChange={(e) => {
                                                        const newCert = [...cvData.certification];
                                                        newCert[idx] = { ...newCert[idx], value: e.target.value };
                                                        setCvData({ ...cvData, certification: newCert });
                                                    }}
                                                    className="flex-1 px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                />
                                                <button
                                                    onClick={() => handleSoftDelete('certification', cert, idx, 'Certification')}
                                                    className="text-red-500"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </Reorder.Item>
                                        ))}
                                        </AnimatePresence>
                                        </Reorder.Group>
                                        </LayoutGroup>
                                        <button
                                            onClick={() => setCvData({ ...cvData, certification: [...cvData.certification, { id: crypto.randomUUID(), value: '' }] })}
                                            className="w-full p-3 border-2 border-dashed border-black rounded-none hover:bg-primary hover:text-white transition-colors font-bold text-black"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add Certification
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sections.find(s => s.id === 'language' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-4 md:p-6">
                                    <h2 className="text-xl font-semibold mb-4">Languages</h2>
                                    <div className="space-y-3">
                                        <LayoutGroup id="language-section">
                                        <Reorder.Group axis="y" values={cvData.language} onReorder={(reordered) => setCvData({ ...cvData, language: reordered })} className="flex flex-col gap-3">
                                        <AnimatePresence initial={false}>
                                        {cvData.language.map((lang, idx) => (
                                            <Reorder.Item
                                                key={lang.id || idx}
                                                value={lang}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                                layout={draggingSection === 'language' ? true : undefined}
                                                onDragStart={() => setDraggingSection('language')}
                                                onDragEnd={() => setDraggingSection(null)}
                                                className="flex gap-2 cursor-grab active:cursor-grabbing hover:bg-gray-100 p-2 border-2 border-transparent hover:border-gray-200 transition-colors bg-white relative"
                                            >
                                                <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0 cursor-grab active:cursor-grabbing hover:text-gray-600" />
                                                <input
                                                    type="text"
                                                    placeholder="Language"
                                                    value={lang.value}
                                                    onChange={(e) => {
                                                        const newLang = [...cvData.language];
                                                        newLang[idx] = { ...newLang[idx], value: e.target.value };
                                                        setCvData({ ...cvData, language: newLang });
                                                    }}
                                                    className="flex-1 px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                />
                                                <button
                                                onClick={() => handleSoftDelete('language', lang, idx, 'Language')}
                                                    className="text-red-500"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </Reorder.Item>
                                        ))}
                        </AnimatePresence>
                        </Reorder.Group>
                        </LayoutGroup>
                        <button
                                            onClick={() => setCvData({ ...cvData, language: [...cvData.language, { id: crypto.randomUUID(), value: '' }] })}
                                            className="w-full p-3 border-2 border-dashed border-black rounded-none hover:bg-primary hover:text-white transition-colors font-bold text-black"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add Language
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white border-4 border-black shadow-neo p-4 md:p-6">
                                <div className="space-y-3">
                                    <motion.button
                                        onClick={() => onNavigate('review')}
                                        whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        className="w-full p-4 bg-purple-600 text-white border-2 border-black shadow-neo-sm rounded-none font-bold flex items-center justify-center gap-2 group"
                                    >
                                        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                        Review & Improve (AI)
                                    </motion.button>
                                    <motion.button
                                        onClick={() => downloadPDF(cvData, undefined, tier)}
                                        whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        className="w-full p-4 bg-primary text-white border-2 border-black shadow-neo-sm rounded-none font-bold flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download PDF
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        <div className="order-2 md:sticky md:top-8 md:h-fit">
                            <div className="bg-white border-4 border-black shadow-neo p-4 md:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl text-black font-semibold">Live Preview</h2>
                                    <select
                                        value={selectedTemplate || 'minimal'}
                                        onChange={handleTemplateChange}
                                        className="px-3 py-1 border-2 border-black rounded-none text-sm text-black font-bold focus:shadow-neo-sm outline-none"
                                    >
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.isPremium && tier !== 'pro' ? '🔒 ' : ''}{t.name}{t.isPremium ? ' (Pro)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <CVPreviewPane
                                    cvData={cvData}
                                    sections={sections}
                                    selectedTemplate={selectedTemplate}
                                    tier={tier}
                                />
                            </div>
                        </div>
                    </div>
                    </SlideIn>
                </div>
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

            <LimitModal
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                tier={tier || 'guest'}
                mode="premium_template"
            />
        </div>
    );
}
