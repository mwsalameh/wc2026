import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useMatchStats } from '@/hooks/useMatchStats';
import { useBestPlayer } from '@/hooks/useBestPlayer';
import { useRTL } from '@/hooks/useRTL';
import { useTeamName } from '@/hooks/useTeamName';
import { getPlayerNameAr } from '@/constants/playerNamesAr';
import type { Match } from '@/types/match';

interface MatchStatsProps {
  match: Match;
}

interface StatBarProps {
  label: string;
  home: number;
  away: number;
  isPossession?: boolean;
  isRTL: boolean;
}

function StatBar({ label, home, away, isPossession = false, isRTL }: StatBarProps) {
  const total = isPossession ? 100 : home + away || 1;
  const homeRatio = home / total;
  const awayRatio = away / total;

  // In RTL the home team is on the right, so values and bar fill flip
  const leftVal = isRTL ? away : home;
  const rightVal = isRTL ? home : away;
  const leftLabel = isPossession ? `${leftVal}%` : String(leftVal);
  const rightLabel = isPossession ? `${rightVal}%` : String(rightVal);

  return (
    <View style={styles.statRow}>
      <Text style={[styles.statValue, styles.statValueLeft]}>{leftLabel}</Text>
      <View style={styles.barContainer}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.bar}>
          {isRTL ? (
            <>
              <View style={[styles.barFill, styles.barFillAway, { flex: awayRatio }]} />
              <View style={[styles.barFill, styles.barFillHome, { flex: homeRatio }]} />
            </>
          ) : (
            <>
              <View style={[styles.barFill, styles.barFillHome, { flex: homeRatio }]} />
              <View style={[styles.barFill, styles.barFillAway, { flex: awayRatio }]} />
            </>
          )}
        </View>
      </View>
      <Text style={[styles.statValue, styles.statValueRight]}>{rightLabel}</Text>
    </View>
  );
}

function PotmCard({ match }: { match: Match }) {
  const { t } = useTranslation();
  const { isRTL, textAlign } = useRTL();
  const isCompleted = ['FT', 'AET', 'PEN'].includes(match.status);
  const { data: best, isLoading } = useBestPlayer(match.id, isCompleted);
  const teamName = useTeamName(best?.teamName ?? '');

  if (!isCompleted) return null;
  if (isLoading) return <ActivityIndicator color={colors.gold} style={{ margin: spacing.lg }} />;
  if (!best) return null;

  const displayName = isRTL ? getPlayerNameAr(best.name) : best.name;

  return (
    <Pressable
      style={({ pressed }) => [potmStyles.card, pressed && { opacity: 0.75 }]}
      onPress={() => router.push({ pathname: '/player/[id]', params: { id: best.playerId, name: best.name } })}
    >
      <Text style={[potmStyles.label, { textAlign }]}>{t('match.playerOfMatch')}</Text>
      <PlayerAvatar uri={best.photo} size={100} />
      <Text style={[potmStyles.name, { textAlign: 'center' }]} numberOfLines={2}>{displayName}</Text>
      <View style={potmStyles.teamRow}>
        <Image source={{ uri: best.teamLogo }} style={potmStyles.teamLogo} resizeMode="contain" />
        <Text style={potmStyles.teamName} numberOfLines={1}>{teamName}</Text>
      </View>
      {best.isOfficial
        ? <Text style={potmStyles.officialBadge}>{t('match.officialAward')}</Text>
        : <Text style={potmStyles.rating}>★ {best.rating.toFixed(1)}</Text>
      }
    </Pressable>
  );
}

export function MatchStats({ match }: MatchStatsProps) {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const { data: stats, isLoading } = useMatchStats(match);

  const isNotStarted = match.status === 'NS' || match.status === 'PST' || match.status === 'CANC';

  if (isNotStarted) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>{t('match.statsNotAvailable')}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>{t('match.statsNotAvailable')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PotmCard match={match} />
      <View style={styles.card}>
        <StatBar
          label={t('match.possession')}
          home={stats.possession.home}
          away={stats.possession.away}
          isPossession
          isRTL={isRTL}
        />
        <StatBar label={t('match.shots')} home={stats.shots.home} away={stats.shots.away} isRTL={isRTL} />
        <StatBar
          label={t('match.shotsOnTarget')}
          home={stats.shotsOnTarget.home}
          away={stats.shotsOnTarget.away}
          isRTL={isRTL}
        />
        <StatBar label={t('match.corners')} home={stats.corners.home} away={stats.corners.away} isRTL={isRTL} />
        <StatBar label={t('match.fouls')} home={stats.fouls.home} away={stats.fouls.away} isRTL={isRTL} />
        <StatBar
          label={t('match.yellowCards')}
          home={stats.yellowCards.home}
          away={stats.yellowCards.away}
          isRTL={isRTL}
        />
        {(stats.redCards.home > 0 || stats.redCards.away > 0) && (
          <StatBar
            label={t('match.redCards')}
            home={stats.redCards.home}
            away={stats.redCards.away}
            isRTL={isRTL}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statValue: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
    minWidth: 36,
  },
  statValueLeft: { textAlign: 'left' },
  statValueRight: { textAlign: 'right' },
  barContainer: {
    flex: 1,
    gap: 4,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  bar: {
    height: 6,
    borderRadius: radius.full,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  barFill: {
    height: 6,
  },
  barFillHome: {
    backgroundColor: colors.gold,
    borderRadius: radius.full,
  },
  barFillAway: {
    backgroundColor: colors.textMuted,
    borderRadius: radius.full,
  },
  placeholder: {
    flex: 1,
    paddingVertical: spacing.xxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  placeholderText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    textAlign: 'center',
    lineHeight: 24,
  },
});

const potmStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    width: '100%',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceElevated,
    marginTop: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: fontFamily.display,
    fontSize: fontSize.title,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  teamLogo: { width: 20, height: 20 },
  teamName: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  rating: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
    marginTop: spacing.xs,
  },
  officialBadge: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
