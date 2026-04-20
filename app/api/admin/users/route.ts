import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Service role client for admin operations (bypasses RLS)
function getServiceClient() {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}

export async function GET(req: Request) {
    const supabase = await createClient();

    // Auth & Admin Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (adminProfile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch Users - use service client to bypass RLS
    const serviceSupabase = getServiceClient();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let query = serviceSupabase.from('profiles').select('*').order('created_at', { ascending: false });

    if (search) {
        query = query.ilike('email', `%${search}%`);
    }

    const { data: users, error } = await query.limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ users });
}

// [Security Fix SA-02] Allowlist of valid tier values — prevents arbitrary strings
// from being written to the tier column even via a compromised admin account.
const VALID_TIERS = ['free', 'starter', 'pro'] as const;
type ValidTier = typeof VALID_TIERS[number];

// [SA-02 Fix] Zod schema validates both tier AND userId format (UUID)
const adminPatchSchema = z.object({
    userId: z.string().uuid('userId must be a valid UUID'),
    tier: z.enum(['free', 'starter', 'pro'])
});

export async function PATCH(req: Request) {
    const supabase = await createClient();

    // [SA-02] Validate request body — enforces UUID format on userId and enum on tier
    const rawBody = await req.json().catch(() => ({}));
    const validation = adminPatchSchema.safeParse(rawBody);
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Invalid request body', details: validation.error.flatten().fieldErrors },
            { status: 400 }
        );
    }
    const { userId, tier } = validation.data;

    // Admin Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (adminProfile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update Target User - use service client to bypass RLS
    const serviceSupabase = getServiceClient();

    // When setting tier to 'pro' or 'starter', also set pro_expires_at to 30 days from now
    const updateData: Record<string, any> = { tier };
    if (tier === 'pro' || tier === 'starter') {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        updateData.pro_expires_at = expiryDate.toISOString();
    } else if (tier === 'free') {
        updateData.pro_expires_at = null;
    }

    const { error } = await serviceSupabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
