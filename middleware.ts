import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Rate Limiter if env vars are set
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(20, '10 s'), // 20 requests per 10 seconds
        analytics: true,
    })
    : null;

export async function middleware(request: NextRequest) {
    // 1. DDoS Protection (Rate Limiting)
    // Only verify if Ratelimit is configured and it's an API route or sensitive path
    if (ratelimit && request.nextUrl.pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

        try {
            const { success } = await ratelimit.limit(ip);
            if (!success) {
                return NextResponse.json(
                    { error: 'Too Many Requests', message: 'Please slow down.' },
                    { status: 429 }
                );
            }
        } catch (err) {
            console.error('Rate limit error:', err);
            // Fail open: Allow request if rate limit fails so legitimate traffic isn't blocked by infrastructure issues
        }
    }

    // 2. Supabase Auth Session
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
