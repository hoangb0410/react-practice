import { describe, expect, it, vi } from 'vitest';

const importEnv = async () => {
  vi.resetModules();
  return await import('../env');
};

describe('env validation', () => {
  it('parses a valid environment', async () => {
    vi.stubGlobal('import', { meta: { env: {} } });
    // Use Vite's stubEnv via import.meta.env
    const original = { ...import.meta.env };
    import.meta.env.VITE_API_URL = 'http://localhost:3000';
    import.meta.env.VITE_ENV = 'DEVELOP';
    import.meta.env.VITE_LANGUAGE = 'vi';

    const { config } = await importEnv();
    expect(config.env.VITE_API_URL).toBe('http://localhost:3000');
    expect(config.env.VITE_ENV).toBe('DEVELOP');
    expect(config.env.VITE_LANGUAGE).toBe('vi');

    Object.assign(import.meta.env, original);
  });

  it('throws when VITE_API_URL is missing scheme', async () => {
    const original = { ...import.meta.env };
    import.meta.env.VITE_API_URL = 'localhost:3000';
    import.meta.env.VITE_ENV = 'DEVELOP';

    await expect(importEnv()).rejects.toThrow(/VITE_API_URL/);

    Object.assign(import.meta.env, original);
  });

  it('throws when VITE_ENV is not one of the allowed values', async () => {
    const original = { ...import.meta.env };
    import.meta.env.VITE_API_URL = 'http://localhost:3000';
    import.meta.env.VITE_ENV = 'WRONG';

    await expect(importEnv()).rejects.toThrow(/VITE_ENV/);

    Object.assign(import.meta.env, original);
  });
});
