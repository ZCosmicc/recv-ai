import { z } from 'zod';

// Helper to clean strings
// We use a function to allow custom max length while keeping the transform
const cleanString = (maxLength: number = 5000) =>
    z.string().trim().min(0).max(maxLength).transform(val => val.replace(/\s+/g, ' ').trim());

// For longer text blocks like summaries, no aggressive whitespace replacement
const textString = z.string().trim().min(1).max(20000);

// --- Sub-schemas based on types/index.ts ---

const customFieldSchema = z.object({
    label: cleanString(100),
    value: cleanString(500)
});

const personalInfoSchema = z.object({
    name: cleanString(100).optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
    phone: cleanString(50).optional().or(z.literal('')),
    location: cleanString(100).optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    customFields: z.array(customFieldSchema).optional()
});

const experienceSchema = z.object({
    title: cleanString(200).optional().or(z.literal('')),
    company: cleanString(200).optional().or(z.literal('')),
    startDate: cleanString(50).optional().or(z.literal('')),
    endDate: cleanString(50).optional().or(z.literal('')),
    description: textString.optional().or(z.literal('')),
    current: z.boolean().optional()
});

const educationSchema = z.object({
    degree: cleanString(200).optional().or(z.literal('')),
    major: cleanString(200).optional().or(z.literal('')),
    institution: cleanString(200).optional().or(z.literal('')),
    year: cleanString(50).optional().or(z.literal(''))
});

// --- Main Schemas ---

/**
 * Validation schema for /api/analyze route
 * Validates CV data structure for AI analysis
 */
export const analyzeRequestSchema = z.object({
    cvData: z.object({
        personalInfo: personalInfoSchema.optional(),
        summary: textString.optional().or(z.literal('')),
        experience: z.array(experienceSchema).optional(),
        education: z.array(educationSchema).optional(),
        skills: z.array(cleanString(100)).optional(),
        certification: z.array(cleanString(200)).optional(),
        language: z.array(cleanString(100)).optional()
    })
});

/**
 * Validation schema for /api/refine route
 * Validates text refinement requests
 */
export const refineRequestSchema = z.object({
    original_text: z.string().optional(),
    current_suggestion: z.string().min(1, 'Current suggestion is required').max(10000),
    user_instruction: z.string().min(1, 'User instruction is required').max(1000),
    section_context: z.string().optional(), // Removed .max() from optional if it was causing issues, or usage was wrong
});

/**
 * Validation schema for /api/webhook/pakasir
 */
export const pakasirWebhookSchema = z.object({
    amount: z.union([z.number(), z.string().transform((val) => Number(val))]),
    order_id: z.string().min(10).max(100),
    status: z.string(),
    payment_method: z.string().optional(),
    completed_at: z.string().optional()
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type RefineRequest = z.infer<typeof refineRequestSchema>;
export type PakasirWebhookRequest = z.infer<typeof pakasirWebhookSchema>;
