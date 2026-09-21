import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
    name: z.string().min(1).max(100).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
      .optional(),
  }).refine(
    (data) => !(data.currentPassword && !data.newPassword),
    { message: 'New password is required when current password is provided', path: ['newPassword'] }
  ),
});

export const updateUserProfileSchema = z.object({
  body: z.object({
    education: z.array(z.string()).optional(),
    degree: z.string().optional(),
    graduationYear: z.number().optional(),
    experienceLevel: z.string().optional(),
    skills: z.array(z.string()).optional(),
    softSkills: z.array(z.string()).optional(),
    preferredRoles: z.array(z.string()).optional(),
    preferredIndustries: z.array(z.string()).optional(),
    careerGoals: z.array(z.string()).optional(),
    experience: z.array(z.string()).optional(),
    location: z.string().optional(),
    remotePreference: z.string().optional(),
    expectedSalary: z.number().optional(),
    maxPaymentWillingness: z.number().optional(),
    learningGoals: z.array(z.string()).optional(),
    budget: z.number().optional(),
    availableTime: z.string().optional(),
    preferredLearningMode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional(),
  }),
});