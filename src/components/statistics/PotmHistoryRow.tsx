import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { useTeamName } from '@/hooks/useTeamName';
import { getPlayerNameAr } from '@/constants/playerNamesAr';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import type { PotmHistoryEntry } from '@/types/bestPlayer';

interface Props {
  entry: PotmHistoryEntry;
}

export function PotmHistoryRow({ entry }: Props) {
  const { t } = useTranslation();
  const { isRTL, rowDir, textAlign } = useRTL();
  const playerTeamName = useTeamName(entry.teamName);
  const displayName = isRTL ? getPlayerNameAr(entry.name) : entry.name;

  const scoreText =
    entry.score.home !== null && entry.score.away !== null
      ? `${entry.score.home} – ${entry.score.away}`
      : '– –';

  const dateStr = new Date(entry.kickoffUtc).toLocaleDateString(isRTL ? 'ar' : 'en', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.row, { flexDirection: rowDir }, pressed && styles.pressed]}
      onPress={() =>
        router.push({ pathname: '/player/[id]', params: { id: entry.playerId, name: entry.name } })
      }
    >
      {/* Player info */}
      <PlayerAvatar uri={entry.photo} size={40} />
      <View style={[styles.playerInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={[styles.playerName, { textAlign }]} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={[styles.subRow, { flexDirection: rowDir }]}>
          {entry.teamLogo ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                router.push(`/team/${entry.teamId}` as any);
              }}
              hitSlop={6}
            >
              <Image source={{ uri: entry.teamLogo }} style={styles.miniLogo} resizeMode="contain" />
            </Pressable>
          ) : null}
          <Text style={[styles.teamName, { textAlign }]} numberOfLines={1}>
            {playerTeamName}
          </Text>
        </View>
      </View>

      {/* Match score — home | score | away always in that order regardless of RTL */}
      <View style={styles.matchBlock}>
        <View style={styles.scoreRow}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/team/${entry.homeTeam.id}` as any);
            }}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.viewTeam', { name: entry.homeTeam.name })}
          >
            <Image
              source={{ uri: entry.homeTeam.logoUrl }}
              style={styles.scoreLogo}
              resizeMode="contain"
            />
          </Pressable>
          <Text style={styles.scoreText}>{scoreText}</Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/team/${entry.awayTeam.id}` as any);
            }}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.viewTeam', { name: entry.awayTeam.name })}
          >
            <Image
              source={{ uri: entry.awayTeam.logoUrl }}
              style={styles.scoreLogo}
              resizeMode="contain"
            />
          </Pressable>
        </View>
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.65 },
  playerInfo: {
    flex: 1,
    gap: 2,
  },
  playerName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniLogo: {
    width: 14,
    height: 14,
  },
  teamName: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
  matchBlock: {
    alignItems: 'center',
    gap: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreLogo: {
    width: 22,
    height: 22,
  },
  scoreText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
    minWidth: 38,
    textAlign: 'center',
  },
  dateText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
