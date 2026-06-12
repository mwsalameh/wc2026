import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useTeamName } from '@/hooks/useTeamName';
import { useRTL } from '@/hooks/useRTL';
import { useTeamNavigation } from '@/hooks/useTeamNavigation';
import { matchClockLabel } from '@/utils/matchClock';
import type { Match } from '@/types/match';

interface MatchHeaderProps {
  match: Match;
}

function TeamCrest({ teamId, logoUrl, name, align }: { teamId: number; logoUrl: string; name: string; align: 'left' | 'right' }) {
  const goToTeam = useTeamNavigation();
  return (
    <Pressable
      style={({ pressed }) => [styles.teamCol, { alignItems: align === 'left' ? 'flex-start' : 'flex-end', opacity: pressed ? 0.75 : 1 }]}
      onPress={() => goToTeam(teamId)}
    >
      <Image source={{ uri: logoUrl }} style={styles.crest} resizeMode="contain" />
      <Text style={[styles.teamName, { textAlign: align }]} numberOfLines={2}>{name}</Text>
    </Pressable>
  );
}

function ScoreCenter({ match }: { match: Match }) {
  const { t } = useTranslation();
  const { score, status, elapsed } = match;
  const hasScore = score.home !== null && score.away !== null;
  const isLive = status === 'LIVE' || status === 'HT';

  const statusLabel = () => {
    if (status === 'HT') return t('match.halfTime');
    if (status === 'FT') return t('match.fullTime');
    if (status === 'AET') return t('match.afterET');
    if (status === 'PEN') return t('match.afterPens');
    if (status === 'NS') return t('match.notStarted');
    if (isLive) return matchClockLabel(match);
    return '';
  };

  return (
    <View style={styles.scoreCol}>
      {hasScore ? (
        <Text style={styles.score}>
          {score.home} – {score.away}
        </Text>
      ) : (
        <Text style={styles.vs}>VS</Text>
      )}
      <View style={[styles.statusBadge, isLive && styles.liveBadge]}>
        <Text style={[styles.statusText, isLive && styles.liveText]}>
          {statusLabel()}
        </Text>
      </View>
      {score.homePens !== null && score.homePens !== undefined && (
        <Text style={styles.pens}>
          ({score.homePens} – {score.awayPens})
        </Text>
      )}
    </View>
  );
}

export function MatchHeader({ match }: MatchHeaderProps) {
  const { isRTL } = useRTL();
  const homeName = useTeamName(match.homeTeam.name);
  const awayName = useTeamName(match.awayTeam.name);

  // In RTL, home team is on the right (Arabic reading order: right = first)
  const leftTeam = isRTL
    ? { id: match.awayTeam.id, logo: match.awayTeam.logoUrl, name: awayName, align: 'left' as const }
    : { id: match.homeTeam.id, logo: match.homeTeam.logoUrl, name: homeName, align: 'left' as const };
  const rightTeam = isRTL
    ? { id: match.homeTeam.id, logo: match.homeTeam.logoUrl, name: homeName, align: 'right' as const }
    : { id: match.awayTeam.id, logo: match.awayTeam.logoUrl, name: awayName, align: 'right' as const };

  return (
    <View style={styles.container}>
      <Text style={styles.round}>{match.round}</Text>
      <View style={styles.teamsRow}>
        <TeamCrest teamId={leftTeam.id} logoUrl={leftTeam.logo} name={leftTeam.name} align={leftTeam.align} />
        <ScoreCenter match={match} />
        <TeamCrest teamId={rightTeam.id} logoUrl={rightTeam.logo} name={rightTeam.name} align={rightTeam.align} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  round: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  teamCol: {
    flex: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  crest: { width: 64, height: 64 },
  teamName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
    lineHeight: 18,
  },
  scoreCol: {
    alignItems: 'center',
    minWidth: 100,
    gap: spacing.xs,
  },
  score: {
    color: colors.white,
    fontFamily: fontFamily.display,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: 1,
  },
  vs: {
    color: colors.textMuted,
    fontFamily: fontFamily.display,
    fontSize: 32,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
  },
  liveBadge: { backgroundColor: colors.live },
  statusText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
  },
  liveText: { color: colors.white },
  pens: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
});
