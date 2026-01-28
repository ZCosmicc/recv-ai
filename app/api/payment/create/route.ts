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

        // 2. Generate unique order ID
        const orderId = `PRO-${user.id.slice(0, 8)}-${Date.now()}`;

        // 3. Price: Rp.15,000 (Indonesian Rupiah)
        const amount = 15000;

        // 4. Get Pakasir project slug from environment
        const slug = process.env.PAKASIR_PROJECT_SLUG || 'recv';

        // 5. Construct Pakasir payment URL
        const paymentUrl = `https://app.pakasir.com/pay/${slug}/${amount}?order_id=${orderId}`;

        // 6. Store pending transaction in database (optional but recommended)
        await supabase.from('payment_transactions').insert({
            order_id: orderId,
            user_id: user.id,
            amount: amount,
            status: 'pending',
            created_at: new Date().toISOString()
        });

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
