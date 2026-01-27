import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

    // Fetch Users
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

    if (search) {
        query = query.ilike('email', `%${search}%`);
    }

    const { data: users, error } = await query.limit(50); // Simple limit for now

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
    const supabase = await createClient();
    const { userId, tier } = await req.json();

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

    // Update Target User
    const { error } = await supabase
        .from('profiles')
        .update({ tier })
        .eq('id', userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
