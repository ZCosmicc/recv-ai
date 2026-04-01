'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import SupportModal from './SupportModal';

export default function SupportButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.email) {
                setUserEmail(session.user.email);
            }
        });
    }, []);

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-black text-white font-bold px-4 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-yellow-400 hover:text-black hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                aria-label="Contact Support"
            >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">Support</span>
            </button>

            <SupportModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                userEmail={userEmail}
            />
        </>
    );
}
