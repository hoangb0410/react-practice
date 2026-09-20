import { z } from 'zod';
import { passwordSchema } from './common';

export const resetPasswordValidationSchema = z
  .object({
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'passwordRequired'),
  })
  .refine((v) => v.newPassword === v.confirmNewPassword, {
    error: 'passwordMismatch',
    path: ['confirmNewPassword'],
  });
