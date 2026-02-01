'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import CoverLetterWizard from '@/components/CoverLetterWizard';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CreateCoverLetterPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{t.coverLetter.createTitle}</h1>
                    <p className="text-gray-600">{t.coverLetter.createDesc}</p>
                </div>

                <CoverLetterWizard />
            </div>
        </div>
    );
}
