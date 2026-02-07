'use client';

import React from 'react';
import { CVData, Section } from '../types';

interface CVPreviewProps {
    cvData: CVData;
    sections: Section[];
    selectedTemplate: string | null;
}

export const templates = [
    { id: 'minimal', name: 'Minimal', description: 'Clean black & white design', isPremium: false },
    { id: 'corporate', name: 'Corporate', description: 'Traditional professional layout', isPremium: false },
    { id: 'modern', name: 'Modern', description: 'Subtle blue accents, professional', isPremium: true },
    { id: 'creative', name: 'Creative', description: 'Colored sidebar, modern fonts', isPremium: true },
    { id: 'executive', name: 'Executive', description: 'Premium dark sidebar with gold accents', isPremium: true }
];

export default function CVPreview({ cvData, sections, selectedTemplate }: CVPreviewProps) {
    const renderMinimal = () => (
        <div className="p-5 sm:p-8 bg-white text-sm">
            {cvData.personal.name && (
                <div className="text-center mb-6 border-b-2 border-black pb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-gray-900">{cvData.personal.name}</h1>
                    <div className="text-gray-800 mt-2 space-x-3 text-xs">
                        {cvData.personal.email && <span>{cvData.personal.email}</span>}
                        {cvData.personal.phone && <span>• {cvData.personal.phone}</span>}
                        {cvData.personal.location && <span>• {cvData.personal.location}</span>}
                    </div>
                    {cvData.personal.customFields.map((field, idx) => (
                        field.label && field.value && (
                            <div key={idx} className="text-gray-800 text-xs mt-1">
                                {field.label}: {field.value}
                            </div>
                        )
                    ))}
                </div>
            )}

            {sections.filter(s => s.enabled).map(section => {
                if (section.id === 'personal') return null;

                if (section.id === 'summary' && cvData.summary) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-1 mb-3 text-gray-900">Summary</h2>
                            <p className="text-gray-900 leading-relaxed">{cvData.summary}</p>
                        </div>
                    );
                }

                if (section.id === 'experience' && cvData.experience.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-1 mb-3 text-gray-900">Experience</h2>
                            {cvData.experience.map((exp, idx) => (
                                <div key={idx} className="mb-4">
                                    {exp.title && <h3 className="font-bold text-gray-900">{exp.title}</h3>}
                                    {exp.company && <p className="text-gray-800 italic">{exp.company}</p>}
                                    {(exp.startDate || exp.endDate || exp.current) && (
                                        <p className="text-gray-700 text-xs">
                                            {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                            {' - '}
                                            {exp.current ? 'Present' : exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                        </p>
                                    )}
                                    {exp.description && <p className="text-gray-900 mt-1 whitespace-pre-line">{exp.description}</p>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section.id === 'education' && cvData.education.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-1 mb-3 text-gray-900">Education</h2>
                            {cvData.education.map((edu, idx) => (
                                <div key={idx} className="mb-3">
                                    {edu.degree && <h3 className="font-bold text-gray-900">{edu.degree}{edu.major && ` in ${edu.major}`}</h3>}
                                    {edu.institution && <p className="text-gray-800 italic">{edu.institution}</p>}
                                    {edu.year && <p className="text-gray-700 text-xs">{new Date(edu.year).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section.id === 'projects' && cvData.projects?.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-1 mb-3 text-gray-900">Projects</h2>
                            {cvData.projects.map((project, idx) => (
                                <div key={idx} className="mb-4">
                                    {project.title && <h3 className="font-bold text-gray-900">{project.title}</h3>}
                                    {project.technologies && <p className="text-gray-700 text-xs italic">{project.technologies}</p>}
                                    {project.description && <p className="text-gray-900 mt-1">{project.description}</p>}
                                    {project.link && <p className="text-gray-600 text-xs mt-1">Link: {project.link}</p>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section.id === 'skills' && cvData.skills.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-1 mb-3 text-gray-900">Skills</h2>
                            <p className="text-gray-900">{cvData.skills.filter(s => s.trim()).join(' • ')}</p>
                        </div>
                    );
                }

                if (section.id === 'certification' && cvData.certification.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-1 mb-3 text-gray-900">Certifications</h2>
                            <ul className="list-disc list-inside space-y-1">
                                {cvData.certification.filter(c => c.trim()).map((cert, idx) => (
                                    <li key={idx} className="text-gray-900">{cert}</li>
                                ))}
                            </ul>
                        </div>
                    );
                }

                if (section.id === 'language' && cvData.language.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-1 mb-3 text-gray-900">Languages</h2>
                            <p className="text-gray-900">{cvData.language.filter(l => l.trim()).join(' • ')}</p>
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );

    const renderModern = () => (
        <div className="p-5 sm:p-8 bg-white text-sm">
            {cvData.personal.name && (
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{cvData.personal.name}</h1>
                    <div className="flex flex-wrap gap-3 text-gray-600 text-xs">
                        {cvData.personal.email && <span className="flex items-center gap-1">📧 {cvData.personal.email}</span>}
                        {cvData.personal.phone && <span className="flex items-center gap-1">📞 {cvData.personal.phone}</span>}
                        {cvData.personal.location && <span className="flex items-center gap-1">📍 {cvData.personal.location}</span>}
                    </div>
                    {cvData.personal.customFields.map((field, idx) => (
                        field.label && field.value && (
                            <div key={idx} className="text-gray-600 text-xs mt-1">
                                🔗 {field.label}: {field.value}
                            </div>
                        )
                    ))}
                </div>
            )}

            {sections.filter(s => s.enabled).map(section => {
                if (section.id === 'personal') return null;

                if (section.id === 'summary' && cvData.summary) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-200">Summary</h2>
                            <p className="text-gray-700 leading-relaxed">{cvData.summary}</p>
                        </div>
                    );
                }

                if (section.id === 'experience' && cvData.experience.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-200">Experience</h2>
                            {cvData.experience.map((exp, idx) => (
                                <div key={idx} className="mb-4 pl-4 border-l-2 border-blue-300">
                                    {exp.title && <h3 className="font-bold text-gray-900">{exp.title}</h3>}
                                    {exp.company && <p className="text-blue-600 font-medium">{exp.company}</p>}
                                    {(exp.startDate || exp.endDate || exp.current) && (
                                        <p className="text-gray-500 text-xs">
                                            {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                            {' - '}
                                            {exp.current ? 'Present' : exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                        </p>
                                    )}
                                    {exp.description && <p className="text-gray-700 mt-1 whitespace-pre-line">{exp.description}</p>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section.id === 'education' && cvData.education.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-200">Education</h2>
                            {cvData.education.map((edu, idx) => (
                                <div key={idx} className="mb-3">
                                    {edu.degree && <h3 className="font-bold text-gray-900">{edu.degree}{edu.major && ` in ${edu.major}`}</h3>}
                                    {edu.institution && <p className="text-blue-600">{edu.institution}</p>}
                                    {edu.year && <p className="text-gray-500 text-xs">{new Date(edu.year).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section.id === 'projects' && cvData.projects?.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-200">Projects</h2>
                            {cvData.projects.map((project, idx) => (
                                <div key={idx} className="mb-4 pl-4 border-l-2 border-blue-300">
                                    {project.title && <h3 className="font-bold text-gray-900">{project.title}</h3>}
                                    {project.technologies && <p className="text-blue-600 font-medium text-xs">{project.technologies}</p>}
                                    {project.description && <p className="text-gray-700 mt-1">{project.description}</p>}
                                    {project.link && <p className="text-gray-500 text-xs mt-1">🔗 {project.link}</p>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section.id === 'skills' && cvData.skills.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-200">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {cvData.skills.filter(s => s.trim()).map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                }

                if (section.id === 'certification' && cvData.certification.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-200">Certifications</h2>
                            <ul className="space-y-1">
                                {cvData.certification.filter(c => c.trim()).map((cert, idx) => (
                                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">✓</span>
                                        <span>{cert}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                }

                if (section.id === 'language' && cvData.language.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-200">Languages</h2>
                            <div className="flex flex-wrap gap-2">
                                {cvData.language.filter(l => l.trim()).map((lang, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-blue-50 text-gray-700 rounded text-sm">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );

    const renderCreative = () => (
        <div className="flex flex-col sm:flex-row bg-white text-sm">
            <div className="w-full sm:w-1/3 bg-gradient-to-b from-purple-600 to-purple-800 text-white p-5 sm:p-6">
                {cvData.personal.name && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-3">{cvData.personal.name}</h1>
                        <div className="space-y-2 text-xs">
                            {cvData.personal.email && <p className="break-all">📧 {cvData.personal.email}</p>}
                            {cvData.personal.phone && <p>📞 {cvData.personal.phone}</p>}
                            {cvData.personal.location && <p>📍 {cvData.personal.location}</p>}
                            {cvData.personal.customFields.map((field, idx) => (
                                field.label && field.value && (
                                    <p key={idx} className="break-all">🔗 {field.value}</p>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {cvData.skills.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold mb-3 pb-2 border-b border-purple-400">Skills</h2>
                        <div className="space-y-2">
                            {cvData.skills.filter(s => s.trim()).map((skill, idx) => (
                                <div key={idx} className="bg-purple-700 px-3 py-1 rounded text-xs">
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {cvData.language.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold mb-3 pb-2 border-b border-purple-400">Languages</h2>
                        <div className="space-y-1 text-xs">
                            {cvData.language.filter(l => l.trim()).map((lang, idx) => (
                                <p key={idx}>• {lang}</p>
                            ))}
                        </div>
                    </div>
                )}

                {cvData.certification.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold mb-3 pb-2 border-b border-purple-400">Certifications</h2>
                        <div className="space-y-1 text-xs">
                            {cvData.certification.filter(c => c.trim()).map((cert, idx) => (
                                <p key={idx}>✓ {cert}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full sm:w-2/3 p-5 sm:p-8">
                {sections.filter(s => s.enabled).map(section => {
                    if (section.id === 'personal' || section.id === 'skills' || section.id === 'language' || section.id === 'certification') return null;

                    if (section.id === 'summary' && cvData.summary) {
                        return (
                            <div key={section.id} className="mb-6">
                                <h2 className="text-xl font-bold text-purple-700 mb-3">Professional Summary</h2>
                                <p className="text-gray-700 leading-relaxed">{cvData.summary}</p>
                            </div>
                        );
                    }

                    if (section.id === 'experience' && cvData.experience.length > 0) {
                        return (
                            <div key={section.id} className="mb-6">
                                <h2 className="text-xl font-bold text-purple-700 mb-4">Experience</h2>
                                {cvData.experience.map((exp, idx) => (
                                    <div key={idx} className="mb-4">
                                        {exp.title && <h3 className="font-bold text-gray-900">{exp.title}</h3>}
                                        {exp.company && <p className="text-purple-600 font-medium">{exp.company}</p>}
                                        {(exp.startDate || exp.endDate || exp.current) && (
                                            <p className="text-gray-500 text-xs mb-2">
                                                {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                                {' - '}
                                                {exp.current ? 'Present' : exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                            </p>
                                        )}
                                        {exp.description && <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    if (section.id === 'education' && cvData.education.length > 0) {
                        return (
                            <div key={section.id} className="mb-6">
                                <h2 className="text-xl font-bold text-purple-700 mb-4">Education</h2>
                                {cvData.education.map((edu, idx) => (
                                    <div key={idx} className="mb-3">
                                        {edu.degree && <h3 className="font-bold text-gray-900">{edu.degree}{edu.major && ` in ${edu.major}`}</h3>}
                                        {edu.institution && <p className="text-purple-600">{edu.institution}</p>}
                                        {edu.year && <p className="text-gray-500 text-xs">{new Date(edu.year).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>}
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    if (section.id === 'projects' && cvData.projects?.length > 0) {
                        return (
                            <div key={section.id} className="mb-6">
                                <h2 className="text-xl font-bold text-purple-700 mb-4">Projects</h2>
                                {cvData.projects.map((project, idx) => (
                                    <div key={idx} className="mb-4">
                                        {project.title && <h3 className="font-bold text-gray-900">{project.title}</h3>}
                                        {project.technologies && <p className="text-purple-600 font-medium text-sm">{project.technologies}</p>}
                                        {project.description && <p className="text-gray-700 mt-1">{project.description}</p>}
                                        {project.link && <p className="text-gray-500 text-xs mt-1">🔗 {project.link}</p>}
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );

    const renderCorporate = () => (
        <div className="p-5 sm:p-8 bg-white text-sm font-serif">
            {cvData.personal.name && (
                <div className="text-center mb-6 pb-4 border-b-4 border-gray-800">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{cvData.personal.name}</h1>
                    <div className="text-gray-600 space-x-2 text-xs">
                        {cvData.personal.email && <span>{cvData.personal.email}</span>}
                        {cvData.personal.phone && <span>| {cvData.personal.phone}</span>}
                        {cvData.personal.location && <span>| {cvData.personal.location}</span>}
                    </div>
                    {cvData.personal.customFields.map((field, idx) => (
                        field.label && field.value && (
                            <div key={idx} className="text-gray-600 text-xs mt-1">
                                {field.label}: {field.value}
                            </div>
                        )
                    ))}
                </div>
            )}

            {sections.filter(s => s.enabled).map(section => {
                if (section.id === 'personal') return null;

                if (section.id === 'summary' && cvData.summary) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-base font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-3 py-1">Professional Summary</h2>
                            <p className="text-gray-800 leading-relaxed px-3">{cvData.summary}</p>
                        </div>
                    );
                }

                if (section.id === 'experience' && cvData.experience.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-base font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-3 py-1">Professional Experience</h2>
                            <div className="px-3 space-y-4">
                                {cvData.experience.map((exp, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                {exp.title && <h3 className="font-bold text-gray-900">{exp.title}</h3>}
                                                {exp.company && <p className="text-gray-700 italic">{exp.company}</p>}
                                            </div>
                                            {(exp.startDate || exp.endDate || exp.current) && (
                                                <p className="text-gray-600 text-xs text-right">
                                                    {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                                    {' - '}
                                                    {exp.current ? 'Present' : exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                                </p>
                                            )}
                                        </div>
                                        {exp.description && <p className="text-gray-800 mt-1 whitespace-pre-line">{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                if (section.id === 'education' && cvData.education.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-base font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-3 py-1">Education</h2>
                            <div className="px-3 space-y-3">
                                {cvData.education.map((edu, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                {edu.degree && <h3 className="font-bold text-gray-900">{edu.degree}{edu.major && ` in ${edu.major}`}</h3>}
                                                {edu.institution && <p className="text-gray-700">{edu.institution}</p>}
                                            </div>
                                            {edu.year && <p className="text-gray-600 text-xs">{new Date(edu.year).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                if (section.id === 'projects' && cvData.projects?.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-base font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-3 py-1">Projects</h2>
                            <div className="px-3 space-y-3">
                                {cvData.projects.map((project, idx) => (
                                    <div key={idx}>
                                        {project.title && <h3 className="font-bold text-gray-900">{project.title}</h3>}
                                        {project.technologies && <p className="text-gray-700 italic text-xs">{project.technologies}</p>}
                                        {project.description && <p className="text-gray-800 mt-1">{project.description}</p>}
                                        {project.link && <p className="text-gray-600 text-xs mt-1">{project.link}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                if (section.id === 'skills' && cvData.skills.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-base font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-3 py-1">Skills</h2>
                            <p className="text-gray-800 px-3">{cvData.skills.filter(s => s.trim()).join(', ')}</p>
                        </div>
                    );
                }

                if (section.id === 'certification' && cvData.certification.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-base font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-3 py-1">Certifications</h2>
                            <ul className="list-disc list-inside px-3 space-y-1">
                                {cvData.certification.filter(c => c.trim()).map((cert, idx) => (
                                    <li key={idx} className="text-gray-800">{cert}</li>
                                ))}
                            </ul>
                        </div>
                    );
                }

                if (section.id === 'language' && cvData.language.length > 0) {
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-base font-bold text-gray-900 mb-2 uppercase bg-gray-200 px-3 py-1">Languages</h2>
                            <p className="text-gray-800 px-3">{cvData.language.filter(l => l.trim()).join(', ')}</p>
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );

    const renderExecutive = () => (
        <div className="flex flex-col sm:flex-row bg-white text-sm font-sans h-full min-h-0 sm:min-h-[800px]">
            {/* Sidebar */}
            <div className="w-full sm:w-1/3 bg-gray-900 text-white p-5 sm:p-8 border-b-4 sm:border-b-0 sm:border-r-4 border-yellow-500">
                {cvData.personal.name && (
                    <div className="mb-10 text-center">
                        <div className="w-16 h-1 w-full bg-yellow-500 mb-4"></div>
                        <h1 className="text-3xl font-bold uppercase tracking-widest mb-4 font-serif text-yellow-500">{cvData.personal.name}</h1>
                        <div className="text-gray-300 text-xs space-y-2 font-medium">
                            {cvData.personal.email && <div className="border-b border-gray-700 pb-1">{cvData.personal.email}</div>}
                            {cvData.personal.phone && <div className="border-b border-gray-700 pb-1">{cvData.personal.phone}</div>}
                            {cvData.personal.location && <div className="border-b border-gray-700 pb-1">{cvData.personal.location}</div>}
                        </div>
                        {cvData.personal.customFields.map((field, idx) => (
                            field.label && field.value && (
                                <div key={idx} className="text-gray-400 text-xs mt-2 text-left">
                                    <span className="text-yellow-600 font-bold uppercase">{field.label}:</span> {field.value}
                                </div>
                            )
                        ))}
                    </div>
                )}

                {cvData.skills.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-yellow-500 mb-4 border-b border-gray-700 pb-2">Expertise</h2>
                        <ul className="space-y-2">
                            {cvData.skills.filter(s => s.trim()).map((skill, idx) => (
                                <li key={idx} className="text-gray-300 text-xs flex items-center">
                                    <span className="w-2 h-2 bg-yellow-600 mr-2 rotate-45"></span>
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {cvData.language.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-yellow-500 mb-4 border-b border-gray-700 pb-2">Languages</h2>
                        <ul className="space-y-2">
                            {cvData.language.filter(l => l.trim()).map((lang, idx) => (
                                <li key={idx} className="text-gray-300 text-xs">{lang}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="w-full sm:w-2/3 p-5 sm:p-8 bg-gray-50">
                {sections.filter(s => s.enabled).map(section => {
                    if (section.id === 'personal' || section.id === 'skills' || section.id === 'language') return null;

                    if (section.id === 'summary' && cvData.summary) {
                        return (
                            <div key={section.id} className="mb-8">
                                <h2 className="text-xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-8 h-1 bg-gray-900"></span> Profile
                                </h2>
                                <p className="text-gray-700 leading-relaxed text-justify">{cvData.summary}</p>
                            </div>
                        );
                    }

                    if (section.id === 'experience' && cvData.experience.length > 0) {
                        return (
                            <div key={section.id} className="mb-8">
                                <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-8 h-1 bg-gray-900"></span> Experience
                                </h2>
                                <div className="space-y-6 relative border-l-2 border-gray-200 ml-2 pl-6">
                                    {cvData.experience.map((exp, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute -left-[31px] top-1 w-4 h-4 bg-yellow-500 border-4 border-white rounded-full"></div>
                                            <div className="flex justify-between items-baseline mb-1">
                                                {exp.title && <h3 className="font-bold text-gray-900 text-lg">{exp.title}</h3>}
                                                {(exp.startDate || exp.endDate || exp.current) && (
                                                    <p className="text-gray-500 text-xs font-bold uppercase">
                                                        {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                                        {' - '}
                                                        {exp.current ? 'Present' : exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                                    </p>
                                                )}
                                            </div>
                                            {exp.company && <p className="text-gray-600 font-serif italic mb-2">{exp.company}</p>}
                                            {exp.description && <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{exp.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    if (section.id === 'education' && cvData.education.length > 0) {
                        return (
                            <div key={section.id} className="mb-8">
                                <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-8 h-1 bg-gray-900"></span> Education
                                </h2>
                                <div className="grid gap-4">
                                    {cvData.education.map((edu, idx) => (
                                        <div key={idx} className="bg-white p-4 shadow-sm border-l-4 border-yellow-500">
                                            {edu.degree && <h3 className="font-bold text-gray-900">{edu.degree}</h3>}
                                            {edu.major && <p className="text-gray-600 text-sm">{edu.major}</p>}
                                            <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 uppercase font-bold">
                                                <span>{edu.institution}</span>
                                                {edu.year && <span>{new Date(edu.year).toLocaleDateString('en-US', { year: 'numeric' })}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    if (section.id === 'projects' && cvData.projects?.length > 0) {
                        return (
                            <div key={section.id} className="mb-8">
                                <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-8 h-1 bg-gray-900"></span> Projects
                                </h2>
                                <div className="space-y-4">
                                    {cvData.projects.map((project, idx) => (
                                        <div key={idx} className="bg-white p-4 shadow-sm border-l-4 border-yellow-500">
                                            {project.title && <h3 className="font-bold text-gray-900 text-lg">{project.title}</h3>}
                                            {project.technologies && <p className="text-gray-600 text-sm italic">{project.technologies}</p>}
                                            {project.description && <p className="text-gray-700 text-sm mt-2">{project.description}</p>}
                                            {project.link && <p className="text-gray-500 text-xs mt-2">🔗 {project.link}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    if (section.id === 'certification' && cvData.certification.length > 0) {
                        return (
                            <div key={section.id} className="mb-6">
                                <h2 className="text-xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-8 h-1 bg-gray-900"></span> Certifications
                                </h2>
                                <div className="grid grid-cols-2 gap-2">
                                    {cvData.certification.filter(c => c.trim()).map((cert, idx) => (
                                        <div key={idx} className="text-gray-700 text-sm bg-white p-2 border-l-2 border-gray-900">
                                            {cert}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );

    switch (selectedTemplate) {
        case 'minimal': return renderMinimal();
        case 'modern': return renderModern();
        case 'creative': return renderCreative();
        case 'corporate': return renderCorporate();
        case 'executive': return renderExecutive();
        default: return renderMinimal();
    }
}
