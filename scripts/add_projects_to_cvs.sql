-- Migration: Add projects field to existing CV records
-- This script updates all existing CVs in the database to include an empty projects array

-- Update all CVs that don't have a projects field in their data JSON
UPDATE cvs
SET data = jsonb_set(
    data::jsonb,
    '{projects}',
    '[]'::jsonb,
    true
)
WHERE NOT (data::jsonb ? 'projects');

-- Verify the update
-- Run this to check how many rows were affected:
-- SELECT COUNT(*) FROM cvs WHERE data::jsonb ? 'projects';
