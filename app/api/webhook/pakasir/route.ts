import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { pakasirWebhookSchema } from '@/lib/validation';

export async function POST(req: Request) {
    try {
        console.log('🔔 Pakasir webhook received!');

        // 1. Parse webhook payload from Pakasir
        const body = await req.json();

        // VALIDATION
        const validation = pakasirWebhookSchema.safeParse(body);
        if (!validation.success) {
            console.error('❌ Webhook validation failed');
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const { amount, order_id, status, payment_method, completed_at } = validation.data;

        // Log only non-sensitive webhook info
        console.log('🔔 Webhook received - Order:', order_id, 'Status:', status);

        // 2. Verify it's from Pakasir (basic validation)
        // (Redundant check kept for logic flow if needed, but schema handles existence)
        if (!order_id || !amount) {
            console.error('❌ Missing required fields');
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // 3. Only process completed payments
        if (status !== 'completed') {
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

        // 5. Extract plan and user ID from order_id (format: ReCV-{PLAN}-{userId8}-{timestamp})
        const orderParts = order_id.split('-');

        // Should be: ['ReCV', 'PRO'|'STARTER', '{userId8}', '{timestamp}']
        const planFromOrder = orderParts[1]; // 'PRO' or 'STARTER'
        if (orderParts.length < 4 || orderParts[0] !== 'ReCV' || !['PRO', 'STARTER'].includes(planFromOrder)) {
            console.error('❌ Invalid order ID format:', order_id);
            return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
        }

        // Verify the amount matches what we expect for this plan
        const expectedAmount = planFromOrder === 'STARTER' ? 5000 : 15000;
        if (amount !== expectedAmount) {
            console.error(`❌ Amount mismatch: expected ${expectedAmount} for ${planFromOrder}, got ${amount}`);
            return NextResponse.json({ error: 'Amount mismatch for plan' }, { status: 400 });
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

        // 7. Find user by ID prefix using a targeted DB query
        // [Security Fix #9] Uses ilike instead of fetching ALL profiles + JS filter.
        // Also detects UUID prefix collisions to prevent wrong-user upgrades.
        const { data: matchingProfiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, tier')
            .ilike('id', `${userIdPrefix}%`)
            .limit(2); // Fetch up to 2 to detect collisions

        if (profileError || !matchingProfiles || matchingProfiles.length === 0) {
            console.error('❌ User not found');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (matchingProfiles.length > 1) {
            console.error('❌ Ambiguous order ID prefix — multiple users matched:', userIdPrefix);
            return NextResponse.json({ error: 'Ambiguous order ID. Please contact support.' }, { status: 409 });
        }

        const profile = matchingProfiles[0];
        const userId = profile.id;

        const newTier = planFromOrder === 'STARTER' ? 'starter' : 'pro';
        console.log(`✅ Payment verified, upgrading user to ${newTier}`);

        // 8. Calculate expiry date (30 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // 9. Update user tier
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                tier: newTier,
                pro_expires_at: expiryDate.toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            console.error('❌ Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }

        console.log(`✅ User upgraded to ${newTier} successfully`);

        return NextResponse.json({
            success: true,
            message: 'Payment processed successfully'
        });

    } catch (error: any) {
        console.error('❌ Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
