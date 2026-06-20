import { useMemo } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { useLanguageStore } from '@/store/languageStore';
import { useTeamName } from '@/hooks/useTeamName';
import { usePlayerDetail } from '@/hooks/usePlayerDetail';
import { useTopScorers } from '@/hooks/usePlayerStats';
import { usePotmStats } from '@/hooks/useBestPlayer';
import { getPlayerNameAr } from '@/constants/playerNamesAr';
import { getClubNameAr } from '@/constants/clubNamesAr';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { BackHeader } from '@/components/ui/BackHeader';
import type { PlayerWcStats } from '@/types/playerDetail';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function formatBirthDate(dateStr: string, isAr: boolean): string {
  try {
    const d = parseISO(dateStr);
    if (isAr) {
      return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }
    return format(d, 'MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value, isRTL }: { label: string; value: string; isRTL: boolean }) {
  return (
    <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={[styles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
      <Text style={[styles.infoValue, { textAlign: isRTL ? 'left' : 'right' }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}


function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>{label}</Text>
    </View>
  );
}

function WcStatsSection({ stats, t, isRTL, potmAwards }: { stats: PlayerWcStats; t: (k: string) => string; isRTL: boolean; potmAwards: number }) {
  const hasExtra = stats.shotsOnTarget > 0 || stats.yellowCards > 0 || stats.redCards > 0 || stats.rating;
  const rating = stats.rating ? parseFloat(stats.rating).toFixed(1) : null;

  return (
    <View style={styles.card}>
      <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Ionicons name="trophy-outline" size={14} color={colors.gold} />
        <Text style={[styles.cardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('player.wcStats')}</Text>
      </View>

      {/* Primary stats row */}
      <View style={styles.statsGrid}>
        <StatBox value={stats.appearances} label={t('player.appearances')} />
        <StatBox value={stats.goals} label={t('player.goals')} />
        <StatBox value={stats.assists ?? 0} label={t('player.assists')} />
        <StatBox value={stats.minutes} label={t('player.minutes')} />
        <StatBox value={potmAwards} label={t('player.potmAwards')} />
      </View>

      {/* Secondary stats row */}
      {hasExtra && (
        <View style={[styles.statsGrid, styles.statsGridBorder]}>
          {stats.shotsOnTarget > 0 && (
            <StatBox value={stats.shotsOnTarget} label={t('player.shotsOnTarget')} />
          )}
          {stats.yellowCards > 0 && (
            <StatBox value={stats.yellowCards} label={t('player.yellowCards')} />
          )}
          {stats.redCards > 0 && (
            <StatBox value={stats.redCards} label={t('player.redCards')} />
          )}
          {rating && (
            <StatBox value={rating} label={t('player.rating')} />
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PlayerScreen() {
  const { id, name: paramName } = useLocalSearchParams<{ id: string; name: string }>();
  const { t } = useTranslation();
  const { isRTL, textAlign } = useRTL();
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const playerId = parseInt(id, 10);
  const { data: detail, isLoading, isError } = usePlayerDetail(playerId);
  const { data: allFixtureStats } = useTopScorers();
  const { awardLeaders } = usePotmStats();

  const profile = detail?.profile;
  const wcStats = detail?.wcStats;
  const club = detail?.club ?? null;

  // Fixture-aggregated stats for this player (same data source as Statistics page).
  // Used as fallback when the /players API returns no appearances for this player.
  const aggregatedStats = useMemo(
    () => allFixtureStats?.find((p) => p.playerId === playerId),
    [allFixtureStats, playerId]
  );

  const potmAwards = useMemo(
    () => awardLeaders.find((p) => p.playerId === playerId)?.awards ?? 0,
    [awardLeaders, playerId]
  );

  // Prefer API stats when they have real appearances; fall back to fixture aggregation.
  const effectiveWcStats = useMemo((): PlayerWcStats | null => {
    if (wcStats && wcStats.appearances > 0) return wcStats;
    if (!aggregatedStats || aggregatedStats.appearances === 0) return wcStats ?? null;
    return {
      teamId: aggregatedStats.teamId,
      teamName: aggregatedStats.teamName,
      teamLogo: aggregatedStats.teamLogo,
      position: wcStats?.position ?? '',
      number: wcStats?.number ?? null,
      appearances: aggregatedStats.appearances,
      minutes: aggregatedStats.minutesPlayed,
      goals: aggregatedStats.goals,
      assists: aggregatedStats.assists ?? 0,
      shotsOnTarget: aggregatedStats.shotsOnTarget,
      yellowCards: aggregatedStats.yellowCards,
      redCards: aggregatedStats.redCards,
      rating: wcStats?.rating ?? null,
      passAccuracy: wcStats?.passAccuracy ?? null,
      dribbles: wcStats?.dribbles ?? null,
    };
  }, [wcStats, aggregatedStats]);

  const nameEn = profile?.name ?? paramName ?? '—';
  const nameAr = profile ? (getPlayerNameAr(profile.name) || null) : null;
  const displayName = isAr ? (nameAr ?? nameEn) : nameEn;

  const teamNameRaw = effectiveWcStats?.teamName ?? '';
  const teamName = useTeamName(teamNameRaw);

  const positionKey = effectiveWcStats?.position || '';
  const positionLabel = positionKey
    ? (t(`player.positions.${positionKey}`) || positionKey)
    : null;

  const clubDisplayName = club?.name
    ? (isAr ? (getClubNameAr(club.name) ?? club.name) : club.name)
    : null;

  const headerTitle = displayName || t('player.profile');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackHeader title={headerTitle} />

      {isLoading && !detail && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      )}

      {isError && !detail && (
        <View style={styles.loadingWrap}>
          <Ionicons name="person-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.errorText, { textAlign }]}>{t('errors.loadFailed')}</Text>
        </View>
      )}

      {(detail || (!isLoading && !isError)) && (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.avatarWrap}>
              <PlayerAvatar uri={profile?.photo} size={110} />
              {profile?.injured && (
                <View style={styles.injuredBadge}>
                  <Text style={styles.injuredText}>{t('player.injured')}</Text>
                </View>
              )}
            </View>

            <Text style={[styles.displayName, { textAlign: 'center' }]}>{displayName}</Text>

            {effectiveWcStats?.teamName ? (
              <Pressable
                style={({ pressed }) => [styles.teamRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }, pressed && { opacity: 0.7 }]}
                onPress={() => router.push({ pathname: '/team/[id]', params: { id: effectiveWcStats.teamId } })}
              >
                {effectiveWcStats.teamLogo ? (
                  <Image source={{ uri: effectiveWcStats.teamLogo }} style={styles.teamLogo} resizeMode="contain" />
                ) : null}
                <Text style={styles.teamName}>{teamName || effectiveWcStats.teamName}</Text>
              </Pressable>
            ) : null}

            {positionLabel ? (
              <View style={styles.positionBadge}>
                <Text style={styles.positionText}>{positionLabel}</Text>
              </View>
            ) : null}
          </View>

          {/* Profile info */}
          {profile && (
            <View style={styles.card}>
              <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name="person-outline" size={14} color={colors.gold} />
                <Text style={[styles.cardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('player.profile')}</Text>
              </View>

              {clubDisplayName && (
                <InfoRow label={t('player.club')} value={clubDisplayName} isRTL={isRTL} />
              )}
              {(effectiveWcStats?.number ?? null) !== null && (
                <InfoRow label={t('player.number')} value={`#${effectiveWcStats!.number}`} isRTL={isRTL} />
              )}
              {profile.age > 0 && (
                <InfoRow label={t('player.age')} value={`${profile.age}`} isRTL={isRTL} />
              )}
              {profile.birthDate && (
                <InfoRow
                  label={t('player.dateOfBirth')}
                  value={formatBirthDate(profile.birthDate, isAr)}
                  isRTL={isRTL}
                />
              )}
              {profile.height && (
                <InfoRow label={t('player.height')} value={profile.height} isRTL={isRTL} />
              )}
              {profile.weight && (
                <InfoRow label={t('player.weight')} value={profile.weight} isRTL={isRTL} />
              )}
            </View>
          )}

          {/* WC stats */}
          {effectiveWcStats && effectiveWcStats.appearances > 0 ? (
            <WcStatsSection stats={effectiveWcStats} t={t} isRTL={isRTL} potmAwards={potmAwards} />
          ) : profile ? (
            <View style={styles.noStatsBox}>
              <Text style={[styles.noStatsText, { textAlign: 'center' }]}>{t('player.noStats')}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  errorText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
  },

  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // ── Hero ──
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  injuredBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: colors.loss,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  injuredText: {
    color: colors.white,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
  },
  displayName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.h2,
    marginTop: spacing.xs,
  },
  teamRow: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  teamLogo: { width: 20, height: 20 },
  teamName: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  positionBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  positionText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },

  // ── Card ──
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  cardTitle: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
  },

  // ── Info rows ──
  infoRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
    alignItems: 'center',
  },
  infoLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
    flex: 1,
  },
  infoValue: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
    flex: 1,
  },
  // ── Stats grid ──
  statsGrid: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statsGridBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  statValue: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 22,
    lineHeight: 26,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 14,
  },

  // ── No stats ──
  noStatsBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noStatsText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
});
