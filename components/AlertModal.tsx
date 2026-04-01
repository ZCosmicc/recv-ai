'use client';

import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import SlideIn from './SlideIn';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string; // Make optional - will default to translated "Notice"
    message: React.ReactNode;
    type?: 'info' | 'warning' | 'error' | 'success';
}

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
    const { t } = useLanguage();

    if (!isOpen) return null;

    const colors = {
        info: 'bg-blue-50 border-blue-500',
        warning: 'bg-yellow-50 border-yellow-500',
        error: 'bg-red-50 border-red-500',
        success: 'bg-green-50 border-green-500'
    };

    // Use translated "Notice" if no title provided
    const displayTitle = title || t.alertModal.notice;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-2 sm:p-4">
            <SlideIn className={`bg-white border-4 shadow-neo-lg max-w-md w-full p-4 sm:p-6 mx-2 sm:mx-0 ${colors[type].replace('bg-', 'border-')}`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className={`flex items-center gap-2 ${type === 'error' ? 'text-red-600' : type === 'warning' ? 'text-yellow-600' : type === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                        <h2 className="text-lg sm:text-xl font-bold text-black">{displayTitle}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-black hover:text-white border-2 border-black transition-colors text-black flex-shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message */}
                <div className="text-gray-800 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                    {message}
                </div>

                {/* Close Button */}
                <motion.button
                    onClick={onClose}
                    whileHover={{ x: 4, y: 4, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-white text-black font-bold border-4 border-black shadow-neo flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    {t.alertModal.gotIt}
                </motion.button>
            </SlideIn>
        </div>
    );
}
