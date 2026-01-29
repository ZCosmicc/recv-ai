'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function PaymentSuccess() {
    const router = useRouter();
    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Check if payment was successful
        const checkPayment = async () => {
            // Wait a few seconds for webhook to process
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Refresh the page to get updated tier
            window.location.reload();
        };

        checkPayment();

        // Countdown timer
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black shadow-neo-lg p-8 max-w-md w-full text-center">
                {status === 'processing' && (
                    <>
                        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-600" />
                        <h1 className="text-2xl font-bold mb-2">Memproses Pembayaran...</h1>
                        <p className="text-gray-600 mb-4">
                            Terima kasih! Kami sedang memverifikasi pembayaran Anda.
                        </p>
                        <p className="text-sm text-gray-500">
                            Dialihkan dalam {countdown} detik...
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
                        <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
                        <p className="text-gray-600 mb-8 text-center max-w-md">
                            Your payment is being processed. Your account will be upgraded to Pro shortly.
                        </p>

                        {/* Instructions */}
                        <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg mb-6">
                            <h3 className="font-bold text-blue-900 mb-2">What's Next?</h3>
                            <ul className="text-sm text-blue-800 space-y-2">
                                <li>✓ We're processing your payment with Pakasir</li>
                                <li>✓ Your tier will update automatically in a few moments</li>
                                <li>✓ Try refreshing this page if it doesn't update within 30 seconds</li>
                            </ul>
                        </div>

                        {/* Support Info */}
                        <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg mb-6">
                            <h3 className="font-bold text-yellow-900 mb-2">Having Issues?</h3>
                            <p className="text-sm text-yellow-800 mb-2">
                                If your tier doesn't update after refreshing, please contact support:
                            </p>
                            <a
                                href="mailto:farizfadillah612@gmail.com"
                                className="text-sm text-blue-600 hover:underline font-medium"
                            >
                                farizfadillah612@gmail.com
                            </a>
                        </div>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
                        <h1 className="text-2xl font-bold mb-2">Pembayaran Gagal</h1>
                        <p className="text-gray-600 mb-4">
                            Terjadi kesalahan. Silakan coba lagi.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
