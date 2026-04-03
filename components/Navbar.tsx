'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '@/contexts/LanguageContext';

interface NavbarProps {
    onNavigate?: (step: string) => void;
    onSectionClick?: (section: string) => void;
}

export default function Navbar({ onNavigate, onSectionClick }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        setMobileMenuOpen(false);
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
        setMobileMenuOpen(false);
        if (onSectionClick) {
            onSectionClick(section);
        } else {
            router.push('/#' + section);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setMobileMenuOpen(false);
        router.refresh();
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'id' : 'en');
    };

    return (
        <nav className="border-b-4 border-black bg-primary text-white py-3 px-4 md:py-4 md:px-12 flex justify-between items-center shadow-neo sticky top-0 z-50">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleHomeClick}>
                <Image src="/LogoPrimaryReCV.png" alt="ReCV Logo" width={100} height={34} className="object-contain w-20 md:w-[120px]" />
            </div>

            {/* Desktop Navigation */}
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

                <a href="/changelog" className="hover:underline decoration-2 underline-offset-4">Changelog</a>

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
                            <motion.button
                                onClick={handleLogout}
                                whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="text-black bg-white px-6 py-2 border-2 border-black shadow-neo-sm font-bold"
                            >
                                {t.nav.logout}
                            </motion.button>
                        </div>
                    </>
                ) : (
                    <motion.button
                        onClick={() => router.push('/login')}
                        whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="text-black bg-white px-6 py-2 border-2 border-black shadow-neo-sm font-bold"
                    >
                        {t.nav.login}
                    </motion.button>
                )}
            </div>

            {/* Mobile: Language Switcher + Hamburger */}
            <div className="flex md:hidden items-center gap-3">
                {/* Language Switcher (Mobile) */}
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1 font-bold text-xs bg-black/10 hover:bg-black/20 px-2 py-1 rounded transition-colors"
                >
                    <span className={language === 'en' ? 'text-white' : 'text-white/50'}>EN</span>
                    <span className="text-white/50">|</span>
                    <span className={language === 'id' ? 'text-white' : 'text-white/50'}>ID</span>
                </button>

                {/* Hamburger Button */}
                <motion.button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-white p-1"
                    aria-label="Toggle menu"
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {mobileMenuOpen ? (
                            <motion.span
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25, duration: 0.15 }}
                                style={{ display: 'block' }}
                            >
                                <X size={24} />
                            </motion.span>
                        ) : (
                            <motion.span
                                key="open"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25, duration: 0.15 }}
                                style={{ display: 'block' }}
                            >
                                <Menu size={24} />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        key="mobile-menu"
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="fixed inset-0 top-[57px] md:top-[65px] bg-primary z-40 flex flex-col p-6 gap-4 overflow-y-auto"
                    >
                        {[
                            { label: t.nav.home, onClick: handleHomeClick },
                            ...(isLandingPage ? [
                                { label: t.nav.features, onClick: (e: React.MouseEvent) => handleSectionClick(e, 'features') },
                                { label: t.nav.pricing, onClick: (e: React.MouseEvent) => handleSectionClick(e, 'pricing') },
                                { label: t.nav.faq, onClick: (e: React.MouseEvent) => handleSectionClick(e, 'faq') },
                            ] : []),
                        ].map((item, i) => (
                            <motion.a
                                key={item.label}
                                href="#"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                                className="text-white font-bold text-lg py-2 border-b border-white/20"
                                onClick={item.onClick}
                            >
                                {item.label}
                            </motion.a>
                        ))}

                        <motion.a
                            href="/changelog"
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (isLandingPage ? 4 : 1) * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                            className="text-white font-bold text-lg py-2 border-b border-white/20"
                        >
                            Changelog
                        </motion.a>

                        {user ? (
                            <>
                                <motion.button
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (isLandingPage ? 5 : 2) * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        router.push('/dashboard');
                                    }}
                                    className="text-white font-bold text-lg py-2 border-b border-white/20 text-left"
                                >
                                    {t.nav.dashboard}
                                </motion.button>
                                <motion.div
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (isLandingPage ? 6 : 3) * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                                    className="py-2 border-b border-white/20"
                                >
                                    <span className="text-white/80 text-sm block mb-2">{user.email}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-black bg-white px-6 py-3 border-2 border-black shadow-neo-sm font-bold text-center"
                                    >
                                        {t.nav.logout}
                                    </button>
                                </motion.div>
                            </>
                        ) : (
                            <motion.button
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (isLandingPage ? 5 : 2) * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    router.push('/login');
                                }}
                                className="w-full text-black bg-white px-6 py-3 border-2 border-black shadow-neo-sm font-bold mt-4"
                            >
                                {t.nav.login}
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
