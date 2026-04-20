'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SlideIn from '@/components/SlideIn';
import CVPreview from '@/components/CVPreview';
import { DUMMY_CV_DATA, DUMMY_SECTIONS } from '@/components/ChooseTemplate';

const templates = [
    {
        id: 'minimal',
        name: 'Minimal',
        category: 'Classic',
        description: 'A timeless, centered layout that strips away the noise to prioritize your content. Highly effective for traditional industry applications.',
        bestFor: 'Academic researchers, Law professionals, and Traditional Corporate roles.',
        features: ['Perfect ATS Compliance', 'Centered Hero Header', 'Single-Column Clarity']
    },
    {
        id: 'corporate',
        name: 'Corporate',
        category: 'Classic',
        description: 'A high-authority, serif-driven design with bold gray section headers. Engineered for readability and professional impact.',
        bestFor: 'Senior Management, Legal consultants, and Finance experts.',
        features: ['Professional Serif Typography', 'Structural Header Blocks', 'Optimized White Space']
    },
    {
        id: 'creative',
        name: 'Creative',
        category: 'Modern',
        description: 'Features a vibrant purple gradient sidebar and modern sans-serif typography. Designed to stand out in visual and innovative industries.',
        bestFor: 'Graphic Designers, Marketing specialists, and content creators.',
        features: ['Vibrant Purple Sidebar', 'Modern Rounded Tags', 'Split Layout Perspective']
    },
    {
        id: 'modern',
        name: 'Modern',
        category: 'Modern',
        description: 'Our most popular design, featuring clean blue accents and a contemporary profile section. Perfectly balanced for modern tech and business roles.',
        bestFor: 'Startup employees, Project Managers, and Tech Professionals.',
        features: ['Subtle Blue Accents', 'Clean Progress Tags', 'Sophisticated Contact Grid']
    },
    {
        id: 'executive',
        name: 'Executive',
        category: 'Premium',
        description: 'A premium layout featuring a deep charcoal sidebar with elegant gold accents. Designed specifically for senior-level career storytelling.',
        bestFor: 'C-Suite Executives, Directors, and Board Members.',
        features: ['Charcoal & Gold Palette', 'Timeline-based Experience', 'Sophisticated Serif Headers']
    },
    {
        id: 'syntax',
        name: 'Syntax',
        category: 'Technical',
        description: 'A developer-centric grid layout inspired by modern code editors. Uses monospaced typography and dashed dividers for a technical edge.',
        bestFor: 'Full-stack Developers, DevOps, and Technical Leads.',
        features: ['Developer-first Grid System', 'Monospaced Aesthetics', 'Dashed Section Dividers']
    },
    {
        id: 'syntax-nano',
        name: 'Syntax Nano',
        category: 'Technical',
        description: 'The streamlined, single-column version of Syntax. Maintains the monospaced technical feel in a denser, high-efficiency format.',
        bestFor: 'Junior Developers and Technical Specialists.',
        features: ['Single-Column Coding Vibe', 'High Information Density', 'Modern Monospace Fonts']
    }
];

export default function TemplatesPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <Navbar onSectionClick={() => (window.location.href = '/')} />

            <main className="container mx-auto px-6 pt-32 pb-20">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-20 border-b-8 border-black pb-12">
                        <div className="text-gray-500 font-black uppercase tracking-widest mb-4">
                            Resources & Updates
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4">
                            Template Gallery
                        </h1>
                        <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-2xl leading-relaxed">
                            A curated selection of ATS-optimized designs. From classic professional layouts to high-tech syntax for developers.
                        </p>
                    </div>

                    {/* Template List (Changelog Style) */}
                    <div className="space-y-40">
                        {templates.map((template, index) => (
                            <SlideIn key={template.id} delay={0.1} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                                {/* Left Column: Info (Mirroring the "Updates" style) */}
                                <div className="md:col-span-4 lg:col-span-3 border-t-8 border-black pt-8">
                                    <h2 className="text-2xl md:text-4xl font-black mb-4 uppercase tracking-tight leading-none">
                                        {template.name}
                                    </h2>
                                    <div className="inline-block bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-widest mb-6">
                                        {template.category}
                                    </div>
                                    
                                    <p className="text-gray-700 font-bold leading-relaxed mb-8 text-sm md:text-base">
                                        {template.description}
                                    </p>
                                    
                                    <div className="space-y-6 pt-6 border-t-2 border-gray-200">
                                        <div>
                                            <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-2">Best For</h3>
                                            <p className="font-bold text-gray-800 text-sm italic leading-snug">
                                                {template.bestFor}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-2">Key Features</h3>
                                            <ul className="space-y-1">
                                                {template.features.map((feature, fIndex) => (
                                                    <li key={fIndex} className="font-bold text-gray-600 text-xs flex items-center gap-2">
                                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Live CV Preview Component */}
                                <div className="md:col-span-8 lg:col-span-9 flex justify-center items-start">
                                    {/* The Card: Fixed Aspect Ratio and Height across devices */}
                                    <div className="bg-[#f0f0f0] border-[6px] border-black shadow-neo-lg overflow-hidden group relative w-full max-w-[500px] aspect-[21/29.7] flex justify-center bg-[radial-gradient(#d1d1d1_1px,transparent_1px)] [background-size:20px_20px]">
                                        {/* Scaled Preview Component: Targeting 210mm x 297mm (A4) */}
                                        <div className="absolute top-0 w-[210mm] h-[297mm] origin-top transform scale-[0.25] sm:scale-[0.35] md:scale-[0.5] lg:scale-[0.55] xl:scale-[0.6] bg-white shadow-2xl pointer-events-none select-none mt-8 border-2 border-gray-100">
                                            <CVPreview
                                                cvData={DUMMY_CV_DATA}
                                                sections={DUMMY_SECTIONS}
                                                selectedTemplate={template.id}
                                            />
                                        </div>
                                        
                                        {/* Decorative Overlay */}
                                        <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                                        
                                        {/* Bottom Status Bar */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 text-[10px] font-bold tracking-widest uppercase z-20 whitespace-nowrap">
                                            Live Metadata • {template.id}
                                        </div>
                                    </div>
                                </div>
                            </SlideIn>
                        ))}
                    </div>

                    {/* Footer Call to Action */}
                    <div className="mt-40 text-center border-t-8 border-black pt-20">
                        <button 
                            onClick={() => window.location.href = '/'}
                            className="bg-primary text-white text-xl md:text-3xl font-black px-10 py-5 border-4 border-black shadow-neo uppercase tracking-widest hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo-lg transition-all"
                        >
                            Start Building for Free
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t-4 border-black bg-gray-50 py-16">
                <div className="container mx-auto px-6 text-center">
                    <p className="font-black uppercase tracking-widest text-gray-400 text-xs mb-4">
                        © 2026 RECV. AI — THE MODERN CV BUILDER
                    </p>
                    <div className="flex justify-center gap-8 font-bold text-gray-500 text-sm">
                        <a href="/" className="hover:text-black">Home</a>
                        <a href="/privacy" className="hover:text-black">Privacy</a>
                        <a href="/terms" className="hover:text-black">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
