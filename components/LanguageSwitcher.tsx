'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-600" />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'id')}
                className="px-2 py-1 border-2 border-black bg-white text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
            >
                <option value="en">EN</option>
                <option value="id">ID</option>
            </select>
        </div>
    );
}
