import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // 1. Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
        }

        // 2. Load Profile & Check Credits
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tier, daily_credits_used, last_credit_reset')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const now = new Date();
        const lastReset = new Date(profile.last_credit_reset || 0);
        const limit = profile.tier === 'pro' ? 50 : 1; // 50 for Pro, 1 for Free

        // Check if 24 hours have passed since last reset
        const hoursSuccess = Math.abs(now.getTime() - lastReset.getTime()) / 36e5;
        let currentUsage = profile.daily_credits_used || 0;

        if (hoursSuccess >= 24) {
            // Reset credits
            currentUsage = 0;
            await supabase.from('profiles').update({
                daily_credits_used: 0,
                last_credit_reset: now.toISOString()
            }).eq('id', user.id);
        }

        // Enforce Limit
        if (currentUsage >= limit) {
            return NextResponse.json(
                { error: 'Daily limit reached. Upgrade to Pro for more.', code: 'LIMIT_REACHED' },
                { status: 403 }
            );
        }

        // Initialize Groq client
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const { cvData } = await req.json();

        if (!cvData) {
            return NextResponse.json({ error: 'No CV data provided' }, { status: 400 });
        }

        // 1. Flatten CV Data for the prompt
        const cvText = JSON.stringify(cvData, null, 2);

        // 2. Construct the prompt
        const prompt = `
        You are an expert ATS (Applicant Tracking System) and Resume Coach. 
        Analyze the following CV JSON data and provide constructive feedback.
        
        CV DATA:
        ${cvText}

        INSTRUCTIONS:
        1. Rate the CV from 0-100 based on completeness, impact, formatting (implied), and clarity.
        2. Provide a brief 2-sentence summary of the CV's quality.
        3. Identify **1 to 3** key strengths (do not force 3 if the CV is sparse).
        4. Identify **0 to 5** specific areas for improvement.
           - **STOPPING RULE**: If the CV is good, it is perfectly fine to return 0, 1, or 2 improvements. **DO NOT** invent minor issues just to fill a quota.
           - **Categorize** each improvement as:
             - "fix": A direct text replacement. **PRIORITIZE THIS** if you can offer a professional rephrasing that solves the issue without inventing facts (e.g., prefixing a short role with "Contract:", or formatting a gap as "Career Break").
             - "warning": Use this ONLY if you absolutely cannot write the text for them (e.g., missing entire degree).
           
           - **NITPICKING FORBIDDEN**: 
             - If a Summary is professional but standard, **DO NOT** flag it as "too generic". Accept it.
             - If Experience dates are short but clear, accept them.
           - **LOCATION**: Accept ALL valid cities/regions.
           - **FACTS**: DO NOT suggest changing factual history (like University Name).
             - **exception**: You CAN suggest a "fix" that *frames* the facts better. 
             - Example: If short duration, suggestion "Project Focus: [Original Description]" is a valid "fix".
             - Example: If "High School", suggestion to add "Relevant Courses: [Placeholder]" is a valid "fix" (user can fill placeholder).
             - If they have a 1-month job, do NOT call it "unrealistic". Suggest "Clarify if this was a project or internship" (Type: warning).
           - **LANGUAGE**: Only correct if it is literally a Country Name (e.g., "Malaysia" -> "Malay"). If it is "Malay", leave it alone.
           - **Fake Data**: If "Bikini Bottom", Type: "fix" (Suggestion: "[Enter Actual City]"). Tone: Humorous.
           
        OUTPUT FORMAT:
        Return ONLY valid JSON with this structure (no markdown formatting):
        {
            "score": number,
            "summary": "string",
            "strengths": ["string", "string", "string"],
            "improvements": [
                {
                    "section": "string",
                    "improvement_type": "string ('fix', 'remove', or 'warning')",
                    "target_path": "string (REQUIRED for 'fix' and 'remove'. Format: 'section[index].field' or 'section[index]')",
                    "feedback": "string",
                    "original": "string (Optional)",
                    "suggestion": "string (IF TYPE='fix': The exact replacement text. IF TYPE='remove': The reason for removal. IF TYPE='warning': The advice.)\n                    NOTE: If type is 'fix', the suggestion MUST be the content itself (e.g. 'Project Manager'). DO NOT say 'Change to Project Manager'.\n                    NOTE: If you want to delete something, use type 'remove'. DO NOT use type 'fix' with suggestion 'Remove this'."
                }
            ]
        }
        `;

        // 3. Call Groq
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            response_format: { type: 'json_object' },
        });

        const resultText = completion.choices[0]?.message?.content || '{}';
        const result = JSON.parse(resultText);

        // POST-PROCESSING: Force 'remove' type if AI failed to set it
        if (result.improvements) {
            result.improvements = result.improvements.map((item: any) => {
                const lowerSuggestion = item.suggestion?.toLowerCase()?.trim();
                // Check for common rejection phrases
                if (lowerSuggestion === 'remove' ||
                    lowerSuggestion === 'remove this' ||
                    lowerSuggestion === 'delete' ||
                    lowerSuggestion === 'remove or replace with a valid language' ||
                    lowerSuggestion === 'remove this entry' ||
                    lowerSuggestion.startsWith('remove this')
                ) {
                    return {
                        ...item,
                        improvement_type: 'remove',
                        suggestion: 'This item identifies as invalid or irrelevant.' // Friendly removal reason
                    };
                }
                return item;
            });
        }

        // Increment usage count
        await supabase.from('profiles').update({
            daily_credits_used: currentUsage + 1
        }).eq('id', user.id);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Groq API Error:', error);

        // Handle Rate Limits gracefully
        if (error?.status === 429) {
            return NextResponse.json(
                { error: 'AI is currently busy (Rate Limit Reached). Please try again in a minute.' },
                { status: 429 }
            );
        }

        return NextResponse.json({ error: 'Failed to analyze CV' }, { status: 500 });
    }
}
