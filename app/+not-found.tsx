import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.message}>{t('errors.pageNotFound', 'Page not found')}</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>{t('common.goHome', 'Go home')}</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  code: {
    color: colors.textMuted,
    fontFamily: fontFamily.display,
    fontSize: 64,
  },
  message: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
  },
  link: {
    marginTop: spacing.sm,
  },
  linkText: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
  },
});
