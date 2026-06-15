import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { useTeamName } from '@/hooks/useTeamName';

interface Props {
  rank: number;
  teamId?: number;
  teamName: string;
  teamLogo: string;
  value: number | string;
  valueLabel: string;
  valueColor?: string;
}

const RANK_COLORS: Record<number, string> = {
  1: colors.gold,
  2: '#C0C0C0',
  3: '#CD7F32',
};

export function TeamStatRow({ rank, teamId, teamName, teamLogo, value, valueLabel, valueColor }: Props) {
  const { rowDir, textAlign } = useRTL();
  const translatedName = useTeamName(teamName);

  return (
    <View style={[styles.row, { flexDirection: rowDir }]}>
      <Text style={[styles.rank, { color: RANK_COLORS[rank] ?? colors.textMuted }]}>{rank}</Text>
      <Pressable
        onPress={teamId ? () => router.push(`/team/${teamId}` as any) : undefined}
        disabled={!teamId}
        hitSlop={8}
        style={({ pressed }) => [pressed && teamId && { opacity: 0.65 }]}
      >
        <Image source={{ uri: teamLogo }} style={styles.logo} resizeMode="contain" />
      </Pressable>
      <Text style={[styles.name, { textAlign }]} numberOfLines={1}>{translatedName}</Text>
      <View style={styles.valueBox}>
        <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
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
  logo: {
    width: 28,
    height: 28,
  },
  name: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.body,
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
