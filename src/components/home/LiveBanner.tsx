import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useTeamName } from '@/hooks/useTeamName';
import { useRTL } from '@/hooks/useRTL';
import { useTeamNavigation } from '@/hooks/useTeamNavigation';
import { matchClockLabel } from '@/utils/matchClock';
import type { Match } from '@/types/match';

interface LiveBannerProps {
  matches: Match[];
}

function LiveMatchRow({ match }: { match: Match }) {
  const { t } = useTranslation();
  const { isRTL, rowDir } = useRTL();
  const goToTeam = useTeamNavigation();
  const homeName = useTeamName(match.homeTeam.name);
  const awayName = useTeamName(match.awayTeam.name);

  const elapsedLabel =
    match.status === 'HT' ? t('match.htShort') : matchClockLabel(match);

  // In RTL: away team renders on the left, home team on the right
  const left = isRTL
    ? { id: match.awayTeam.id, logo: match.awayTeam.logoUrl, name: awayName }
    : { id: match.homeTeam.id, logo: match.homeTeam.logoUrl, name: homeName };
  const right = isRTL
    ? { id: match.homeTeam.id, logo: match.homeTeam.logoUrl, name: homeName }
    : { id: match.awayTeam.id, logo: match.awayTeam.logoUrl, name: awayName };

  return (
    <Pressable
      style={({ pressed }) => [styles.matchRow, { flexDirection: rowDir }, pressed && { opacity: 0.8 }]}
      onPress={() => router.push(`/match/${match.id}`)}
    >
      <View style={[styles.teamInfo, { flexDirection: rowDir }]}>
        <Pressable onPress={() => goToTeam(left.id)}>
          <Image source={{ uri: left.logo }} style={styles.crest} resizeMode="contain" />
        </Pressable>
        <Text style={[styles.teamName, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
          {left.name}
        </Text>
      </View>

      <View style={styles.scoreBlock}>
        <Text style={styles.score}>
          {match.score.home ?? 0} – {match.score.away ?? 0}
        </Text>
        <Text style={styles.elapsed}>{elapsedLabel}</Text>
      </View>

      <View style={[styles.teamInfo, styles.teamInfoRight, { flexDirection: rowDir }]}>
        <Text style={[styles.teamName, { textAlign: isRTL ? 'left' : 'right' }]} numberOfLines={1}>
          {right.name}
        </Text>
        <Pressable onPress={() => goToTeam(right.id)}>
          <Image source={{ uri: right.logo }} style={styles.crest} resizeMode="contain" />
        </Pressable>
      </View>
    </Pressable>
  );
}

export function LiveBanner({ matches }: LiveBannerProps) {
  const { t } = useTranslation();
  const { isRTL, rowDir } = useRTL();

  if (matches.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, { flexDirection: rowDir }]}>
        <View style={styles.liveDot} />
        <Text style={styles.liveLabel}>{t('home.liveNow')}</Text>
      </View>
      {matches.map((m) => (
        <LiveMatchRow key={m.id} match={m} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: '#1A0A0A',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.live,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.live,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  liveLabel: {
    color: colors.white,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#330D0D',
  },
  teamInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  teamInfoRight: { justifyContent: 'flex-end' },
  crest: { width: 28, height: 28 },
  teamName: {
    color: colors.white,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
    flex: 1,
  },
  scoreBlock: {
    alignItems: 'center',
    minWidth: 68,
  },
  score: {
    color: colors.white,
    fontFamily: fontFamily.display,
    fontSize: 28,
    lineHeight: 30,
  },
  elapsed: {
    color: colors.live,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
  },
});
