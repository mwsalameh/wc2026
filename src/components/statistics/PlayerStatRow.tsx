import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { useTeamName } from '@/hooks/useTeamName';
import { getPlayerNameAr } from '@/constants/playerNamesAr';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';

interface Props {
  rank: number;
  name: string;
  photo: string;
  teamName: string;
  teamLogo: string;
  value: number;
  valueLabel: string;
  sub?: string;
  valueColor?: string;
}

const RANK_COLORS: Record<number, string> = {
  1: colors.gold,
  2: '#C0C0C0',
  3: '#CD7F32',
};

export function PlayerStatRow({ rank, name, photo, teamName, teamLogo, value, valueLabel, sub, valueColor }: Props) {
  const { rowDir, isRTL, textAlign } = useRTL();
  const translatedTeam = useTeamName(teamName);
  const displayName = isRTL ? getPlayerNameAr(name) : name;

  return (
    <View style={[styles.row, { flexDirection: rowDir }]}>
      <Text style={[styles.rank, { color: RANK_COLORS[rank] ?? colors.textMuted }]}>{rank}</Text>

      <PlayerAvatar uri={photo} size={40} />

      <View style={[styles.info, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={[styles.name, { textAlign }]} numberOfLines={1}>{displayName}</Text>
        <View style={[styles.teamRow, { flexDirection: rowDir }]}>
          {teamLogo ? (
            <Image source={{ uri: teamLogo }} style={styles.teamLogo} resizeMode="contain" />
          ) : null}
          <Text style={[styles.teamName, { textAlign }]} numberOfLines={1}>{translatedTeam}</Text>
        </View>
        {sub ? <Text style={[styles.sub, { textAlign }]}>{sub}</Text> : null}
      </View>

      <View style={[styles.valueBox, { alignItems: 'center' }]}>
        <Text style={[styles.value, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
        <Text style={styles.valueLabel}>{valueLabel}</Text>
      </View>
    </View>
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
  rank: {
    width: 22,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  photo: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamLogo: {
    width: 16,
    height: 16,
  },
  teamName: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
  sub: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    marginTop: 1,
  },
  valueBox: {
    minWidth: 44,
    alignItems: 'center',
  },
  value: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 20,
    lineHeight: 24,
  },
  valueLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
  },
});
