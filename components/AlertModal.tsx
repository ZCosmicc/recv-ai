'use client';

import { X, AlertCircle } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error';
}

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
    if (!isOpen) return null;

    const colors = {
        info: 'bg-blue-50 border-blue-500',
        warning: 'bg-yellow-50 border-yellow-500',
        error: 'bg-red-50 border-red-500'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-4 border-black shadow-neo-lg max-w-md w-full p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-6 h-6" />
                        <h2 className="text-xl font-bold">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-black hover:text-white border-2 border-black transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message */}
                <p className="text-gray-800 leading-relaxed mb-6">
                    {message}
                </p>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-black text-white font-bold border-4 border-black shadow-neo hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
