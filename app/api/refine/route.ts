import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@/utils/supabase/server';
import { refineRequestSchema } from '@/lib/validation';

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

        // Parse and validate request body
        const body = await req.json();
        const validationResult = refineRequestSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Invalid request data',
                details: validationResult.error.format()
            }, { status: 400 });
        }

        const { original_text, current_suggestion, user_instruction, section_context } = validationResult.data;

        const prompt = `
        You are an expert CV editor assistant.
        
        CONTEXT:
        The user is reviewing a suggestion for their CV section: "${section_context}".
        
        Original Text: "${original_text || '(Empty)'}"
        Current AI Suggestion: "${current_suggestion}"
        
        USER INSTRUCTION:
        "${user_instruction}"
        
        TASK:
        Rewrite the "Current AI Suggestion" to incorporate the "User Instruction".
        Keep it professional, concise, and CV-ready.
        
        OUTPUT:
        Return ONLY the rewritten text string. 
        - NO quotes.
        - NO markdown (unless partial bolding is requested).
        - NO conversational filler (e.g., "Here is the refined text").
        - If the user asks to clarify a role, return the CLARIFIED DESCRIPTION, not advice.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
        });

        const refined_text = completion.choices[0]?.message?.content || current_suggestion;

        // Increment usage count in profile
        await supabase.from('profiles').update({
            daily_credits_used: currentUsage + 1
        }).eq('id', user.id);

        // Log to usage_logs for analytics
        await supabase.from('usage_logs').insert({
            user_id: user.id,
            model: 'llama-3.3-70b',
            tokens_used: 0 // We don't have exact token count from Groq SDK easily in this context
        });

        return NextResponse.json({ refined_suggestion: refined_text.trim() });

    } catch (error: any) {
        console.error('Groq Refine API Error:', error);

        // Handle Rate Limits gracefully
        if (error?.status === 429) {
            return NextResponse.json(
                { error: 'AI is currently busy (Rate Limit Reached). Please try again in a minute.' },
                { status: 429 }
            );
        }

        return NextResponse.json({ error: 'Failed to refine text' }, { status: 500 });
    }
}
