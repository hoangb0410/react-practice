import { ROUTES } from '@/constants';
import { EUserRole } from '@/enums';
import { useAppToast } from '@/hooks';
import { IRegisterFormValues } from '@/interfaces';
import { useRegisterMutation } from '@/react-query';
import { registerValidationSchema } from '@/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const useRegisterHooks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showServerErrorMsg, showServerSuccessMsg } = useAppToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IRegisterFormValues>({
    mode: 'onTouched',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: EUserRole.READER,
      firstName: '',
      lastName: '',
    },
    resolver: zodResolver(registerValidationSchema),
  });

  const { mutate: register, isPending } = useRegisterMutation({
    configs: {
      onSuccess: (res, variables) => {
        const hash = res.data?.hash;
        if (!hash) return;
        showServerSuccessMsg(res, t('otpSentToEmail'));
        navigate(ROUTES.VERIFY_OTP, {
          state: { hash, email: variables.body.email },
        });
      },
      onError: (err) => showServerErrorMsg(err),
    },
  });

  const onSubmit = handleSubmit((values) =>
    register({
      body: {
        ...values,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
      },
    })
  );
  return { t, control, errors, isValid, isPending, onSubmit };
};
