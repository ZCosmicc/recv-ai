'use client';

import React from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { templates } from './CVPreview';
import CVPreview from './CVPreview';
import { CVData, Section } from '../types';

const DUMMY_SECTIONS: Section[] = [
    { id: 'personal', name: 'Personal', required: true, enabled: true },
    { id: 'summary', name: 'Summary', required: true, enabled: true },
    { id: 'experience', name: 'Experience', required: true, enabled: true },
    { id: 'education', name: 'Education', required: true, enabled: true },
    { id: 'skills', name: 'Skills', required: false, enabled: true },
];

const DUMMY_CV_DATA: CVData = {
    personal: {
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        customFields: [
            { label: 'LinkedIn', value: 'linkedin.com/in/alexmorgan' },
            { label: 'Portfolio', value: 'alexmorgan.design' }
        ]
    },
    summary: 'Creative and detail-oriented professional with 5+ years of experience in digital design and project management. Proven track record of delivering high-quality visual solutions. Adept at leading cross-functional teams and managing projects from concept to completion.',
    experience: [
        {
            title: 'Senior Product Designer',
            company: 'Creative Studio',
            startDate: '2021-01-01',
            endDate: '',
            current: true,
            description: 'Leading a team of designers to create stunning visual assets for global brands.\nSpearheaded the redesign of the company website, increasing engagement by 40%.\nMentored junior designers and conducted code reviews to ensure high-quality output.'
        },
        {
            title: 'UX/UI Designer',
            company: 'Tech Solutions Inc.',
            startDate: '2019-06-01',
            endDate: '2020-12-31',
            current: false,
            description: 'Designed user-friendly interfaces for web and mobile applications.\nCollaborated with developers to implement designs and ensure pixel-perfect consistency.\nConducted user research and usability testing to gather feedback and improve designs.'
        },
        {
            title: 'Junior Graphic Designer',
            company: 'Design Co.',
            startDate: '2018-01-01',
            endDate: '2019-05-31',
            current: false,
            description: 'Assisted senior designers in creating marketing materials and social media graphics.\nManaged multiple projects simultaneously and met tight deadlines.'
        }
    ],
    education: [
        {
            degree: 'Master of Arts',
            major: 'Interaction Design',
            institution: 'Royal College of Art',
            year: '2021-06-15'
        },
        {
            degree: 'Bachelor of Fine Arts',
            major: 'Graphic Design',
            institution: 'New York University',
            year: '2019-05-15'
        }
    ],
    skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'React', 'HTML/CSS', 'Tailwind CSS', 'Project Management', 'User Research'],
    certification: ['Google UX Design Professional Certificate', 'Certified ScrumMaster (CSM)'],
    language: ['English (Native)', 'Spanish (Professional)', 'French (Basic)']
};

interface ChooseTemplateProps {
    selectedTemplate: string | null;
    onSelectTemplate: (id: string) => void;
    onBack: () => void;
    onClearData: () => void;
    hasSavedData: boolean;
}

export default function ChooseTemplate({
    selectedTemplate,
    onSelectTemplate,
    onBack,
    onClearData,
    hasSavedData
}: ChooseTemplateProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="border-b-4 border-black bg-primary text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-neo">
                <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
                    <Image src="/LogoPrimaryReCV.png" alt="ReCV Logo" width={120} height={40} className="object-contain" />
                </div>
                <div className="hidden md:flex items-center gap-8 font-bold text-sm">
                    <a href="#" className="hover:underline decoration-2 underline-offset-4" onClick={onBack}>Home</a>
                    <a href="#" className="hover:underline decoration-2 underline-offset-4">Features</a>
                    <a href="#" className="hover:underline decoration-2 underline-offset-4">Pricing</a>
                    <a href="#" className="hover:underline decoration-2 underline-offset-4">FAQ</a>
                    <button className="text-black bg-white px-6 py-2 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold">Log in</button>
                    <button className="text-black bg-white px-6 py-2 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold">Sign Up</button>
                </div>
            </nav>

            <div className="flex-1 bg-white p-8 relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-primary mb-2">Choose Template</h1>
                        </div>
                        {hasSavedData && (
                            <button
                                onClick={onClearData}
                                className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 font-bold border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear Data
                            </button>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {templates.map(template => (
                            <button
                                key={template.id}
                                onClick={() => onSelectTemplate(template.id)}
                                className={`p-6 bg-white border-4 border-black transition-transform duration-300 hover:-translate-y-2 shadow-neo text-left group relative flex flex-col h-full ${selectedTemplate === template.id ? 'bg-primary' : ''}`}
                            >
                                <div className={`w-full h-[250px] md:h-[450px] border-2 border-black mb-4 overflow-hidden relative bg-gray-100 ${selectedTemplate === template.id ? 'bg-white' : ''}`}>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[210mm] origin-top transform scale-[0.22] md:scale-[0.4] pointer-events-none select-none bg-white shadow-lg mt-4">
                                        <CVPreview
                                            cvData={DUMMY_CV_DATA}
                                            sections={DUMMY_SECTIONS}
                                            selectedTemplate={template.id}
                                        />
                                    </div>
                                    {/* Overlay to Prevent Interaction */}
                                    <div className="absolute inset-0 z-10"></div>
                                </div>
                                <div className={`w-full text-center py-2 font-bold border-2 border-black ${selectedTemplate === template.id ? 'bg-primary text-white border-white' : 'bg-primary text-white'}`}>
                                    {template.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
