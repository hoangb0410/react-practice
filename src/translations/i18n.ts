import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { TRANSLATIONS_EN } from './en';
import { TRANSLATIONS_VI } from './vi';

const stored = localStorage.getItem('i18nextLng');
export const DEFAULT_LANGUAGE = stored || import.meta.env.VITE_LANGUAGE || 'en';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: TRANSLATIONS_EN },
      vi: { translation: TRANSLATIONS_VI },
    },
    fallbackLng: 'en',
    lng: DEFAULT_LANGUAGE,
    supportedLngs: ['en', 'vi'],
    interpolation: { escapeValue: false },
  });

document.documentElement.lang = i18n.language;

export default i18n;
