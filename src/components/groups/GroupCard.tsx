import { View, Text, Image, Pressable, StyleSheet, GestureResponderEvent } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { useTeamName } from '@/hooks/useTeamName';
import { useRTL } from '@/hooks/useRTL';
import { useTeamNavigation } from '@/hooks/useTeamNavigation';
import type { Standing } from '@/types/group';

interface GroupCardProps {
  groupId: string;
  standings: Standing[];
}

function TeamRow({ standing, pos }: { standing: Standing; pos: number }) {
  const name = useTeamName(standing.team.name);
  const { rowDir, textAlign } = useRTL();
  const goToTeam = useTeamNavigation();

  const handleLogoPress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    goToTeam(standing.team.id);
  };

  return (
    <View style={[styles.teamRow, { flexDirection: rowDir }]}>
      <Text style={styles.pos}>{pos}</Text>
      <Pressable onPress={handleLogoPress}>
        {standing.team.logoUrl ? (
          <Image source={{ uri: standing.team.logoUrl }} style={styles.logo} resizeMode="contain" />
        ) : <View style={styles.logo} />}
      </Pressable>
      <Text style={[styles.teamName, { textAlign }]} numberOfLines={1}>{name}</Text>
      <Text style={styles.pts}>{standing.points}</Text>
    </View>
  );
}

export function GroupCard({ groupId, standings }: GroupCardProps) {
  const { t } = useTranslation();
  const { textAlign } = useRTL();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/group/${groupId}`)}
    >
      <Text style={[styles.groupLabel, { textAlign }]}>{t('groups.group', { id: groupId })}</Text>
      <View style={styles.teams}>
        {standings.slice(0, 4).map((s, i) => (
          <TeamRow key={s.team.id} standing={s} pos={i + 1} />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.75 },
  groupLabel: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  teams: { gap: 6 },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 24,
  },
  logo: { width: 18, height: 18, flexShrink: 0 },
  pos: {
    width: 14,
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  teamName: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
  pts: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
    minWidth: 16,
    textAlign: 'right',
  },
});
