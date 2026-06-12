import { create } from 'zustand';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

type Language = 'en' | 'ar';
const STORAGE_KEY = '@wc2026_language';

interface LanguageStore {
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: (i18n.language as Language) ?? 'en',
  isRTL: I18nManager.isRTL,

  setLanguage: (lang) => {
    const rtl = lang === 'ar';
    AsyncStorage.setItem(STORAGE_KEY, lang);
    i18n.changeLanguage(lang);
    // Set flag so next cold-start launches in the right direction
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    set({ language: lang, isRTL: rtl });
  },
}));

// Call this once from _layout.tsx before the app renders
export async function applyPersistedLanguage(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY) as Language | null;
    const lang: Language = stored ?? 'en';
    const rtl = lang === 'ar';
    i18n.changeLanguage(lang);
    if (I18nManager.isRTL !== rtl) {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    }
  } catch { /* ignore */ }
}
