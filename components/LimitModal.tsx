import React, { useState } from 'react';
import { X, Lock, Crown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import AlertModal from './AlertModal';
import SlideIn from './SlideIn';

interface LimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier: 'guest' | 'free' | 'starter' | 'pro';
    mode?: 'cv' | 'ai' | 'premium_template' | 'cl'; // Default to 'cv'
}

const CREDIT_LIMITS: Record<string, number> = { pro: 30, starter: 10, free: 1 };
const CV_LIMITS: Record<string, number> = { pro: 4, starter: 2, free: 1 };

export default function LimitModal({ isOpen, onClose, tier, mode = 'cv' }: LimitModalProps) {
    const { t } = useLanguage();
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    if (!isOpen) return null;

    const isGuest = tier === 'guest';
    const isFree = tier === 'free';
    const isStarter = tier === 'starter';
    const isPro = tier === 'pro';

    // Who needs an upgrade CTA?
    const needsStarterCTA = (isGuest || isFree) && (mode === 'ai' || mode === 'cv' || mode === 'premium_template' || mode === 'cl');
    const needsProCTA = isStarter && (mode === 'ai' || mode === 'cv' || mode === 'cl');
    const needsPremiumCTA = mode === 'premium_template' && !isPro;

    const handlePayment = async (plan: 'starter' | 'pro') => {
        // Validation: Don't allow Pro users to pay for Starter or Pro again
        if (tier === 'pro') {
            setAlertMessage(t.pricing.alreadyMemberPro);
            setShowAlert(true);
            return;
        }

        // Validation: Don't allow Starter users to pay for Starter again
        if (plan === 'starter' && tier === 'starter') {
            setAlertMessage(t.pricing.alreadyMemberStarter);
            setShowAlert(true);
            return;
        }

        try {
            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan })
            });
            const data = await res.json();

            if (res.status === 401) {
                setAlertMessage(t.errors.loginRequired);
                setShowAlert(true);
                return;
            }

            if (res.status === 400 && (data.error === 'ALREADY_PRO' || data.error === 'ALREADY_STARTER')) {
                setAlertMessage(data.message || `You're already on this plan!`);
                setShowAlert(true);
                return;
            }

            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                const errorMsg = data.message || data.error || t.errors.paymentFailed;
                setAlertMessage(errorMsg);
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Payment error:', error);
            setAlertMessage(t.errors.generic);
            setShowAlert(true);
        }
    };

    const creditLimit = CREDIT_LIMITS[tier] ?? 1;
    const cvLimit = CV_LIMITS[tier] ?? 1;

    return (
        <React.Fragment>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <SlideIn className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md relative">
                    <div className="flex justify-between items-center p-3 sm:p-4 border-b-4 border-black bg-yellow-100">
                        <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-1 sm:gap-2 text-yellow-600 pr-2">
                            {isGuest ? <Lock className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" /> : <Crown className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />}
                            <span className="line-clamp-2">{mode === 'ai' ? t.limitModal.dailyLimit : mode === 'premium_template' ? t.limitModal.premiumTemplate : mode === 'cl' ? t.limitModal.limitReached : (isGuest ? t.limitModal.unlockMore : t.limitModal.limitReached)}</span>
                        </h2>
                        <button onClick={onClose} className="hover:bg-yellow-200 p-1 rounded transition-colors flex-shrink-0">
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        {mode === 'ai' ? (
                            <>
                                <p className="font-medium text-lg">
                                    {t.limitModal.usedCredits} <strong>{creditLimit} AI {creditLimit === 1 ? 'credit' : 'credits'}</strong>.
                                </p>
                                <p className="text-gray-600">
                                    {isPro
                                        ? t.limitModal.powerUser
                                        : isStarter
                                            ? t.limitModal.creditsPro
                                            : t.limitModal.creditsStarter}
                                </p>
                            </>
                        ) : mode === 'premium_template' ? (
                            <>
                                <p className="font-medium text-lg">
                                    {t.limitModal.exclusiveTemplate} <strong>Starter & Pro users</strong>.
                                </p>
                                <p className="text-gray-600">
                                    <strong>Upgrade to Starter or Pro</strong> {t.limitModal.upgradeUnlock}
                                </p>
                            </>
                        ) : mode === 'cl' ? (
                            /* Cover Letter Limit Logic */
                            isPro ? (
                                <>
                                    <p className="font-medium text-lg">
                                        Reached maximum limit of <strong>{cvLimit} Cover Letters</strong>.
                                    </p>
                                    <p className="text-gray-600">Please delete an existing Cover Letter to create a new one.</p>
                                </>
                            ) : isStarter ? (
                                <>
                                    <p className="font-medium text-lg">
                                        {t.limitModal.clLimitStarterTitle}
                                    </p>
                                    <p className="text-gray-600">
                                        {t.limitModal.clLimitStarterDesc}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium text-lg">
                                        {t.limitModal.clLimitFreeTitle}
                                    </p>
                                    <p className="text-gray-600">
                                        {t.limitModal.clLimitFreeDesc}
                                    </p>
                                </>
                            )
                        ) : (
                            /* CV Limit Logic */
                            isPro ? (
                                <>
                                    <p className="font-medium text-lg">
                                        {t.limitModal.reached4CVs} <strong>{cvLimit} CVs</strong>.
                                    </p>
                                    <p className="text-gray-600">{t.limitModal.deleteToCreate}</p>
                                </>
                            ) : isStarter ? (
                                <>
                                    <p className="font-medium text-lg">
                                        {t.limitModal.cvLimitStarterTitle}
                                    </p>
                                    <p className="text-gray-600">
                                        {t.limitModal.cvLimitStarterDesc}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium text-lg">
                                        {t.limitModal.cvLimitFreeTitle}
                                    </p>
                                    <p className="text-gray-600">
                                        {t.limitModal.cvLimitFreeDesc}
                                    </p>
                                </>
                            )
                        )}

                        <div className="flex flex-col gap-2 pt-4">
                            {/* Maybe Later / Got It */}
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ backgroundColor: '#f3f4f6' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 font-bold border-2 border-black transition-all"
                                >
                                    {(needsStarterCTA || needsProCTA || needsPremiumCTA) ? t.limitModal.maybeLater : t.limitModal.gotIt}
                                </motion.button>

                                {/* Go Pro button — only if not showing the double button block below */}
                                {(needsProCTA || needsPremiumCTA) && !needsStarterCTA && (
                                    <motion.button
                                        whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        onClick={() => handlePayment('pro')}
                                        className="flex-1 px-4 py-3 font-bold text-black bg-yellow-400 border-2 border-black shadow-neo-sm flex items-center justify-center gap-2"
                                    >
                                        <Crown className="w-4 h-4" />
                                        {t.limitModal.goPro}
                                    </motion.button>
                                )}
                            </div>

                            {/* Go Starter button — for Free/Guest users only */}
                            {needsStarterCTA && (
                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        onClick={() => handlePayment('starter')}
                                        className="flex-1 px-4 py-3 font-bold text-white bg-blue-500 border-2 border-black shadow-neo-sm flex items-center justify-center gap-2"
                                    >
                                        <Zap className="w-4 h-4" />
                                        {t.limitModal.goStarter}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        onClick={() => handlePayment('pro')}
                                        className="flex-1 px-4 py-3 font-bold text-black bg-yellow-400 border-2 border-black shadow-neo-sm flex items-center justify-center gap-2"
                                    >
                                        <Crown className="w-4 h-4" />
                                        {t.limitModal.goPro}
                                    </motion.button>
                                </div>
                            )}
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
