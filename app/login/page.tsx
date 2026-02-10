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
    const [googleLoading, setGoogleLoading] = useState(false);
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

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
                setGoogleLoading(false);
            }
            // Note: If successful, browser redirects to Google, so we don't setLoading(false)
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to initiate Google sign-in.' });
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md p-4 sm:p-8 animate-in fade-in zoom-in duration-300 mx-2 sm:mx-0">
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-gray-600 text-sm sm:text-base">Sign in to manage your CVs</p>
                    </div>

                    {message && (
                        <div className={`p-3 sm:p-4 mb-6 border-2 border-black text-sm sm:text-base ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block font-bold mb-2 text-sm sm:text-base">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-primary shadow-neo-sm text-sm sm:text-base"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="flex justify-center w-full overflow-hidden">
                            <div className="transform scale-[0.80] min-[320px]:scale-100 origin-center">
                                <Turnstile
                                    ref={turnstileRef}
                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                                    onSuccess={(token) => setCaptchaToken(token)}
                                    onError={() => setCaptchaToken(null)}
                                    onExpire={() => setCaptchaToken(null)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 sm:py-4 bg-primary text-white font-bold text-base sm:text-lg border-2 border-black shadow-neo transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white font-bold text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Google OAuth Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="w-full py-3 sm:py-4 bg-white text-black font-bold text-base sm:text-lg border-2 border-black shadow-neo transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {googleLoading ? (
                            'Redirecting to Google...'
                        ) : (
                            <>
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                    <div className="mt-6 text-center text-xs sm:text-sm text-gray-500">
                        <p>We use Magic Links. No passwords to remember!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
