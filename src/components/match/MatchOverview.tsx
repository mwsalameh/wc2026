import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { formatKickoffFull, getTimezoneAbbr } from '@/utils/dateTime';
import { useLanguageStore } from '@/store/languageStore';
import { useRTL } from '@/hooks/useRTL';
import { getVenueNameAr, getCityNameAr, getVenueCountry } from '@/constants/venueNamesAr';
import { getPlayerNameAr } from '@/constants/playerNamesAr';
import { getRefereeInfo, getRefereeNationalityAr, getFlagEmoji, getCountryCodeFromName, getCountryNationalityAr, transliterateToArabic } from '@/constants/refereeData';
import type { Match, MatchEvent } from '@/types/match';

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value, isRTL }: { label: string; value: string; isRTL: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
      <Text style={[styles.value, { textAlign: isRTL ? 'right' : 'left' }]}>{value}</Text>
    </View>
  );
}

// ─── Referee row ──────────────────────────────────────────────────────────────

function RefereeRow({
  referee,
  isRTL,
  isAr,
}: {
  referee: { name: string; country: string };
  isRTL: boolean;
  isAr: boolean;
}) {
  const { t } = useTranslation();
  const info = getRefereeInfo(referee.name, referee.country);
  const sep = isAr ? '، ' : ', ';

  // When no Arabic name is available, wrap the Latin name in LTR embedding marks
  // so it renders correctly inside an RTL string instead of appearing garbled.
  const displayName = isAr
    ? (info?.nameAr ?? transliterateToArabic(referee.name))
    : (info?.nameEn ?? referee.name);
  const nationality = info
    ? (isAr ? getRefereeNationalityAr(info) : info.nationality)
    : (isAr ? getCountryNationalityAr(referee.country) : referee.country);
  const flagCode = info?.countryCode ?? getCountryCodeFromName(referee.country);
  const flag = flagCode ? getFlagEmoji(flagCode) : '';

  if (__DEV__ && !info) {
    console.warn('[refereeData] MISS — no entry for:', JSON.stringify(referee.name), 'country:', JSON.stringify(referee.country), '→ auto-ar:', transliterateToArabic(referee.name));
  }

  // Flag uses the same separator as other items so it anchors correctly in RTL
  const value = [displayName, nationality, flag].filter(Boolean).join(sep);

  return <InfoRow label={t('match.referee')} value={value} isRTL={isRTL} />;
}

// ─── Venue row ────────────────────────────────────────────────────────────────

function VenueRow({ venue, isRTL, isAr }: { venue: { name: string; city: string }; isRTL: boolean; isAr: boolean }) {
  const { t } = useTranslation();
  const sep = isAr ? '، ' : ', ';

  const venueName = (isAr ? getVenueNameAr(venue.name) : venue.name) || venue.name;
  const cityName = venue.city ? (isAr ? getCityNameAr(venue.city) : venue.city) : '';
  const hostCountry = getVenueCountry(venue.name, venue.city);
  const countryName = hostCountry ? (isAr ? hostCountry.nameAr : hostCountry.name) : '';
  const flag = hostCountry ? getFlagEmoji(hostCountry.code) : '';

  const value = [venueName, cityName, countryName].filter(Boolean).join(sep) + (flag ? ` ${flag}` : '');

  return <InfoRow label={t('match.venue')} value={value} isRTL={isRTL} />;
}

// ─── Timeline helpers ─────────────────────────────────────────────────────────

function halfEndMinute(events: MatchEvent[], base: number): string {
  const stoppage = events.filter(
    (e) => e.minute === base && e.extraMinute != null && e.extraMinute > 0
  );
  if (stoppage.length === 0) return `${base}'`;
  const maxExtra = Math.max(...stoppage.map((e) => e.extraMinute!));
  return `${base}+${maxExtra}'`;
}

function TimelineDivider({ minute, label, score }: { minute: string; label: string; score: string }) {
  const parts = [minute, label, score].filter(Boolean);
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerPill}>
        <Text style={styles.dividerText}>{parts.join('  ·  ')}</Text>
      </View>
    </View>
  );
}

// ─── Event row ────────────────────────────────────────────────────────────────

function PlayerLink({
  id,
  rawName,
  displayName,
  style,
  dim,
}: {
  id: number;
  rawName: string;
  displayName: string;
  style?: object;
  dim?: boolean;
}) {
  if (!id) {
    return (
      <Text style={[styles.eventPlayerName, dim && { color: colors.textMuted }, style]} numberOfLines={1}>
        {displayName}
      </Text>
    );
  }
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/player/[id]', params: { id, name: rawName } })}
      hitSlop={6}
    >
      {({ pressed }) => (
        <Text
          style={[styles.eventPlayerName, dim && { color: colors.textMuted }, style, pressed && { opacity: 0.6 }]}
          numberOfLines={1}
        >
          {displayName}
        </Text>
      )}
    </Pressable>
  );
}

function EventIcon({ type, detail }: { type: string; detail: string }) {
  if (type === 'Goal') return <Text style={styles.eventEmoji}>⚽</Text>;
  if (type === 'Card') {
    if (detail === 'Yellow Card') return <View style={styles.yellowCard} />;
    return <View style={styles.redCard} />;
  }
  return null;
}

function EventRow({ event, isRTL, showAr }: { event: MatchEvent; isRTL: boolean; showAr: boolean }) {
  const { t } = useTranslation();

  const isGoal = event.type === 'Goal';
  const isCard = event.type === 'Card';
  const isSubst = event.type === 'subst';
  const isYellow = isCard && event.detail === 'Yellow Card';
  const isRed = isCard && (event.detail === 'Red Card' || event.detail === 'Yellow Red Card');

  if (!isGoal && !isYellow && !isRed && !isSubst) return null;

  const minute = event.extraMinute
    ? `${event.minute}+${event.extraMinute}'`
    : `${event.minute}'`;

  const isHome = event.teamSide === 'home';
  const goesLeft = isRTL ? !isHome : isHome;

  // ── Substitution row ──────────────────────────────────────────────────────
  if (isSubst) {
    // api-football: player = going OFF, assist = coming ON
    const playerOut = showAr ? getPlayerNameAr(event.playerName) : event.playerName;
    const playerIn = event.assistName
      ? (showAr ? getPlayerNameAr(event.assistName) : event.assistName)
      : '';

    const substContent = (
      <View style={styles.substBlock}>
        {playerIn && event.assistId ? (
          <View style={styles.substLine}>
            <Text style={styles.substArrowIn}>↑</Text>
            <PlayerLink id={event.assistId} rawName={event.assistName!} displayName={playerIn} />
          </View>
        ) : null}
        <View style={styles.substLine}>
          <Text style={styles.substArrowOut}>↓</Text>
          <PlayerLink id={event.playerId} rawName={event.playerName} displayName={playerOut} dim />
        </View>
      </View>
    );

    return (
      <View style={styles.eventRow}>
        <View style={[styles.eventSide, { alignItems: 'flex-end' }]}>
          {goesLeft && substContent}
        </View>
        <View style={styles.eventMinuteWrap}>
          <Text style={styles.eventMinuteText}>{minute}</Text>
        </View>
        <View style={[styles.eventSide, { alignItems: 'flex-start' }]}>
          {!goesLeft && substContent}
        </View>
      </View>
    );
  }

  // ── Goal / Card row ───────────────────────────────────────────────────────
  const playerName = showAr ? getPlayerNameAr(event.playerName) : event.playerName;
  if (!playerName) return null;

  const isOwnGoal = event.detail === 'Own Goal';
  const isPenalty = event.detail === 'Penalty';
  const suffix = isOwnGoal
    ? ` (${t('match.ownGoal')})`
    : isPenalty
    ? ` (${t('match.penalty')})`
    : '';

  // Assist displayed for normal goals only (not own goals), when the API provided one
  const showAssist = isGoal && !isOwnGoal && !!event.assistName;
  const assistDisplayName = showAssist
    ? (showAr ? (getPlayerNameAr(event.assistName!) || event.assistName!) : event.assistName!)
    : null;

  const icon = <EventIcon type={event.type} detail={event.detail} />;

  const nameBlock = (side: 'left' | 'right') => (
    <View style={[styles.goalNameBlock, { alignItems: side === 'left' ? 'flex-end' : 'flex-start' }]}>
      <PlayerLink id={event.playerId} rawName={event.playerName} displayName={playerName + suffix} />
      {showAssist && assistDisplayName && (
        <PlayerLink
          id={event.assistId ?? 0}
          rawName={event.assistName!}
          displayName={assistDisplayName}
          style={styles.assistName}
        />
      )}
    </View>
  );

  return (
    <View style={styles.eventRow}>
      <View style={[styles.eventSide, { alignItems: 'flex-end' }]}>
        {goesLeft && (
          <View style={styles.eventLeftContent}>
            {nameBlock('left')}
            {icon}
          </View>
        )}
      </View>
      <View style={styles.eventMinuteWrap}>
        <Text style={styles.eventMinuteText}>{minute}</Text>
      </View>
      <View style={[styles.eventSide, { alignItems: 'flex-start' }]}>
        {!goesLeft && (
          <View style={styles.eventRightContent}>
            {icon}
            {nameBlock('right')}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Events section ───────────────────────────────────────────────────────────

function EventsSection({ match, isRTL, showAr }: { match: Match; isRTL: boolean; showAr: boolean }) {
  const { t } = useTranslation();
  const { events = [], score, status } = match;

  const visible = events.filter(
    (e) =>
      e.type === 'Goal' ||
      e.type === 'subst' ||
      (e.type === 'Card' &&
        (e.detail === 'Yellow Card' || e.detail === 'Red Card' || e.detail === 'Yellow Red Card'))
  );

  // Gate hasHT on match state: the API may return { home:0, away:0 } as a
  // placeholder from kick-off, so 0 !== null must not trigger the HT divider.
  const isPostHalfTime =
    status === 'HT' ||
    status === 'FT' ||
    status === 'AET' ||
    status === 'PEN' ||
    (status === 'LIVE' && (match.elapsed ?? 0) > 45);
  const hasHT = score.homeHT !== null && score.awayHT !== null && isPostHalfTime;
  const isFinal = status === 'FT' || status === 'AET' || status === 'PEN';

  if (visible.length === 0 && !hasHT && !isFinal) {
    if (status !== 'LIVE') return null;
    return (
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t('match.events')}
        </Text>
        <Text style={[styles.inProgressText, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t('match.matchInProgress')}
        </Text>
      </View>
    );
  }

  // Split by match period FIRST, then sort each period descending.
  // A sub at 46' (base minute 46) must never mix with a 45+5' goal (base minute 45)
  // in a flat sort, because 45+5 effective=50 > 46 effective=46 would push the sub
  // below the HT divider when it belongs above it.
  const sortDesc = (a: MatchEvent, b: MatchEvent) =>
    (b.minute + (b.extraMinute ?? 0)) - (a.minute + (a.extraMinute ?? 0));

  const firstHalf  = [...visible.filter(e => e.minute <= 45)].sort(sortDesc);
  const secondHalf = [...visible.filter(e => e.minute > 45)].sort(sortDesc);

  // Minutes for divider labels.
  // For a live match at HT, match.extra = the announced first-half stoppage time.
  const htMin =
    status === 'HT' && match.extra != null && match.extra > 0
      ? `45+${match.extra}'`
      : match.firstHalfAddedTime
      ? `45+${match.firstHalfAddedTime}'`
      : halfEndMinute(events.filter(e => e.minute <= 45), 45);
  const ftBase = status === 'AET' || status === 'PEN' ? 120 : 90;
  const ftMin = halfEndMinute(events.filter(e => e.minute > 45 && e.minute <= ftBase), ftBase);

  const htScore = hasHT ? `${score.homeHT} – ${score.awayHT}` : '';
  const ftScore = `${score.home ?? 0} – ${score.away ?? 0}`;
  const ftLabel =
    status === 'AET' ? t('match.afterET') :
    status === 'PEN' ? t('match.afterPens') :
    t('match.fullTime');

  // Build render list: FT → 2nd-half events → HT → 1st-half events
  type Item =
    | { kind: 'ft' }
    | { kind: 'ht' }
    | { kind: 'event'; event: MatchEvent; idx: number };
  const items: Item[] = [];

  if (isFinal) items.push({ kind: 'ft' });
  secondHalf.forEach((e, idx) => items.push({ kind: 'event', event: e, idx }));
  if (hasHT) items.push({ kind: 'ht' });
  firstHalf.forEach((e, idx) => items.push({ kind: 'event', event: e, idx: idx + secondHalf.length }));

  return (
    <View style={styles.card}>
      <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
        {t('match.events')}
      </Text>
      {items.map((item, i) => {
        if (item.kind === 'ft') {
          return <TimelineDivider key="ft" minute={ftMin} label={ftLabel} score={ftScore} />;
        }
        if (item.kind === 'ht') {
          return <TimelineDivider key="ht" minute={htMin} label={t('match.halfTime')} score={htScore} />;
        }
        return (
          <EventRow key={`evt-${item.idx}`} event={item.event} isRTL={isRTL} showAr={showAr} />
        );
      })}
    </View>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function MatchOverview({ match }: { match: Match }) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { isRTL } = useRTL();
  const isAr = language === 'ar';
  const tzAbbr = getTimezoneAbbr();
  const kickoffLabel = `${formatKickoffFull(match.kickoffUtc, language)} (${tzAbbr})`;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <InfoRow label={t('match.kickoff')} value={kickoffLabel} isRTL={isRTL} />
        <VenueRow venue={match.venue} isRTL={isRTL} isAr={isAr} />
        {match.referee ? (
          <RefereeRow referee={match.referee} isRTL={isRTL} isAr={isAr} />
        ) : null}
      </View>

      {((match.events?.length ?? 0) > 0 ||
        match.score.homeHT !== null ||
        match.status === 'LIVE' ||
        match.status === 'FT' || match.status === 'AET' || match.status === 'PEN') && (
        <EventsSection match={match} isRTL={isRTL} showAr={isAr} />
      )}

      <View style={styles.card}>
        <View style={[styles.broadcastHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('match.broadcast')}
          </Text>
          <Text style={[styles.broadcastRegion, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('match.broadcastRegion')}
          </Text>
        </View>
        <View style={[styles.broadcastRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="tv-outline" size={18} color={colors.gold} />
          <Text style={styles.broadcastName}>beIN Sports MENA</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  dividerRow: {
    alignItems: 'center',
    marginVertical: 2,
  },
  dividerPill: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
    textAlign: 'center' as const,
  },
  broadcastHeader: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  broadcastRegion: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
  broadcastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  broadcastName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
  },

  inProgressText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
    paddingVertical: spacing.xs,
  },

  // ── Events ──
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
  },
  eventSide: {
    flex: 1,
  },
  eventLeftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    justifyContent: 'flex-end',
  },
  eventRightContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  eventPlayerName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    flexShrink: 1,
  },
  goalNameBlock: {
    gap: 2,
  },
  assistName: {
    color: colors.textMuted,
    fontSize: 11,
  },
  eventEmoji: {
    fontSize: 13,
  },
  yellowCard: {
    width: 9,
    height: 13,
    borderRadius: 2,
    backgroundColor: '#FFC107',
  },
  redCard: {
    width: 9,
    height: 13,
    borderRadius: 2,
    backgroundColor: '#E53935',
  },
  eventMinuteWrap: {
    width: 52,
    alignItems: 'center',
  },
  eventMinuteText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
  },
  substBlock: {
    gap: 2,
  },
  substLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  substArrowIn: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
  },
  substArrowOut: {
    color: colors.live,
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
  },
});
