import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { useLineups } from '@/hooks/useLineups';
import { useTeamName } from '@/hooks/useTeamName';
import { useRTL } from '@/hooks/useRTL';
import { getPlayerNameAr } from '@/constants/playerNamesAr';
import type { Match } from '@/types/match';
import type { Player, Lineup } from '@/types/lineup';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFormationRows(players: Player[]): Player[][] {
  const rowMap = new Map<number, Player[]>();
  for (const p of players) {
    const rowNum = p.grid ? parseInt(p.grid.split(':')[0], 10) : 0;
    if (!rowMap.has(rowNum)) rowMap.set(rowNum, []);
    rowMap.get(rowNum)!.push(p);
  }
  rowMap.forEach((row) =>
    row.sort((a, b) => {
      const ca = a.grid ? parseInt(a.grid.split(':')[1], 10) : 0;
      const cb = b.grid ? parseInt(b.grid.split(':')[1], 10) : 0;
      return ca - cb;
    })
  );
  return Array.from(rowMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, ps]) => ps);
}

function pitchDisplayName(englishName: string, isRTL: boolean): string {
  if (!isRTL) return englishName;
  return getPlayerNameAr(englishName);
}

// ─── Goalpost (top / bottom for portrait pitch) ───────────────────────────────

function GoalPost({ side, pitchWidth }: { side: 'home' | 'away'; pitchWidth: number }) {
  const goalW = Math.round(pitchWidth * 0.22);
  const goalH = 8;
  const left = (pitchWidth - goalW) / 2;
  const color = 'rgba(255,255,255,0.6)';
  const bar = 1.5;
  const isHome = side === 'home';

  return (
    <View style={{ position: 'absolute', left, bottom: isHome ? 0 : undefined, top: isHome ? undefined : 0, width: goalW, height: goalH }}>
      {/* left post */}
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: bar, backgroundColor: color }} />
      {/* right post */}
      <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: bar, backgroundColor: color }} />
      {/* back bar */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: isHome ? 0 : undefined, top: isHome ? undefined : 0, height: bar, backgroundColor: color }} />
    </View>
  );
}

// ─── Pitch player dot ─────────────────────────────────────────────────────────

function PitchDot({ player, home, isRTL }: { player: Player; home: boolean; isRTL: boolean }) {
  return (
    <View style={styles.pitchDot}>
      <View style={[styles.pitchCircle, home ? styles.circleHome : styles.circleAway]}>
        <PlayerAvatar uri={player.photo} size={38} backgroundColor="transparent" />
      </View>
      <Text style={styles.pitchName} numberOfLines={2}>{pitchDisplayName(player.name, isRTL)}</Text>
    </View>
  );
}

// ─── Formation half (portrait: rows rendered top→bottom) ──────────────────────

function FormationHalf({ lineup, home, isRTL }: { lineup: Lineup; home: boolean; isRTL: boolean }) {
  const rows = parseFormationRows(lineup.startXI);
  // Portrait orientation:
  //   away (top half):  GK row first → rows ascending  (GK at top, strikers near center)
  //   home (bottom half): strikers near center → rows reversed (strikers at top of half, GK at bottom)
  const displayRows = home ? [...rows].reverse() : rows;

  return (
    <View style={styles.formationHalf}>
      {displayRows.map((rowPlayers, i) => (
        <View key={i} style={styles.formationRow}>
          {rowPlayers.map((p) => (
            <PitchDot key={p.id} player={p} home={home} isRTL={isRTL} />
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Full pitch view (portrait) ───────────────────────────────────────────────

function PitchView({ home, away, width, height, isRTL }: { home: Lineup; away: Lineup; width: number; height: number; isRTL: boolean }) {
  return (
    <View style={[styles.pitch, { width, height }]}>
      <View style={styles.pitchLines}>
        <View style={styles.centreLine} />
        <View style={styles.centreCircle} />
      </View>
      <GoalPost side="away" pitchWidth={width} />
      <GoalPost side="home" pitchWidth={width} />

      <View style={styles.pitchInner}>
        <FormationHalf lineup={away} home={false} isRTL={isRTL} />
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
        <FormationHalf lineup={home} home isRTL={isRTL} />
      </View>
    </View>
  );
}

// ─── Substitutes list ─────────────────────────────────────────────────────────

function SubRow({ player, rtl, showAr }: { player: Player; rtl: boolean; showAr: boolean }) {
  const displayName = showAr ? getPlayerNameAr(player.name) : player.name;
  return (
    <View style={[styles.subRow, rtl && { flexDirection: 'row-reverse' }]}>
      <View style={styles.subAvatarWrap}>
        <PlayerAvatar uri={player.photo} size={26} radius={5} />
        <View style={styles.subBadge}>
          <Text style={styles.subBadgeNum}>{player.number}</Text>
        </View>
      </View>
      <Text style={[styles.subName, { textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>
        {displayName}
      </Text>
    </View>
  );
}

function SubsColumn({ lineup, rtl, showAr }: { lineup: Lineup; rtl: boolean; showAr: boolean }) {
  const { t } = useTranslation();
  const teamName = useTeamName(lineup.team.name);
  return (
    <View style={styles.subsCol}>
      <Text style={[styles.subsTeamName, { textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>
        {teamName}
      </Text>
      <Text style={[styles.subsLabel, { textAlign: rtl ? 'right' : 'left' }]}>
        {t('match.substitutes')}
      </Text>
      {lineup.substitutes.map((p) => (
        <SubRow key={p.id} player={p} rtl={rtl} showAr={showAr} />
      ))}
    </View>
  );
}

// ─── Coach row ────────────────────────────────────────────────────────────────

function CoachCard({ lineup, rtl }: { lineup: Lineup; rtl: boolean }) {
  const { t } = useTranslation();
  const teamName = useTeamName(lineup.team.name);
  const coachName = lineup.coach?.name ?? '—';
  const displayCoachName = rtl ? getPlayerNameAr(coachName) : coachName;
  return (
    <View style={[styles.coachCard, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
      <PlayerAvatar uri={lineup.coach?.photo} size={36} />
      <Text style={[styles.coachName, { textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>
        {displayCoachName}
      </Text>
      <Text style={[styles.coachTeam, { textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>
        {teamName}
      </Text>
      <Text style={[styles.coachLabel, { textAlign: rtl ? 'right' : 'left' }]}>
        {t('match.coach')}
      </Text>
    </View>
  );
}

// ─── Placeholder (when no lineup data) ───────────────────────────────────────

const SILO_ROWS = [1, 4, 3, 3];

function SiloHalf({ mirrored }: { mirrored: boolean }) {
  const rows = mirrored ? [...SILO_ROWS].reverse() : SILO_ROWS;
  return (
    <View style={styles.formationHalf}>
      {rows.map((count, i) => (
        <View key={i} style={styles.formationRow}>
          {Array.from({ length: count }).map((_, j) => (
            <View key={j} style={styles.siloDot} />
          ))}
        </View>
      ))}
    </View>
  );
}

function LineupsPlaceholder({ finished }: { finished: boolean }) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const pitchWidth = screenWidth - spacing.lg * 4;
  const pitchHeight = Math.round(pitchWidth * 1.55);

  return (
    <View style={styles.placeholder}>
      <View style={[styles.pitch, { width: pitchWidth, height: pitchHeight }]}>
        <View style={styles.pitchLines}>
          <View style={styles.centreLine} />
          <View style={styles.centreCircle} />
        </View>
        <GoalPost side="away" pitchWidth={pitchWidth} />
        <GoalPost side="home" pitchWidth={pitchWidth} />
        <View style={styles.pitchInner}>
          <SiloHalf mirrored={false} />
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <SiloHalf mirrored />
        </View>
        <View style={styles.pitchOverlay}>
          <Ionicons name="football-outline" size={28} color={colors.gold} style={{ opacity: 0.6 }} />
        </View>
      </View>
      <View style={styles.messageBox}>
        <Text style={styles.messageTitle}>
          {finished ? t('match.lineupsUnavailableTitle') : t('match.lineupsNotAvailableTitle')}
        </Text>
        <Text style={styles.messageSubtitle}>
          {finished ? t('match.lineupsUnavailable') : t('match.lineupsNotAvailable')}
        </Text>
      </View>
    </View>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function MatchLineups({ match }: { match: Match }) {
  const { t } = useTranslation();
  const { isRTL, rowDir } = useRTL();
  const { width: screenWidth } = useWindowDimensions();
  const { data: lineups, isLoading } = useLineups(match);

  const isFinished = ['FT', 'AET', 'PEN'].includes(match.status);
  const isBeforeWindow =
    match.status === 'NS' &&
    new Date(match.kickoffUtc).getTime() - Date.now() > 2 * 60 * 60 * 1000;

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!lineups?.home && !lineups?.away) {
    return <LineupsPlaceholder finished={isFinished && !isBeforeWindow} />;
  }

  const home = lineups.home!;
  const away = lineups.away!;
  const pitchWidth = screenWidth - spacing.lg * 2;
  const pitchHeight = Math.round(pitchWidth * 1.55);

  return (
    <View style={styles.container}>
      {/* Pitch – portrait orientation, formation labels outside the pitch */}
      <View style={[styles.pitchWrapper, { width: pitchWidth }]}>
        {away.formation ? (
          <Text style={styles.formationLabelText}>{away.formation}</Text>
        ) : null}
        <PitchView home={home} away={away} width={pitchWidth} height={pitchHeight} isRTL={isRTL} />
        {home.formation ? (
          <Text style={styles.formationLabelText}>{home.formation}</Text>
        ) : null}
      </View>

      {/* Substitutes */}
      <View style={[styles.dividerRow, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={styles.dividerLabel}>{t('match.substitutes')}</Text>
      </View>
      <View style={[styles.subsRow, { flexDirection: rowDir }]}>
        <SubsColumn lineup={isRTL ? away : home} rtl={isRTL} showAr={isRTL} />
        <View style={styles.subsDivider} />
        <SubsColumn lineup={isRTL ? home : away} rtl={isRTL} showAr={isRTL} />
      </View>

      {/* Coaches */}
      <View style={[styles.dividerRow, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={styles.dividerLabel}>{t('match.coach')}</Text>
      </View>
      <View style={[styles.coachesRow, { flexDirection: rowDir }]}>
        <CoachCard lineup={isRTL ? away : home} rtl={isRTL} />
        <View style={styles.subsDivider} />
        <CoachCard lineup={isRTL ? home : away} rtl={isRTL} />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xxl },

  // ── Pitch ──
  pitch: {
    alignSelf: 'center',
    backgroundColor: '#0A4A20',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#0D5C2A',
    overflow: 'hidden',
  },
  pitchLines: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centreCircle: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  centreLine: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  pitchInner: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  formationHalf: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  formationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  // ── Pitch player dot ──
  pitchDot: { alignItems: 'center', gap: 2 },
  pitchCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleHome: { borderColor: 'rgba(255,255,255,0.75)' },
  circleAway: { borderColor: colors.gold },
  pitchPhoto: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  pitchNumber: {
    color: colors.white,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 11,
    lineHeight: 12,
  },
  pitchName: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: fontFamily.bodyMedium,
    fontSize: 9,
    textAlign: 'center',
    width: 64,
    lineHeight: 12,
  },

  // ── Formation labels (outside pitch) ──
  pitchWrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 4,
  },
  formationLabelText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textAlign: 'center',
  },

  // ── Silhouette fallback dots ──
  siloDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  // ── Pitch overlay icon ──
  pitchOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },

  // ── Placeholder ──
  placeholder: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.xl,
  },
  messageBox: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  messageTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  messageSubtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Loading ──
  loadingWrap: { paddingVertical: spacing.xxl * 2, alignItems: 'center' },

  // ── Section divider ──
  dividerRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dividerLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // ── Substitutes ──
  subsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  subsCol: { flex: 1, gap: 3 },
  subsDivider: { width: 1, backgroundColor: colors.border },
  subsTeamName: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
    marginBottom: spacing.xs,
  },
  subsLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  subAvatarWrap: {
    position: 'relative',
    width: 26,
    height: 26,
    flexShrink: 0,
  },
  subPhoto: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  subShirt: {
    width: 26,
    height: 26,
    borderRadius: 5,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.surface,
    borderRadius: 4,
    paddingHorizontal: 2,
    minWidth: 12,
    alignItems: 'center',
  },
  subBadgeNum: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 7,
    lineHeight: 11,
  },
  subNumber: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 9,
  },
  subName: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
  },

  // ── Coach ──
  coachesRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  coachCard: {
    flex: 1,
    gap: 3,
  },
  coachPhoto: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
  },
  coachPhotoFallback: {
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  coachTeam: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
  },
  coachLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    opacity: 0.6,
  },
});
