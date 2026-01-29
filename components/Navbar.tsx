'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

import { useLanguage } from '@/contexts/LanguageContext';

interface NavbarProps {
    onNavigate?: (step: string) => void;
    onSectionClick?: (section: string) => void;
}

export default function Navbar({ onNavigate, onSectionClick }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();
    const { language, setLanguage, t } = useLanguage();

    // Check if we're on the landing page
    const isLandingPage = pathname === '/' && !onNavigate;

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleHomeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onSectionClick) {
            onSectionClick('home');
        } else if (onNavigate) {
            onNavigate('home');
        } else {
            router.push('/');
        }
    };

    const handleSectionClick = (e: React.MouseEvent, section: string) => {
        e.preventDefault();
        if (onSectionClick) {
            onSectionClick(section);
        } else {
            router.push('/#' + section);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'id' : 'en');
    };

    return (
        <nav className="border-b-4 border-black bg-primary text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-neo sticky top-0 z-50">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleHomeClick}>
                <Image src="/LogoPrimaryReCV.png" alt="ReCV Logo" width={120} height={40} className="object-contain" />
            </div>
            <div className="hidden md:flex items-center gap-8 font-bold text-sm">
                {/* Language Switcher */}
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1 font-bold text-sm bg-black/10 hover:bg-black/20 px-3 py-1 rounded transition-colors"
                >
                    <span className={language === 'en' ? 'text-white' : 'text-white/50'}>EN</span>
                    <span className="text-white/50">|</span>
                    <span className={language === 'id' ? 'text-white' : 'text-white/50'}>ID</span>
                </button>

                <a href="#" className="hover:underline decoration-2 underline-offset-4" onClick={handleHomeClick}>{t.nav.home}</a>

                {/* Only show Features, Pricing, FAQ on landing page */}
                {isLandingPage && (
                    <>
                        <a href="#features" className="hover:underline decoration-2 underline-offset-4" onClick={(e) => handleSectionClick(e, 'features')}>{t.nav.features}</a>
                        <a href="#pricing" className="hover:underline decoration-2 underline-offset-4" onClick={(e) => handleSectionClick(e, 'pricing')}>{t.nav.pricing}</a>
                        <a href="#faq" className="hover:underline decoration-2 underline-offset-4" onClick={(e) => handleSectionClick(e, 'faq')}>{t.nav.faq}</a>
                    </>
                )}

                {user ? (
                    <>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="hover:underline decoration-2 underline-offset-4"
                        >
                            {t.nav.dashboard}
                        </button>
                        <div className="flex items-center gap-4">
                            <span className="text-xs opacity-80 truncate max-w-[150px]">{user.email}</span>
                            <button
                                onClick={handleLogout}
                                className="text-black bg-white px-6 py-2 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
                            >
                                {t.nav.logout}
                            </button>
                        </div>
                    </>
                ) : (
                    <button
                        onClick={() => router.push('/login')}
                        className="text-black bg-white px-6 py-2 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
                    >
                        {t.nav.login}
                    </button>
                )}
            </div>
        </nav>
    );
}
