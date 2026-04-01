import { Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import fs from 'fs';
import path from 'path';

export const metadata = {
    title: 'Changelog',
    description: 'See what\'s new in Recv. AI — bug fixes, new features, and improvements.',
};

export default function ChangelogPage() {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = fs.readFileSync(changelogPath, 'utf-8');

    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/LogoPrimaryReCV.png" alt="ReCV Logo" width={100} height={34} className="object-contain" />
                    </Link>
                    <Link
                        href="/"
                        className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-black bg-white hover:bg-gray-50 font-bold shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm sm:text-base"
                    >
                        ← Back
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 max-w-3xl">
                <div className="mb-10">
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-black mb-3">Changelog</h1>
                    <p className="text-gray-500 text-sm sm:text-base">What's new, fixed, and improved in Recv. AI.</p>
                </div>

                <div className="prose prose-sm sm:prose max-w-none">
                    <ReactMarkdown
                        components={{
                            h1: () => null, // Hide the "# Changelog" title (already shown above)
                            h2: ({ children }) => (
                                <div className="mt-10 mb-4 first:mt-0">
                                    <h2 className="text-lg sm:text-xl font-extrabold text-black inline-block bg-yellow-400 border-2 border-black px-3 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                        {children}
                                    </h2>
                                </div>
                            ),
                            h3: ({ children }) => (
                                <h3 className="text-base font-bold text-black mt-5 mb-2 flex items-center gap-2">
                                    {children}
                                </h3>
                            ),
                            h4: ({ children }) => (
                                <h4 className="text-sm font-bold text-gray-700 mt-4 mb-1 uppercase tracking-wide">
                                    {children}
                                </h4>
                            ),
                            ul: ({ children }) => (
                                <ul className="space-y-1 ml-4 mb-3">{children}</ul>
                            ),
                            li: ({ children }) => (
                                <li className="text-gray-700 text-sm flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                                    <span>{children}</span>
                                </li>
                            ),
                            p: ({ children }) => (
                                <p className="text-gray-700 text-sm leading-relaxed mb-2">{children}</p>
                            ),
                            strong: ({ children }) => (
                                <strong className="font-bold text-black">{children}</strong>
                            ),
                            code: ({ children }) => (
                                <code className="bg-gray-100 border border-gray-300 px-1 py-0.5 text-xs font-mono rounded">
                                    {children}
                                </code>
                            ),
                            hr: () => (
                                <hr className="my-8 border-t-2 border-dashed border-gray-200" />
                            ),
                            blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-gray-600 my-3">
                                    {children}
                                </blockquote>
                            ),
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t-4 border-black bg-gray-50 py-8 mt-16">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                        © 2026 ReCV. Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by ZCo Studio.
                    </p>
                </div>
            </footer>
        </div>
    );
}
