import React, { useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

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

    const getBgColor = () => {
        switch (type) {
            case 'success': return 'bg-green-100';
            case 'error': return 'bg-red-100';
            case 'info': return 'bg-blue-100';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success': return 'bg-green-500 text-white';
            case 'error': return 'bg-red-500 text-white';
            case 'info': return 'bg-blue-500 text-white';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <Check className="w-4 h-4" />;
            case 'error': return <AlertCircle className="w-4 h-4" />;
            case 'info': return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className={`fixed top-24 right-6 z-[100] flex items-center gap-3 px-6 py-4 border-4 border-black shadow-neo animate-in slide-in-from-right duration-300 ${getBgColor()}`}>
            <div className={`border-2 border-black p-1 ${getIconColor()}`}>
                {getIcon()}
            </div>
            <p className="font-bold text-black">{message}</p>
            <button onClick={onClose} className="ml-4 text-gray-500 hover:text-black">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
