import { EUserRole } from '@/enums';
import { useRegisterHooks } from '../hooks/useRegisterHooks';
import { Controller, FieldError } from 'react-hook-form';
import {
  ErrorText,
  FieldLabel,
  FieldRow,
  FooterText,
  Form,
  RequiredMark,
  RoleCard,
  RoleGroup,
  Row,
  Subtitle,
  Title,
} from '../styled';
import { AppButton, AppInput } from '@/components';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

const ROLES = [
  { value: EUserRole.READER, label: 'roleReader' },
  { value: EUserRole.CREATOR, label: 'roleCreator' },
] as const;

export const Register = () => {
  const { t, control, errors, isPending, onSubmit } = useRegisterHooks();
  const errMsg = (e?: FieldError) => (e?.message ? t(e.message) : undefined);

  return (
    <>
      <Title>{t('createAccount')}</Title>
      <Subtitle>{t('registerSubtitle')}</Subtitle>
      <Form onSubmit={onSubmit} noValidate>
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              required
              label={t('username')}
              placeholder={t('enterUsername')}
              errors={errMsg(errors.username)}
            />
          )}
        />
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
        <Row>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <AppInput
                {...field}
                value={field.value ?? ''}
                label={t('firstName')}
                placeholder={t('enterFirstName')}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <AppInput
                {...field}
                value={field.value ?? ''}
                label={t('lastName')}
                placeholder={t('enterLastName')}
              />
            )}
          />
        </Row>
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
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              required
              type="password"
              label={t('confirmPassword')}
              placeholder={t('enterYourPassword')}
              errors={errMsg(errors.confirmPassword)}
            />
          )}
        />
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FieldRow>
              <FieldLabel>
                {t('accountType')}
                <RequiredMark>*</RequiredMark>
              </FieldLabel>
              <RoleGroup>
                {ROLES.map((role) => (
                  <RoleCard
                    key={role.value}
                    $active={field.value === role.value}
                  >
                    <input
                      type="radio"
                      value={role.value}
                      checked={field.value === role.value}
                      onChange={() => field.onChange(role.value)}
                    />
                    {t(role.label)}
                  </RoleCard>
                ))}
              </RoleGroup>
              {errors.role && <ErrorText>{errMsg(errors.role)}</ErrorText>}
            </FieldRow>
          )}
        />
        <AppButton type="submit" text={t('signUp')} loading={isPending} />
      </Form>
      <FooterText>
        {t('alreadyHaveAccount')} <Link to={ROUTES.SIGN_IN}>{t('signIn')}</Link>
      </FooterText>
    </>
  );
};
