import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';

export function BracketLockScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="lock-closed" size={48} color={colors.gold} style={styles.icon} />
        <Text style={styles.title}>{t('bracket.lockedTitle')}</Text>
        <Text style={styles.message}>{t('bracket.lockedMessage')}</Text>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color={colors.gold} />
          <Text style={styles.dateText}>{t('bracket.lockedDate')}</Text>
        </View>
      </View>

      <View style={styles.preview}>
        {['bracket.roundOf32', 'bracket.roundOf16', 'bracket.quarterFinals', 'bracket.semiFinals', 'bracket.final'].map((key, i) => (
          <View key={key} style={[styles.previewRound, i === 2 && styles.previewCenter]}>
            <Text style={styles.previewLabel}>{t(key)}</Text>
            {Array.from({ length: i === 2 ? 1 : i === 0 ? 4 : i === 1 ? 2 : 1 }).map((_, j) => (
              <View key={j} style={styles.previewSlot} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: 340,
  },
  icon: { marginBottom: spacing.sm },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.display,
    fontSize: 28,
    letterSpacing: 1,
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gold,
    marginTop: spacing.sm,
  },
  dateText: {
    color: colors.gold,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    opacity: 0.3,
  },
  previewRound: {
    alignItems: 'center',
    gap: 6,
  },
  previewCenter: {},
  previewLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  previewSlot: {
    width: 44,
    height: 28,
    borderRadius: 4,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 4,
  },
});
