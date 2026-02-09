'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function ErrorContent() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold mb-2 text-red-600">Authentication Error</h1>
                        <p className="text-gray-600">Something went wrong during the authentication process.</p>
                    </div>

                    <div className="p-4 mb-6 border-2 border-dashed border-red-300 bg-red-50 text-red-800 rounded-sm">
                        <p>The link you clicked may be invalid, expired, or already used.</p>
                    </div>

                    <div className="space-y-4">
                        <Link
                            href="/login"
                            className="block w-full py-3 bg-primary text-white text-center font-bold text-lg border-2 border-black shadow-neo transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        >
                            Try Again
                        </Link>

                        <Link
                            href="/"
                            className="block w-full py-3 bg-white text-black text-center font-bold text-lg border-2 border-black shadow-neo-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
