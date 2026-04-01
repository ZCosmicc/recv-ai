import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

// ─── In-memory rate limiter (no external service needed) ───────────────────
// Sliding window: tracks request timestamps per IP in a Map.
// Resets on cold starts — perfectly fine for low-traffic projects.
const WINDOW_MS = 10_000;   // 10 seconds
const MAX_REQUESTS = 20;    // 20 requests per window per IP

const ipTimestamps = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const timestamps = (ipTimestamps.get(ip) ?? []).filter(t => t > windowStart);
    if (timestamps.length >= MAX_REQUESTS) return true;
    timestamps.push(now);
    ipTimestamps.set(ip, timestamps);
    return false;
}

export async function middleware(request: NextRequest) {
    // 1. DDoS Protection — only apply to API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too Many Requests', message: 'Please slow down.' },
                { status: 429 }
            );
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
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
