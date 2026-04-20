import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// [SA-03 Fix] Magic byte validation — verifies the actual binary file signature
// regardless of what file.type (Content-Type header) claims.
// Prevents content-type spoofing (e.g. an HTML file renamed to .jpg).
function getMimeFromBytes(buf: Buffer): string | null {
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png';
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return 'image/webp'; // RIFF header
    return null;
}

function getServiceSupabase() {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function POST(req: Request) {
    try {
        // [Security Fix #1] Require authentication — prevents unauthenticated users from
        // flooding Supabase storage with arbitrary files at zero cost.
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please log in to attach screenshots.' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate MIME type from the Content-Type header
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' }, { status: 400 });
        }

        // Validate size
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // [SA-03] Magic byte validation — re-checks actual binary signature regardless of declared type
        const actualMime = getMimeFromBytes(buffer);
        if (!actualMime || !ALLOWED_TYPES.includes(actualMime)) {
            return NextResponse.json(
                { error: 'File content does not match an allowed image format.' },
                { status: 400 }
            );
        }

        const folder = user.id;

        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${folder}/${timestamp}-${safeName}`;

        const serviceSupabase = getServiceSupabase();
        const { error } = await serviceSupabase.storage
            .from('support-screenshots')
            .upload(path, buffer, { contentType: file.type, upsert: false });

        if (error) {
            console.error('Storage upload error:', error);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }

        // [Security Fix #10] Signed URL valid for 90 days (reduced from 1 year)
        // Shorter lifespan limits exposure if a URL leaks from admin panel logs.
        const { data: signedData } = await serviceSupabase.storage
            .from('support-screenshots')
            .createSignedUrl(path, 60 * 60 * 24 * 90);

        return NextResponse.json({ url: signedData?.signedUrl ?? '' });
    } catch (err) {
        console.error('Upload route error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
