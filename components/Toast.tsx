import React, { useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
    action?: { label: string; onClick: () => void };
    offsetIndex?: number; // 0 = top slot (96px), 1 = 80px below, etc.
}

export default function Toast({ message, type, onClose, duration = 3000, action, offsetIndex = 0 }: ToastProps) {
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
        <div
            className={`fixed right-3 md:right-6 z-[100] flex items-center gap-2 md:gap-3 px-3 py-2 md:px-6 md:py-4 border-2 md:border-4 border-black shadow-neo animate-in slide-in-from-right duration-300 max-w-[90vw] md:max-w-none ${getBgColor()}`}
            style={{ top: `${72 + offsetIndex * 56}px` }}
        >
            <div className={`border md:border-2 border-black p-0.5 md:p-1 flex-shrink-0 ${getIconColor()}`}>
                {getIcon()}
            </div>
            <div className="flex items-center gap-1 min-w-0">
                <p className="font-bold text-black text-xs md:text-base truncate">{message}</p>
                {action && (
                    <button
                        onClick={() => { action.onClick(); onClose(); }}
                        className="font-bold underline hover:no-underline text-primary ml-1 md:ml-2 whitespace-nowrap text-xs md:text-base"
                    >
                        {action.label}
                    </button>
                )}
            </div>
            <button onClick={onClose} className="ml-2 md:ml-4 text-gray-500 hover:text-black flex-shrink-0">
                <X className="w-3 h-3 md:w-4 md:h-4" />
            </button>
        </div>
    );
}
