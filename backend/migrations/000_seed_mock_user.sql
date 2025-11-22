-- ============================================================================
-- Seed Mock User for Phase 1 MVP Development
-- ============================================================================
-- This script creates a test user that matches the mock authentication system
-- Run this AFTER creating the sparkle schema (001_initial_schema.sql)
--
-- Phase 2: This seed can be removed when real authentication is implemented
-- ============================================================================

-- Insert mock test user
INSERT INTO sparkle.sparkle_users (
    id,
    email,
    full_name,
    avatar_url,
    linkedin_profile_url,
    created_at,
    updated_at
) VALUES (
    '123e4567-e89b-12d3-a456-426614174000'::uuid,
    'test@sparkle.com',
    'Test User',
    NULL,
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;  -- Skip if already exists

-- Verify the user was created
SELECT
    id,
    email,
    full_name,
    created_at
FROM sparkle.sparkle_users
WHERE id = '123e4567-e89b-12d3-a456-426614174000'::uuid;

-- Expected output:
-- id                                   | email              | full_name | created_at
-- -------------------------------------|--------------------|-----------|-----------------------
-- 123e4567-e89b-12d3-a456-426614174000 | test@sparkle.com   | Test User | [timestamp]
