import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
    try {
        console.log('🔔 Pakasir webhook received!');

        // 1. Parse webhook payload from Pakasir
        const body = await req.json();
        console.log('📥 Webhook payload:', JSON.stringify(body, null, 2));

        const { amount, order_id, status, payment_method, completed_at } = body;

        // 2. Verify it's from Pakasir (basic validation)
        if (!order_id || !amount) {
            console.error('❌ Missing order_id or amount');
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // 3. Only process completed payments
        if (status !== 'completed') {
            console.log(`⏳ Payment status: ${status} - not processing yet`);
            return NextResponse.json({ message: 'Payment not completed yet' }, { status: 200 });
        }

        // 4. Verify payment details with Pakasir API
        const apiKey = process.env.PAKASIR_API_KEY;
        const slug = process.env.PAKASIR_PROJECT_SLUG || 'recv';

        const verifyUrl = `https://app.pakasir.com/api/transactiondetail?project=${slug}&amount=${amount}&order_id=${order_id}&api_key=${apiKey}`;
        const verifyRes = await fetch(verifyUrl);
        const verifyData = await verifyRes.json();

        if (!verifyData.transaction || verifyData.transaction.status !== 'completed') {
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
        }

        // 5. Extract user ID from order_id (format: ReCV-PRO-{userId}-{timestamp})
        const orderParts = order_id.split('-');
        console.log('📦 Order ID parts:', orderParts);

        // Should be: ['ReCV', 'PRO', '{userId}', '{timestamp}']
        if (orderParts.length < 4 || orderParts[0] !== 'ReCV' || orderParts[1] !== 'PRO') {
            console.error('❌ Invalid order ID format:', order_id);
            return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
        }
        const userIdPrefix = orderParts[2];

        // 6. Use service role to update user (bypass RLS)
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    get() { return undefined },
                    set() { },
                    remove() { },
                }
            }
        );

        // 7. Find user by ID prefix and update to Pro
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, tier')
            .ilike('id', `${userIdPrefix}%`)
            .limit(1);

        if (!profiles || profiles.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = profiles[0].id;

        // 8. Set Pro tier with 30-day expiry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const { error: updateError } = await supabase.from('profiles').update({
            tier: 'pro',
            pro_expires_at: expiryDate.toISOString()
        }).eq('id', userId);

        if (updateError) {
            console.error('Failed to upgrade user:', updateError);
            return NextResponse.json({ error: 'Failed to upgrade user' }, { status: 500 });
        }

        console.log(`✅ User ${userId} upgraded to Pro via ${payment_method}`);

        return NextResponse.json({ message: 'Payment processed successfully' });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
