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
                        <p className="text-gray-600 mb-4">
                            Akun Anda telah diupgrade ke Pro.
                        </p>
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
