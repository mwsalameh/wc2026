import { useLanguageStore } from '@/store/languageStore';

export function useRTL() {
  const isRTL = useLanguageStore((s) => s.isRTL);
  return {
    isRTL,
    rowDir: (isRTL ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left',
  };
}
