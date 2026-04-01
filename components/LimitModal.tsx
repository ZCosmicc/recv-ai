import React, { useState } from 'react';
import { X, Lock, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import AlertModal from './AlertModal';
import SlideIn from './SlideIn';

interface LimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier: 'guest' | 'free' | 'pro';
    mode?: 'cv' | 'ai' | 'premium_template'; // Default to 'cv'
}

export default function LimitModal({ isOpen, onClose, tier, mode = 'cv' }: LimitModalProps) {
    const { t } = useLanguage();
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    if (!isOpen) return null;

    const isGuest = tier === 'guest';
    const isFree = tier === 'free';

    return (
        <React.Fragment>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <SlideIn className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md relative">
                    <div className="flex justify-between items-center p-3 sm:p-4 border-b-4 border-black bg-yellow-100">
                        <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-1 sm:gap-2 text-yellow-600 pr-2">
                            {isGuest ? <Lock className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" /> : <Crown className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />}
                            <span className="line-clamp-2">{mode === 'ai' ? t.limitModal.dailyLimit : mode === 'premium_template' ? t.limitModal.premiumTemplate : (isGuest ? t.limitModal.unlockMore : t.limitModal.limitReached)}</span>
                        </h2>
                        <button onClick={onClose} className="hover:bg-yellow-200 p-1 rounded transition-colors flex-shrink-0">
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        {mode === 'ai' ? (
                            <>
                                <p className="font-medium text-lg">
                                    {t.limitModal.usedCredits} <strong>{tier === 'pro' ? '50' : '1'}</strong>.
                                </p>
                                <p className="text-gray-600">
                                    {tier === 'pro'
                                        ? t.limitModal.powerUser
                                        : t.limitModal.upgradeFor50}
                                </p>
                            </>
                        ) : mode === 'premium_template' ? (
                            <>
                                <p className="font-medium text-lg">
                                    {t.limitModal.exclusiveTemplate} <strong>Pro users</strong>.
                                </p>
                                <p className="text-gray-600">
                                    <strong>{t.limitModal.upgradeToPro}</strong> {t.limitModal.upgradeUnlock}
                                </p>
                            </>
                        ) : (
                            /* CV Limit Logic */
                            isGuest || isFree ? (
                                <>
                                    <p className="font-medium text-lg">
                                        {t.limitModal.used1CV} <strong>1 free CV</strong>.
                                    </p>
                                    <p className="text-gray-600">
                                        <strong>{t.limitModal.upgradeToPro}</strong> {t.limitModal.upgradeTo4CVs}
                                    </p>
                                </>
                            ) : (
                                /* Pro user who reached 4 CV limit */
                                <>
                                    <p className="font-medium text-lg">
                                        {t.limitModal.reached4CVs} <strong>4 CVs</strong>.
                                    </p>
                                    <p className="text-gray-600">
                                        {t.limitModal.deleteToCreate}
                                    </p>
                                </>
                            )
                        )}

                        <div className="flex gap-4 pt-4">
                            <motion.button
                                whileHover={{ backgroundColor: '#f3f4f6' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="flex-1 px-4 py-3 font-bold border-2 border-black transition-all"
                            >
                                {(isGuest || isFree || (mode === 'ai' && tier !== 'pro') || mode === 'premium_template') ? t.limitModal.maybeLater : t.limitModal.gotIt}
                            </motion.button>
                            {((isGuest || isFree) && mode === 'cv') || (mode === 'ai' && tier !== 'pro') || mode === 'premium_template' ? (
                                <motion.button
                                    whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    onClick={async () => {
                                        try {
                                            const res = await fetch('/api/payment/create', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' }
                                            });
                                            const data = await res.json();

                                            if (res.status === 401) {
                                                // User not logged in - show styled alert
                                                setAlertMessage(t.errors.loginRequired);
                                                setShowAlert(true);
                                                return;
                                            }

                                            if (res.status === 400 && data.error === 'ALREADY_PRO') {
                                                // User is already Pro
                                                setAlertMessage(data.message || "You're already a Pro member!");
                                                setShowAlert(true);
                                                return;
                                            }

                                            if (data.paymentUrl) {
                                                // Redirect to Pakasir payment page
                                                window.location.href = data.paymentUrl;
                                            } else {
                                                // Show specific error from API if available
                                                const errorMsg = data.message || data.error || t.errors.paymentFailed;
                                                setAlertMessage(errorMsg);
                                                setShowAlert(true);
                                            }
                                        } catch (error) {
                                            console.error('Payment error:', error);
                                            setAlertMessage(t.errors.generic);
                                            setShowAlert(true);
                                        }
                                    }}
                                    className="flex-1 px-4 py-3 font-bold text-black bg-yellow-400 border-2 border-black shadow-neo-sm flex items-center justify-center gap-2"
                                >
                                    <Crown className="w-4 h-4" />
                                    {t.limitModal.goPro}
                                </motion.button>
                            ) : null}
                        </div>
                    </div>
                </SlideIn>
            </div>

            <AlertModal
                isOpen={showAlert}
                onClose={() => {
                    setShowAlert(false);
                    if (alertMessage.includes('log in')) {
                        window.location.href = '/login';
                    }
                }}
                message={alertMessage}
            />
        </React.Fragment>
    );
}
