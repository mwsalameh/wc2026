import { useLanguageStore } from '@/store/languageStore';
import { getTeamNameAr } from '@/constants/teamNamesAr';

export function useTeamName(englishName: string): string {
  const { language } = useLanguageStore();
  if (language === 'ar') return getTeamNameAr(englishName);
  return englishName;
}
