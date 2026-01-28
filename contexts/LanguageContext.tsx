'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, Translations } from '@/lib/i18n/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    // Initialize language on mount
    useEffect(() => {
        // 1. Check localStorage first
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'en' || saved === 'id')) {
            setLanguageState(saved);
            return;
        }

        // 2. Auto-detect from browser
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('id')) {
            setLanguageState('id');
            localStorage.setItem('language', 'id');
        } else {
            setLanguageState('en');
            localStorage.setItem('language', 'en');
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
