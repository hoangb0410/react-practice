import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const changeLanguageMock = vi.fn((_lang: string) => Promise.resolve());
let currentLang = 'en';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      get language() {
        return currentLang;
      },
      changeLanguage: (lang: string) => {
        currentLang = lang;
        return changeLanguageMock(lang);
      },
    },
  }),
}));

import { useLanguage } from '../useLanguage';

describe('useLanguage', () => {
  beforeEach(() => {
    currentLang = 'en';
    changeLanguageMock.mockClear();
  });

  afterEach(() => {
    document.documentElement.lang = '';
  });

  it('reports current language', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.current).toBe('en');
  });

  it('changeLanguage updates i18n and document lang', async () => {
    const { result } = renderHook(() => useLanguage());

    await act(async () => {
      await result.current.changeLanguage('vi');
    });

    expect(changeLanguageMock).toHaveBeenCalledWith('vi');
    expect(document.documentElement.lang).toBe('vi');
  });

  it('toggleLanguage flips en ↔ vi', async () => {
    const { result, rerender } = renderHook(() => useLanguage());

    await act(async () => {
      await result.current.toggleLanguage();
    });
    expect(changeLanguageMock).toHaveBeenLastCalledWith('vi');

    rerender();
    await act(async () => {
      await result.current.toggleLanguage();
    });
    expect(changeLanguageMock).toHaveBeenLastCalledWith('en');
  });
});
