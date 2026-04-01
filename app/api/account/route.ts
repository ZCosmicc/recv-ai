import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

function getServiceSupabase() {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function DELETE() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.id;
        const serviceSupabase = getServiceSupabase();

        // 1. Delete screenshot files from storage
        const { data: files } = await serviceSupabase.storage
            .from('support-screenshots')
            .list(userId);

        if (files && files.length > 0) {
            const paths = files.map(f => `${userId}/${f.name}`);
            await serviceSupabase.storage.from('support-screenshots').remove(paths);
        }

        // 2. Delete support tickets
        await serviceSupabase.from('support_tickets').delete().eq('user_id', userId);

        // 3. Delete cover letters
        await serviceSupabase.from('cover_letters').delete().eq('user_id', userId);

        // 4. Delete CVs
        await serviceSupabase.from('cvs').delete().eq('user_id', userId);

        // 5. Delete profile
        await serviceSupabase.from('profiles').delete().eq('id', userId);

        // 6. Delete auth user (must be last)
        const { error: authError } = await serviceSupabase.auth.admin.deleteUser(userId);
        if (authError) {
            console.error('Auth delete error:', authError);
            return NextResponse.json({ error: 'Failed to delete auth account' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Account delete error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
