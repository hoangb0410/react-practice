import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Id, toast } from 'react-toastify';
import { IAppToastOption } from '@/types';
import { getAPIErrorMsg } from '@/utils';

export const useAppToast = () => {
  const { t } = useTranslation();
  const toastId = useRef<Id | null>(null);

  const showAppToast = ({
    type,
    content,
    duration = 3000,
  }: IAppToastOption) => {
    if (toastId.current && toast.isActive(toastId.current)) return;
    toastId.current = toast(content, {
      type,
      autoClose: duration,
      onClose: () => {
        toastId.current = null;
      },
    });
  };

  const showServerErrorMsg = (err: unknown) => {
    const error = err as {
      response?: { status?: number; data?: Record<string, unknown> };
    };
    if (error?.response?.status === 401) return;
    showAppToast({
      type: 'error',
      content: getAPIErrorMsg(error?.response?.data) ?? t('somethingWentWrong'),
    });
  };

  const showServerSuccessMsg = (res: unknown) => {
    const response = res as { data?: { message?: string } };
    showAppToast({
      type: 'success',
      content: response?.data?.message ?? t('success'),
    });
  };

  return { showAppToast, showServerErrorMsg, showServerSuccessMsg };
};
