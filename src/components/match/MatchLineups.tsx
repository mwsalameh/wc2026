import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { router } from 'expo-router';
import { useLineups } from '@/hooks/useLineups';
import { useTeamName } from '@/hooks/useTeamName';
import { useRTL } from '@/hooks/useRTL';
import { getPlayerNameAr } from '@/constants/playerNamesAr';
import { fetchFixturePlayers } from '@/api/fixtures';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';
import type { Match, MatchEvent } from '@/types/match';
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
  const full = isRTL ? getPlayerNameAr(englishName) : englishName;
  const parts = full.trim().split(/\s+/);
  return parts[parts.length - 1];
}

type CardType = 'yellow' | 'red';

function buildCardMap(events: MatchEvent[]): Map<number, CardType> {
  const map = new Map<number, CardType>();
  for (const e of events) {
    if (e.type !== 'Card') continue;
    const isRed =
      e.detail === 'Red Card' ||
      e.detail === 'Yellow-Red Card' ||
      map.get(e.playerId) === 'yellow'; // second yellow becomes red
    map.set(e.playerId, isRed ? 'red' : 'yellow');
  }
  return map;
}

function buildRatingMap(playerStats: any[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const teamData of playerStats) {
    for (const p of teamData.players ?? []) {
      const rating = parseFloat(p.statistics?.[0]?.games?.rating ?? '0');
      if (rating > 0) map.set(p.player.id as number, rating);
    }
  }
  return map;
}

function buildCaptainSet(playerStats: any[]): Set<number> {
  const set = new Set<number>();
  for (const teamData of playerStats) {
    for (const p of teamData.players ?? []) {
      if (p.statistics?.[0]?.games?.captain === true) {
        set.add(p.player.id as number);
      }
    }
  }
  return set;
}

function buildSubstMaps(events: MatchEvent[]): { subbedOnIds: Set<number>; subbedOffIds: Set<number> } {
  const subbedOnIds = new Set<number>();
  const subbedOffIds = new Set<number>();
  for (const e of events) {
    if (e.type !== 'subst') continue;
    // API-Football: player = going OFF (startXI), assist = coming ON (sub bench)
    subbedOffIds.add(e.playerId);
    if (e.assistId != null) subbedOnIds.add(e.assistId);
  }
  return { subbedOnIds, subbedOffIds };
}

function buildGoalMap(events: MatchEvent[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const e of events) {
    if (e.type !== 'Goal' || e.detail === 'Missed Penalty') continue;
    map.set(e.playerId, (map.get(e.playerId) ?? 0) + 1);
  }
  return map;
}

function buildAssistMap(events: MatchEvent[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const e of events) {
    if (e.type !== 'Goal' || e.detail === 'Missed Penalty' || e.detail === 'Own Goal') continue;
    if (e.assistId != null) map.set(e.assistId, (map.get(e.assistId) ?? 0) + 1);
  }
  return map;
}

function ratingColor(rating: number): string {
  if (rating >= 8.0) return colors.gold;
  if (rating >= 7.0) return '#22C55E';
  if (rating >= 6.0) return '#FFFFFF';
  return '#EF4444';
}

function buildTopRaterIds(home: Lineup, away: Lineup, ratingMap: Map<number, number>): Set<number> {
  const set = new Set<number>();
  for (const lineup of [home, away]) {
    let topId: number | null = null;
    let topRating = 0;
    for (const p of [...lineup.startXI, ...lineup.substitutes]) {
      const r = ratingMap.get(p.id) ?? 0;
      if (r > topRating) { topRating = r; topId = p.id; }
    }
    if (topId !== null && topRating > 0) set.add(topId);
  }
  return set;
}


// ─── Goalpost ─────────────────────────────────────────────────────────────────

function GoalPost({ side, pitchWidth }: { side: 'home' | 'away'; pitchWidth: number }) {
  const goalW = Math.round(pitchWidth * 0.22);
  const goalH = 8;
  const left = (pitchWidth - goalW) / 2;
  const color = 'rgba(255,255,255,0.6)';
  const bar = 1.5;
  const isHome = side === 'home';

  return (
    <View style={{ position: 'absolute', left, bottom: isHome ? 0 : undefined, top: isHome ? undefined : 0, width: goalW, height: goalH }}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: bar, backgroundColor: color }} />
      <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: bar, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: isHome ? 0 : undefined, top: isHome ? undefined : 0, height: bar, backgroundColor: color }} />
    </View>
  );
}

// ─── Pitch player dot ─────────────────────────────────────────────────────────

function PitchDot({
  player,
  home,
  isRTL,
  card,
  rating,
  subbedOff,
  goalCount,
  assistCount,
  captainSet,
  topRaterIds,
}: {
  player: Player;
  home: boolean;
  isRTL: boolean;
  card?: CardType;
  rating?: number;
  subbedOff: boolean;
  goalCount: number;
  assistCount: number;
  captainSet: Set<number>;
  topRaterIds: Set<number>;
}) {
  const iconsStr = '⚽'.repeat(goalCount) + '👟'.repeat(assistCount);
  const isCaptain = player.captain === true || captainSet.has(player.id);
  const showInjury = !!player.injured;
  return (
    <Pressable
      style={({ pressed }) => [styles.pitchDot, pressed && { opacity: 0.7 }]}
      onPress={() => router.push({ pathname: '/player/[id]', params: { id: player.id, name: player.name } })}
    >
      <View style={styles.pitchDotInner}>
        <View style={[styles.pitchCircle, home ? styles.circleHome : styles.circleAway]}>
          <PlayerAvatar uri={player.photo} size={38} backgroundColor="transparent" />
        </View>

        {/* Captain circle + jersey number — top-left */}
        <View style={styles.jerseyBadge}>
          {isCaptain && (
            <View style={styles.captainCircle}>
              <Text style={styles.captainCircleText}>C</Text>
            </View>
          )}
          <Text style={styles.jerseyText}>{player.number}</Text>
        </View>

        {/* Card badge — bottom-left */}
        {card && (
          <View style={[styles.cardBadge, card === 'yellow' ? styles.cardYellow : styles.cardRed]} />
        )}

        {/* Goal / assist icons — top-right, pushed outside the circle */}
        {iconsStr.length > 0 && (
          <Text style={styles.pitchIconsBadge}>{iconsStr}</Text>
        )}

        {/* Injury badge — bottom-right */}
        {showInjury && (
          <View style={styles.injuryBadge}>
            <Text style={styles.injuryText}>+</Text>
          </View>
        )}

        {/* Rating badge — bottom-center, only after FT */}
        {rating !== undefined && rating > 0 && (
          <View style={styles.ratingBadge}>
            <Text style={[styles.ratingText, { color: ratingColor(rating) }]}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.pitchName} numberOfLines={1}>
        {topRaterIds.has(player.id) ? '⭐ ' : ''}{pitchDisplayName(player.name, isRTL)}
        {subbedOff ? <Text style={styles.pitchSubOffArrow}> ↓</Text> : null}
      </Text>

    </Pressable>
  );
}

// ─── Formation half ───────────────────────────────────────────────────────────

function FormationHalf({
  lineup,
  home,
  isRTL,
  cardMap,
  ratingMap,
  captainSet,
  topRaterIds,
  subbedOffIds,
  goalMap,
  assistMap,
}: {
  lineup: Lineup;
  home: boolean;
  isRTL: boolean;
  cardMap: Map<number, CardType>;
  ratingMap: Map<number, number>;
  captainSet: Set<number>;
  topRaterIds: Set<number>;
  subbedOffIds: Set<number>;
  goalMap: Map<number, number>;
  assistMap: Map<number, number>;
}) {
  const rows = parseFormationRows(lineup.startXI);
  const displayRows = home ? [...rows].reverse() : rows;

  return (
    <View style={styles.formationHalf}>
      {displayRows.map((rowPlayers, i) => (
        <View key={i} style={styles.formationRow}>
          {rowPlayers.map((p) => (
            <PitchDot
              key={p.id}
              player={p}
              home={home}
              isRTL={isRTL}
              card={cardMap.get(p.id)}
              rating={ratingMap.get(p.id)}
              subbedOff={subbedOffIds.has(p.id)}
              goalCount={goalMap.get(p.id) ?? 0}
              assistCount={assistMap.get(p.id) ?? 0}
              captainSet={captainSet}
              topRaterIds={topRaterIds}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Full pitch view ──────────────────────────────────────────────────────────

function PitchView({
  home,
  away,
  width,
  height,
  isRTL,
  homeTeamName,
  awayTeamName,
  cardMap,
  ratingMap,
  captainSet,
  topRaterIds,
  subbedOffIds,
  goalMap,
  assistMap,
}: {
  home: Lineup;
  away: Lineup;
  width: number;
  height: number;
  isRTL: boolean;
  homeTeamName: string;
  awayTeamName: string;
  cardMap: Map<number, CardType>;
  ratingMap: Map<number, number>;
  captainSet: Set<number>;
  topRaterIds: Set<number>;
  subbedOffIds: Set<number>;
  goalMap: Map<number, number>;
  assistMap: Map<number, number>;
}) {
  return (
    <View style={[styles.pitch, { width, height }]}>
      <View style={styles.pitchLines}>
        <View style={styles.centreLine} />
        <View style={styles.centreCircle} />
      </View>
      <GoalPost side="away" pitchWidth={width} />
      <GoalPost side="home" pitchWidth={width} />

      {/* Team name labels — away top-left, home bottom-right */}
      <Text style={[styles.pitchTeamLabel, styles.pitchTeamLabelTopLeft]} numberOfLines={1}>
        {awayTeamName}
      </Text>
      <Text style={[styles.pitchTeamLabel, styles.pitchTeamLabelBottomRight]} numberOfLines={1}>
        {homeTeamName}
      </Text>

      <View style={styles.pitchInner}>
        <FormationHalf
          lineup={away} home={false} isRTL={isRTL}
          cardMap={cardMap} ratingMap={ratingMap} captainSet={captainSet}
          topRaterIds={topRaterIds} subbedOffIds={subbedOffIds}
          goalMap={goalMap} assistMap={assistMap}
        />
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
        <FormationHalf
          lineup={home} home isRTL={isRTL}
          cardMap={cardMap} ratingMap={ratingMap} captainSet={captainSet}
          topRaterIds={topRaterIds} subbedOffIds={subbedOffIds}
          goalMap={goalMap} assistMap={assistMap}
        />
      </View>
    </View>
  );
}

// ─── Substitutes list ─────────────────────────────────────────────────────────

function SubRow({
  player, rtl, showAr, subbedOn, card, goalCount, assistCount, captainSet, topRaterIds,
}: {
  player: Player;
  rtl: boolean;
  showAr: boolean;
  subbedOn: boolean;
  card?: CardType;
  goalCount: number;
  assistCount: number;
  captainSet: Set<number>;
  topRaterIds: Set<number>;
}) {
  const displayName = showAr ? getPlayerNameAr(player.name) : player.name;
  const iconsStr = '⚽'.repeat(goalCount) + '👟'.repeat(assistCount);
  const isCaptain = player.captain === true || captainSet.has(player.id);
  const showInjury = !!player.injured;
  return (
    <Pressable
      style={({ pressed }) => [styles.subRow, rtl && { flexDirection: 'row-reverse' }, pressed && { opacity: 0.65 }]}
      onPress={() => router.push({ pathname: '/player/[id]', params: { id: player.id, name: player.name } })}
    >
      <View style={styles.subAvatarWrap}>
        <PlayerAvatar uri={player.photo} size={26} radius={5} />
        <View style={styles.subBadge}>
          {isCaptain && (
            <View style={styles.subCaptainCircle}>
              <Text style={styles.subCaptainCircleText}>C</Text>
            </View>
          )}
          <Text style={styles.subBadgeNum}>{player.number}</Text>
        </View>
      </View>
      <View style={[styles.subNameRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        {subbedOn && <Text style={styles.subOnArrow}>↑</Text>}
        <Text style={[styles.subName, { textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>
          {topRaterIds.has(player.id) ? '⭐ ' : ''}{displayName}
        </Text>
        {iconsStr.length > 0 && <Text style={styles.subIcons}>{iconsStr}</Text>}
      </View>
      {(card || showInjury) && (
        <View style={[styles.subIndicators, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          {showInjury && (
            <View style={styles.subInjuryBadge}>
              <Text style={styles.subInjuryText}>+</Text>
            </View>
          )}
          {card && (
            <View style={[styles.subCardBadge, card === 'yellow' ? styles.cardYellow : styles.cardRed]} />
          )}
        </View>
      )}
    </Pressable>
  );
}

function SubsColumn({
  lineup, rtl, showAr, subbedOnIds, cardMap, goalMap, assistMap, captainSet, topRaterIds,
}: {
  lineup: Lineup;
  rtl: boolean;
  showAr: boolean;
  subbedOnIds: Set<number>;
  cardMap: Map<number, CardType>;
  goalMap: Map<number, number>;
  assistMap: Map<number, number>;
  captainSet: Set<number>;
  topRaterIds: Set<number>;
}) {
  const teamName = useTeamName(lineup.team.name);
  return (
    <View style={styles.subsCol}>
      <Text style={[styles.subsTeamName, { textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>
        {teamName}
      </Text>
      {lineup.substitutes.map((p) => (
        <SubRow
          key={p.id}
          player={p}
          rtl={rtl}
          showAr={showAr}
          subbedOn={subbedOnIds.has(p.id)}
          card={cardMap.get(p.id)}
          goalCount={goalMap.get(p.id) ?? 0}
          assistCount={assistMap.get(p.id) ?? 0}
          captainSet={captainSet}
          topRaterIds={topRaterIds}
        />
      ))}
    </View>
  );
}

// ─── Coach row ────────────────────────────────────────────────────────────────

function CoachCard({ lineup, rtl, showAr }: { lineup: Lineup; rtl: boolean; showAr: boolean }) {
  const { t } = useTranslation();
  const teamName = useTeamName(lineup.team.name);
  const coachName = lineup.coach?.name ?? '—';
  const displayCoachName = showAr ? getPlayerNameAr(coachName) : coachName;
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

// ─── Placeholder ──────────────────────────────────────────────────────────────

function LineupsPlaceholder({ finished }: { finished: boolean }) {
  const { t } = useTranslation();
  return (
    <View style={styles.placeholder}>
      <Ionicons name="football-outline" size={44} color={colors.gold} style={{ opacity: 0.45 }} />
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

  const isLive = match.status === 'LIVE' || match.status === 'HT';

  // Player stats: fetched for finished matches (ratings) and live matches (captain).
  // 6-hour stale time means it fires at most once per viewing session.
  const { data: playerStats } = useQuery({
    queryKey: QUERY_KEYS.fixturePlayers(match.id),
    queryFn: () => fetchFixturePlayers(match.id),
    staleTime: STALE_TIMES.FIXTURE_PLAYERS,
    enabled: isFinished || isLive,
  });

  const events = match.events ?? [];
  const cardMap = useMemo(() => buildCardMap(events), [events]);
  const ratingMap = useMemo(() => (playerStats ? buildRatingMap(playerStats) : new Map<number, number>()), [playerStats]);
  const captainSet = useMemo(() => (playerStats ? buildCaptainSet(playerStats) : new Set<number>()), [playerStats]);
  const topRaterIds = useMemo(() => {
    if (!lineups?.home || !lineups?.away || ratingMap.size === 0) return new Set<number>();
    return buildTopRaterIds(lineups.home, lineups.away, ratingMap);
  }, [lineups, ratingMap]);
  const { subbedOnIds, subbedOffIds } = useMemo(() => buildSubstMaps(events), [events]);
  const goalMap = useMemo(() => buildGoalMap(events), [events]);
  const assistMap = useMemo(() => buildAssistMap(events), [events]);

  const homeTeamName = useTeamName(match.homeTeam.name);
  const awayTeamName = useTeamName(match.awayTeam.name);

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!lineups?.home || !lineups?.away) {
    return <LineupsPlaceholder finished={isFinished && !isBeforeWindow} />;
  }

  const home = lineups.home;
  const away = lineups.away;
  const pitchWidth = screenWidth - spacing.lg * 2;
  const pitchHeight = Math.round(pitchWidth * 1.55);

  return (
    <View style={styles.container}>
      <View style={[styles.pitchWrapper, { width: pitchWidth }]}>
        {away.formation ? (
          <Text style={styles.formationLabelText}>{away.formation}</Text>
        ) : null}
        <PitchView
          home={home}
          away={away}
          width={pitchWidth}
          height={pitchHeight}
          isRTL={isRTL}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          cardMap={cardMap}
          ratingMap={ratingMap}
          captainSet={captainSet}
          topRaterIds={topRaterIds}
          subbedOffIds={subbedOffIds}
          goalMap={goalMap}
          assistMap={assistMap}
        />
        {home.formation ? (
          <Text style={styles.formationLabelText}>{home.formation}</Text>
        ) : null}
      </View>

      {/* Substitutes — title centered above both columns */}
      <View style={styles.dividerRow}>
        <Text style={styles.dividerLabel}>{t('match.substitutes')}</Text>
      </View>
      <View style={[styles.subsRow, { flexDirection: rowDir }]}>
        <SubsColumn
          lineup={home} rtl={isRTL} showAr={isRTL}
          subbedOnIds={subbedOnIds} cardMap={cardMap}
          goalMap={goalMap} assistMap={assistMap} captainSet={captainSet} topRaterIds={topRaterIds}
        />
        <View style={styles.subsDivider} />
        <SubsColumn
          lineup={away} rtl={!isRTL} showAr={isRTL}
          subbedOnIds={subbedOnIds} cardMap={cardMap}
          goalMap={goalMap} assistMap={assistMap} captainSet={captainSet} topRaterIds={topRaterIds}
        />
      </View>

      {/* Coaches */}
      <View style={[styles.dividerRow, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={styles.dividerLabel}>{t('match.coach')}</Text>
      </View>
      <View style={[styles.coachesRow, { flexDirection: rowDir }]}>
        <CoachCard lineup={home} rtl={isRTL} showAr={isRTL} />
        <View style={styles.subsDivider} />
        <CoachCard lineup={away} rtl={!isRTL} showAr={isRTL} />
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

  // ── Team name labels on pitch ──
  pitchTeamLabel: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.95)',
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.2,
    maxWidth: 120,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  pitchTeamLabelTopLeft: {
    top: 12,
    left: 8,
  },
  pitchTeamLabelBottomRight: {
    bottom: 12,
    right: 8,
    textAlign: 'right',
  },

  // ── Pitch player dot ──
  pitchDot: { alignItems: 'center', gap: 2 },
  pitchDotInner: { position: 'relative' },
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
  pitchName: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: fontFamily.bodyMedium,
    fontSize: 9,
    textAlign: 'center',
    width: 64,
    lineHeight: 12,
  },
  // ── Jersey number badge (top-left of circle) ──
  jerseyBadge: {
    position: 'absolute',
    top: -3,
    left: -3,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.80)',
    borderRadius: 3,
    paddingHorizontal: 2,
    minWidth: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  jerseyText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 8,
    lineHeight: 12,
    fontFamily: fontFamily.bodySemiBold,
  },
  captainCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  captainCircleText: {
    color: '#000',
    fontSize: 10,
    lineHeight: 11,
    fontFamily: fontFamily.bodyBold,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
  },

  // ── Inline sub-off arrow in player name text (on pitch) ──
  pitchSubOffArrow: {
    color: '#EF4444',
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 12,
  },

  // ── Card badge (bottom-left, same row as rating) ──
  cardBadge: {
    position: 'absolute',
    bottom: 1,
    left: -3,
    width: 8,
    height: 11,
    borderRadius: 1.5,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.3)',
  },

  // ── Goal / assist emoji icons (top-right of circle) ──
  pitchIconsBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 10,
    lineHeight: 12,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  // ── Injury badge (bottom-right of circle) ──
  injuryBadge: {
    position: 'absolute',
    bottom: -1,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  injuryText: {
    color: '#E53935',
    fontSize: 11,
    lineHeight: 13,
    fontFamily: fontFamily.bodySemiBold,
  },
  cardYellow: { backgroundColor: '#F4C842' },
  cardRed: { backgroundColor: '#E53935' },

  // ── Rating badge (bottom-center of circle, after FT only) ──
  ratingBadge: {
    position: 'absolute',
    bottom: 1,
    left: '50%',
    transform: [{ translateX: -12 }],
    width: 24,
    backgroundColor: 'rgba(0,0,0,0.80)',
    borderRadius: 4,
    alignItems: 'center',
    paddingVertical: 1,
  },
  ratingText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 8,
    lineHeight: 10,
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

  // ── Placeholder ──
  placeholder: {
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
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
    alignItems: 'center',
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
  subBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    flexDirection: 'row',
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
  subCaptainCircle: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 1,
  },
  subCaptainCircleText: {
    color: '#000',
    fontSize: 8,
    lineHeight: 10,
    fontFamily: fontFamily.bodyBold,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  subNameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    overflow: 'hidden',
  },
  subName: {
    flexShrink: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
  },
  subIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  subOnArrow: {
    color: '#22C55E',
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    lineHeight: 17,
    flexShrink: 0,
  },
  subCardBadge: {
    width: 7,
    height: 10,
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  subInjuryBadge: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subInjuryText: {
    color: '#E53935',
    fontSize: 10,
    lineHeight: 12,
    fontFamily: fontFamily.bodySemiBold,
  },
  subIcons: {
    fontSize: 11,
    lineHeight: 14,
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
