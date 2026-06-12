import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';

interface ErrorBannerProps {
  onRetry?: () => void;
  message?: string;
}

export function ErrorBanner({ onRetry, message }: ErrorBannerProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message ?? t('errors.loadFailed')}</Text>
      {onRetry && (
        <Pressable style={styles.btn} onPress={onRetry}>
          <Text style={styles.btnText}>{t('errors.retry')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  message: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  btn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  btnText: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
  },
});
