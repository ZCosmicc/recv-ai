'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, FileText, Zap, Download, Check, X, Sparkles } from 'lucide-react';
import Navbar from './Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import AlertModal from './AlertModal';

interface HomeProps {
    onStart: () => void;
}

export default function Home({ onStart }: HomeProps) {
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
            <div id="home" className="container mx-auto px-6 py-20 md:py-32 relative overflow-hidden">
                <div className="text-center max-w-4xl mx-auto relative z-10">
                    <h1 className="text-7xl md:text-9xl font-extrabold text-black leading-none mb-8 tracking-tight">
                        {t.hero.titlePart1} {text}<span className="inline-block w-2 md:w-4 h-12 md:h-20 bg-primary ml-1 animate-blink align-middle"></span><br />{t.hero.titlePart2}
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
                        {t.hero.subtitle}
                    </p>
                    <button
                        onClick={onStart}
                        className="bg-primary text-white text-xl font-bold px-10 py-5 border-4 border-black shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all uppercase tracking-wider"
                    >
                        {t.hero.button}
                    </button>
                </div>

                {/* Features Section */}
                <div id="features" className="mt-40 text-center scroll-mt-24">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-primary mb-20 uppercase tracking-tight">{t.features.title}</h2>
                    <div className="grid md:grid-cols-4 gap-10 max-w-7xl mx-auto">
                        {/* Feature 1 */}
                        <div className="bg-white border-4 border-black shadow-neo p-10 flex flex-col items-center h-full hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-20 h-20 bg-primary border-4 border-black mb-6 flex items-center justify-center shadow-neo-sm">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{t.features.ats.title}</h3>
                            <p className="text-gray-700 font-medium">{t.features.ats.desc}</p>
                        </div>

                        {/* Feature 2 - AI Analysis */}
                        <div className="bg-white border-4 border-black shadow-neo p-10 flex flex-col items-center h-full hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-20 h-20 bg-purple-500 border-4 border-black mb-6 flex items-center justify-center shadow-neo-sm">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{t.features.ai.title}</h3>
                            <p className="text-gray-700 font-medium">{t.features.ai.desc}</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white border-4 border-black shadow-neo p-10 flex flex-col items-center h-full hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-20 h-20 bg-yellow-400 border-4 border-black mb-6 flex items-center justify-center shadow-neo-sm">
                                <Zap className="w-10 h-10 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{t.features.preview.title}</h3>
                            <p className="text-gray-700 font-medium">{t.features.preview.desc}</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white border-4 border-black shadow-neo p-10 flex flex-col items-center h-full hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-20 h-20 bg-green-500 border-4 border-black mb-6 flex items-center justify-center shadow-neo-sm">
                                <Download className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{t.features.export.title}</h3>
                            <p className="text-gray-700 font-medium">{t.features.export.desc}</p>
                        </div>
                    </div>
                </div>
                {/* Pricing Section */}
                <div id="pricing" className="mt-40 text-center scroll-mt-24">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-20 uppercase tracking-tight">{t.pricing.title}</h2>
                    <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto px-4">
                        {/* Free Plan */}
                        <div className="bg-white border-4 border-black shadow-neo p-8 text-left relative">
                            <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 font-bold text-sm border-l-4 border-b-4 border-white">{t.pricing.popular}</div>
                            <h3 className="text-3xl font-bold mb-2">{t.pricing.free.title}</h3>
                            <div className="text-5xl font-extrabold mb-6">{t.pricing.free.price}<span className="text-xl font-medium text-gray-500">{t.pricing.perMonth}</span></div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 font-bold">
                                    <Check className="w-6 h-6 text-green-600 border-2 border-black p-0.5" />
                                    {t.pricing.free.features.basic}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <Check className="w-6 h-6 text-green-600 border-2 border-black p-0.5" />
                                    {t.pricing.free.features.watermark}
                                </li>
                                <li className="flex items-center gap-3 font-bold text-gray-400">
                                    <X className="w-6 h-6 text-red-500 border-2 border-gray-400 p-0.5" />
                                    {t.pricing.free.features.aiLimit}
                                </li>
                                <li className="flex items-center gap-3 font-bold text-gray-400">
                                    <X className="w-6 h-6 text-red-500 border-2 border-gray-400 p-0.5" />
                                    {t.pricing.free.features.coverLetter}
                                </li>
                            </ul>
                            <button onClick={onStart} className="w-full py-4 border-4 border-black bg-white hover:bg-gray-50 font-extrabold text-xl shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                {t.pricing.free.button}
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-primary text-white border-4 border-black shadow-neo p-8 text-left relative transform md:-translate-y-4">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-2 border-4 border-black font-extrabold shadow-neo-sm transform rotate-2">{t.pricing.bestValue}</div>
                            <h3 className="text-3xl font-bold mb-2">{t.pricing.pro.title}</h3>
                            <div className="text-5xl font-extrabold mb-6">{t.pricing.pro.price}<span className="text-xl font-medium text-blue-100">{t.pricing.perMonth}</span></div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-black" /></div>
                                    {t.pricing.pro.features.premium}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-black" /></div>
                                    {t.pricing.pro.features.noWatermark}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-black" /></div>
                                    {t.pricing.pro.features.aiLimit}
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-black" /></div>
                                    {t.pricing.pro.features.support}
                                </li>
                            </ul>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/payment/create', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' }
                                        });
                                        const data = await res.json();

                                        if (res.status === 401) {
                                            // User not logged in
                                            setAlertMessage('Please log in first to upgrade to Pro.');
                                            setShowAlert(true);
                                            return;
                                        }

                                        if (data.paymentUrl) {
                                            window.location.href = data.paymentUrl;
                                        } else {
                                            const errorMsg = data.error || 'Failed to create payment. Please try again.';
                                            setAlertMessage(errorMsg);
                                            setShowAlert(true);
                                        }
                                    } catch (error) {
                                        console.error('Payment error:', error);
                                        setAlertMessage('Payment error. Please try again.');
                                        setShowAlert(true);
                                    }
                                }}
                                className="w-full py-4 border-4 border-black bg-yellow-400 text-black font-extrabold text-xl shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            >
                                {t.pricing.pro.button}
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div id="faq" className="mt-40 mb-20 max-w-4xl mx-auto px-6 scroll-mt-24">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-16 text-center uppercase tracking-tight">{t.faq.title}</h2>
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
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t-4 border-black bg-gray-100 py-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-600 flex items-center gap-1">
                                © 2026 ReCV. {t.footer.madeWith}
                                <svg className="w-4 h-4 text-red-500 fill-red-500 inline" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                {t.footer.by}
                            </span>
                        </div>
                        <div className="flex gap-8 font-bold text-gray-600 flex-wrap justify-center">
                            <a href="/privacy" className="hover:text-black hover:underline">{t.footer.privacy}</a>
                            <a href="/terms" className="hover:text-black hover:underline">{t.footer.terms}</a>
                            <a href="mailto:farizfadillah612@gmail.com" className="hover:text-black hover:underline">{t.footer.contact}</a>
                            <a href="https://instagram.com/zcostudio" target="_blank" rel="noopener noreferrer" className="hover:text-black hover:underline">Instagram</a>
                        </div>
                    </div>
                </div>
            </footer>

            <AlertModal
                isOpen={showAlert}
                onClose={() => {
                    setShowAlert(false);
                    if (alertMessage.includes('log in')) {
                        window.location.href = '/login';
                    }
                }}
                title="Notice"
                message={alertMessage}
            />
        </div>
    );
}
