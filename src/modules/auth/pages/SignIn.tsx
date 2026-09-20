import { Controller, FieldError } from 'react-hook-form';
import { useSignInHooks } from '../hooks';
import { FooterText, ForgotLink, Form, Subtitle, Title } from '../styled';
import { AppButton, AppInput } from '@/components';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export const SignIn = () => {
  const { t, control, errors, isPending, onSubmit } = useSignInHooks();
  const errMsg = (e?: FieldError) => (e?.message ? t(e.message) : undefined);

  return (
    <>
      <Title>{t('welcomeBack')}</Title>
      <Subtitle>{t('signInToContinue')}</Subtitle>
      <Form onSubmit={onSubmit} noValidate>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              required
              type="email"
              label={t('emailAddress')}
              placeholder={t('enterYourEmail')}
              onBlur={(e) => {
                field.onBlur();
                field.onChange(e.target.value.trim());
              }}
              errors={errMsg(errors.email)}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              required
              type="password"
              label={t('password')}
              placeholder={t('enterYourPassword')}
              errors={errMsg(errors.password)}
            />
          )}
        />
        <ForgotLink as={Link} to={ROUTES.FORGOT_PASSWORD}>
          {t('forgotPassword')}
        </ForgotLink>
        <AppButton type="submit" text={t('signIn')} loading={isPending} />
      </Form>
      <FooterText>
        {t('dontHaveAccount')} <Link to={ROUTES.SIGN_UP}>{t('signUp')}</Link>
      </FooterText>
    </>
  );
};
