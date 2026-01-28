import { z } from 'zod';

/**
 * Validation schema for /api/analyze route
 * Validates CV data structure for AI analysis
 */
export const analyzeRequestSchema = z.object({
    cvData: z.object({
        personalInfo: z.object({
            fullName: z.string().optional(),
            email: z.string().email().optional().or(z.literal('')),
            phone: z.string().optional(),
            location: z.string().optional(),
            linkedin: z.string().url().optional().or(z.literal('')),
            website: z.string().url().optional().or(z.literal('')),
        }).optional(),
        summary: z.string().optional(),
        experience: z.array(z.any()).optional(),
        education: z.array(z.any()).optional(),
        skills: z.array(z.any()).optional(),
    }).passthrough() // Allow additional fields
});

/**
 * Validation schema for /api/refine route
 * Validates text refinement requests
 */
export const refineRequestSchema = z.object({
    original_text: z.string().optional(),
    current_suggestion: z.string().min(1, 'Current suggestion is required'),
    user_instruction: z.string().min(1, 'User instruction is required'),
    section_context: z.string().optional(),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type RefineRequest = z.infer<typeof refineRequestSchema>;
