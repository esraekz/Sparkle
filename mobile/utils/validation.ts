/**
 * Zod validation schemas for form validation
 */

import { z } from 'zod';

// ============================================
// Auth Validation Schemas
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const signupSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password is too long'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
