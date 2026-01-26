import React, { useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`fixed top-24 right-6 z-[100] flex items-center gap-3 px-6 py-4 border-4 border-black shadow-neo animate-in slide-in-from-right duration-300 ${type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
            <div className={`border-2 border-black p-1 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <p className="font-bold text-black">{message}</p>
            <button onClick={onClose} className="ml-4 text-gray-500 hover:text-black">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
