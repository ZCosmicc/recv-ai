import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
    try {
        // Initialize Groq client at runtime to avoid build-time env var issues
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const { original_text, current_suggestion, user_instruction, section_context } = await req.json();

        if (!user_instruction) {
            return NextResponse.json({ error: 'Instruction required' }, { status: 400 });
        }

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

        return NextResponse.json({ refined_suggestion: refined_text.trim() });

    } catch (error: any) {
        console.error('Groq Refine API Error:', error);
        return NextResponse.json({ error: 'Failed to refine text' }, { status: 500 });
    }
}
