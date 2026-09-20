import { useReduxUser } from '@/redux';
import { useTranslation } from 'react-i18next';

export const Home = () => {
  const { t } = useTranslation();
  const { user } = useReduxUser();

  return (
    <h2>
      {user
        ? `${t('WelcomeBack')}, ${user.username ?? user.email}`
        : t('appName')}
    </h2>
  );
};
