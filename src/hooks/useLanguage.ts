import { useTranslation } from 'react-i18next';

export type AppLanguage = 'en' | 'vi';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const current = (i18n.language as AppLanguage) || 'en';

  const changeLanguage = async (lang: AppLanguage) => {
    await i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => changeLanguage(current === 'vi' ? 'en' : 'vi');

  return { current, changeLanguage, toggleLanguage };
};
