import { useAppToast } from '@/hooks';
import { QK_GET_USER_PROFILE, useVerifyRegisterMutation } from '@/react-query';
import { useReduxUser } from '@/redux';
import { getDefaultRouteByRole } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

interface ILocationState {
  hash?: string;
  email?: string;
}

export const useVerifyOtpHooks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { state } = useLocation();
  const { hash, email } = (state ?? {}) as ILocationState;
  const { setUserInfo } = useReduxUser();
  const { showServerErrorMsg, showServerSuccessMsg } = useAppToast();

  const [otp, setOtp] = useState('');

  const { mutate: verify, isPending } = useVerifyRegisterMutation({
    configs: {
      onSuccess: (res) => {
        const user = res.data;
        if (!user) return;
        setUserInfo(user);
        queryClient.invalidateQueries({ queryKey: [QK_GET_USER_PROFILE] });
        showServerSuccessMsg(res, t('verifyRegisterSuccess'));
        navigate(getDefaultRouteByRole(user.role), { replace: true });
      },
      onError: showServerErrorMsg,
    },
  });

  const onSubmit = (e?: SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!hash || !otp.trim()) return;
    verify({ body: { hash, otp: otp.trim() } });
  };

  return { t, email, otp, setOtp, isPending, onSubmit, missingHash: !hash };
};
