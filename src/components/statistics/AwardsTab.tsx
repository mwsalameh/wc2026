import { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { useTeamName } from '@/hooks/useTeamName';
import { useTopScorers } from '@/hooks/usePlayerStats';
import { Skeleton } from '@/components/ui/Skeleton';

function TbdCard({ title, icon }: { title: string; icon: string }) {
  const { t } = useTranslation();
  const { isRTL, textAlign } = useRTL();
  return (
    <View style={[styles.awardCard, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
      <Text style={styles.awardIcon}>{icon}</Text>
      <Text style={[styles.awardTitle, { textAlign }]}>{title}</Text>
      <Text style={[styles.tbdText, { textAlign }]}>{t('stats.tbdAward')}</Text>
    </View>
  );
}

function GoldenBootCard() {
  const { t } = useTranslation();
  const { rowDir, isRTL, textAlign } = useRTL();
  const { data: scorers, isLoading } = useTopScorers();
  const leader = useMemo(
    () => scorers?.filter((p) => p.goals > 0).sort((a, b) => b.goals - a.goals)[0],
    [scorers]
  );
  const teamName = useTeamName(leader?.teamName ?? '');

  return (
    <View style={[styles.awardCard, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
      <Text style={styles.awardIcon}>👟</Text>
      <Text style={[styles.awardTitle, { textAlign }]}>{t('stats.goldenBoot')}</Text>

      {isLoading ? (
        <Skeleton height={56} style={styles.leaderSkeleton} />
      ) : leader ? (
        <View style={[styles.leaderRow, { flexDirection: rowDir }]}>
          <Image source={{ uri: leader.photo }} style={styles.leaderPhoto} />
          <View style={[styles.leaderInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text style={[styles.leaderName, { textAlign }]} numberOfLines={1}>{leader.name}</Text>
            <View style={[styles.leaderTeamRow, { flexDirection: rowDir }]}>
              {leader.teamLogo ? (
                <Image source={{ uri: leader.teamLogo }} style={styles.leaderFlag} resizeMode="contain" />
              ) : null}
              <Text style={[styles.leaderTeam, { textAlign }]}>{teamName}</Text>
            </View>
          </View>
          <View style={styles.leaderValueBox}>
            <Text style={styles.leaderValue}>{leader.goals}</Text>
            <Text style={styles.leaderValueLabel}>{t('stats.goals')}</Text>
          </View>
        </View>
      ) : (
        <Text style={[styles.tbdText, { textAlign }]}>{t('stats.noData')}</Text>
      )}
    </View>
  );
}

export function AwardsTab() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <GoldenBootCard />
      <TbdCard title={t('stats.goldenBall')} icon="⚽" />
      <TbdCard title={t('stats.goldenGlove')} icon="🧤" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  awardCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  awardIcon: {
    fontSize: 28,
  },
  awardTitle: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.h2,
    letterSpacing: 0.5,
  },
  tbdText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    marginTop: spacing.xs,
  },
  leaderSkeleton: {
    marginTop: spacing.xs,
    width: '100%',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
  },
  leaderPhoto: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  leaderInfo: {
    flex: 1,
    gap: 3,
  },
  leaderName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
  },
  leaderTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderFlag: {
    width: 16,
    height: 16,
  },
  leaderTeam: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
  leaderValueBox: {
    alignItems: 'center',
  },
  leaderValue: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 28,
    lineHeight: 32,
  },
  leaderValueLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
  },
});
