import { z } from 'zod';
import { emailSchema, passwordSchema } from './common';
import { EUserRole } from '@/enums';

export const registerValidationSchema = z
  .object({
    username: z.string().min(1, 'usernameRequired').max(50, 'usernameMax'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'passwordRequired'),
    role: z.enum([EUserRole.READER, EUserRole.CREATOR], {
      error: 'roleRequired',
    }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: 'passwordMismatch',
    path: ['confirmPassword'],
  });
