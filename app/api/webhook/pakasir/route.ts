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

        // 7. Find user by ID prefix
        console.log(`🔍 Searching for user with ID starting with: ${userIdPrefix}`);

        // Fetch all profiles (small dataset) and filter by ID prefix
        const { data: allProfiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, tier');

        console.log(`📊 Total profiles found: ${allProfiles?.length || 0}`);

        if (profileError) {
            console.error('❌ Error fetching profiles:', profileError);
            return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
        }

        if (!allProfiles || allProfiles.length === 0) {
            console.error('❌ No profiles found in database');
            return NextResponse.json({ error: 'No users in database' }, { status: 404 });
        }

        // Filter by ID prefix (convert UUID to string for comparison)
        const matchingProfiles = allProfiles.filter(p => p.id.toString().startsWith(userIdPrefix));

        console.log(`🎯 Profiles matching prefix ${userIdPrefix}:`, matchingProfiles.length);

        if (matchingProfiles.length === 0) {
            console.error(`❌ User not found with prefix: ${userIdPrefix}`);
            console.log('💡 All IDs in database:', allProfiles.map(p => p.id.toString().substring(0, 10)));
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const profile = matchingProfiles[0];
        const userId = profile.id;
        console.log(`✅ Found user: ${userId} (${profile.email})`);

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

        console.log(`✅ User ${userId} upgraded to Pro until ${expiryDate.toISOString()}`);

        return NextResponse.json({
            success: true,
            message: 'Payment processed and user upgraded to Pro',
            userId,
            expiresAt: expiryDate.toISOString()
        });

    } catch (error: any) {
        console.error('❌ Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
