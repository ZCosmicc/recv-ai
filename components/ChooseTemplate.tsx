'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2, Crown, Lock } from 'lucide-react';
import { templates } from './CVPreview';
import CVPreview from './CVPreview';
import { CVData, Section } from '../types';
import Navbar from './Navbar';
import LimitModal from './LimitModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import SlideIn from './SlideIn';

const DUMMY_SECTIONS: Section[] = [
    { id: 'personal', name: 'Personal', required: true, enabled: true },
    { id: 'summary', name: 'Summary', required: true, enabled: true },
    { id: 'experience', name: 'Experience', required: true, enabled: true },
    { id: 'education', name: 'Education', required: true, enabled: true },
    { id: 'skills', name: 'Skills', required: false, enabled: true },
    { id: 'projects', name: 'Projects', required: false, enabled: true },
];

const DUMMY_CV_DATA: CVData = {
    personal: {
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        customFields: [
            { id: 'custom-1', label: 'LinkedIn', value: 'linkedin.com/in/alexmorgan' },
            { id: 'custom-2', label: 'Portfolio', value: 'alexmorgan.design' }
        ]
    },
    summary: 'Creative and detail-oriented professional with 5+ years of experience in digital design and project management. Proven track record of delivering high-quality visual solutions. Adept at leading cross-functional teams and managing projects from concept to completion.',
    experience: [
        {
            id: 'exp-1',
            title: 'Senior Product Designer',
            company: 'Creative Studio',
            startDate: '2021-01-01',
            endDate: '',
            current: true,
            description: 'Leading a team of designers to create stunning visual assets for global brands.\nSpearheaded the redesign of the company website, increasing engagement by 40%.\nMentored junior designers and conducted code reviews to ensure high-quality output.'
        },
        {
            id: 'exp-2',
            title: 'UX/UI Designer',
            company: 'Tech Solutions Inc.',
            startDate: '2019-06-01',
            endDate: '2020-12-31',
            current: false,
            description: 'Designed user-friendly interfaces for web and mobile applications.\nCollaborated with developers to implement designs and ensure pixel-perfect consistency.\nConducted user research and usability testing to gather feedback and improve designs.'
        },
        {
            id: 'exp-3',
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
            id: 'edu-1',
            degree: 'Master of Arts',
            major: 'Interaction Design',
            institution: 'Royal College of Art',
            year: '2021-06-15'
        },
        {
            id: 'edu-2',
            degree: 'Bachelor of Fine Arts',
            major: 'Graphic Design',
            institution: 'New York University',
            year: '2019-05-15'
        }
    ],
    skills: [
        { id: 'skill-1', value: 'Figma' },
        { id: 'skill-2', value: 'Adobe XD' },
        { id: 'skill-3', value: 'Photoshop' },
        { id: 'skill-4', value: 'Illustrator' },
        { id: 'skill-5', value: 'React' },
        { id: 'skill-6', value: 'HTML/CSS' },
        { id: 'skill-7', value: 'Tailwind CSS' },
        { id: 'skill-8', value: 'Project Management' },
        { id: 'skill-9', value: 'User Research' }
    ],
    projects: [
        {
            id: 'proj-1',
            title: 'E-Commerce Redesign',
            description: 'Led the UI/UX redesign of a major e-commerce platform, improving conversion rates by 15%.',
            technologies: 'Figma, React, Tailwind CSS',
            link: 'https://example.com/project1'
        },
        {
            id: 'proj-2',
            title: 'Mobile Banking App',
            description: 'Designed a secure and intuitive mobile banking experience for a fintech startup.',
            technologies: 'Adobe XD, Flutter',
            link: 'https://example.com/project2'
        }
    ],
    certification: [
        { id: 'cert-1', value: 'Google UX Design Professional Certificate' },
        { id: 'cert-2', value: 'Certified ScrumMaster (CSM)' }
    ],
    language: [
        { id: 'lang-1', value: 'English (Native)' },
        { id: 'lang-2', value: 'Spanish (Professional)' },
        { id: 'lang-3', value: 'French (Basic)' }
    ]
};

interface ChooseTemplateProps {
    selectedTemplate: string | null;
    onSelectTemplate: (id: string) => void;
    onBack: () => void;
    onClearData: () => void;
    hasSavedData: boolean;
    tier?: 'guest' | 'free' | 'starter' | 'pro';
}

export default function ChooseTemplate({
    selectedTemplate,
    onSelectTemplate,
    onBack,
    onClearData,
    hasSavedData,
    tier = 'guest'
}: ChooseTemplateProps) {
    const { t } = useLanguage();
    const [showLimitModal, setShowLimitModal] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <React.Fragment>
                <nav className="sticky top-0 z-50">
                    {/* Replaced with shared Navbar component */}
                </nav>
                {/* Note: The parent page passes props, but for ChooseTemplate, we need to ensure Navbar handles the navigation props correctly if needed. 
                   However, Navbar handles internal routing for login/dashboard. The "Home" link in Navbar uses onNavigate if provided.
               */}
            </React.Fragment>
            {/* Actually, looking at the code, ChooseTemplate receives `onBack`. Use Navbar with onNavigate. */}
            <Navbar onNavigate={(step) => {
                if (step === 'home') onBack();
            }} />

            <div className="flex-1 bg-white p-4 sm:p-6 md:p-8 relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-0">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">{t.chooseTemplate.title}</h1>
                        </div>
                        {hasSavedData && (
                            <motion.button
                                onClick={onClearData}
                                whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white bg-red-500 font-bold border-2 border-black shadow-neo-sm rounded-none text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t.chooseTemplate.clearData}
                            </motion.button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                        {templates.map((template, index) => {
                            const isLocked = (template.isPremium && tier !== 'pro' && tier !== 'starter');
                            return (
                                <SlideIn key={template.id} delay={index * 0.1} className="h-full w-full">
                                    <motion.button
                                        onClick={() => {
                                        if (isLocked) {
                                            setShowLimitModal(true);
                                            return;
                                        }
                                        onSelectTemplate(template.id);
                                    }}
                                    whileHover={!isLocked ? { y: -8 } : {}}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className={`w-full p-4 sm:p-5 md:p-6 bg-white border-4 border-black shadow-neo text-left group relative flex flex-col h-full ${selectedTemplate === template.id ? 'bg-primary' : ''} ${isLocked ? 'cursor-not-allowed opacity-90' : ''}`}
                                >
                                    {template.isPremium && (
                                        <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-20 bg-yellow-400 text-black px-2 sm:px-3 py-1 font-bold border-2 border-black shadow-neo-sm flex items-center gap-1 sm:gap-2 text-xs">
                                            <Crown className="w-3 h-3" /> <span className="hidden sm:inline">PRO</span>
                                        </div>
                                    )}

                                    <div className={`w-full h-[200px] sm:h-[250px] md:h-[450px] border-2 border-black mb-3 sm:mb-4 overflow-hidden relative bg-gray-100 ${selectedTemplate === template.id ? 'bg-white' : ''}`}>
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[210mm] origin-top transform scale-[0.18] sm:scale-[0.22] md:scale-[0.4] pointer-events-none select-none bg-white shadow-lg mt-2 sm:mt-4">
                                            <CVPreview
                                                cvData={DUMMY_CV_DATA}
                                                sections={DUMMY_SECTIONS}
                                                selectedTemplate={template.id}
                                            />
                                        </div>
                                        {/* Overlay to Prevent Interaction */}
                                        <div className="absolute inset-0 z-10"></div>

                                        {/* Lock Overlay for Non-Pro (Hover Only) */}
                                        {isLocked && (
                                            <div className="absolute inset-0 z-10 bg-black/20 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-white border-4 border-black p-3 sm:p-4 shadow-neo flex flex-col items-center transform scale-90 group-hover:scale-100 transition-transform duration-300 relative z-20">
                                                    <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-black mb-1 sm:mb-2" />
                                                    <span className="font-bold text-xs sm:text-sm">{t.chooseTemplate.locked}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`w-full text-center py-2 font-bold border-4 border-black text-sm sm:text-base ${isLocked
                                        ? 'bg-yellow-400 text-black'
                                        : 'bg-primary text-white'
                                        }`}>
                                        {isLocked ? t.limitModal.upgradeToPro : template.name}
                                    </div>
                                    </motion.button>
                                </SlideIn>
                            );
                        })}
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
