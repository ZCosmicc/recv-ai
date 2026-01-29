import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    isDestructive = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
            <div className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md animate-in fade-in zoom-in duration-200 mx-2 sm:mx-0">
                <div className={`flex justify-between items-center p-3 sm:p-4 border-b-4 border-black ${isDestructive ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <h2 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isDestructive ? 'text-red-600' : 'text-black'}`}>
                        {isDestructive && <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />}
                        <span className="line-clamp-2">{title}</span>
                    </h2>
                    <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded transition-colors flex-shrink-0">
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                    <p className="font-medium text-base sm:text-lg">
                        {message}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 sm:py-3 font-bold border-2 border-black hover:bg-gray-100 transition-all text-sm sm:text-base order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2 sm:py-3 font-bold text-white border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2 ${isDestructive ? 'bg-red-600' : 'bg-primary'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
