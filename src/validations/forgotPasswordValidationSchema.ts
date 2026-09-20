import { z } from 'zod';
import { emailSchema } from './common';

export const forgotPasswordValidationSchema = z.object({ email: emailSchema });
