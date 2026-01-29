'use client';

import { X, AlertCircle } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: React.ReactNode;
    type?: 'info' | 'warning' | 'error' | 'success';
}

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
    if (!isOpen) return null;

    const colors = {
        info: 'bg-blue-50 border-blue-500',
        warning: 'bg-yellow-50 border-yellow-500',
        error: 'bg-red-50 border-red-500',
        success: 'bg-green-50 border-green-500'
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className={`bg-white border-4 shadow-neo-lg max-w-md w-full p-6 ${colors[type].replace('bg-', 'border-')}`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className={`flex items-center gap-2 ${type === 'error' ? 'text-red-600' : type === 'warning' ? 'text-yellow-600' : type === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
                        <AlertCircle className="w-6 h-6" />
                        <h2 className="text-xl font-bold text-black">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-black hover:text-white border-2 border-black transition-colors text-black"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message */}
                <div className="text-gray-800 leading-relaxed mb-6">
                    {message}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-white text-black font-bold border-4 border-black shadow-neo hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
