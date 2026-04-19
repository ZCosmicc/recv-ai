'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2, X, Plus, Sparkles, Crown, Lock, Loader2, Check } from 'lucide-react';
import LimitModal from './LimitModal';
import { motion, Reorder, useDragControls } from 'framer-motion';
import SlideIn from './SlideIn';
import CVPreviewPane from './CVPreviewPane';
import { templates } from './CVPreview';
import { Section, CVData } from '../types';
import Navbar from './Navbar';
import PlanCard from './PlanCard';

interface SectionsProps {
    sections: Section[];
    setSections: (sections: Section[]) => void;
    cvData: CVData;
    selectedTemplate: string | null;
    setSelectedTemplate: (id: string) => void;
    onNavigate: (step: string) => void;
    onClearData: () => void;
    isCloud?: boolean;
    onSave?: () => void;
    isSaving?: boolean;
    tier?: 'guest' | 'free' | 'starter' | 'pro';
    aiCredits?: number;
}

// ─── Drag-handle-only wrapper for sections ───────────────────────────────────
type DraggableSectionItemProps = {
    value: unknown;
    className?: string;
    children: (bag: { startDrag: (e: React.PointerEvent) => void }) => React.ReactNode;
} & Pick<React.ComponentProps<typeof Reorder.Item>, 'initial' | 'animate' | 'exit' | 'transition'>;

const DraggableSectionItem = ({
    value, className, initial, animate, exit, transition, children,
}: DraggableSectionItemProps) => {
    const dragControls = useDragControls();
    return (
        <Reorder.Item
            value={value}
            dragListener={false}
            dragControls={dragControls}
            className={className}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={transition}
        >
            {children({ startDrag: (e) => dragControls.start(e) })}
        </Reorder.Item>
    );
};
// ─────────────────────────────────────────────────────────────────────────────


export default function Sections({
    sections,
    setSections,
    cvData,
    selectedTemplate,
    setSelectedTemplate,
    onNavigate,
    onClearData,
    isCloud,
    onSave,
    isSaving,
    tier = 'guest',
    aiCredits = 0
}: SectionsProps) {
    const [showLimitModal, setShowLimitModal] = useState(false);

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
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2">Sections</h1>
                            <p className="text-black font-medium text-sm md:text-base">Create and reorder sections here</p>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
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

                    <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-white border-4 border-black shadow-neo p-4 md:p-6 h-auto md:h-[800px] overflow-y-auto">
                            <h2 className="text-xl text-gray-900 font-semibold mb-4">Sections</h2>

                            <Reorder.Group
                                axis="y"
                                values={sections.filter(s => s.enabled)}
                                onReorder={(reordered) => {
                                    // Merge reordered enabled sections back with disabled ones, preserving disabled order at the end
                                    const disabled = sections.filter(s => !s.enabled);
                                    setSections([...reordered, ...disabled]);
                                }}
                                className="space-y-2 mb-6"
                            >
                                {sections.filter(s => s.enabled).map((section, index) => (
                                    <DraggableSectionItem
                                        key={section.id}
                                        value={section}
                                        className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white border-b-2 border-gray-100 last:border-0 hover:bg-gray-50"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.05 }}
                                    >
                                    {({ startDrag }) => (<>
                                        <div
                                            onPointerDown={startDrag}
                                            style={{ touchAction: 'none', cursor: 'grab' }}
                                            className="text-gray-400 hover:text-gray-600 select-none"
                                        >≡</div>
                                        <span className="flex-1 font-medium text-base md:text-lg text-black">{section.name}</span>
                                        {!section.required && (
                                            <button
                                                onClick={() => {
                                                    setSections(sections.map(s =>
                                                        s.id === section.id ? { ...s, enabled: false } : s
                                                    ));
                                                }}
                                                className="text-red-500 hover:text-red-700 font-bold"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </>)}
                                    </DraggableSectionItem>
                                ))}
                            </Reorder.Group>

                            <div className="w-full mb-6">
                                <h3 className="text-lg font-bold mb-3">Add Section</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {sections.filter(s => !s.enabled).map((section, index) => (
                                        <SlideIn key={section.id} delay={index * 0.1}>
                                        <div className="flex gap-2 h-full">
                                            <motion.button
                                                onClick={() => {
                                                    setSections(sections.map(s =>
                                                        s.id === section.id ? { ...s, enabled: true } : s
                                                    ));
                                                }}
                                                whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                                whileTap={{ scale: 0.98 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                className="flex-1 px-4 py-3 border-2 border-black bg-white shadow-neo-sm font-bold flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                {section.name}
                                            </motion.button>
                                            {!['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certification', 'language'].includes(section.id) && (
                                                <motion.button
                                                    onClick={() => {
                                                        if (confirm(`Delete ${section.name} permanently?`)) {
                                                            setSections(sections.filter(s => s.id !== section.id));
                                                        }
                                                    }}
                                                    whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                                    whileTap={{ scale: 0.95 }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                    className="px-3 border-2 border-black bg-red-100 shadow-neo-sm text-red-600"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </motion.button>
                                            )}
                                        </div>
                                        </SlideIn>
                                    ))}
                                    {sections.filter(s => !s.enabled).length === 0 && (
                                        <button disabled className="col-span-2 py-3 border-2 border-gray-200 text-gray-400 font-bold bg-gray-50 cursor-not-allowed">
                                            All sections added
                                        </button>
                                    )}
                                </div>
                            </div>

                            <motion.button
                                onClick={() => onNavigate('fill')}
                                whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="w-full p-4 bg-primary text-white border-4 border-black shadow-neo font-bold text-xl"
                            >
                                Next: Fill Section
                            </motion.button>
                        </div>

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
                                pageIdPrefix="sections-preview-page"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <LimitModal
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                tier={tier}
                mode="premium_template"
            />
        </div>
    );
}
