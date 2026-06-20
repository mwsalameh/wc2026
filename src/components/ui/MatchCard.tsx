import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { formatMatchTime, formatMatchDate } from '@/utils/dateTime';
import { useTeamName } from '@/hooks/useTeamName';
import { useLanguageStore } from '@/store/languageStore';
import { useRTL } from '@/hooks/useRTL';
import { useTeamNavigation } from '@/hooks/useTeamNavigation';
import { matchClockLabel } from '@/utils/matchClock';
import type { Match } from '@/types/match';

interface MatchCardProps {
  match: Match;
}

function StatusBadge({ match }: { match: Match }) {
  const { t } = useTranslation();
  const isLive = match.status === 'LIVE' || match.status === 'HT';

  if (isLive) {
    return (
      <View style={styles.liveBadge}>
        <Text style={styles.liveText}>
          {match.status === 'HT' ? t('match.halfTimeLive') : matchClockLabel(match)}
        </Text>
      </View>
    );
  }
  if (match.status === 'FT') return <Text style={styles.ftText}>{t('match.fullTime')}</Text>;
  if (match.status === 'AET') return <Text style={styles.ftText}>{t('match.afterET')}</Text>;
  if (match.status === 'PEN') return <Text style={styles.ftText}>{t('match.afterPens')}</Text>;
  if (match.status === 'PST') return <Text style={styles.ftText}>{t('match.postponed')}</Text>;
  if (match.status === 'CANC') return <Text style={styles.ftText}>{t('match.cancelled')}</Text>;
  return <Text style={styles.timeText}>{formatMatchTime(match.kickoffUtc)}</Text>;
}

export function MatchCard({ match }: MatchCardProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { isRTL } = useRTL();
  const goToTeam = useTeamNavigation();
  const hasScore = match.score.home !== null && match.score.away !== null;
  const homeName = useTeamName(match.homeTeam.name);
  const awayName = useTeamName(match.awayTeam.name);
  const dateLabels = { today: t('common.today'), tomorrow: t('common.tomorrow'), yesterday: t('common.yesterday'), language };

  // In RTL: away team is displayed on the left, home on the right
  const left = isRTL
    ? { id: match.awayTeam.id, logo: match.awayTeam.logoUrl, name: awayName, score: match.score.away }
    : { id: match.homeTeam.id, logo: match.homeTeam.logoUrl, name: homeName, score: match.score.home };
  const right = isRTL
    ? { id: match.homeTeam.id, logo: match.homeTeam.logoUrl, name: homeName, score: match.score.home }
    : { id: match.awayTeam.id, logo: match.awayTeam.logoUrl, name: awayName, score: match.score.away };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/match/${match.id}`)}
    >
      <View style={styles.team}>
        <Pressable
          onPress={() => goToTeam(left.id)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.viewTeam', { name: left.name })}
        >
          {left.logo ? (
            <Image source={{ uri: left.logo }} style={styles.crest} resizeMode="contain" />
          ) : <View style={styles.crest} />}
        </Pressable>
        <Text style={styles.teamName} numberOfLines={1}>{left.name}</Text>
      </View>

      <View style={styles.center}>
        {hasScore ? (
          <View style={styles.scoreRow}>
            <Text style={styles.score}>{left.score}</Text>
            <Text style={styles.scoreSep}>–</Text>
            <Text style={styles.score}>{right.score}</Text>
          </View>
        ) : null}
        <StatusBadge match={match} />
        {match.status === 'NS' && (
          <Text style={styles.dateText}>{formatMatchDate(match.kickoffUtc, dateLabels)}</Text>
        )}
      </View>

      <View style={[styles.team, styles.teamRight]}>
        <Text style={[styles.teamName, styles.teamNameRight]} numberOfLines={1}>{right.name}</Text>
        <Pressable
          onPress={() => goToTeam(right.id)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.viewTeam', { name: right.name })}
        >
          {right.logo ? (
            <Image source={{ uri: right.logo }} style={styles.crest} resizeMode="contain" />
          ) : <View style={styles.crest} />}
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 64,
  },
  pressed: { opacity: 0.75 },
  crest: { width: 28, height: 28, flexShrink: 0 },
  team: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  teamRight: { justifyContent: 'flex-end' },
  teamName: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  teamNameRight: {
    textAlign: 'right',
  },
  center: {
    alignItems: 'center',
    minWidth: 72,
    gap: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  score: {
    color: colors.white,
    fontFamily: fontFamily.display,
    fontSize: 28,
    lineHeight: 32,
  },
  scoreSep: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
  },
  liveBadge: {
    backgroundColor: colors.live,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveText: {
    color: colors.white,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
  },
  ftText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  timeText: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
  },
  dateText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
  },
});
