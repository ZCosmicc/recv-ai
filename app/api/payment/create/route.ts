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

        // 2. Parse which plan the user wants to buy
        let body: any = {};
        try { body = await req.json(); } catch { /* no body is fine */ }
        const plan: 'starter' | 'pro' = body?.plan === 'starter' ? 'starter' : 'pro';
        const planLabel = plan.toUpperCase(); // 'STARTER' | 'PRO'
        const amount = plan === 'starter' ? 5000 : 15000;

        // 3. Check if user already has an active subscription for this plan
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tier, pro_expires_at')
            .eq('id', user.id)
            .single();

        if (profileError) {
            return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
        }

        // Block if already on the exact same active plan
        if (profile?.tier === plan && profile?.pro_expires_at) {
            const expiryDate = new Date(profile.pro_expires_at);
            const now = new Date();
            if (expiryDate > now) {
                const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const errorCode = plan === 'pro' ? 'ALREADY_PRO' : 'ALREADY_STARTER';
                const planName = plan === 'pro' ? 'Pro' : 'Starter';
                return NextResponse.json({
                    error: errorCode,
                    message: `You're already a ${planName} member! Your subscription expires in ${daysRemaining} days.`,
                    expiresAt: profile.pro_expires_at
                }, { status: 400 });
            }
        }

        // 4. Generate unique order ID — format: ReCV-{PLAN}-{userId8}-{timestamp}
        const orderId = `ReCV-${planLabel}-${user.id.slice(0, 8)}-${Date.now()}`;

        // 5. Get Pakasir project slug from environment
        const slug = process.env.PAKASIR_PROJECT_SLUG || 'recv';

        // 6. Get domain for redirect URL
        const domain = process.env.NEXT_PUBLIC_SITE_URL || 'https://recv-ai.me';
        const redirectUrl = `${domain}/?payment=success&plan=${plan}`;

        // 7. Construct Pakasir payment URL with redirect
        const paymentUrl = `https://app.pakasir.com/pay/${slug}/${amount}?order_id=${orderId}&redirect=${encodeURIComponent(redirectUrl)}`;

        console.log(`💳 Payment created: ${planLabel} — Rp${amount}`);

        return NextResponse.json({ paymentUrl, orderId, amount, plan });

    } catch (error: any) {
        console.error('Payment Creation Error:', error);
        return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }
}
