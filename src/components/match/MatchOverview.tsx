import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { formatKickoffFull, getTimezoneAbbr } from '@/utils/dateTime';
import { useLanguageStore } from '@/store/languageStore';
import { useRTL } from '@/hooks/useRTL';
import { getVenueNameAr, getCityNameAr } from '@/constants/venueNamesAr';
import { getPlayerNameAr } from '@/constants/playerNamesAr';
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

// ─── Event row ────────────────────────────────────────────────────────────────

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
    const playerIn = showAr ? getPlayerNameAr(event.playerName) : event.playerName;
    const playerOut = event.assistName
      ? (showAr ? getPlayerNameAr(event.assistName) : event.assistName)
      : '';

    const substContent = (
      <View style={styles.substBlock}>
        <View style={styles.substLine}>
          <Text style={styles.substArrowIn}>↑</Text>
          <Text style={styles.eventPlayerName} numberOfLines={1}>{playerIn}</Text>
        </View>
        {playerOut ? (
          <View style={styles.substLine}>
            <Text style={styles.substArrowOut}>↓</Text>
            <Text style={[styles.eventPlayerName, { color: colors.textMuted }]} numberOfLines={1}>{playerOut}</Text>
          </View>
        ) : null}
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

  const icon = <EventIcon type={event.type} detail={event.detail} />;

  return (
    <View style={styles.eventRow}>
      <View style={[styles.eventSide, { alignItems: 'flex-end' }]}>
        {goesLeft && (
          <View style={styles.eventLeftContent}>
            <Text style={styles.eventPlayerName} numberOfLines={1}>{playerName}{suffix}</Text>
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
            <Text style={styles.eventPlayerName} numberOfLines={1}>{playerName}{suffix}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Events section ───────────────────────────────────────────────────────────

function EventsSection({ events, isRTL, showAr }: { events: MatchEvent[]; isRTL: boolean; showAr: boolean }) {
  const { t } = useTranslation();

  const visible = events.filter(
    (e) =>
      e.type === 'Goal' ||
      e.type === 'subst' ||
      (e.type === 'Card' &&
        (e.detail === 'Yellow Card' || e.detail === 'Red Card' || e.detail === 'Yellow Red Card'))
  );

  if (visible.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
        {t('match.events')}
      </Text>
      {visible.map((e, i) => (
        <EventRow key={i} event={e} isRTL={isRTL} showAr={showAr} />
      ))}
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
  const venueName = isAr ? getVenueNameAr(match.venue.name) : match.venue.name;
  const venueCity = isAr ? getCityNameAr(match.venue.city) : match.venue.city;
  const venueLabel = venueName ? `${venueName}، ${venueCity}` : venueCity;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <InfoRow label={t('match.kickoff')} value={kickoffLabel} isRTL={isRTL} />
        {venueLabel ? (
          <InfoRow label={t('match.venue')} value={venueLabel} isRTL={isRTL} />
        ) : null}
        {match.referee ? (
          <InfoRow label={t('match.referee')} value={match.referee} isRTL={isRTL} />
        ) : null}
      </View>

      {(match.score.homeHT !== null || match.score.awayHT !== null) &&
       (match.status === 'HT' ||
        match.status === 'FT' ||
        match.status === 'AET' ||
        match.status === 'PEN' ||
        (match.status === 'LIVE' && (match.elapsed ?? 0) > 45)) && (
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {match.status === 'HT' ? t('match.halfTimeLive') : t('match.halfTime')}
          </Text>
          <Text style={styles.htScore}>
            {match.score.homeHT ?? 0} – {match.score.awayHT ?? 0}
          </Text>
        </View>
      )}

      {(match.events?.length ?? 0) > 0 && (
        <EventsSection events={match.events} isRTL={isRTL} showAr={isAr} />
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
  htScore: {
    color: colors.textSecondary,
    fontFamily: fontFamily.display,
    fontSize: 32,
    textAlign: 'center',
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
    alignItems: 'center',
    gap: 5,
    justifyContent: 'flex-end',
  },
  eventRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eventPlayerName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    flexShrink: 1,
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
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
  },
});
