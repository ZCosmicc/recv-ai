'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import Navbar from '@/components/Navbar'; // Assuming we want shared navbar or maybe a simpler one for auth

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileInstance>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!captchaToken) {
            setMessage({ type: 'error', text: 'Please complete the security check.' });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                    captchaToken,
                },
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
                turnstileRef.current?.reset();
                setCaptchaToken(null);
            } else {
                setMessage({ type: 'success', text: 'Check your email for the magic link!' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to manage your CVs</p>
                    </div>

                    {message && (
                        <div className={`p-4 mb-6 border-2 border-black ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block font-bold mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-primary shadow-neo-sm"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="flex justify-center">
                            <Turnstile
                                ref={turnstileRef}
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                                onSuccess={(token) => setCaptchaToken(token)}
                                onError={() => setCaptchaToken(null)}
                                onExpire={() => setCaptchaToken(null)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white font-bold text-lg border-2 border-black shadow-neo transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>We use Magic Links. No passwords to remember!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
