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
            className={`fixed right-6 z-[100] flex items-center gap-3 px-6 py-4 border-4 border-black shadow-neo animate-in slide-in-from-right duration-300 ${getBgColor()}`}
            style={{ top: `${96 + offsetIndex * 80}px` }}
        >
            <div className={`border-2 border-black p-1 ${getIconColor()}`}>
                {getIcon()}
            </div>
            <div className="flex items-center gap-1">
                <p className="font-bold text-black">{message}</p>
                {action && (
                    <button
                        onClick={() => { action.onClick(); onClose(); }}
                        className="font-bold underline hover:no-underline text-primary ml-2 whitespace-nowrap"
                    >
                        {action.label}
                    </button>
                )}
            </div>
            <button onClick={onClose} className="ml-4 text-gray-500 hover:text-black">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
