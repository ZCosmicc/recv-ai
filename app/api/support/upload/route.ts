import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

function getServiceSupabase() {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' }, { status: 400 });
        }

        // Validate size
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 });
        }

        // Get user for folder path (guests use 'guest')
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const folder = user?.id ?? 'guest';

        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${folder}/${timestamp}-${safeName}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const serviceSupabase = getServiceSupabase();
        const { error } = await serviceSupabase.storage
            .from('support-screenshots')
            .upload(path, buffer, { contentType: file.type, upsert: false });

        if (error) {
            console.error('Storage upload error:', error);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }

        // Get a signed URL valid for 1 year (for admin viewing)
        const { data: signedData } = await serviceSupabase.storage
            .from('support-screenshots')
            .createSignedUrl(path, 60 * 60 * 24 * 365);

        return NextResponse.json({ url: signedData?.signedUrl ?? '' });
    } catch (err) {
        console.error('Upload route error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
