'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, FileText, Zap, Download, Check, X } from 'lucide-react';
import Navbar from './Navbar';

interface HomeProps {
    onStart: () => void;
}

export default function Home({ onStart }: HomeProps) {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

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
                        Re {text}<span className="inline-block w-2 md:w-4 h-12 md:h-20 bg-primary ml-1 animate-blink align-middle"></span><br />Your CV
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Just like it's name. We help you enhance your CV tailored to your needs. Stand out with a resume that gets you hired.
                    </p>
                    <button
                        onClick={onStart}
                        className="bg-primary text-white text-xl font-bold px-10 py-5 border-4 border-black shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all uppercase tracking-wider"
                    >
                        Try Now Free
                    </button>
                </div>

                {/* Features Section */}
                <div id="features" className="mt-40 text-center scroll-mt-24">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-primary mb-20 uppercase tracking-tight">Features</h2>
                    <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        {/* Feature 1 */}
                        <div className="bg-white border-4 border-black shadow-neo p-10 flex flex-col items-center h-full hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-20 h-20 bg-primary border-4 border-black mb-6 flex items-center justify-center shadow-neo-sm">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">ATS-Friendly</h3>
                            <p className="text-gray-700 font-medium">Optimized structure and formatting to ensure your CV gets past Applicant Tracking Systems and reaches human eyes.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white border-4 border-black shadow-neo p-10 flex flex-col items-center h-full hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-20 h-20 bg-yellow-400 border-4 border-black mb-6 flex items-center justify-center shadow-neo-sm">
                                <Zap className="w-10 h-10 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Real-time Preview</h3>
                            <p className="text-gray-700 font-medium">See your changes instantly as you type. No more guessing how your resume will look after export.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white border-4 border-black shadow-neo p-10 flex flex-col items-center h-full hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-20 h-20 bg-green-500 border-4 border-black mb-6 flex items-center justify-center shadow-neo-sm">
                                <Download className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">PDF Export</h3>
                            <p className="text-gray-700 font-medium">Download high-quality, professional PDFs ready for job applications with a single click.</p>
                        </div>
                    </div>
                </div>
                {/* Pricing Section */}
                <div id="pricing" className="mt-40 text-center scroll-mt-24">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-20 uppercase tracking-tight">Pricing</h2>
                    <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto px-4">
                        {/* Free Plan */}
                        <div className="bg-white border-4 border-black shadow-neo p-8 text-left relative">
                            <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 font-bold text-sm border-l-4 border-b-4 border-white">POPULAR</div>
                            <h3 className="text-3xl font-bold mb-2">Free</h3>
                            <div className="text-5xl font-extrabold mb-6">$0<span className="text-xl font-medium text-gray-500">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 font-bold">
                                    <Check className="w-6 h-6 text-green-600 border-2 border-black p-0.5" />
                                    Basic Templates
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <Check className="w-6 h-6 text-green-600 border-2 border-black p-0.5" />
                                    PDF Export (Watermarked)
                                </li>
                                <li className="flex items-center gap-3 font-bold text-gray-400">
                                    <X className="w-6 h-6 text-red-500 border-2 border-gray-400 p-0.5" />
                                    1 AI Analysis per day
                                </li>
                                <li className="flex items-center gap-3 font-bold text-gray-400">
                                    <X className="w-6 h-6 text-red-500 border-2 border-gray-400 p-0.5" />
                                    Cover Letter Builder
                                </li>
                            </ul>
                            <button onClick={onStart} className="w-full py-4 border-4 border-black bg-white hover:bg-gray-50 font-extrabold text-xl shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                Start for Free
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-primary text-white border-4 border-black shadow-neo p-8 text-left relative transform md:-translate-y-4">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-2 border-4 border-black font-extrabold shadow-neo-sm transform rotate-2">BEST VALUE</div>
                            <h3 className="text-3xl font-bold mb-2">Pro</h3>
                            <div className="text-5xl font-extrabold mb-6">$12<span className="text-xl font-medium text-blue-100">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-black" /></div>
                                    All Premium Templates
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-black" /></div>
                                    Unlimited PDF Exports
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-black" /></div>
                                    50 AI Analyses per day
                                </li>
                                <li className="flex items-center gap-3 font-bold">
                                    <div className="bg-white border-2 border-black p-0.5"><Check className="w-4 h-4 text-black" /></div>
                                    Priority Support
                                </li>
                            </ul>
                            <button className="w-full py-4 border-4 border-black bg-yellow-400 text-black font-extrabold text-xl shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                Go Pro
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div id="faq" className="mt-40 mb-20 max-w-4xl mx-auto px-6 scroll-mt-24">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-16 text-center uppercase tracking-tight">FAQ</h2>
                    <div className="space-y-6">
                        {[
                            { q: "Is ReCV really free?", a: "Yes! You can build your resume and export it for free. Our Pro plan offers advanced features like AI suggestions and premium templates." },
                            { q: "Do I need an account?", a: "No. You can build immediately. All CV data is stored in your browser's Local Storage. If you create an account, we only store your basic profile info." },
                            { q: "Is my data safe?", a: "Absolutely. We do not sell your data. Your resume information is stored locally on your device unless you create an account." },
                            { q: "How does the AI work?", a: "Our AI analyzes your experience and suggests improvements to make your bullet points more impactful and action-oriented." }
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
                            <Image src="/LogoPrimaryReCV.png" alt="ReCV Logo" width={100} height={34} className="object-contain opacity-50 grayscale hover:grayscale-0 transition-all" />
                            <span className="font-bold text-gray-500">© 2024 ReCV Inc.</span>
                        </div>
                        <div className="flex gap-8 font-bold text-gray-600">
                            <a href="#" className="hover:text-black hover:underline">Privacy</a>
                            <a href="#" className="hover:text-black hover:underline">Terms</a>
                            <a href="#" className="hover:text-black hover:underline">Contact</a>
                            <a href="#" className="hover:text-black hover:underline">Twitter</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
