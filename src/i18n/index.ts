import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import ar from './ar.json';

const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
const defaultLanguage = deviceLocale === 'ar' ? 'ar' : 'en';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: defaultLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
