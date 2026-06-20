import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useTeamName } from '@/hooks/useTeamName';
import { useRTL } from '@/hooks/useRTL';
import type { Standing } from '@/types/group';

interface StandingsRowProps {
  standing: Standing;
  isLast?: boolean;
}

const COL = { pos: 24, flag: 32, pts: 32, stat: 28 };

function Stat({ value }: { value: number }) {
  return <Text style={styles.stat}>{value}</Text>;
}

export function StandingsRow({ standing, isLast }: StandingsRowProps) {
  const { team, position, played, won, drawn, lost, goalDifference, points, qualified } = standing;
  const teamName = useTeamName(team.name);
  const { rowDir, isRTL, textAlign } = useRTL();
  const qualifiedColor =
    qualified === 'direct' ? colors.win :
    qualified === 'third-place' ? colors.draw : undefined;

  return (
    <Pressable
      onPress={() => router.push(`/team/${team.id}`)}
      style={[styles.row, { flexDirection: rowDir }, !isLast && styles.border]}
    >
      <View style={[styles.posBar, qualifiedColor ? { backgroundColor: qualifiedColor } : null]} />
      <Text style={styles.pos}>{position}</Text>
      {team.logoUrl ? (
        <Image source={{ uri: team.logoUrl }} style={styles.logo} resizeMode="contain" />
      ) : <View style={styles.logo} />}
      <View style={[styles.nameRow, { flexDirection: isRTL ? 'row-reverse' : 'row', marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
        <Text
          style={[styles.name, { textAlign }]}
          numberOfLines={1}
        >{teamName}</Text>
      </View>
      <Stat value={played} />
      <Stat value={won} />
      <Stat value={drawn} />
      <Stat value={lost} />
      <Stat value={goalDifference} />
      <Text style={[styles.stat, styles.pts]}>{points}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
    gap: 4,
    minHeight: 44,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  logo: { width: 20, height: 20, flexShrink: 0 },
  posBar: {
    width: 3,
    height: 28,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginRight: 4,
  },
  pos: {
    width: COL.pos,
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
    textAlign: 'center',
  },
  nameRow: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  name: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  stat: {
    width: COL.stat,
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
    textAlign: 'center',
  },
  pts: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
  },
});
