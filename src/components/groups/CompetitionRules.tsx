import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';

const RULE_KEYS = ['rule1', 'rule2', 'rule3', 'rule4'] as const;

export function CompetitionRules() {
  const { t } = useTranslation();
  const { textAlign, rowDir } = useRTL();

  return (
    <View style={styles.card}>
      <Text style={[styles.title, { textAlign }]}>
        {t('groups.competitionRules.title')}
      </Text>
      <Text style={[styles.description, { textAlign }]}>
        {t('groups.competitionRules.tiebreaker')}
      </Text>
      <View style={styles.rules}>
        {RULE_KEYS.map((key, i) => (
          <View key={key} style={[styles.ruleRow, { flexDirection: rowDir }]}>
            <Text style={styles.bullet}>•</Text>
            <Text style={[styles.ruleText, { textAlign }]}>
              {t(`groups.competitionRules.${key}`)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
    lineHeight: 20,
  },
  rules: {
    gap: 6,
    marginTop: 2,
  },
  ruleRow: {
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
    lineHeight: 20,
  },
  ruleText: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
    lineHeight: 20,
  },
});
