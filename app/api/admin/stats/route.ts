import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
    const supabase = await createClient();

    // 1. Admin Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    // 2. Fetch Stats
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // A. Global Requests (Last 24h)
    const { count: requests24h } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo);

    // B. Total AI Usage (All time)
    const { count: totalUsage } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true });

    // C. User Stats
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { count: newUsers7d } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo);

    const { count: proUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tier', 'pro');

    const { count: freeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .or('tier.eq.free,tier.is.null,tier.eq.guest'); // Count guest/free together or separately? 
    // Note: 'guest' is usually frontend state if not in DB, but we store profiles for logged in users. 
    // Real 'guest' (no login) aren't in DB. So this counts Logged In Free users.

    // D. Top Active Users (24h)
    // Supabase JS doesn't support complex GROUP BY aggregation easily without RPC.
    // We will fetch last 100 logs or so and aggregate in JS for simplicity, 
    // OR use a raw query if we had a function. 
    // For small scale, fetching last few hundred logs is fine.
    // Better: Fetch top users by daily_credits_used from profiles!
    const { data: topUsers } = await supabase
        .from('profiles')
        .select('email, daily_credits_used, tier')
        .order('daily_credits_used', { ascending: false })
        .limit(5);

    return NextResponse.json({
        requests24h,
        totalUsage,
        totalUsers,
        newUsers7d,
        proUsers,
        freeUsers,
        topUsers
    });
}
