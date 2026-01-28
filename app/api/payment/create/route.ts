import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // 1. Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
        }

        // 2. Generate unique order ID with ReCV branding
        const orderId = `ReCV-PRO-${user.id.slice(0, 8)}-${Date.now()}`;

        // 3. Price: Rp.15,000 (Indonesian Rupiah)
        const amount = 15000;

        // 4. Get Pakasir project slug from environment
        const slug = process.env.PAKASIR_PROJECT_SLUG || 'recv';

        // 5. Get domain for redirect URL
        const domain = process.env.NEXT_PUBLIC_SITE_URL || 'https://recv-ai.vercel.app';
        const redirectUrl = `${domain}/payment/success`;

        // 6. Construct Pakasir payment URL with redirect
        const paymentUrl = `https://app.pakasir.com/pay/${slug}/${amount}?order_id=${orderId}&rdr=${encodeURIComponent(redirectUrl)}`;

        console.log('💳 Payment created:', { orderId, amount, redirectUrl });

        return NextResponse.json({
            paymentUrl,
            orderId,
            amount
        });

    } catch (error: any) {
        console.error('Payment Creation Error:', error);
        return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }
}
