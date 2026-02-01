import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const saveSchema = z.object({
    id: z.string().uuid().nullable().optional(),
    cvId: z.string().uuid(),
    title: z.string().optional(),
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
    jobDescription: z.string().optional(),
    keySkills: z.string().optional(),
    tone: z.string().optional(),
    language: z.enum(['en', 'id']).optional(),
    content: z.string().optional()
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // 1. Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Request
        const body = await req.json();

        const validationResult = saveSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: validationResult.error.format() }, { status: 400 });
        }

        const { id, cvId, title, jobTitle, companyName, jobDescription, keySkills, tone, language, content } = validationResult.data;

        // 3. Logic: Update or Create
        let existingLetter = null;

        if (id) {
            // If ID provided, ensure user owns it
            const { data, error } = await supabase
                .from('cover_letters')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

            if (!error && data) {
                existingLetter = data;
            } else {
                return NextResponse.json({ error: 'Cover letter not found or unauthorized' }, { status: 404 });
            }
        }

        // 3b. Check Storage Limit if Creating New
        if (!existingLetter) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('tier')
                .eq('id', user.id)
                .single();

            if (profile) {
                const { count, error: countError } = await supabase
                    .from('cover_letters')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (!countError && count !== null) {
                    const storageLimit = profile.tier === 'pro' ? 4 : 1;
                    if (count >= storageLimit) {
                        return NextResponse.json({
                            error: `Storage limit reached (${storageLimit}). Upgrade to Pro or delete old letters.`,
                            code: 'STORAGE_LIMIT_REACHED'
                        }, { status: 403 });
                    }
                }
            }
        }

        // 4. Save
        let savedLetter;
        let saveError;

        const payload = {
            cv_id: cvId,
            title: title || (existingLetter ? existingLetter.title : 'Untitled Draft'),
            job_title: jobTitle || '',
            company_name: companyName || '',
            job_description: jobDescription || '',
            content: content || '',
            tone: tone || 'Professional',
            // key_skills: keySkills // If DB supports it, uncomment this!
        };


        if (existingLetter) {
            const { data, error } = await supabase
                .from('cover_letters')
                .update({
                    ...payload,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingLetter.id)
                .select()
                .single();
            savedLetter = data;
            saveError = error;
        } else {
            const { data, error } = await supabase
                .from('cover_letters')
                .insert({
                    user_id: user.id,
                    ...payload
                })
                .select()
                .single();
            savedLetter = data;
            saveError = error;
        }

        if (saveError) {
            console.error('DB Save Error:', saveError);
            return NextResponse.json({ error: 'Database error', details: saveError.message }, { status: 500 });
        }

        return NextResponse.json(savedLetter);

    } catch (error) {
        console.error('Save Draft Critical API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
