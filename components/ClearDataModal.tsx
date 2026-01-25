import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface ClearDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ClearDataModal({ isOpen, onClose, onConfirm }: ClearDataModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b-4 border-black bg-red-100">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                        Clear All Data?
                    </h2>
                    <button onClick={onClose} className="hover:bg-red-200 p-1 rounded transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="font-medium text-lg">
                        Are you sure you want to delete all your CV data? This action cannot be undone.
                    </p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-sm">
                        <p className="font-bold text-blue-800 mb-1">Privacy Notice:</p>
                        <p className="text-blue-700">
                            We value your privacy. Your data is <strong>never sent to a server</strong>.
                            It is stored locally in your browser's Local Storage.
                            Clearing it will remove it from this device.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 font-bold border-2 border-black hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-3 font-bold text-white bg-red-600 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Yes, Clear Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
