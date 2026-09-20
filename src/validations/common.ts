import { z } from 'zod';
import { EMAIL_REGEX } from '@/constants';

export const emailSchema = z
  .string()
  .min(1, 'emailRequired')
  .regex(EMAIL_REGEX, 'emailInvalid');

export const passwordSchema = z
  .string()
  .min(1, 'passwordRequired')
  .min(8, 'passwordMin')
  .max(32, 'passwordMax')
  .regex(/[A-Z]/, 'passwordUppercase')
  .regex(/[a-z]/, 'passwordLowercase')
  .regex(/[0-9]/, 'passwordNumber')
  .regex(/[@$!%*?&]/, 'passwordSymbol');
