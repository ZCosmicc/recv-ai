import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { supportTicketSchema } from '@/lib/validation';

function getServiceSupabase() {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const validation = supportTicketSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, category, subject, description, screenshot_url } = validation.data;

        // Check session (optional — guests allowed)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const serviceSupabase = getServiceSupabase();

        // Rate limit: logged-in users can only submit 1 ticket per 24h
        if (user) {
            const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { count } = await serviceSupabase
                .from('support_tickets')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', since);

            if ((count ?? 0) >= 1) {
                return NextResponse.json(
                    { error: 'rate_limited', message: "You've already submitted a ticket today. Please check back tomorrow." },
                    { status: 429 }
                );
            }
        }

        const { error } = await serviceSupabase.from('support_tickets').insert({
            user_id: user?.id ?? null,
            email,
            category,
            subject,
            description,
            screenshot_url: screenshot_url || null,
        });

        if (error) {
            console.error('Support ticket insert error:', error);
            return NextResponse.json({ error: 'Failed to submit ticket' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Support route error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
