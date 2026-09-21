import { ROUTES } from '@/constants';
import { useVerifyOtpHooks } from '../hooks';
import { Link, Navigate } from 'react-router-dom';
import { FooterText, Form, Subtitle, Title } from '../styled';
import { AppButton, AppInput } from '@/components';

export const VerifyOtp = () => {
  const { t, email, otp, setOtp, isPending, onSubmit, missingHash } =
    useVerifyOtpHooks();

  if (missingHash) return <Navigate to={ROUTES.SIGN_UP} replace />;

  return (
    <>
      <Title>{t('verifyOtpTitle')}</Title>
      <Subtitle>{t('verifyOtpSubtitle', { email })}</Subtitle>
      <Form onSubmit={onSubmit} noValidate>
        <AppInput
          required
          autoFocus
          label={t('otp')}
          placeholder={t('enterOtp')}
          value={otp}
          inputMode="numeric"
          onChange={(e) => setOtp(e.target.value)}
        />
        <AppButton
          type="submit"
          text={t('verify')}
          loading={isPending}
          disabled={isPending || !otp.trim()}
        />
      </Form>
      <FooterText>
        {t('alreadyHaveAccount')} <Link to={ROUTES.SIGN_IN}>{t('signIn')}</Link>
      </FooterText>
    </>
  );
};
