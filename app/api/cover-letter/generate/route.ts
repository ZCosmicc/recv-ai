import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const generateSchema = z.object({
    id: z.string().uuid().optional(), // Optional ID for updating
    cvId: z.string().uuid(),
    title: z.string().min(1).default('Untitled Cover Letter'),
    jobTitle: z.string().min(1),
    companyName: z.string().min(1),
    jobDescription: z.string().min(10), // Ensure meaningful description
    keySkills: z.string().optional(),
    tone: z.enum(['Professional', 'Enthusiastic', 'Confident', 'Creative']),
    language: z.enum(['en', 'id']).default('en'),
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
        const validationResult = generateSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: validationResult.error.format() }, { status: 400 });
        }

        const { id, cvId, title, jobTitle, companyName, jobDescription, tone, language } = validationResult.data;

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
                // Invalid ID or not owned -> treat as new or error?
                // Let's error to be safe, prevents confusion
                return NextResponse.json({ error: 'Cover letter not found or unauthorized' }, { status: 404 });
            }
        }

        // 3. Fetch Source CV
        const { data: cv, error: cvError } = await supabase
            .from('cvs')
            .select('data')
            .eq('id', cvId)
            .eq('user_id', user.id)
            .single();

        if (cvError || !cv) {
            return NextResponse.json({ error: 'CV not found' }, { status: 404 });
        }

        // 4. Check Credits
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tier, daily_credits_used, last_credit_reset, pro_expires_at')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const now = new Date();

        // Check if Pro subscription expired - auto-downgrade
        if (profile.tier === 'pro' && profile.pro_expires_at) {
            const expiryDate = new Date(profile.pro_expires_at);
            if (expiryDate < now) {
                await supabase.from('profiles').update({ tier: 'free', pro_expires_at: null }).eq('id', user.id);
                profile.tier = 'free';
            }
        }

        const lastReset = new Date(profile.last_credit_reset || 0);
        const limit = profile.tier === 'pro' ? 50 : 1;

        // Reset if 24h passed
        const hoursSuccess = Math.abs(now.getTime() - lastReset.getTime()) / 36e5;
        let currentUsage = profile.daily_credits_used || 0;

        if (hoursSuccess >= 24) {
            currentUsage = 0;
            await supabase.from('profiles').update({ daily_credits_used: 0, last_credit_reset: now.toISOString() }).eq('id', user.id);
        }

        if (currentUsage >= limit) {
            return NextResponse.json({ error: 'Daily limit reached. Upgrade to Pro for more.', code: 'LIMIT_REACHED' }, { status: 403 });
        }

        // 5. Check Storage Limit (Only if Creating New)
        if (!existingLetter) {
            const { count, error: countError } = await supabase
                .from('cover_letters')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (!countError && count !== null) {
                const storageLimit = profile.tier === 'pro' ? 4 : 1;
                if (count >= storageLimit) {
                    return NextResponse.json({
                        error: `Storage limit reached (${storageLimit} max). Delete existing letters to create new ones.`,
                        code: 'STORAGE_LIMIT_REACHED'
                    }, { status: 403 });
                }
            }
        }


        // 5. Generate with Groq
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        // Flatten CV for prompt
        // We only need relevant parts: Experience, Skills, Summary, personal info for name
        const cvSummary = {
            name: cv.data.personal?.name || 'Applicant',
            summary: cv.data.summary,
            skills: cv.data.skills,
            experience: cv.data.experience?.map((e: any) => ({
                role: e.title || e.role,
                company: e.company,
                description: e.description
            })),
            education: cv.data.education
        };

        const languageInstruction = language === 'id' ? 'Bahasa Indonesia' : 'English';
        const salutation = language === 'id' ? 'Yth. HRD / Manajer Perekrutan,' : 'Dear Hiring Manager,';
        const signOff = language === 'id' ? 'Hormat saya,' : 'Sincerely,';

        const prompt = `
        You are an expert career coach and professional writer.
        Write a ${tone} cover letter in ${languageInstruction} for the position of "${jobTitle}" at "${companyName}".
        
        JOB DESCRIPTION:
        ${jobDescription.substring(0, 3000)} -- (Truncated for safety)

        APPLICANT PROFILE (CV Summary):
        ${JSON.stringify(cvSummary)}

        INSTRUCTIONS:
        1. Language: Write STRICTLY in ${languageInstruction}.
        2. Content: Tailor specifically to the job description keywords, highlighting relevant experience from the CV.
        3. Tone: Match the requested tone: ${tone}.
        4. Structure (Use HTML paragraphs <p>):
           - Salutation: Start with "${salutation}" (or similar professional greeting).
           - Opening: Hook the reader, mention position and company.
           - Body Paragraph 1: Relevant experience/skills matching specific job needs.
           - Body Paragraph 2: Soft skills or cultural fit.
           - Closing: Call to action (interview request).
           - Sign-off: End with "${signOff}" followed by a line break and the applicant's name: "${cvSummary.name}".
        5. Formatting: Output VALID HTML. Wrap paragraphs in <p> tags. Do NOT use markdown code blocks.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
        });

        const generatedContent = completion.choices[0]?.message?.content || '';

        // 6. Save (Update or Insert)
        let savedLetter;
        let saveError;

        if (existingLetter) {
            const { data, error } = await supabase
                .from('cover_letters')
                .update({
                    cv_id: cvId,
                    title: title,
                    job_title: jobTitle,
                    company_name: companyName,
                    job_description: jobDescription,
                    content: generatedContent,
                    tone: tone
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
                    cv_id: cvId,
                    title: title,
                    job_title: jobTitle,
                    company_name: companyName,
                    job_description: jobDescription,
                    content: generatedContent,
                    tone: tone
                })
                .select()
                .single();
            savedLetter = data;
            saveError = error;
        }

        if (saveError) {
            console.error('Failed to save letter:', saveError);
            // Even if save fails, we return the content so user doesn't lose it, but we warn them
            return NextResponse.json({
                error: 'Generated but failed to save to database. You can still copy the content below.',
                saveError: saveError.message,
                content: generatedContent
            }, { status: 500 });
        }

        // Increment usage count
        await supabase.from('profiles').update({ daily_credits_used: currentUsage + 1 }).eq('id', user.id);

        // Log usage
        await supabase.from('usage_logs').insert({ user_id: user.id, model: 'llama-3.3-70b-cover-letter', tokens_used: 0 });

        return NextResponse.json(savedLetter);

    } catch (error) {
        console.error('Cover Letter API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
