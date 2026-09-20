import { useReduxUser } from '@/redux';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ISignInFormValues } from '@/interfaces';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInValidationSchema } from '@/validations';
import { useLoginMutation } from '@/react-query';
import { getDefaultRouteByRole } from '@/utils';
import { useAppToast } from '@/hooks';

export const useSignInHooks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUserInfo } = useReduxUser();
  const { showServerErrorMsg, showServerSuccessMsg } = useAppToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ISignInFormValues>({
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(signInValidationSchema),
  });

  const { mutate: login, isPending } = useLoginMutation({
    configs: {
      onSuccess: (res) => {
        const user = res.data;
        if (!user) return;
        queryClient.clear();
        setUserInfo(user);
        showServerSuccessMsg(res, t('signInSuccess'));
        reset();
        navigate(getDefaultRouteByRole(user.role), { replace: true });
      },
      onError: (err) => showServerErrorMsg(err),
    },
  });

  const onSubmit = handleSubmit((values) => login({ body: values }));
  return { t, control, errors, isValid, isPending, onSubmit };
};
