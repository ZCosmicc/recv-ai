'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
    onNavigate?: (step: string) => void;
    onSectionClick?: (section: string) => void;
}

export default function Navbar({ onNavigate, onSectionClick }: NavbarProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

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
            // If we are not on home page, maybe go to home#section?
            router.push('/#' + section);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh(); // Refresh to update server components if any
    };

    return (
        <nav className="border-b-4 border-black bg-primary text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-neo sticky top-0 z-50">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleHomeClick}>
                <Image src="/LogoPrimaryReCV.png" alt="ReCV Logo" width={120} height={40} className="object-contain" />
            </div>
            <div className="hidden md:flex items-center gap-8 font-bold text-sm">
                <a href="#" className="hover:underline decoration-2 underline-offset-4" onClick={handleHomeClick}>Home</a>
                <a href="#features" className="hover:underline decoration-2 underline-offset-4" onClick={(e) => handleSectionClick(e, 'features')}>Features</a>
                <a href="#pricing" className="hover:underline decoration-2 underline-offset-4" onClick={(e) => handleSectionClick(e, 'pricing')}>Pricing</a>
                <a href="#faq" className="hover:underline decoration-2 underline-offset-4" onClick={(e) => handleSectionClick(e, 'faq')}>FAQ</a>

                {user ? (
                    <>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="hover:underline decoration-2 underline-offset-4"
                        >
                            Dashboard
                        </button>
                        <div className="flex items-center gap-4">
                            <span className="text-xs opacity-80 truncate max-w-[150px]">{user.email}</span>
                            <button
                                onClick={handleLogout}
                                className="text-black bg-white px-6 py-2 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
                            >
                                Log out
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => router.push('/login')}
                            className="text-black bg-white px-6 py-2 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => router.push('/login')} // Signup goes to login for now (magic link/auth helper handles both effectively)
                            className="text-black bg-white px-6 py-2 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
                        >
                            Sign Up
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
