import React, { useState, useEffect } from 'react';
import { X, Crown, Zap, User, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SlideIn from './SlideIn';

interface TierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (tier: 'free' | 'starter' | 'pro') => void;
    currentTier: string;
    email: string;
    isUpdating: boolean;
}

export default function TierModal({
    isOpen,
    onClose,
    onConfirm,
    currentTier,
    email,
    isUpdating
}: TierModalProps) {
    const [confirmingTier, setConfirmingTier] = useState<'free' | 'starter' | 'pro' | null>(null);

    // Reset state when modal closes/opens
    useEffect(() => {
        if (!isOpen) setConfirmingTier(null);
    }, [isOpen]);

    if (!isOpen) return null;

    const tiers = [
        { id: 'free', label: 'FREE', icon: <User className="w-5 h-5" />, color: 'bg-gray-100', desc: 'Basic features, 1 CV limit' },
        { id: 'starter', label: 'STARTER', icon: <Zap className="w-5 h-5" />, color: 'bg-blue-100 text-blue-700', desc: 'Premium templates, 2 CV limit' },
        { id: 'pro', label: 'PRO', icon: <Crown className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-700', desc: 'Full access, 4 CV limit' },
    ] as const;

    const selectedTierData = tiers.find(t => t.id === confirmingTier);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <SlideIn className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md relative overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b-4 border-black bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold">Change User Tier</h2>
                        <p className="text-xs text-gray-500 font-medium truncate max-w-[250px]">{email}</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {!confirmingTier ? (
                            <motion.div
                                key="selection"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select New Tier:</p>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    {tiers.map((tier) => (
                                        <motion.button
                                            key={tier.id}
                                            disabled={isUpdating || currentTier === tier.id}
                                            onClick={() => setConfirmingTier(tier.id)}
                                            whileHover={currentTier === tier.id ? {} : { x: 4, scale: 1.02 }}
                                            whileTap={currentTier === tier.id ? {} : { scale: 0.98 }}
                                            className={`flex items-center justify-between p-4 border-2 border-black font-bold transition-all ${
                                                currentTier === tier.id 
                                                    ? 'bg-gray-100 opacity-50 cursor-not-allowed' 
                                                    : 'hover:bg-gray-50 hover:shadow-neo-sm text-left'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 border-2 border-black ${tier.color}`}>
                                                    {tier.icon}
                                                </div>
                                                <div>
                                                    <div className="text-base">{tier.label}</div>
                                                    <div className="text-[10px] font-medium text-gray-500">{tier.desc}</div>
                                                </div>
                                            </div>
                                            {currentTier === tier.id && (
                                                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full uppercase">Current</span>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 font-bold border-2 border-black hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="confirmation"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-yellow-50 border-4 border-yellow-400 p-4 flex gap-3">
                                    <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-yellow-900">Confirm Tier Change</p>
                                        <p className="text-sm text-yellow-800">
                                            You are changing <strong>{email}</strong> to the <strong>{confirmingTier.toUpperCase()}</strong> tier.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600 font-medium italic">
                                        * Changing to a premium tier will set a new 30-day expiration date from now.
                                    </p>
                                    
                                    <div className="flex flex-col gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => onConfirm(confirmingTier)}
                                            disabled={isUpdating}
                                            className="w-full py-4 bg-black text-white font-bold border-2 border-black shadow-neo-sm hover:shadow-neo transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Update to {confirmingTier.toUpperCase()}
                                        </motion.button>
                                        
                                        <button
                                            onClick={() => setConfirmingTier(null)}
                                            disabled={isUpdating}
                                            className="w-full py-3 font-bold text-gray-500 flex items-center justify-center gap-2 hover:text-black transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Selection
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                {isUpdating && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 font-bold italic">
                        <div className="flex flex-col items-center gap-2">
                             <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                             Updating...
                        </div>
                    </div>
                )}
            </SlideIn>
        </div>
    );
}

function CheckCircle({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    );
}
