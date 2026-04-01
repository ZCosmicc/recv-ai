'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import SupportModal from './SupportModal';
import { motion } from 'framer-motion';

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

    // Listen for open-support custom event (fired by footer Contact button, payment page, etc.)
    useEffect(() => {
        const handler = () => setIsOpen(true);
        window.addEventListener('open-support', handler);
        return () => window.removeEventListener('open-support', handler);
    }, []);

    return (
        <>
            {/* Floating button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,0.3)', backgroundColor: '#facc15', color: '#000' }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-black text-white font-bold px-4 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                aria-label="Contact Support"
            >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">Support</span>
            </motion.button>

            <SupportModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                userEmail={userEmail}
            />
        </>
    );
}
