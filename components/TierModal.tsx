import React from 'react';
import { X, Crown, Zap, User } from 'lucide-react';
import { motion } from 'framer-motion';
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
    if (!isOpen) return null;

    const tiers = [
        { id: 'free', label: 'FREE', icon: <User className="w-5 h-5" />, color: 'bg-gray-100' },
        { id: 'starter', label: 'STARTER', icon: <Zap className="w-5 h-5" />, color: 'bg-blue-100 text-blue-700' },
        { id: 'pro', label: 'PRO', icon: <Crown className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-700' },
    ] as const;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <SlideIn className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md relative">
                <div className="flex justify-between items-center p-4 border-b-4 border-black bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold">Change User Tier</h2>
                        <p className="text-xs text-gray-500 font-medium truncate max-w-[250px]">{email}</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select New Tier:</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {tiers.map((tier) => (
                            <motion.button
                                key={tier.id}
                                disabled={isUpdating || currentTier === tier.id}
                                onClick={() => onConfirm(tier.id)}
                                whileHover={currentTier === tier.id ? {} : { x: 4, scale: 1.02 }}
                                whileTap={currentTier === tier.id ? {} : { scale: 0.98 }}
                                className={`flex items-center justify-between p-4 border-2 border-black font-bold transition-all ${
                                    currentTier === tier.id 
                                        ? 'bg-gray-100 opacity-50 cursor-not-allowed' 
                                        : 'hover:bg-gray-50 hover:shadow-neo-sm'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 border-2 border-black ${tier.color}`}>
                                        {tier.icon}
                                    </div>
                                    <span>{tier.label}</span>
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
                </div>
                
                {isUpdating && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 font-bold italic">
                        Updating...
                    </div>
                )}
            </SlideIn>
        </div>
    );
}
