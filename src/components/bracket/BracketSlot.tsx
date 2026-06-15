import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, spacing, radius } from '@/constants/theme';
import { useBracketStore } from '@/store/bracketStore';
import { useTeamNavigation } from '@/hooks/useTeamNavigation';
import { isFavoriteTeam } from '@/constants/favoriteTeam';
import type { MatchStatus } from '@/types/match';

export interface BracketSlotData {
  homeLabel: string;
  awayLabel: string;
  homeLogo?: string;
  awayLogo?: string;
  homeId?: number;
  awayId?: number;
  homeScore?: number | null;
  awayScore?: number | null;
  matchId?: number;
  status?: MatchStatus;
  isTBD?: boolean;
  matchNumber?: number;
  showTrophy?: boolean;
}

interface BracketSlotProps {
  slot: BracketSlotData;
  width: number;
  height: number;
}

export const SLOT_H = 64;
export const SLOT_W = 130;

function MatchDivider({ matchNumber, showTrophy }: { matchNumber?: number; showTrophy?: boolean }) {
  if (showTrophy) {
    return (
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Ionicons name="trophy" size={13} color={colors.gold} />
        <View style={styles.dividerLine} />
      </View>
    );
  }
  if (matchNumber !== undefined) {
    return (
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.matchNumText}>M{matchNumber}</Text>
        <View style={styles.dividerLine} />
      </View>
    );
  }
  return <View style={styles.dividerSimple} />;
}

export function BracketSlot({ slot, width, height }: BracketSlotProps) {
  const { selectedTeamId } = useBracketStore();
  const goToTeam = useTeamNavigation();
  const isHomeHighlighted = slot.homeId != null && slot.homeId === selectedTeamId;
  const isAwayHighlighted = slot.awayId != null && slot.awayId === selectedTeamId;

  const handlePress = () => {
    if (slot.matchId) router.push(`/match/${slot.matchId}`);
  };

  const hasScore =
    slot.homeScore !== null && slot.homeScore !== undefined &&
    slot.awayScore !== null && slot.awayScore !== undefined;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { width, height },
        pressed && slot.matchId ? styles.pressed : undefined,
      ]}
    >
      <TeamLine
        label={slot.homeLabel}
        logo={slot.homeLogo}
        score={slot.homeScore}
        hasScore={hasScore}
        highlighted={isHomeHighlighted}
        onTeamPress={slot.homeId ? () => goToTeam(slot.homeId!) : undefined}
      />
      <MatchDivider matchNumber={slot.matchNumber} showTrophy={slot.showTrophy} />
      <TeamLine
        label={slot.awayLabel}
        logo={slot.awayLogo}
        score={slot.awayScore}
        hasScore={hasScore}
        highlighted={isAwayHighlighted}
        onTeamPress={slot.awayId ? () => goToTeam(slot.awayId!) : undefined}
      />
    </Pressable>
  );
}

function TeamLine({
  label, logo, score, hasScore, highlighted, onTeamPress,
}: {
  label: string;
  logo?: string;
  score?: number | null;
  hasScore: boolean;
  highlighted: boolean;
  onTeamPress?: () => void;
}) {
  const isJordan = isFavoriteTeam(label);
  return (
    <Pressable style={styles.teamLine} onPress={onTeamPress} disabled={!onTeamPress}>
      {logo ? (
        <Image source={{ uri: logo }} style={styles.logo} resizeMode="contain" />
      ) : (
        <View style={styles.logoPlaceholder} />
      )}
      <Text style={[styles.teamLabel, (highlighted || isJordan) && styles.teamLabelHighlighted]} numberOfLines={1}>
        {label}
      </Text>
      {isJordan && <Text style={styles.bracketStar}>★</Text>}
      {hasScore && (
        <Text style={[styles.score, (highlighted || isJordan) && styles.scoreHighlighted]}>
          {score ?? 0}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  teamLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    gap: 4,
    flex: 1,
  },
  logo: { width: 16, height: 16, flexShrink: 0 },
  logoPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.surfaceElevated,
    flexShrink: 0,
  },
  teamLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 10,
  },
  teamLabelHighlighted: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
  },
  score: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 11,
    minWidth: 12,
    textAlign: 'right',
  },
  scoreHighlighted: { color: colors.gold },
  bracketStar: {
    color: colors.gold,
    fontSize: 8,
    lineHeight: 12,
    flexShrink: 0,
  },

  // Dividers
  dividerSimple: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    gap: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  matchNumText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
