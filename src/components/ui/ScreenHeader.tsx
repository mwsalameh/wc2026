import { View, Text, StyleSheet, Pressable, I18nManager } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
      accessibilityRole="button"
      accessibilityLabel={t('a11y.switchLanguage')}
    >
      <Text style={styles.langText}>{t('language')}</Text>
    </Pressable>
  );
}

export function HomeButton() {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => router.navigate('/')}
      hitSlop={12}
      style={styles.homeBtn}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.home')}
    >
      <Ionicons name="home-outline" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showInfo?: boolean;
  showLang?: boolean;
  onTitleLongPress?: () => void;
}

export function ScreenHeader({ title, subtitle, showInfo, showLang, onTitleLongPress }: ScreenHeaderProps) {
  const { t } = useTranslation();
  const { isRTL, rowDir } = useRTL();

  // Info should sit on the outer edge (away from title).
  // On an RTL device flexDirection:'row' renders right-to-left, so the first JSX
  // child lands on the right. We XOR app-language RTL with device RTL to determine
  // whether Info needs to be rendered first or second in the JSX so it always
  // ends up on the outer (screen-edge) side of the lang/home button.
  const infoFirst = isRTL !== I18nManager.isRTL;

  const infoBtn = showInfo ? (
    <Pressable
      onPress={() => router.push('/info')}
      hitSlop={12}
      style={styles.infoBtn}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.info')}
    >
      <Ionicons name="information-circle-outline" size={22} color={colors.textMuted} />
    </Pressable>
  ) : null;

  return (
    <View style={[styles.container, { flexDirection: rowDir }]}>
      <Pressable
        onPress={() => router.navigate('/')}
        onLongPress={onTitleLongPress}
        hitSlop={8}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </Pressable>
      <View style={styles.actions}>
        {infoFirst && infoBtn}
        {showLang ? <LangButton /> : <HomeButton />}
        {!infoFirst && infoBtn}
      </View>
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
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
    letterSpacing: 0.5,
    marginTop: -2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoBtn: {
    padding: 2,
  },
  homeBtn: {
    padding: 2,
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
