'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, FileText, Zap, Download, Check, X, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import AlertModal from './AlertModal';
import SlideIn from './SlideIn';

interface HomeProps {
    onStart: () => void;
    tier?: 'guest' | 'free' | 'starter' | 'pro';
}

export default function Home({ onStart, tier }: HomeProps) {
    const { t } = useLanguage();
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const words = ['WRITE', 'WORD', 'BUILD', 'CREATE'];

    useEffect(() => {
        const handleType = () => {
            const i = loopNum % words.length;
            const fullText = words[i];

            setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));

            setTypingSpeed(isDeleting ? 30 : 150);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed]);

    const handlePayment = async (plan: 'starter' | 'pro') => {
        // Validation: Don't allow Pro users to pay for Starter or Pro again
        if (tier === 'pro') {
            setAlertMessage(t.pricing.alreadyMemberPro);
            setShowAlert(true);
            return;
        }

        // Validation: Don't allow Starter users to pay for Starter again
        if (plan === 'starter' && tier === 'starter') {
            setAlertMessage(t.pricing.alreadyMemberStarter);
            setShowAlert(true);
            return;
        }

        try {
            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan })
            });
            const data = await res.json();

            if (res.status === 401) {
                setAlertMessage('Please log in first to upgrade.');
                setShowAlert(true);
                return;
            }

            if (res.status === 400 && (data.error === 'ALREADY_PRO' || data.error === 'ALREADY_STARTER')) {
                setAlertMessage(data.message || `You're already a member!`);
                setShowAlert(true);
                return;
            }

            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                const errorMsg = data.message || data.error || 'Failed to create payment. Please try again.';
                setAlertMessage(errorMsg);
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Payment error:', error);
            setAlertMessage('Payment error. Please try again.');
            setShowAlert(true);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            {/* Navigation */}
            <Navbar onSectionClick={(section) => {
                const element = document.getElementById(section);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }} />

            {/* Hero Section */}
            <SlideIn delay={0.1} className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-32 relative overflow-hidden" id="home">
                <div className="text-center max-w-4xl mx-auto relative z-10">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-extrabold text-black leading-none mb-6 sm:mb-8 tracking-tight break-words">
                        {t.hero.titlePart1} {text}<span className="inline-block w-1 sm:w-2 md:w-4 h-8 sm:h-12 md:h-20 bg-primary ml-1 animate-blink align-middle"></span><br />{t.hero.titlePart2}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-700 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2">
                        {t.hero.subtitle}
                    </p>
                    <motion.button
                        onClick={onStart}
                        whileHover={{ x: 4, y: 4, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="bg-primary text-white text-base sm:text-lg md:text-xl font-bold px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 border-4 border-black shadow-neo uppercase tracking-wider w-full sm:w-auto max-w-xs sm:max-w-none"
                    >
                        {t.hero.button}
                    </motion.button>
                </div>
            </SlideIn>

            {/* Features Section */}
            <SlideIn delay={0.2} id="features" className="mt-20 sm:mt-32 md:mt-40 text-center scroll-mt-24">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary mb-12 sm:mb-16 md:mb-20 uppercase tracking-tight px-2">{t.features.title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10 max-w-7xl mx-auto px-4 sm:px-6">
                        {/* Feature 1 */}
                        <div className="bg-white border-4 border-black shadow-neo p-6 sm:p-8 md:p-10 flex flex-col items-center h-full hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary border-4 border-black mb-4 sm:mb-6 flex items-center justify-center shadow-neo-sm">
                                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{t.features.ats.title}</h3>
                            <p className="text-gray-700 font-medium">{t.features.ats.desc}</p>
                        </div>

                        {/* Feature 2 - AI Analysis */}
                        <div className="bg-white border-4 border-black shadow-neo p-6 sm:p-8 md:p-10 flex flex-col items-center h-full hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-500 border-4 border-black mb-4 sm:mb-6 flex items-center justify-center shadow-neo-sm">
                                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t.features.ai.title}</h3>
                            <p className="text-sm sm:text-base text-gray-700 font-medium">{t.features.ai.desc}</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white border-4 border-black shadow-neo p-6 sm:p-8 md:p-10 flex flex-col items-center h-full hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-400 border-4 border-black mb-4 sm:mb-6 flex items-center justify-center shadow-neo-sm">
                                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t.features.preview.title}</h3>
                            <p className="text-sm sm:text-base text-gray-700 font-medium">{t.features.preview.desc}</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white border-4 border-black shadow-neo p-6 sm:p-8 md:p-10 flex flex-col items-center h-full hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 border-4 border-black mb-4 sm:mb-6 flex items-center justify-center shadow-neo-sm">
                                <Download className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t.features.export.title}</h3>
                            <p className="text-sm sm:text-base text-gray-700 font-medium">{t.features.export.desc}</p>
                        </div>
                    </div>
            </SlideIn>
            {/* Pricing Section */}
            <SlideIn delay={0.3} id="pricing" className="mt-20 sm:mt-32 md:mt-40 text-center scroll-mt-24">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-12 sm:mb-16 md:mb-20 uppercase tracking-tight px-2">{t.pricing.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-6 md:gap-8 max-w-6xl mx-auto px-4 sm:px-6">
                        {/* Free Plan */}
                        <div className="bg-white border-4 border-black shadow-neo p-6 sm:p-8 text-left h-full flex flex-col">
                            <h3 className="text-2xl sm:text-3xl font-bold mb-2">{t.pricing.free.title}</h3>
                            <div className="text-4xl sm:text-5xl font-extrabold mb-6">{t.pricing.free.price}<span className="text-lg sm:text-xl font-medium text-gray-500">{t.pricing.perMonth}</span></div>
                            <ul className="space-y-4 mb-8 flex-grow">
                                <li className="flex items-center gap-3 font-bold">
                                    <Check className="w-6 h-6 text-green-600 border-2 border-black p-0.5" />
                                    {t.pricing.free.features.basic}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <Check className="w-6 h-6 text-green-600 border-2 border-black p-0.5" />
                                    {t.pricing.free.features.watermark}
                                </li>
                                <li className="flex items-center gap-3 font-bold text-gray-500">
                                    <Check className="w-6 h-6 text-green-600 border-2 border-black p-0.5" />
                                    {t.pricing.free.features.aiLimit}
                                </li>
                                <li className="flex items-center gap-3 font-bold text-gray-500">
                                    <Check className="w-6 h-6 text-green-600 border-2 border-black p-0.5" />
                                    {t.pricing.free.features.coverLetter}
                                </li>
                            </ul>
                            <motion.button 
                                onClick={onStart} 
                                whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="w-full py-4 border-4 border-black bg-white hover:bg-gray-50 font-extrabold text-xl shadow-neo-sm mt-auto"
                            >
                                {t.pricing.free.button}
                            </motion.button>
                        </div>

                        {/* Starter Plan */}
                        <div className="bg-white text-blue-500 border-4 border-black shadow-neo p-6 sm:p-8 text-left relative h-full flex flex-col">
                            <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 font-extrabold text-[10px] tracking-widest uppercase border-l-4 border-b-4 border-black z-20">{t.pricing.popular}</div>
                            <h3 className="text-2xl sm:text-3xl font-bold mb-2 mt-4 sm:mt-0">{t.pricing.starter ? t.pricing.starter.title : 'Starter'}</h3>
                            <div className="text-4xl sm:text-5xl font-extrabold mb-6 text-black">{t.pricing.starter ? t.pricing.starter.price : 'Rp.5k'}<span className="text-lg sm:text-xl font-medium text-gray-500">{t.pricing.perMonth}</span></div>
                            <ul className="space-y-4 mb-8 flex-grow">
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-green-600" /></div>
                                    {t.pricing.starter ? t.pricing.starter.features.premium : 'All Premium Templates'}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-green-600" /></div>
                                    {t.pricing.starter ? t.pricing.starter.features.noWatermark : 'PDF Export (No Watermark)'}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-green-600" /></div>
                                    {t.pricing.starter ? t.pricing.starter.features.aiLimit : '10 AI Credits per day'}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-green-600" /></div>
                                    {t.pricing.starter ? t.pricing.starter.features.cvLimit : 'Up to 2 Saved CVs'}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-green-600" /></div>
                                    {t.pricing.starter ? t.pricing.starter.features.coverLetter : 'AI Cover Letter Generator (2)'}
                                </li>
                            </ul>
                            <motion.button
                                onClick={() => handlePayment('starter')}
                                whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="w-full py-4 border-4 border-black bg-blue-500 text-white font-extrabold text-xl shadow-neo-sm mt-auto hover:bg-blue-600 transition-colors"
                            >
                                {t.pricing.starter ? t.pricing.starter.button : 'Go Starter'}
                            </motion.button>
                        </div>

                        {/* Pro Plan (Hero) */}
                        <div className="bg-primary text-white border-4 border-black shadow-neo p-6 sm:p-8 text-left relative transform md:-translate-y-4 h-full flex flex-col z-10">
                            <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 sm:px-6 py-2 border-4 border-black font-extrabold text-sm sm:text-base shadow-neo-sm transform rotate-2 whitespace-nowrap">{t.pricing.bestValue}</div>
                            <h3 className="text-2xl sm:text-3xl font-bold mb-2 mt-4 sm:mt-0">{t.pricing.pro.title}</h3>
                            <div className="text-4xl sm:text-5xl font-extrabold mb-6">{t.pricing.pro.price}<span className="text-lg sm:text-xl font-medium text-blue-100">{t.pricing.perMonth}</span></div>
                            <ul className="space-y-4 mb-8 flex-grow">
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-green-600" /></div>
                                    {t.pricing.pro.features.premium}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-green-600" /></div>
                                    {t.pricing.pro.features.noWatermark}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-green-600" /></div>
                                    {t.pricing.pro.features.aiLimit}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-green-600" /></div>
                                    {t.pricing.pro.features.coverLetter}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-green-600" /></div>
                                    {t.pricing.pro.features.support}
                                </li>
                            </ul>
                            <motion.button
                                onClick={() => handlePayment('pro')}
                                whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="w-full py-4 border-4 border-black bg-yellow-400 text-black font-extrabold text-xl shadow-neo-sm mt-auto"
                            >
                                {t.pricing.pro.button}
                            </motion.button>
                        </div>
                    </div>
            </SlideIn>

            {/* FAQ Section */}
            <SlideIn delay={0.4} id="faq" className="mt-20 sm:mt-32 md:mt-40 mb-12 sm:mb-16 md:mb-20 max-w-4xl mx-auto px-4 sm:px-6 scroll-mt-24">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-10 sm:mb-14 md:mb-16 text-center uppercase tracking-tight px-2">{t.faq.title}</h2>
                    <div className="space-y-6">
                        {[
                            t.faq.q1,
                            t.faq.q2,
                            t.faq.q3,
                            t.faq.q4
                        ].map((item, i) => (
                            <div key={i} className="border-4 border-black shadow-neo bg-white p-6">
                                <h3 className="text-xl font-bold mb-2 flex items-start gap-3">
                                    <span className="bg-primary text-white border-2 border-black w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm">Q</span>
                                    {item.q}
                                </h3>
                                <p className="text-gray-700 ml-11 font-medium">{item.a}</p>
                            </div>
                        ))}
                    </div>
            </SlideIn>

            {/* Footer */}
            <SlideIn delay={0.5}>
                <footer className="border-t-4 border-black bg-gray-100 py-12">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <p className="font-bold text-gray-600 text-center leading-relaxed">
                                © 2026 ReCV. {t.footer.madeWith}{' '}
                                <svg className="w-4 h-4 text-red-500 fill-red-500 inline align-middle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                {' '}{t.footer.by}
                        </p>
                            <div className="flex gap-4 sm:gap-8 font-bold text-gray-600 flex-wrap justify-center">
                                <a href="/privacy" className="hover:text-black hover:underline">{t.footer.privacy}</a>
                                <a href="/terms" className="hover:text-black hover:underline">{t.footer.terms}</a>
                                <a href="/templates" className="hover:text-black hover:underline">{t.footer.templates}</a>
                                <button onClick={() => window.dispatchEvent(new Event('open-support'))} className="hover:text-black hover:underline font-bold text-gray-600">{t.footer.contact}</button>
                                <a href="https://instagram.com/zcostudio" target="_blank" rel="noopener noreferrer" className="hover:text-black hover:underline">Instagram</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </SlideIn>

            <AlertModal
                isOpen={showAlert}
                onClose={() => {
                    setShowAlert(false);
                    if (alertMessage.includes('log in')) {
                        window.location.href = '/login';
                    }
                }}
                message={alertMessage}
            />
        </div>
    );
}
