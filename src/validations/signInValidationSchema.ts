import { z } from 'zod';
import { emailSchema, passwordSchema } from './common';

export const signInValidationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
