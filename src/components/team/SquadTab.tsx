import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { getPlayerNameAr } from '@/constants/playerNamesAr';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import type { SquadPlayer } from '@/hooks/useSquad';
import type { TeamCoach } from '@/hooks/useCoach';

const POSITION_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

function positionLabel(pos: string, t: (k: string) => string): string {
  switch (pos) {
    case 'Goalkeeper': return t('teams.goalkeepers');
    case 'Defender':   return t('teams.defenders');
    case 'Midfielder': return t('teams.midfielders');
    case 'Attacker':   return t('teams.forwards');
    default:           return pos;
  }
}

// ── Coach card ────────────────────────────────────────────────────────────────

function CoachCard({ coach, isRTL, rowDir, textAlign }: {
  coach: TeamCoach;
  isRTL: boolean;
  rowDir: 'row' | 'row-reverse';
  textAlign: 'left' | 'right';
}) {
  const { t } = useTranslation();
const displayName = isRTL ? getPlayerNameAr(coach.name) : coach.name;

  return (
    <View style={styles.group}>
      <View style={[styles.groupHeader, { flexDirection: rowDir }]}>
        <Text style={[styles.groupTitle, { textAlign }]}>
          {t('teams.headCoach')}
        </Text>
      </View>
      <View style={styles.playerList}>
        <View style={[styles.playerRow, styles.playerRowLast, { flexDirection: rowDir }]}>
          <View style={styles.photoWrap}>
            <PlayerAvatar uri={coach.photo} size={40} />
          </View>
          {/* Empty number slot to align with player rows */}
          <View style={styles.numberWrap} />
          <Text style={[styles.playerName, styles.coachName, { textAlign, flex: 1 }]} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Player row ────────────────────────────────────────────────────────────────

function PlayerRow({
  player, isRTL, rowDir, textAlign, isLast,
}: {
  player: SquadPlayer;
  isRTL: boolean;
  rowDir: 'row' | 'row-reverse';
  textAlign: 'left' | 'right';
  isLast: boolean;
}) {
  const displayName = isRTL ? getPlayerNameAr(player.name) : player.name;

  return (
    <View style={[styles.playerRow, { flexDirection: rowDir }, isLast && styles.playerRowLast]}>
      <View style={styles.photoWrap}>
        <PlayerAvatar uri={player.photo} size={40} />
      </View>
      <View style={styles.numberWrap}>
        <Text style={styles.numberText}>{player.number ?? '—'}</Text>
      </View>
      <Text style={[styles.playerName, { textAlign, flex: 1 }]} numberOfLines={1}>
        {displayName}
      </Text>
    </View>
  );
}

// ── SquadTab ──────────────────────────────────────────────────────────────────

interface SquadTabProps {
  players: SquadPlayer[];
  isLoading: boolean;
  coach: TeamCoach | null | undefined;
  coachLoading: boolean;
}

export function SquadTab({ players, isLoading, coach, coachLoading }: SquadTabProps) {
  const { t } = useTranslation();
  const { isRTL, rowDir, textAlign } = useRTL();

  if (isLoading || coachLoading) {
    return (
      <View style={styles.skeletons}>
        {[...Array(10)].map((_, i) => <Skeleton key={i} height={52} />)}
      </View>
    );
  }

  if (players.length === 0) {
    return <Text style={styles.empty}>{t('teams.squadEmpty')}</Text>;
  }

  const grouped = POSITION_ORDER
    .map((pos) => ({
      position: pos,
      players: players
        .filter((p) => p.position === pos)
        .sort((a, b) => (a.number ?? 99) - (b.number ?? 99)),
    }))
    .filter((g) => g.players.length > 0);

  return (
    <View style={styles.container}>
      {/* Head coach at the top */}
      {coach && (
        <CoachCard
          coach={coach}
          isRTL={isRTL}
          rowDir={rowDir}
          textAlign={textAlign}
        />
      )}

      {/* Players grouped by position */}
      {grouped.map(({ position, players: posPlayers }) => (
        <View key={position} style={styles.group}>
          <View style={[styles.groupHeader, { flexDirection: rowDir }]}>
            <Text style={[styles.groupTitle, { textAlign }]}>
              {positionLabel(position, t)}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{posPlayers.length}</Text>
            </View>
          </View>

          <View style={styles.playerList}>
            {posPlayers.map((player, idx) => (
              <PlayerRow
                key={player.id}
                player={player}
                isRTL={isRTL}
                rowDir={rowDir}
                textAlign={textAlign}
                isLast={idx === posPlayers.length - 1}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  skeletons: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    textAlign: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },

  // ── Position group ──
  group: { gap: spacing.xs },
  groupHeader: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  groupTitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  countText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
  },

  // ── Player / coach card ──
  playerList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  playerRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  playerRowLast: {
    borderBottomWidth: 0,
  },

  // ── Photo ──
  photoWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    flexShrink: 0,
  },
  photo: { width: 40, height: 40 },
  photoPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: colors.surfaceElevated,
  },

  // ── Number ──
  numberWrap: {
    width: 28,
    alignItems: 'center',
    flexShrink: 0,
  },
  numberText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
  },

  // ── Name ──
  playerName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
  },
  coachName: {
    fontFamily: fontFamily.bodySemiBold,
  },
});
