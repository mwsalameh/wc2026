import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/store/languageStore';
import { useRTL } from '@/hooks/useRTL';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';

export function LangButton() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  return (
    <Pressable
      onPress={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      style={styles.langBtn}
      hitSlop={12}
    >
      <Text style={styles.langText}>{t('language')}</Text>
    </Pressable>
  );
}

interface ScreenHeaderProps {
  title: string;
}

export function ScreenHeader({ title }: ScreenHeaderProps) {
  const { rowDir } = useRTL();

  return (
    <View style={[styles.container, { flexDirection: rowDir }]}>
      <Text style={styles.title}>{title}</Text>
      <LangButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.gold,
    fontFamily: fontFamily.display,
    fontSize: fontSize.score,
    letterSpacing: 1,
  },
  langBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
});
