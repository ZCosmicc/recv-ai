'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CVData, Section } from '../types';

// A4 at 96dpi: 794 × 1123px
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;
export const PAGE_PADDING_X = 48; // px, left/right
export const PAGE_PADDING_Y = 40; // px, top/bottom
export const USABLE_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_Y * 2;

export type TemplateName = 'minimal' | 'modern' | 'creative' | 'corporate' | 'executive';

interface CVPagedContentProps {
    cvData: CVData;
    sections: Section[];
    selectedTemplate: string | null;
    tier?: 'guest' | 'free' | 'pro';
    /** id prefix for page containers used by pdf.ts */
    pageIdPrefix?: string;
}

// ─── Helper: format date ───────────────────────────────────────────────────
function fmt(d: string) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

// ─── Section renderers ─────────────────────────────────────────────────────
// Each returns a JSX element for a single CV section.
// These are used both in the hidden measurer and in the real pages.

function SectionSummary({ cvData, template }: { cvData: CVData; template: TemplateName }) {
    if (!cvData.summary) return null;
    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Summary</h2>
            <p className="text-gray-900 leading-relaxed text-xs">{cvData.summary}</p>
        </div>
    );
    if (template === 'corporate') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-2 py-1">Professional Summary</h2>
            <p className="text-gray-800 leading-relaxed px-2 text-xs">{cvData.summary}</p>
        </div>
    );
    if (template === 'creative') return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-purple-700 mb-2">Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed text-xs">{cvData.summary}</p>
        </div>
    );
    if (template === 'executive') return (
        <div className="mb-6">
            <h2 className="text-sm font-serif font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gray-900 inline-block" /> Profile
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify text-xs">{cvData.summary}</p>
        </div>
    );
    // modern
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Summary</h2>
            <p className="text-gray-700 leading-relaxed text-xs">{cvData.summary}</p>
        </div>
    );
}

function SectionExperience({ cvData, template }: { cvData: CVData; template: TemplateName }) {
    if (!cvData.experience.length) return null;
    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Experience</h2>
            {cvData.experience.map((exp, i) => (
                <div key={i} className="mb-3">
                    {exp.title && <h3 className="font-bold text-gray-900 text-xs">{exp.title}</h3>}
                    {exp.company && <p className="text-gray-800 italic text-xs">{exp.company}</p>}
                    {(exp.startDate || exp.endDate || exp.current) && (
                        <p className="text-gray-700 text-xs">{fmt(exp.startDate)} – {exp.current ? 'Present' : fmt(exp.endDate)}</p>
                    )}
                    {exp.description && <p className="text-gray-900 mt-1 whitespace-pre-line text-xs">{exp.description}</p>}
                </div>
            ))}
        </div>
    );
    if (template === 'corporate') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-2 py-1">Professional Experience</h2>
            <div className="px-2 space-y-3">
                {cvData.experience.map((exp, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-start">
                            <div>
                                {exp.title && <h3 className="font-bold text-gray-900 text-xs">{exp.title}</h3>}
                                {exp.company && <p className="text-gray-700 italic text-xs">{exp.company}</p>}
                            </div>
                            {(exp.startDate || exp.endDate || exp.current) && (
                                <p className="text-gray-600 text-xs">{fmt(exp.startDate)} – {exp.current ? 'Present' : fmt(exp.endDate)}</p>
                            )}
                        </div>
                        {exp.description && <p className="text-gray-800 mt-1 whitespace-pre-line text-xs">{exp.description}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
    if (template === 'creative') return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-purple-700 mb-3">Experience</h2>
            {cvData.experience.map((exp, i) => (
                <div key={i} className="mb-3">
                    {exp.title && <h3 className="font-bold text-gray-900 text-xs">{exp.title}</h3>}
                    {exp.company && <p className="text-purple-600 font-medium text-xs">{exp.company}</p>}
                    {(exp.startDate || exp.endDate || exp.current) && (
                        <p className="text-gray-500 text-xs">{fmt(exp.startDate)} – {exp.current ? 'Present' : fmt(exp.endDate)}</p>
                    )}
                    {exp.description && <p className="text-gray-700 whitespace-pre-line text-xs mt-1">{exp.description}</p>}
                </div>
            ))}
        </div>
    );
    if (template === 'executive') return (
        <div className="mb-6">
            <h2 className="text-sm font-serif font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gray-900 inline-block" /> Experience
            </h2>
            <div className="space-y-4 relative border-l-2 border-gray-200 ml-2 pl-4">
                {cvData.experience.map((exp, i) => (
                    <div key={i} className="relative">
                        <div className="absolute -left-[25px] top-1 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full" />
                        <div className="flex justify-between items-baseline mb-1">
                            {exp.title && <h3 className="font-bold text-gray-900 text-xs">{exp.title}</h3>}
                            {(exp.startDate || exp.endDate || exp.current) && (
                                <p className="text-gray-500 text-xs font-bold uppercase">{fmt(exp.startDate)} – {exp.current ? 'Present' : fmt(exp.endDate)}</p>
                            )}
                        </div>
                        {exp.company && <p className="text-gray-600 font-serif italic text-xs mb-1">{exp.company}</p>}
                        {exp.description && <p className="text-gray-700 text-xs whitespace-pre-line leading-relaxed">{exp.description}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
    // modern
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Experience</h2>
            {cvData.experience.map((exp, i) => (
                <div key={i} className="mb-3 pl-3 border-l-2 border-blue-300">
                    {exp.title && <h3 className="font-bold text-gray-900 text-xs">{exp.title}</h3>}
                    {exp.company && <p className="text-blue-600 font-medium text-xs">{exp.company}</p>}
                    {(exp.startDate || exp.endDate || exp.current) && (
                        <p className="text-gray-500 text-xs">{fmt(exp.startDate)} – {exp.current ? 'Present' : fmt(exp.endDate)}</p>
                    )}
                    {exp.description && <p className="text-gray-700 mt-1 whitespace-pre-line text-xs">{exp.description}</p>}
                </div>
            ))}
        </div>
    );
}

function SectionEducation({ cvData, template }: { cvData: CVData; template: TemplateName }) {
    if (!cvData.education.length) return null;
    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Education</h2>
            {cvData.education.map((edu, i) => (
                <div key={i} className="mb-2">
                    {edu.degree && <h3 className="font-bold text-gray-900 text-xs">{edu.degree}{edu.major && ` in ${edu.major}`}</h3>}
                    {edu.institution && <p className="text-gray-800 italic text-xs">{edu.institution}</p>}
                    {edu.year && <p className="text-gray-700 text-xs">{fmt(edu.year)}</p>}
                </div>
            ))}
        </div>
    );
    if (template === 'corporate') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-2 py-1">Education</h2>
            <div className="px-2 space-y-2">
                {cvData.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start">
                        <div>
                            {edu.degree && <h3 className="font-bold text-gray-900 text-xs">{edu.degree}{edu.major && ` in ${edu.major}`}</h3>}
                            {edu.institution && <p className="text-gray-700 text-xs">{edu.institution}</p>}
                        </div>
                        {edu.year && <p className="text-gray-600 text-xs">{fmt(edu.year)}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
    if (template === 'creative') return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-purple-700 mb-3">Education</h2>
            {cvData.education.map((edu, i) => (
                <div key={i} className="mb-2">
                    {edu.degree && <h3 className="font-bold text-gray-900 text-xs">{edu.degree}{edu.major && ` in ${edu.major}`}</h3>}
                    {edu.institution && <p className="text-purple-600 text-xs">{edu.institution}</p>}
                    {edu.year && <p className="text-gray-500 text-xs">{fmt(edu.year)}</p>}
                </div>
            ))}
        </div>
    );
    if (template === 'executive') return (
        <div className="mb-6">
            <h2 className="text-sm font-serif font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gray-900 inline-block" /> Education
            </h2>
            <div className="grid gap-3">
                {cvData.education.map((edu, i) => (
                    <div key={i} className="bg-white p-3 shadow-sm border-l-4 border-yellow-500">
                        {edu.degree && <h3 className="font-bold text-gray-900 text-xs">{edu.degree}</h3>}
                        {edu.major && <p className="text-gray-600 text-xs">{edu.major}</p>}
                        <div className="flex justify-between mt-1 pt-1 border-t border-gray-100 text-xs text-gray-500 uppercase font-bold">
                            <span>{edu.institution}</span>
                            {edu.year && <span>{new Date(edu.year).getFullYear()}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    // modern
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Education</h2>
            {cvData.education.map((edu, i) => (
                <div key={i} className="mb-2">
                    {edu.degree && <h3 className="font-bold text-gray-900 text-xs">{edu.degree}{edu.major && ` in ${edu.major}`}</h3>}
                    {edu.institution && <p className="text-blue-600 text-xs">{edu.institution}</p>}
                    {edu.year && <p className="text-gray-500 text-xs">{fmt(edu.year)}</p>}
                </div>
            ))}
        </div>
    );
}

function SectionSkills({ cvData, template }: { cvData: CVData; template: TemplateName }) {
    const skills = cvData.skills.filter(s => s.trim());
    if (!skills.length) return null;
    if (template === 'minimal' || template === 'corporate') return (
        <div className="mb-5">
            <h2 className={`text-xs font-bold uppercase ${template === 'corporate' ? 'bg-gray-200 px-2 py-1 mb-2' : 'border-b border-black pb-1 mb-2'} tracking-wider text-gray-900`}>Skills</h2>
            <p className="text-gray-900 text-xs">{skills.join(template === 'corporate' ? ', ' : ' • ')}</p>
        </div>
    );
    if (template === 'modern') return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Skills</h2>
            <div className="flex flex-wrap gap-1">
                {skills.map((s, i) => <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{s}</span>)}
            </div>
        </div>
    );
    // creative/executive — skills go in sidebar, not main content
    return null;
}

function SectionProjects({ cvData, template }: { cvData: CVData; template: TemplateName }) {
    const projects = cvData.projects ?? [];
    if (!projects.length) return null;
    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Projects</h2>
            {projects.map((p, i) => (
                <div key={i} className="mb-3">
                    {p.title && <h3 className="font-bold text-gray-900 text-xs">{p.title}</h3>}
                    {p.technologies && <p className="text-gray-700 text-xs italic">{p.technologies}</p>}
                    {p.description && <p className="text-gray-900 mt-1 text-xs">{p.description}</p>}
                    {p.link && <p className="text-gray-600 text-xs mt-1">Link: {p.link}</p>}
                </div>
            ))}
        </div>
    );
    if (template === 'corporate') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-2 py-1">Projects</h2>
            <div className="px-2 space-y-2">
                {projects.map((p, i) => (
                    <div key={i}>
                        {p.title && <h3 className="font-bold text-gray-900 text-xs">{p.title}</h3>}
                        {p.technologies && <p className="text-gray-700 italic text-xs">{p.technologies}</p>}
                        {p.description && <p className="text-gray-800 mt-1 text-xs">{p.description}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
    if (template === 'creative') return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-purple-700 mb-3">Projects</h2>
            {projects.map((p, i) => (
                <div key={i} className="mb-3">
                    {p.title && <h3 className="font-bold text-gray-900 text-xs">{p.title}</h3>}
                    {p.technologies && <p className="text-purple-600 font-medium text-xs">{p.technologies}</p>}
                    {p.description && <p className="text-gray-700 mt-1 text-xs">{p.description}</p>}
                </div>
            ))}
        </div>
    );
    if (template === 'executive') return (
        <div className="mb-6">
            <h2 className="text-sm font-serif font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gray-900 inline-block" /> Projects
            </h2>
            <div className="space-y-3">
                {projects.map((p, i) => (
                    <div key={i} className="bg-white p-3 shadow-sm border-l-4 border-yellow-500">
                        {p.title && <h3 className="font-bold text-gray-900 text-xs">{p.title}</h3>}
                        {p.technologies && <p className="text-gray-600 text-xs italic">{p.technologies}</p>}
                        {p.description && <p className="text-gray-700 text-xs mt-1">{p.description}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
    // modern
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Projects</h2>
            {projects.map((p, i) => (
                <div key={i} className="mb-3 pl-3 border-l-2 border-blue-300">
                    {p.title && <h3 className="font-bold text-gray-900 text-xs">{p.title}</h3>}
                    {p.technologies && <p className="text-blue-600 font-medium text-xs">{p.technologies}</p>}
                    {p.description && <p className="text-gray-700 mt-1 text-xs">{p.description}</p>}
                </div>
            ))}
        </div>
    );
}

function SectionCertification({ cvData, template }: { cvData: CVData; template: TemplateName }) {
    const certs = cvData.certification.filter(c => c.trim());
    if (!certs.length) return null;
    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Certifications</h2>
            <ul className="list-disc list-inside space-y-1">{certs.map((c, i) => <li key={i} className="text-gray-900 text-xs">{c}</li>)}</ul>
        </div>
    );
    if (template === 'corporate') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-2 py-1">Certifications</h2>
            <ul className="list-disc list-inside px-2 space-y-1">{certs.map((c, i) => <li key={i} className="text-gray-800 text-xs">{c}</li>)}</ul>
        </div>
    );
    if (template === 'executive') return (
        <div className="mb-6">
            <h2 className="text-sm font-serif font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gray-900 inline-block" /> Certifications
            </h2>
            <div className="grid grid-cols-2 gap-2">
                {certs.map((c, i) => <div key={i} className="text-gray-700 text-xs bg-white p-2 border-l-2 border-gray-900">{c}</div>)}
            </div>
        </div>
    );
    if (template === 'creative') return (
        // creative certs go in sidebar — render null in main
        null
    );
    // modern
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Certifications</h2>
            <ul className="space-y-1">{certs.map((c, i) => <li key={i} className="text-gray-700 flex items-start gap-1 text-xs"><span className="text-blue-600 mt-0.5">✓</span><span>{c}</span></li>)}</ul>
        </div>
    );
}

function SectionLanguage({ cvData, template }: { cvData: CVData; template: TemplateName }) {
    const langs = cvData.language.filter(l => l.trim());
    if (!langs.length) return null;
    if (template === 'creative' || template === 'executive') return null; // sidebar only
    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Languages</h2>
            <p className="text-gray-900 text-xs">{langs.join(' • ')}</p>
        </div>
    );
    if (template === 'corporate') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-2 py-1">Languages</h2>
            <p className="text-gray-800 px-2 text-xs">{langs.join(', ')}</p>
        </div>
    );
    // modern
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Languages</h2>
            <div className="flex flex-wrap gap-1">{langs.map((l, i) => <span key={i} className="px-2 py-0.5 bg-blue-50 text-gray-700 rounded text-xs">{l}</span>)}</div>
        </div>
    );
}

// ─── Map section id → renderer ─────────────────────────────────────────────
type SectionRenderer = (cvData: CVData, template: TemplateName) => React.ReactNode;

const SECTION_RENDERERS: Record<string, SectionRenderer> = {
    summary: (d, t) => <SectionSummary cvData={d} template={t} />,
    experience: (d, t) => <SectionExperience cvData={d} template={t} />,
    education: (d, t) => <SectionEducation cvData={d} template={t} />,
    skills: (d, t) => <SectionSkills cvData={d} template={t} />,
    projects: (d, t) => <SectionProjects cvData={d} template={t} />,
    certification: (d, t) => <SectionCertification cvData={d} template={t} />,
    language: (d, t) => <SectionLanguage cvData={d} template={t} />,
};

// ─── Sidebar for sidebar-based templates ───────────────────────────────────
function Sidebar({ cvData, template }: { cvData: CVData; template: 'creative' | 'executive' }) {
    if (template === 'executive') return (
        <div className="w-64 flex-shrink-0 bg-gray-900 text-white p-6 border-r-4 border-yellow-500 self-stretch">
            {cvData.personal.name && (
                <div className="mb-8 text-center">
                    <div className="w-full h-0.5 bg-yellow-500 mb-3" />
                    <h1 className="text-xl font-bold uppercase tracking-widest mb-3 font-serif text-yellow-500">{cvData.personal.name}</h1>
                    <div className="text-gray-300 text-xs space-y-1 font-medium">
                        {cvData.personal.email && <div className="border-b border-gray-700 pb-1">{cvData.personal.email}</div>}
                        {cvData.personal.phone && <div className="border-b border-gray-700 pb-1">{cvData.personal.phone}</div>}
                        {cvData.personal.location && <div className="border-b border-gray-700 pb-1">{cvData.personal.location}</div>}
                    </div>
                    {cvData.personal.customFields.map((f, i) => f.label && f.value && (
                        <div key={i} className="text-gray-400 text-xs mt-1 text-left">
                            <span className="text-yellow-600 font-bold uppercase">{f.label}:</span> {f.value}
                        </div>
                    ))}
                </div>
            )}
            {cvData.skills.filter(s => s.trim()).length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-3 border-b border-gray-700 pb-1">Expertise</h2>
                    <ul className="space-y-1">
                        {cvData.skills.filter(s => s.trim()).map((s, i) => (
                            <li key={i} className="text-gray-300 text-xs flex items-center">
                                <span className="w-1.5 h-1.5 bg-yellow-600 mr-2 rotate-45 inline-block flex-shrink-0" />{s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {cvData.language.filter(l => l.trim()).length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-3 border-b border-gray-700 pb-1">Languages</h2>
                    <ul className="space-y-1">{cvData.language.filter(l => l.trim()).map((l, i) => <li key={i} className="text-gray-300 text-xs">{l}</li>)}</ul>
                </div>
            )}
            {cvData.certification.filter(c => c.trim()).length > 0 && (
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-3 border-b border-gray-700 pb-1">Certifications</h2>
                    <ul className="space-y-1">{cvData.certification.filter(c => c.trim()).map((c, i) => <li key={i} className="text-gray-300 text-xs">✓ {c}</li>)}</ul>
                </div>
            )}
        </div>
    );

    // creative
    return (
        <div className="w-56 flex-shrink-0 bg-gradient-to-b from-purple-600 to-purple-800 text-white p-5 self-stretch">
            {cvData.personal.name && (
                <div className="mb-5">
                    <h1 className="text-lg font-bold mb-2">{cvData.personal.name}</h1>
                    <div className="space-y-1 text-xs">
                        {cvData.personal.email && <p className="break-all">📧 {cvData.personal.email}</p>}
                        {cvData.personal.phone && <p>📞 {cvData.personal.phone}</p>}
                        {cvData.personal.location && <p>📍 {cvData.personal.location}</p>}
                        {cvData.personal.customFields.map((f, i) => f.label && f.value && <p key={i} className="break-all">🔗 {f.value}</p>)}
                    </div>
                </div>
            )}
            {cvData.skills.filter(s => s.trim()).length > 0 && (
                <div className="mb-5">
                    <h2 className="text-sm font-bold mb-2 pb-1 border-b border-purple-400">Skills</h2>
                    <div className="space-y-1">{cvData.skills.filter(s => s.trim()).map((s, i) => <div key={i} className="bg-purple-700 px-2 py-0.5 rounded text-xs">{s}</div>)}</div>
                </div>
            )}
            {cvData.language.filter(l => l.trim()).length > 0 && (
                <div className="mb-5">
                    <h2 className="text-sm font-bold mb-2 pb-1 border-b border-purple-400">Languages</h2>
                    <div className="space-y-1 text-xs">{cvData.language.filter(l => l.trim()).map((l, i) => <p key={i}>• {l}</p>)}</div>
                </div>
            )}
            {cvData.certification.filter(c => c.trim()).length > 0 && (
                <div>
                    <h2 className="text-sm font-bold mb-2 pb-1 border-b border-purple-400">Certifications</h2>
                    <div className="space-y-1 text-xs">{cvData.certification.filter(c => c.trim()).map((c, i) => <p key={i}>✓ {c}</p>)}</div>
                </div>
            )}
        </div>
    );
}

// ─── Personal header renderers ─────────────────────────────────────────────
function PersonalHeader({ cvData, template }: { cvData: CVData; template: TemplateName }) {
    const p = cvData.personal;
    if (!p.name) return null;

    if (template === 'minimal') return (
        <div className="text-center mb-5 border-b-2 border-black pb-3">
            <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900">{p.name}</h1>
            <div className="text-gray-800 mt-1 text-xs space-x-2">
                {p.email && <span>{p.email}</span>}
                {p.phone && <span>• {p.phone}</span>}
                {p.location && <span>• {p.location}</span>}
            </div>
            {p.customFields.map((f, i) => f.label && f.value && <div key={i} className="text-gray-800 text-xs mt-0.5">{f.label}: {f.value}</div>)}
        </div>
    );

    if (template === 'modern') return (
        <div className="mb-5">
            <h1 className="text-3xl font-bold text-blue-600 mb-1">{p.name}</h1>
            <div className="flex flex-wrap gap-2 text-gray-600 text-xs">
                {p.email && <span>📧 {p.email}</span>}
                {p.phone && <span>📞 {p.phone}</span>}
                {p.location && <span>📍 {p.location}</span>}
            </div>
            {p.customFields.map((f, i) => f.label && f.value && <div key={i} className="text-gray-600 text-xs mt-0.5">🔗 {f.label}: {f.value}</div>)}
        </div>
    );

    if (template === 'corporate') return (
        <div className="text-center mb-5 pb-3 border-b-4 border-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 font-serif">{p.name}</h1>
            <div className="text-gray-600 space-x-1 text-xs">
                {p.email && <span>{p.email}</span>}
                {p.phone && <span>| {p.phone}</span>}
                {p.location && <span>| {p.location}</span>}
            </div>
            {p.customFields.map((f, i) => f.label && f.value && <div key={i} className="text-gray-600 text-xs mt-0.5">{f.label}: {f.value}</div>)}
        </div>
    );

    // creative & executive — personal info lives in sidebar, return null for main
    return null;
}

// ─── Page background/layout per template ──────────────────────────────────
function PageLayout({
    template, children, isFirstPage, cvData,
}: {
    template: TemplateName;
    children: React.ReactNode;
    isFirstPage: boolean;
    cvData: CVData;
}) {
    const isSidebar = template === 'creative' || template === 'executive';

    if (isSidebar) return (
        <div className="flex h-full">
            {isFirstPage && <Sidebar cvData={cvData} template={template as 'creative' | 'executive'} />}
            {!isFirstPage && (
                <div className={`flex-shrink-0 ${template === 'executive' ? 'w-64 bg-gray-900 border-r-4 border-yellow-500' : 'w-56 bg-gradient-to-b from-purple-600 to-purple-800'}`} />
            )}
            <div className={`flex-1 p-8 overflow-hidden ${template === 'executive' ? 'bg-gray-50' : 'bg-white'}`}>
                {children}
            </div>
        </div>
    );

    return (
        <div className={`h-full p-10 ${template === 'corporate' ? 'bg-white font-serif' : 'bg-white'}`}>
            {children}
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function CVPagedContent({
    cvData,
    sections,
    selectedTemplate,
    tier = 'free',
    pageIdPrefix = 'pdf-page',
}: CVPagedContentProps) {
    const template: TemplateName = (selectedTemplate as TemplateName) || 'minimal';
    const isSidebar = template === 'creative' || template === 'executive';

    // IDs for each section to measure
    const enabledSections = sections
        .filter(s => s.enabled && s.id !== 'personal')
        .filter(s => {
            // sidebar templates: skills/language/certification go in sidebar
            if (isSidebar && ['skills', 'language', 'certification'].includes(s.id)) return false;
            return true;
        });

    // Ref to hidden measurer container
    const measurerRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<string[][]>([[]]);

    const measureAndPaginate = useCallback(() => {
        if (!measurerRef.current) return;

        const measurer = measurerRef.current;
        const sectionEls = measurer.querySelectorAll<HTMLDivElement>('[data-section-id]');
        
        // Available content height per page (px)
        // For sidebar templates, sidebar eats some width but not height
        const maxH = isSidebar ? A4_HEIGHT_PX - 64 : A4_HEIGHT_PX - 80; // account for padding

        const newPages: string[][] = [[]];
        let currentHeight = 0;

        // Include personal header on page 1 for non-sidebar templates
        if (!isSidebar) {
            const headerEl = measurer.querySelector<HTMLDivElement>('[data-section-id="personal"]');
            if (headerEl) {
                currentHeight += headerEl.offsetHeight + 16; // +16 for margin
            }
        }

        sectionEls.forEach(el => {
            const sectionId = el.getAttribute('data-section-id')!;
            if (sectionId === 'personal') return;
            const h = el.offsetHeight + 16; // +16 for margin between sections

            if (currentHeight + h > maxH && newPages[newPages.length - 1].length > 0) {
                newPages.push([sectionId]);
                currentHeight = h;
            } else {
                newPages[newPages.length - 1].push(sectionId);
                currentHeight += h;
            }
        });

        setPages(newPages);
    }, [isSidebar]);

    // Re-paginate when data changes
    useEffect(() => {
        // Small delay to let DOM render the hidden measurer
        const t = setTimeout(measureAndPaginate, 50);
        return () => clearTimeout(t);
    }, [cvData, sections, selectedTemplate, measureAndPaginate]);

    return (
        <>
            {/* Hidden measurer — renders all sections at A4 width to measure heights */}
            <div
                ref={measurerRef}
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: 0,
                    width: `${A4_WIDTH_PX}px`,
                    visibility: 'hidden',
                    pointerEvents: 'none',
                }}
                aria-hidden="true"
            >
                {/* Personal header */}
                <div data-section-id="personal">
                    <PersonalHeader cvData={cvData} template={template} />
                </div>

                {/* All content sections */}
                {enabledSections.map(section => (
                    <div key={section.id} data-section-id={section.id}>
                        {SECTION_RENDERERS[section.id]?.(cvData, template)}
                    </div>
                ))}
            </div>

            {/* Real pages */}
            {pages.map((pageSectionIds, pageIndex) => (
                <div
                    key={pageIndex}
                    id={`${pageIdPrefix}-${pageIndex}`}
                    data-pdf-page="true"
                    style={{
                        width: `${A4_WIDTH_PX}px`,
                        height: `${A4_HEIGHT_PX}px`,
                        position: 'relative',
                        overflow: 'hidden',
                        flexShrink: 0,
                    }}
                >
                    <PageLayout template={template} isFirstPage={pageIndex === 0} cvData={cvData}>
                        {/* Personal header only on page 1 for non-sidebar templates */}
                        {pageIndex === 0 && !isSidebar && (
                            <PersonalHeader cvData={cvData} template={template} />
                        )}

                        {/* Sections for this page */}
                        {pageSectionIds.map(sectionId => (
                            <div key={sectionId}>
                                {SECTION_RENDERERS[sectionId]?.(cvData, template)}
                            </div>
                        ))}
                    </PageLayout>

                    {/* Watermark for non-pro users */}
                    {tier !== 'pro' && (
                        <div style={{
                            position: 'absolute',
                            bottom: '10mm',
                            right: '10mm',
                            textAlign: 'center',
                            opacity: 0.6,
                            zIndex: 10,
                        }}>
                            <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px', fontWeight: 500 }}>Created by</div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/LogoPrimaryReCV.png" alt="ReCV" style={{ width: '70px', objectFit: 'contain' }} />
                        </div>
                    )}
                </div>
            ))}
        </>
    );
}
