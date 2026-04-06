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

        const { email, category, subject, description, screenshot_urls } = validation.data;

        // Check session (optional — guests allowed)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const serviceSupabase = getServiceSupabase();

        // [Security Fix #4] Rate limit: 1 ticket per 24h, enforced by email for both
        // logged-in users AND guests — prevents unauthenticated ticket spam.
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: recentCount } = await serviceSupabase
            .from('support_tickets')
            .select('id', { count: 'exact', head: true })
            .eq('email', email)
            .gte('created_at', since);

        if ((recentCount ?? 0) >= 1) {
            return NextResponse.json(
                { error: 'rate_limited', message: "A ticket from this email was already submitted today. Please check back tomorrow." },
                { status: 429 }
            );
        }

        // [Security Fix #7] Validate that screenshot URLs are from our own Supabase storage.
        // Prevents users from injecting arbitrary external URLs stored as 'screenshots'.
        if (screenshot_urls && screenshot_urls.length > 0) {
            const supabaseStorageBase = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const hasInvalidUrl = screenshot_urls.some(
                (url) => !url.startsWith(`${supabaseStorageBase}/storage/v1/`)
            );
            if (hasInvalidUrl) {
                return NextResponse.json(
                    { error: 'Invalid screenshot URL. Only Supabase-hosted images are accepted.' },
                    { status: 400 }
                );
            }
        }

        // Store screenshot URLs as JSON string in the screenshot_url TEXT column
        const screenshotUrlValue = screenshot_urls && screenshot_urls.length > 0
            ? JSON.stringify(screenshot_urls)
            : null;

        const { error } = await serviceSupabase.from('support_tickets').insert({
            user_id: user?.id ?? null,
            email,
            category,
            subject,
            description,
            screenshot_url: screenshotUrlValue,
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
