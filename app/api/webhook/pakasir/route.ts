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
            console.error('❌ Invalid payload:', validation.error);
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const { amount, order_id, status, payment_method, completed_at } = validation.data;

        // 2. Verify it's from Pakasir (basic validation)
        // (Redundant check kept for logic flow if needed, but schema handles existence)
        if (!order_id || !amount) {
            console.error('❌ Missing order_id or amount');
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

        // 5. Extract user ID from order_id (format: ReCV-PRO-{userId}-{timestamp})
        const orderParts = order_id.split('-');

        // Should be: ['ReCV', 'PRO', '{userId}', '{timestamp}']
        if (orderParts.length < 4 || orderParts[0] !== 'ReCV' || orderParts[1] !== 'PRO') {
            console.error('❌ Invalid order ID format');
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

        // 7. Find user by ID prefix

        // 7. Find user by ID prefix
        // Since Postgres LIKE on UUID is tricky via client, we fetch IDs and match in JS.
        // This is safe for < 10k users. optimize later if needed.
        const { data: allProfiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, tier');

        if (profileError || !allProfiles) {
            console.error('❌ Error fetching profiles:', profileError);
            return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
        }

        const profile = allProfiles.find(p => p.id.startsWith(userIdPrefix));

        if (!profile) {
            console.error('❌ User not found with prefix:', userIdPrefix);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = profile.id;
        console.log('✅ Payment verified, upgrading user to Pro');

        // 8. Calculate expiry date (30 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // 9. Update user to Pro tier
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                tier: 'pro',
                pro_expires_at: expiryDate.toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            console.error('❌ Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }

        console.log('✅ User upgraded to Pro successfully');

        return NextResponse.json({
            success: true,
            message: 'Payment processed successfully'
        });

    } catch (error: any) {
        console.error('❌ Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
