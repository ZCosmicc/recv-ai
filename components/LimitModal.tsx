import React from 'react';
import { X, Lock, Crown } from 'lucide-react';

interface LimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier: 'guest' | 'free' | 'pro';
    mode?: 'cv' | 'ai'; // Default to 'cv'
}

export default function LimitModal({ isOpen, onClose, tier, mode = 'cv' }: LimitModalProps) {
    if (!isOpen) return null;

    const isGuest = tier === 'guest';
    const isFree = tier === 'free';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b-4 border-black bg-yellow-100">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {isGuest ? <Lock className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
                        {mode === 'ai' ? 'Daily AI Limit Reached' : (isGuest ? 'Unlock More Space' : 'Limit Reached')}
                    </h2>
                    <button onClick={onClose} className="hover:bg-yellow-200 p-1 rounded transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {mode === 'ai' ? (
                        <>
                            <p className="font-medium text-lg">
                                You've used your <strong>{tier === 'pro' ? '50' : '1'} daily AI credits</strong>.
                            </p>
                            <p className="text-gray-600">
                                {tier === 'pro'
                                    ? "You are a power user! Your credits will reset tomorrow."
                                    : "Upgrade to Pro for 50 AI analyses per day and more!"}
                            </p>
                        </>
                    ) : (
                        /* CV Limit Logic */
                        isGuest ? (
                            <>
                                <p className="font-medium text-lg">
                                    You've used your <strong>1 free CV</strong>.
                                </p>
                                <p className="text-gray-600">
                                    Upgrade to the <strong>Pro Plan</strong> to create up to 4 CVs, access AI features, and remove watermarks.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="font-medium text-lg">
                                    You've reached the maximum limit of <strong>4 CVs</strong>.
                                </p>
                                <p className="text-gray-600">
                                    Please delete an existing CV to create a new one.
                                </p>
                            </>
                        )
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 font-bold border-2 border-black hover:bg-gray-100 transition-all"
                        >
                            {isGuest || (mode === 'ai' && tier !== 'pro') ? 'Maybe Later' : 'Got it'}
                        </button>
                        {(isGuest || (mode === 'ai' && tier !== 'pro')) && (
                            <button
                                onClick={() => { onClose(); /* Trigger checkout logic */ alert("Redirecting to payment..."); }}
                                className="flex-1 px-4 py-3 font-bold text-black bg-yellow-400 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                <Crown className="w-4 h-4" />
                                Go Pro
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
