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

        // 2. Check if user is already Pro
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tier, pro_expires_at')
            .eq('id', user.id)
            .single();

        if (profileError) {
            return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
        }

        // Check if user is Pro and subscription hasn't expired
        if (profile?.tier === 'pro' && profile?.pro_expires_at) {
            const expiryDate = new Date(profile.pro_expires_at);
            const now = new Date();

            if (expiryDate > now) {
                // User is already Pro
                const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return NextResponse.json({
                    error: 'ALREADY_PRO',
                    message: `You're already a Pro member! Your subscription expires in ${daysRemaining} days.`,
                    expiresAt: profile.pro_expires_at
                }, { status: 400 });
            }
        }

        // 3. Generate unique order ID with ReCV branding
        const orderId = `ReCV-PRO-${user.id.slice(0, 8)}-${Date.now()}`;

        // 3. Price: Rp.15,000 (Indonesian Rupiah)
        const amount = 15000;

        // 4. Get Pakasir project slug from environment
        const slug = process.env.PAKASIR_PROJECT_SLUG || 'recv';

        // 5. Get domain for redirect URL
        const domain = process.env.NEXT_PUBLIC_SITE_URL || 'https://recv-ai.me';
        // FIXED: Redirect directly to dashboard with success flag
        const redirectUrl = `${domain}/?payment=success`;

        // 6. Construct Pakasir payment URL with redirect
        // FIXED: Use 'redirect' parameter instead of 'rdr' (per Pakasir docs)
        const paymentUrl = `https://app.pakasir.com/pay/${slug}/${amount}?order_id=${orderId}&redirect=${encodeURIComponent(redirectUrl)}`;

        console.log('💳 Payment created for amount:', amount);

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
