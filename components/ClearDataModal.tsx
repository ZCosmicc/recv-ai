import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import SlideIn from './SlideIn';

interface ClearDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ClearDataModal({ isOpen, onClose, onConfirm }: ClearDataModalProps) {
    const { t } = useLanguage();

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
            <SlideIn className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md mx-2 sm:mx-0">
                <div className="flex justify-between items-center p-3 sm:p-4 border-b-4 border-black bg-red-100">
                    <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-red-600 pr-2">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                        <span className="line-clamp-2">{t.clearDataModal.title}</span>
                    </h2>
                    <button onClick={onClose} className="hover:bg-red-200 p-1 rounded transition-colors flex-shrink-0">
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <p className="font-medium text-lg">
                        {t.clearDataModal.message}
                    </p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-sm">
                        <p className="font-bold text-blue-800 mb-1">{t.clearDataModal.privacyTitle}</p>
                        <p className="text-blue-700">
                            {t.clearDataModal.privacyMessage}
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <motion.button
                            onClick={onClose}
                            whileHover={{ backgroundColor: '#f3f4f6' }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-4 py-3 font-bold border-2 border-black transition-all"
                        >
                            {t.clearDataModal.cancel}
                        </motion.button>
                        <motion.button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className="flex-1 px-4 py-3 font-bold text-white bg-red-600 border-2 border-black shadow-neo-sm flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            {t.clearDataModal.confirm}
                        </motion.button>
                    </div>
                </div>
            </SlideIn>
        </div>
    );
}
