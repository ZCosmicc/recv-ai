'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2, X, Plus } from 'lucide-react';
import { Section, CVData } from '../types';
import CVPreview, { templates } from './CVPreview';
import Navbar from './Navbar';

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
}

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
    isSaving
}: SectionsProps) {
    const [draggedSection, setDraggedSection] = useState<number | null>(null);

    const handleDrop = (index: number) => {
        if (draggedSection === null) return;
        const newSections = [...sections];
        const [removed] = newSections.splice(draggedSection, 1);
        newSections.splice(index, 0, removed);
        setSections(newSections);
        setDraggedSection(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar onNavigate={onNavigate} />

            <div className="flex-1 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Sections</h1>
                            <p className="text-black font-medium">Create and reorder sections here</p>
                        </div>
                        <div className="flex gap-2">
                            {isCloud && (
                                <button
                                    onClick={onSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 font-bold border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            )}
                            <button
                                onClick={onClearData}
                                className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 font-bold border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear Data
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-8">
                        <div className="bg-white border-4 border-black shadow-neo p-6 h-[500px] md:h-[800px] overflow-y-auto">
                            <h2 className="text-xl text-gray-900 font-semibold mb-4">Sections</h2>

                            <div className="space-y-2 mb-6">
                                {sections.filter(s => s.enabled).map((section, index) => (
                                    <div
                                        key={section.id}
                                        draggable
                                        onDragStart={() => setDraggedSection(index)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleDrop(index)}
                                        className="flex items-center gap-3 p-3 bg-white border-b-2 border-gray-100 last:border-0 hover:bg-gray-50 cursor-move"
                                    >
                                        <div className="text-gray-400">≡</div>
                                        <span className="flex-1 font-medium text-lg text-black">{section.name}</span>
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
                                    </div>
                                ))}
                            </div>

                            <div className="w-full mb-6">
                                <h3 className="text-lg font-bold mb-3">Add Section</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {sections.filter(s => !s.enabled).map(section => (
                                        <div key={section.id} className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSections(sections.map(s =>
                                                        s.id === section.id ? { ...s, enabled: true } : s
                                                    ));
                                                }}
                                                className="flex-1 px-4 py-3 border-2 border-black bg-white shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                {section.name}
                                            </button>
                                            {!['personal', 'summary', 'experience', 'education', 'skills', 'certification', 'language'].includes(section.id) && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Delete ${section.name} permanently?`)) {
                                                            setSections(sections.filter(s => s.id !== section.id));
                                                        }
                                                    }}
                                                    className="px-3 border-2 border-black bg-red-100 hover:bg-red-200 shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-red-600"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {sections.filter(s => !s.enabled).length === 0 && (
                                        <button disabled className="col-span-2 py-3 border-2 border-gray-200 text-gray-400 font-bold bg-gray-50 cursor-not-allowed">
                                            All sections added
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => onNavigate('fill')}
                                className="w-full p-4 bg-primary text-white border-4 border-black shadow-neo font-bold text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                            >
                                Next: Fill Section
                            </button>
                        </div>

                        <div className="bg-white border-4 border-black shadow-neo p-6 h-[800px] overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl text-black font-semibold">Live Preview</h2>
                                <select
                                    value={selectedTemplate || 'minimal'}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600"
                                >
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="border border-gray-200 rounded bg-white overflow-hidden" style={{ height: '600px', overflowY: 'auto' }}>
                                <CVPreview cvData={cvData} sections={sections} selectedTemplate={selectedTemplate} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
