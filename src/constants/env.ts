import { z } from 'zod';

const envSchema = z.object({
  VITE_PORT: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 3000))
    .pipe(z.number().int().positive()),
  VITE_API_URL: z.url().refine((v) => /^https?:\/\//.test(v), {
    message: 'VITE_API_URL must start with http:// or https://',
  }),
  VITE_ENV: z.enum(['DEVELOP', 'STAGING', 'PRODUCTION']),
  VITE_LANGUAGE: z.enum(['en', 'vi']).optional().default('en'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const config = { env: parsed.data };
export type AppEnv = z.infer<typeof envSchema>;
