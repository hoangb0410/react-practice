import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const toastMock = vi.fn();
const isActiveMock = vi.fn((_id?: unknown) => false);

vi.mock('react-toastify', () => {
  const toast = (...args: unknown[]) => toastMock(...args);
  (toast as unknown as { isActive: (id: unknown) => boolean }).isActive = (
    id: unknown
  ) => isActiveMock(id);
  return { toast };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import { useAppToast } from '../useAppToast';

describe('useAppToast', () => {
  beforeEach(() => {
    toastMock.mockClear();
    isActiveMock.mockClear();
    isActiveMock.mockReturnValue(false);
  });

  afterEach(() => {
    toastMock.mockReset();
    isActiveMock.mockReset();
  });

  it('shows toast on showServerSuccessMsg with message from response', () => {
    toastMock.mockReturnValue('toast-id-1');
    const { result } = renderHook(() => useAppToast());

    act(() => {
      result.current.showServerSuccessMsg({ data: { message: 'Saved!' } });
    });

    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith(
      'Saved!',
      expect.objectContaining({ type: expect.any(String) })
    );
  });

  it('falls back to t("success") when response has no message', () => {
    toastMock.mockReturnValue('toast-id-2');
    const { result } = renderHook(() => useAppToast());

    act(() => {
      result.current.showServerSuccessMsg({});
    });

    expect(toastMock).toHaveBeenCalledWith('success', expect.anything());
  });

  it('ignores 401 errors silently', () => {
    const { result } = renderHook(() => useAppToast());

    act(() => {
      result.current.showServerErrorMsg({ response: { status: 401 } });
    });

    expect(toastMock).not.toHaveBeenCalled();
  });

  it('shows somethingWentWrong fallback when error has no parseable message', () => {
    toastMock.mockReturnValue('toast-id-3');
    const { result } = renderHook(() => useAppToast());

    act(() => {
      result.current.showServerErrorMsg({ response: { status: 500 } });
    });

    expect(toastMock).toHaveBeenCalledWith(
      'somethingWentWrong',
      expect.anything()
    );
  });

  it('dedupes when an active toast is already showing', () => {
    toastMock.mockReturnValue('toast-id-4');
    isActiveMock.mockReturnValue(true);
    const { result } = renderHook(() => useAppToast());

    act(() => {
      result.current.showServerSuccessMsg({ data: { message: 'A' } });
    });
    act(() => {
      result.current.showServerSuccessMsg({ data: { message: 'B' } });
    });

    expect(toastMock).toHaveBeenCalledTimes(1);
  });

  it('prefers top-level message, then fallback', () => {
    toastMock.mockReturnValue('toast-id-5');
    const { result } = renderHook(() => useAppToast());
    act(() => {
      result.current.showServerSuccessMsg({ message: 'From BE' }, 'fallback');
    });
    expect(toastMock).toHaveBeenLastCalledWith('From BE', expect.anything());
    act(() => {
      result.current.showServerSuccessMsg({}, 'fallback');
    });
    expect(toastMock).toHaveBeenLastCalledWith('fallback', expect.anything());
  });
});
