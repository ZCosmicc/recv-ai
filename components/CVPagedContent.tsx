'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CVData, Section } from '../types';

// A4 at 96dpi
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

// Actual content area widths (page width minus padding)
// non-sidebar: p-10 = 40px each side → 794 - 80 = 714px
// creative sidebar: sidebar w-56(224px) + content p-8(32px x2) → 794-224-64 = 506px
// executive sidebar: sidebar w-64(256px) + content p-8(32px x2) → 794-256-64 = 474px
const CONTENT_WIDTHS: Record<string, number> = {
    minimal: 714,
    modern: 714,
    corporate: 714,
    creative: 506,
    executive: 474,
};

// Max usable height per page (A4 height minus vertical padding)
// non-sidebar p-10: 40px top + 40px bottom = 1123-80 = 1043px
// sidebar p-8: 32px top + 32px bottom = 1123-64 = 1059px
const MAX_HEIGHTS: Record<string, number> = {
    minimal: 1043,
    modern: 1043,
    corporate: 1043,
    creative: 1059,
    executive: 1059,
};

export type TemplateName = 'minimal' | 'modern' | 'creative' | 'corporate' | 'executive';

interface CVPagedContentProps {
    cvData: CVData;
    sections: Section[];
    selectedTemplate: string | null;
    tier?: 'guest' | 'free' | 'pro';
    pageIdPrefix?: string;
    highlightedPath?: string | null;
}

const getHL = (path: string, hp?: string | null) => 
    path === hp ? ' ring-2 ring-yellow-400 bg-yellow-200/50 rounded px-1 -mx-1 transition-colors duration-300 ' : ' transition-colors duration-300 ';

function fmt(d: string) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }); }
    catch { return d; }
}

// Renders description text with proper bullet handling.
// If lines start with • – ▸ ✓ or -, renders as a list with hanging indent.
// Otherwise renders as plain pre-wrapped text.
const BULLET_RE = /^([•\-–▸✓])\s*/;
function DescriptionText({ text, className = '' }: { text: string; className?: string }) {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim());
    const hasBullets = lines.some(l => BULLET_RE.test(l.trim()));
    if (!hasBullets) {
        return <p className={`text-xs leading-relaxed ${className}`} style={{ whiteSpace: 'pre-wrap' }}>{text}</p>;
    }
    return (
        <div className={`space-y-0.5 text-xs leading-relaxed ${className}`}>
            {lines.map((line, i) => {
                const trimmed = line.trim();
                const match = trimmed.match(BULLET_RE);
                const bullet = match ? match[1] : '';
                const content = match ? trimmed.slice(match[0].length) : trimmed;
                return (
                    <div key={i} className="flex items-start gap-1">
                        <span className="flex-shrink-0 w-3 text-center mt-px">{bullet || '•'}</span>
                        <span className="flex-1">{content}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Section renderers ─────────────────────────────────────────────────────

function SectionSummary({ cvData, template, highlightedPath }: { cvData: CVData; template: TemplateName; highlightedPath?: string | null }) {
    if (!cvData.summary) return null;
    const hp = highlightedPath;
    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Summary</h2>
            <p className={`text-gray-900 leading-relaxed text-xs ${getHL('summary', hp)}`}>{cvData.summary}</p>
        </div>
    );
    if (template === 'corporate') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-2 py-1">Professional Summary</h2>
            <p className={`text-gray-800 leading-relaxed px-2 text-xs ${getHL('summary', hp)}`}>{cvData.summary}</p>
        </div>
    );
    if (template === 'creative') return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-purple-700 mb-2">Professional Summary</h2>
            <p className={`text-gray-700 leading-relaxed text-xs ${getHL('summary', hp)}`}>{cvData.summary}</p>
        </div>
    );
    if (template === 'executive') return (
        <div className="mb-6">
            <h2 className="text-sm font-serif font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gray-900 inline-block" /> Profile
            </h2>
            <p className={`text-gray-700 leading-relaxed text-justify text-xs ${getHL('summary', hp)}`}>{cvData.summary}</p>
        </div>
    );
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Summary</h2>
            <p className={`text-gray-700 leading-relaxed text-xs ${getHL('summary', hp)}`}>{cvData.summary}</p>
        </div>
    );
}

function SectionExperience({ cvData, template, highlightedPath }: { cvData: CVData; template: TemplateName; highlightedPath?: string | null }) {
    if (!cvData.experience.length) return null;
    const hp = highlightedPath;
    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Experience</h2>
            {cvData.experience.map((exp, i) => (
                <div key={i} className="mb-3">
                    {exp.title && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`experience[${i}].title`, hp)}`}>{exp.title}</h3>}
                    {exp.company && <p className={`text-gray-800 italic text-xs ${getHL(`experience[${i}].company`, hp)}`}>{exp.company}</p>}
                    {(exp.startDate || exp.endDate || exp.current) && (
                        <p className="text-gray-700 text-xs"><span className={getHL(`experience[${i}].startDate`, hp)}>{fmt(exp.startDate)}</span> – <span className={getHL(`experience[${i}].endDate`, hp)}>{exp.current ? 'Present' : fmt(exp.endDate)}</span></p>
                    )}
                    {exp.description && <DescriptionText text={exp.description} className={`text-gray-900 mt-1 ${getHL(`experience[${i}].description`, hp)}`} />}
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
                                {exp.title && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`experience[${i}].title`, hp)}`}>{exp.title}</h3>}
                                {exp.company && <p className={`text-gray-700 italic text-xs ${getHL(`experience[${i}].company`, hp)}`}>{exp.company}</p>}
                            </div>
                            {(exp.startDate || exp.endDate || exp.current) && (
                                <p className="text-gray-600 text-xs"><span className={getHL(`experience[${i}].startDate`, hp)}>{fmt(exp.startDate)}</span> – <span className={getHL(`experience[${i}].endDate`, hp)}>{exp.current ? 'Present' : fmt(exp.endDate)}</span></p>
                            )}
                        </div>
                        {exp.description && <DescriptionText text={exp.description} className={`text-gray-800 mt-1 ${getHL(`experience[${i}].description`, hp)}`} />}
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
                    {exp.title && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`experience[${i}].title`, hp)}`}>{exp.title}</h3>}
                    {exp.company && <p className={`text-purple-600 font-medium text-xs ${getHL(`experience[${i}].company`, hp)}`}>{exp.company}</p>}
                    {(exp.startDate || exp.endDate || exp.current) && (
                         <p className="text-gray-500 text-xs"><span className={getHL(`experience[${i}].startDate`, hp)}>{fmt(exp.startDate)}</span> – <span className={getHL(`experience[${i}].endDate`, hp)}>{exp.current ? 'Present' : fmt(exp.endDate)}</span></p>
                    )}
                    {exp.description && <DescriptionText text={exp.description} className={`text-gray-700 mt-1 ${getHL(`experience[${i}].description`, hp)}`} />}
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
                            {exp.title && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`experience[${i}].title`, hp)}`}>{exp.title}</h3>}
                            {(exp.startDate || exp.endDate || exp.current) && (
                                <p className="text-gray-500 text-xs font-bold uppercase"><span className={getHL(`experience[${i}].startDate`, hp)}>{fmt(exp.startDate)}</span> – <span className={getHL(`experience[${i}].endDate`, hp)}>{exp.current ? 'Present' : fmt(exp.endDate)}</span></p>
                            )}
                        </div>
                        {exp.company && <p className={`text-gray-600 font-serif italic text-xs mb-1 ${getHL(`experience[${i}].company`, hp)}`}>{exp.company}</p>}
                        {exp.description && <DescriptionText text={exp.description} className={`text-gray-700 ${getHL(`experience[${i}].description`, hp)}`} />}
                    </div>
                ))}
            </div>
        </div>
    );
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Experience</h2>
            {cvData.experience.map((exp, i) => (
                <div key={i} className="mb-3 pl-3 border-l-2 border-blue-300">
                    {exp.title && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`experience[${i}].title`, hp)}`}>{exp.title}</h3>}
                    {exp.company && <p className={`text-blue-600 font-medium text-xs ${getHL(`experience[${i}].company`, hp)}`}>{exp.company}</p>}
                    {(exp.startDate || exp.endDate || exp.current) && (
                        <p className="text-gray-500 text-xs"><span className={getHL(`experience[${i}].startDate`, hp)}>{fmt(exp.startDate)}</span> – <span className={getHL(`experience[${i}].endDate`, hp)}>{exp.current ? 'Present' : fmt(exp.endDate)}</span></p>
                    )}
                    {exp.description && <DescriptionText text={exp.description} className={`text-gray-700 mt-1 ${getHL(`experience[${i}].description`, hp)}`} />}
                </div>
            ))}
        </div>
    );
}

function SectionEducation({ cvData, template, highlightedPath }: { cvData: CVData; template: TemplateName; highlightedPath?: string | null }) {
    if (!cvData.education.length) return null;
    const hp = highlightedPath;
    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Education</h2>
            {cvData.education.map((edu, i) => (
                <div key={i} className="mb-2">
                    {edu.degree && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`education[${i}].degree`, hp)}`}>{edu.degree}{edu.major && <span className={getHL(`education[${i}].major`, hp)}>{` in ${edu.major}`}</span>}</h3>}
                    {edu.institution && <p className={`text-gray-800 italic text-xs ${getHL(`education[${i}].institution`, hp)}`}>{edu.institution}</p>}
                    {edu.year && <p className={`text-gray-700 text-xs ${getHL(`education[${i}].year`, hp)}`}>{fmt(edu.year)}</p>}
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
                            {edu.degree && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`education[${i}].degree`, hp)}`}>{edu.degree}{edu.major && <span className={getHL(`education[${i}].major`, hp)}>{` in ${edu.major}`}</span>}</h3>}
                            {edu.institution && <p className={`text-gray-700 text-xs ${getHL(`education[${i}].institution`, hp)}`}>{edu.institution}</p>}
                        </div>
                        {edu.year && <p className={`text-gray-600 text-xs ${getHL(`education[${i}].year`, hp)}`}>{fmt(edu.year)}</p>}
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
                    {edu.degree && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`education[${i}].degree`, hp)}`}>{edu.degree}{edu.major && <span className={getHL(`education[${i}].major`, hp)}>{` in ${edu.major}`}</span>}</h3>}
                    {edu.institution && <p className={`text-purple-600 text-xs ${getHL(`education[${i}].institution`, hp)}`}>{edu.institution}</p>}
                    {edu.year && <p className={`text-gray-500 text-xs ${getHL(`education[${i}].year`, hp)}`}>{fmt(edu.year)}</p>}
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
                        {edu.degree && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`education[${i}].degree`, hp)}`}>{edu.degree}</h3>}
                        {edu.major && <p className={`text-gray-600 text-xs ${getHL(`education[${i}].major`, hp)}`}>{edu.major}</p>}
                        <div className="flex justify-between mt-1 pt-1 border-t border-gray-100 text-xs text-gray-500 uppercase font-bold">
                            <span className={getHL(`education[${i}].institution`, hp)}>{edu.institution}</span>
                            {edu.year && <span className={getHL(`education[${i}].year`, hp)}>{new Date(edu.year).getFullYear()}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Education</h2>
            {cvData.education.map((edu, i) => (
                <div key={i} className="mb-2">
                    {edu.degree && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`education[${i}].degree`, hp)}`}>{edu.degree}{edu.major && <span className={getHL(`education[${i}].major`, hp)}>{` in ${edu.major}`}</span>}</h3>}
                    {edu.institution && <p className={`text-blue-600 text-xs ${getHL(`education[${i}].institution`, hp)}`}>{edu.institution}</p>}
                    {edu.year && <p className={`text-gray-500 text-xs ${getHL(`education[${i}].year`, hp)}`}>{fmt(edu.year)}</p>}
                </div>
            ))}
        </div>
    );
}

function SectionSkills({ cvData, template, highlightedPath }: { cvData: CVData; template: TemplateName; highlightedPath?: string | null }) {
    const skills = cvData.skills as any[];
    const hasValues = skills.some(s => typeof s === 'string' ? s.trim() : s?.value?.trim());
    if (!hasValues) return null;
    if (template === 'creative' || template === 'executive') return null;
    const hp = highlightedPath;
    
    // Custom joiner to allow per-item highlighting
    const renderSkills = (joinStr: string) => skills.map((s, i) => {
        const val = typeof s === 'string' ? s : s.value;
        if (!val || !val.trim()) return null;
        return <React.Fragment key={i}><span className={getHL(`skills[${i}].value`, hp)}>{val}</span>{i < skills.length - 1 && joinStr}</React.Fragment>;
    });

    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Skills</h2>
            <div className="text-gray-900 text-xs">{renderSkills(' • ')}</div>
        </div>
    );
    if (template === 'corporate') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-2 py-1">Skills</h2>
            <div className="text-gray-800 px-2 text-xs">{renderSkills(', ')}</div>
        </div>
    );
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Skills</h2>
            <div className="flex flex-wrap gap-1">
                {skills.map((s, i) => {
                    const val = typeof s === 'string' ? s : s.value;
                    if (!val || !val.trim()) return null;
                    return <span key={i} className={`px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium ${getHL(`skills[${i}].value`, hp)}`}>{val}</span>;
                })}
            </div>
        </div>
    );
}

function SectionProjects({ cvData, template, highlightedPath }: { cvData: CVData; template: TemplateName; highlightedPath?: string | null }) {
    const projects = cvData.projects ?? [];
    const hp = highlightedPath;
    if (!projects.length) return null;
    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Projects</h2>
            {projects.map((p, i) => (
                <div key={i} className="mb-3">
                    {p.title && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`projects[${i}].title`, hp)}`}>{p.title}</h3>}
                    {p.technologies && <p className={`text-gray-700 text-xs italic ${getHL(`projects[${i}].technologies`, hp)}`}>{p.technologies}</p>}
                    {p.description && <p className={`text-gray-900 mt-1 text-xs ${getHL(`projects[${i}].description`, hp)}`}>{p.description}</p>}
                    {p.link && <p className={`text-gray-600 text-xs mt-1 ${getHL(`projects[${i}].link`, hp)}`}>Link: {p.link}</p>}
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
                        {p.title && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`projects[${i}].title`, hp)}`}>{p.title}</h3>}
                        {p.technologies && <p className={`text-gray-700 italic text-xs ${getHL(`projects[${i}].technologies`, hp)}`}>{p.technologies}</p>}
                        {p.description && <p className={`text-gray-800 mt-1 text-xs ${getHL(`projects[${i}].description`, hp)}`}>{p.description}</p>}
                        {p.link && <p className={`text-gray-600 text-xs mt-1 ${getHL(`projects[${i}].link`, hp)}`}>Link: {p.link}</p>}
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
                     {p.title && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`projects[${i}].title`, hp)}`}>{p.title}</h3>}
                     {p.technologies && <p className={`text-purple-600 font-medium text-xs ${getHL(`projects[${i}].technologies`, hp)}`}>{p.technologies}</p>}
                     {p.description && <p className={`text-gray-700 mt-1 text-xs ${getHL(`projects[${i}].description`, hp)}`}>{p.description}</p>}
                     {p.link && <p className={`text-purple-500 text-xs mt-1 ${getHL(`projects[${i}].link`, hp)}`}>Link: {p.link}</p>}
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
                        {p.title && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`projects[${i}].title`, hp)}`}>{p.title}</h3>}
                        {p.technologies && <p className={`text-gray-600 text-xs italic ${getHL(`projects[${i}].technologies`, hp)}`}>{p.technologies}</p>}
                        {p.description && <p className={`text-gray-700 text-xs mt-1 ${getHL(`projects[${i}].description`, hp)}`}>{p.description}</p>}
                        {p.link && <p className={`text-gray-500 text-xs mt-1 ${getHL(`projects[${i}].link`, hp)}`}>Link: {p.link}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Projects</h2>
            {projects.map((p, i) => (
                <div key={i} className="mb-3 pl-3 border-l-2 border-blue-300">
                     {p.title && <h3 className={`font-bold text-gray-900 text-xs ${getHL(`projects[${i}].title`, hp)}`}>{p.title}</h3>}
                     {p.technologies && <p className={`text-blue-600 font-medium text-xs ${getHL(`projects[${i}].technologies`, hp)}`}>{p.technologies}</p>}
                     {p.description && <p className={`text-gray-700 mt-1 text-xs ${getHL(`projects[${i}].description`, hp)}`}>{p.description}</p>}
                     {p.link && <p className={`text-blue-500 text-xs mt-1 ${getHL(`projects[${i}].link`, hp)}`}>Link: {p.link}</p>}
                </div>
            ))}
        </div>
    );
}

function SectionCertification({ cvData, template, highlightedPath }: { cvData: CVData; template: TemplateName; highlightedPath?: string | null }) {
    const certs = cvData.certification as any[];
    const hasValues = certs.some(c => typeof c === 'string' ? c.trim() : c?.value?.trim());
    if (!hasValues) return null;
    if (template === 'creative') return null;
    const hp = highlightedPath;

    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Certifications</h2>
            <ul className="list-disc list-inside space-y-1">
                {certs.map((c, i) => {
                    const val = typeof c === 'string' ? c : c.value;
                    if (!val || !val.trim()) return null;
                    return <li key={i} className="text-gray-900 text-xs"><span className={getHL(`certification[${i}].value`, hp)}>{val}</span></li>;
                })}
            </ul>
        </div>
    );
    if (template === 'corporate') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-2 py-1">Certifications</h2>
            <ul className="list-disc list-inside px-2 space-y-1">
                {certs.map((c, i) => {
                    const val = typeof c === 'string' ? c : c.value;
                    if (!val || !val.trim()) return null;
                    return <li key={i} className="text-gray-800 text-xs"><span className={getHL(`certification[${i}].value`, hp)}>{val}</span></li>;
                })}
            </ul>
        </div>
    );
    if (template === 'executive') return (
        <div className="mb-6">
            <h2 className="text-sm font-serif font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gray-900 inline-block" /> Certifications
            </h2>
            <div className="grid grid-cols-2 gap-2">
                {certs.map((c, i) => {
                    const val = typeof c === 'string' ? c : c.value;
                    if (!val || !val.trim()) return null;
                    return <div key={i} className={`text-gray-700 text-xs bg-white p-2 border-l-2 border-gray-900 ${getHL(`certification[${i}].value`, hp)}`}>{val}</div>;
                })}
            </div>
        </div>
    );
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Certifications</h2>
            <ul className="space-y-1">
                {certs.map((c, i) => {
                    const val = typeof c === 'string' ? c : c.value;
                    if (!val || !val.trim()) return null;
                    return <li key={i} className="text-gray-700 flex items-start gap-1 text-xs"><span className="text-blue-600 mt-0.5">✓</span><span className={getHL(`certification[${i}].value`, hp)}>{val}</span></li>
                })}
            </ul>
        </div>
    );
}

function SectionLanguage({ cvData, template, highlightedPath }: { cvData: CVData; template: TemplateName; highlightedPath?: string | null }) {
    const langs = cvData.language as any[];
    const hasValues = langs.some(l => typeof l === 'string' ? l.trim() : l?.value?.trim());
    if (!hasValues) return null;
    if (template === 'creative' || template === 'executive') return null;
    const hp = highlightedPath;
    
    const renderLangs = (joinStr: string) => langs.map((l, i) => {
         const val = typeof l === 'string' ? l : l.value;
         if (!val || !val.trim()) return null;
         return <React.Fragment key={i}><span className={getHL(`language[${i}].value`, hp)}>{val}</span>{i < langs.length - 1 && joinStr}</React.Fragment>;
    });

    if (template === 'minimal') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 text-gray-900">Languages</h2>
            <div className="text-gray-900 text-xs">{renderLangs(' • ')}</div>
        </div>
    );
    if (template === 'corporate') return (
        <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-2 py-1">Languages</h2>
            <div className="text-gray-800 px-2 text-xs">{renderLangs(', ')}</div>
        </div>
    );
    return (
        <div className="mb-5">
            <h2 className="text-sm font-bold text-blue-600 mb-2 pb-1 border-b-2 border-blue-200">Languages</h2>
            <div className="flex flex-wrap gap-1">
                {langs.map((l, i) => {
                     const val = typeof l === 'string' ? l : l.value;
                     if (!val || !val.trim()) return null;
                     return <span key={i} className={`px-2 py-0.5 bg-blue-50 text-gray-700 rounded text-xs ${getHL(`language[${i}].value`, hp)}`}>{val}</span>;
                })}
            </div>
        </div>
    );
}


type SectionRenderer = (cvData: CVData, template: TemplateName, highlightedPath?: string | null) => React.ReactNode;
const SECTION_RENDERERS: Record<string, SectionRenderer> = {
    summary: (d, t, hp) => <SectionSummary cvData={d} template={t} highlightedPath={hp} />,
    experience: (d, t, hp) => <SectionExperience cvData={d} template={t} highlightedPath={hp} />,
    education: (d, t, hp) => <SectionEducation cvData={d} template={t} highlightedPath={hp} />,
    skills: (d, t, hp) => <SectionSkills cvData={d} template={t} highlightedPath={hp} />,
    projects: (d, t, hp) => <SectionProjects cvData={d} template={t} highlightedPath={hp} />,
    certification: (d, t, hp) => <SectionCertification cvData={d} template={t} highlightedPath={hp} />,
    language: (d, t, hp) => <SectionLanguage cvData={d} template={t} highlightedPath={hp} />,
};

// ─── Sidebar ───────────────────────────────────────────────────────────────

function Sidebar({ cvData, template, highlightedPath }: { cvData: CVData; template: 'creative' | 'executive'; highlightedPath?: string | null }) {
    const hp = highlightedPath;
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
                        <div key={i} className="text-gray-400 text-xs mt-1">
                            <span className="text-yellow-600 font-bold uppercase">{f.label}:</span> {f.value}
                        </div>
                    ))}
                </div>
            )}
            {cvData.skills.map(s => typeof s === 'string' ? s : s.value).filter(v => v && v.trim()).length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-3 border-b border-gray-700 pb-1">Expertise</h2>
                    <ul className="space-y-1">
                        {cvData.skills.map(s => typeof s === 'string' ? s : s.value).filter(v => v && v.trim()).map((s, i) => (
                            <li key={i} className="text-gray-300 text-xs flex items-center">
                                <span className="w-1.5 h-1.5 bg-yellow-600 mr-2 rotate-45 inline-block flex-shrink-0" />{s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {cvData.language.map(l => typeof l === 'string' ? l : l.value).filter(v => v && v.trim()).length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-3 border-b border-gray-700 pb-1">Languages</h2>
                    <ul className="space-y-1">{cvData.language.map(l => typeof l === 'string' ? l : l.value).filter(v => v && v.trim()).map((l, i) => <li key={i} className="text-gray-300 text-xs">{l}</li>)}</ul>
                </div>
            )}
            {cvData.certification.map(c => typeof c === 'string' ? c : c.value).filter(v => v && v.trim()).length > 0 && (
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-3 border-b border-gray-700 pb-1">Certifications</h2>
                    <ul className="space-y-1">{cvData.certification.map(c => typeof c === 'string' ? c : c.value).filter(v => v && v.trim()).map((c, i) => <li key={i} className="text-gray-300 text-xs">✓ {c}</li>)}</ul>
                </div>
            )}
        </div>
    );
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
            {cvData.skills.map(s => typeof s === 'string' ? s : s.value).filter(v => v && v.trim()).length > 0 && (
                <div className="mb-5">
                    <h2 className="text-sm font-bold mb-2 pb-1 border-b border-purple-400">Skills</h2>
                    <div className="space-y-1">{cvData.skills.map(s => typeof s === 'string' ? s : s.value).filter(v => v && v.trim()).map((s, i) => <div key={i} className="bg-purple-700 px-2 py-0.5 rounded text-xs">{s}</div>)}</div>
                </div>
            )}
            {cvData.language.map(l => typeof l === 'string' ? l : l.value).filter(v => v && v.trim()).length > 0 && (
                <div className="mb-5">
                    <h2 className="text-sm font-bold mb-2 pb-1 border-b border-purple-400">Languages</h2>
                    <div className="space-y-1 text-xs">{cvData.language.map(l => typeof l === 'string' ? l : l.value).filter(v => v && v.trim()).map((l, i) => <p key={i}>• {l}</p>)}</div>
                </div>
            )}
            {cvData.certification.map(c => typeof c === 'string' ? c : c.value).filter(v => v && v.trim()).length > 0 && (
                <div>
                    <h2 className="text-sm font-bold mb-2 pb-1 border-b border-purple-400">Certifications</h2>
                    <div className="space-y-1 text-xs">{cvData.certification.map(c => typeof c === 'string' ? c : c.value).filter(v => v && v.trim()).map((c, i) => <p key={i}>✓ {c}</p>)}</div>
                </div>
            )}
        </div>
    );
}

// ─── Personal header ───────────────────────────────────────────────────────

function PersonalHeader({ cvData, template, highlightedPath }: { cvData: CVData; template: TemplateName; highlightedPath?: string | null }) {
    const p = cvData.personal;
    const hp = highlightedPath;
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
    return null; // sidebar templates: personal info in Sidebar
}

// ─── Page container layout ─────────────────────────────────────────────────

function PageLayout({ template, children, isFirstPage, cvData, highlightedPath }: {
    template: TemplateName; children: React.ReactNode; isFirstPage: boolean; cvData: CVData; highlightedPath?: string | null;
}) {
    const isSidebar = template === 'creative' || template === 'executive';
    if (isSidebar) return (
        <div className="flex h-full">
            {isFirstPage
                ? <Sidebar cvData={cvData} template={template as 'creative' | 'executive'} highlightedPath={highlightedPath} />
                : <div className={`flex-shrink-0 ${template === 'executive' ? 'w-64 bg-gray-900 border-r-4 border-yellow-500' : 'w-56 bg-gradient-to-b from-purple-600 to-purple-800'}`} />
            }
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
    cvData, sections, selectedTemplate, tier = 'free', pageIdPrefix = 'pdf-page', highlightedPath,
}: CVPagedContentProps) {
    const template: TemplateName = (selectedTemplate as TemplateName) || 'minimal';
    const isSidebar = template === 'creative' || template === 'executive';

    const contentWidth = CONTENT_WIDTHS[template] ?? 714;
    const maxH = MAX_HEIGHTS[template] ?? 1043;

    const enabledSections = sections
        .filter(s => s.enabled && s.id !== 'personal')
        .filter(s => isSidebar && ['skills', 'language', 'certification'].includes(s.id) ? false : true);

    const measurerRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<string[][]>([[]]);

    const measureAndPaginate = useCallback(() => {
        if (!measurerRef.current) return;
        const measurer = measurerRef.current;
        const newPages: string[][] = [[]];
        let currentHeight = 0;

        // Account for personal header on page 1
        if (!isSidebar) {
            const headerEl = measurer.querySelector<HTMLDivElement>('[data-measure-id="personal"]');
            if (headerEl) currentHeight += headerEl.offsetHeight + 12;
        }

        enabledSections.forEach(section => {
            const el = measurer.querySelector<HTMLDivElement>(`[data-measure-id="${section.id}"]`);
            if (!el) return;
            const h = el.offsetHeight + 12; // +12 for bottom margin
            if (h <= 0) return; // skip unmeasured

            if (currentHeight + h > maxH && newPages[newPages.length - 1].length > 0) {
                newPages.push([section.id]);
                currentHeight = h;
            } else {
                newPages[newPages.length - 1].push(section.id);
                currentHeight += h;
            }
        });

        // Only update if pages actually changed (avoid infinite loop)
        setPages(prev => {
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(newPages);
            return prevStr === nextStr ? prev : newPages;
        });
    }, [enabledSections, isSidebar, maxH]);

    useEffect(() => {
        // Two-pass: wait for measurer to fully render, then measure
        const t = setTimeout(measureAndPaginate, 150);
        return () => clearTimeout(t);
    }, [cvData, sections, selectedTemplate, measureAndPaginate]);

    return (
        <>
            {/* Hidden measurer at ACTUAL content width */}
            <div
                ref={measurerRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: 0,
                    width: `${contentWidth}px`,
                    visibility: 'hidden',
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
            >
                <div data-measure-id="personal">
                    <PersonalHeader cvData={cvData} template={template} highlightedPath={highlightedPath} />
                </div>
                {enabledSections.map(section => (
                    <div key={section.id} data-measure-id={section.id}>
                        {SECTION_RENDERERS[section.id]?.(cvData, template, highlightedPath)}
                    </div>
                ))}
            </div>

            {/* Rendered A4 pages */}
            {pages.map((pageSectionIds, pageIndex) => (
                <div
                    key={pageIndex}
                    id={`${pageIdPrefix}-${pageIndex}`}
                    data-pdf-page={pageIdPrefix}
                    style={{ width: `${A4_WIDTH_PX}px`, height: `${A4_HEIGHT_PX}px`, position: 'relative', overflow: 'hidden', flexShrink: 0 }}
                >
                    <PageLayout template={template} isFirstPage={pageIndex === 0} cvData={cvData} highlightedPath={highlightedPath}>
                        {pageIndex === 0 && !isSidebar && <PersonalHeader cvData={cvData} template={template} highlightedPath={highlightedPath} />}
                        {pageSectionIds.map(sectionId => (
                            <div key={sectionId}>
                                {SECTION_RENDERERS[sectionId]?.(cvData, template, highlightedPath)}
                            </div>
                        ))}
                    </PageLayout>

                    {tier !== 'pro' && (
                        <div style={{ position: 'absolute', bottom: '10mm', right: '10mm', textAlign: 'center', opacity: 0.6, zIndex: 10 }}>
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
