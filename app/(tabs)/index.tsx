import { useMemo, useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { isToday, isTomorrow, format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useQueryClient } from '@tanstack/react-query';
import { useAllFixtures, useLiveFixtures } from '@/hooks/useFixtures';
import { QUERY_KEYS } from '@/config/queryClient';
import { useRTL } from '@/hooks/useRTL';
import { formatMatchDate, formatDateWithWeekday } from '@/utils/dateTime';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MatchCard } from '@/components/ui/MatchCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { LiveBanner } from '@/components/home/LiveBanner';
import { MatchCalendar } from '@/components/home/MatchCalendar';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { data: allFixtures, isLoading, isError, refetch } = useAllFixtures();
  const { data: liveFixtures } = useLiveFixtures();
  const { isRTL, rowDir, textAlign } = useRTL();
  const lang = isRTL ? 'ar' : 'en';
  const queryClient = useQueryClient();
  const { isAdmin } = useAdminAuth();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Case 1: app opened after a match already finished.
  // If allFixtures cache still shows a today's match as NS but kickoff was >95 min ago,
  // the cache is stale — invalidate once so we get the real FT result.
  const startupCheckDone = useRef(false);
  useEffect(() => {
    if (startupCheckDone.current || !allFixtures) return;
    startupCheckDone.current = true;
    const now = Date.now();
    const hasStaleFinished = allFixtures.some(
      (m) =>
        m.status === 'NS' &&
        isToday(new Date(m.kickoffUtc)) &&
        now - new Date(m.kickoffUtc).getTime() > 95 * 60 * 1000,
    );
    if (hasStaleFinished) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fixtures });
    }
  }, [allFixtures, queryClient]);

  // Case 2: match finishes while the app is running.
  // When an ID disappears from liveFixtures the match just ended — invalidate so
  // the Today section refreshes with the final score.
  const prevLiveIdsRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (liveFixtures === undefined) return;
    const currentIds = new Set(liveFixtures.map((m) => m.id));
    const justFinished = [...prevLiveIdsRef.current].some((id) => !currentIds.has(id));
    if (justFinished) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fixtures });
    }
    prevLiveIdsRef.current = currentIds;
  }, [liveFixtures, queryClient]);

  const liveMatchIds = useMemo(() => {
    const ids = new Set<number>();
    liveFixtures?.forEach((m) => ids.add(m.id));
    return ids;
  }, [liveFixtures]);

  const todayMatches = useMemo(() => {
    if (!allFixtures) return [];
    return allFixtures
      .filter((m) => isToday(new Date(m.kickoffUtc)) && !liveMatchIds.has(m.id))
      .sort((a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime());
  }, [allFixtures, liveMatchIds]);

  const tomorrowMatches = useMemo(() => {
    if (!allFixtures) return [];
    return allFixtures
      .filter((m) => isTomorrow(new Date(m.kickoffUtc)))
      .sort((a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime());
  }, [allFixtures]);

  const nextMatch = useMemo(() => {
    if (!allFixtures) return null;
    const now = Date.now();
    return allFixtures
      .filter((m) => m.status === 'NS' && new Date(m.kickoffUtc).getTime() > now)
      .sort((a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime())[0] ?? null;
  }, [allFixtures]);

  const matchDates = useMemo(() => {
    const s = new Set<string>();
    allFixtures?.forEach((m) => {
      s.add(format(new Date(m.kickoffUtc), 'yyyy-MM-dd'));
    });
    return s;
  }, [allFixtures]);

  const selectedDateMatches = useMemo(() => {
    if (!selectedDate || !allFixtures) return [];
    const isSelectedToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
    return allFixtures
      .filter((m) => {
        if (format(new Date(m.kickoffUtc), 'yyyy-MM-dd') !== selectedDate) return false;
        if (isSelectedToday && liveMatchIds.has(m.id)) return false;
        return true;
      })
      .sort((a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime());
  }, [allFixtures, selectedDate, liveMatchIds]);

  const liveMatches = liveFixtures ?? [];
  const hasLive = liveMatches.length > 0;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setCalendarOpen(false);
  };

  const handleReset = () => {
    setSelectedDate(null);
    setCalendarOpen(false);
  };

  const calendarBtnLabel = selectedDate
    ? formatDateWithWeekday(selectedDate, lang)
    : t('home.selectDate');

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t('home.title')}
        subtitle={t('home.titleSub')}
        showInfo
        showLang
        onTitleLongPress={(__DEV__ || isAdmin) ? () => router.push('/admin' as any) : undefined}
      />
      {isError ? (
        <ErrorBanner onRetry={refetch} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {hasLive && <LiveBanner matches={liveMatches} />}

          {/* Calendar toggle + reset row */}
          <View style={[styles.calendarRow, { flexDirection: rowDir }]}>
            <Pressable
              style={[styles.calendarBtn, calendarOpen && styles.calendarBtnActive]}
              onPress={() => setCalendarOpen((v) => !v)}
            >
              <Ionicons
                name="calendar-outline"
                size={15}
                color={calendarOpen ? colors.background : colors.gold}
              />
              <Text style={[styles.calendarBtnText, calendarOpen && styles.calendarBtnTextActive]}>
                {calendarBtnLabel}
              </Text>
              <Ionicons
                name={calendarOpen ? 'chevron-up' : 'chevron-down'}
                size={13}
                color={calendarOpen ? colors.background : colors.gold}
              />
            </Pressable>

            {selectedDate && (
              <Pressable style={styles.resetBtn} onPress={handleReset}>
                <Ionicons name="close-circle" size={14} color={colors.textMuted} />
                <Text style={styles.resetText}>{t('home.resetFilter')}</Text>
              </Pressable>
            )}
          </View>

          {calendarOpen && (
            <View style={styles.calendarWrap}>
              <MatchCalendar
                selectedDate={selectedDate}
                matchDates={matchDates}
                onSelectDate={handleDateSelect}
              />
            </View>
          )}

          {selectedDate ? (
            /* Filtered by date */
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { textAlign }]}>
                {t('home.matchesOn', {
                  date: formatDateWithWeekday(selectedDate, lang),
                })}
              </Text>
              {isLoading ? (
                <View style={styles.list}>
                  {[0, 1, 2].map((i) => <Skeleton key={i} height={64} />)}
                </View>
              ) : selectedDateMatches.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>{t('home.noMatchesOnDate')}</Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {selectedDateMatches.map((m) => <MatchCard key={m.id} match={m} />)}
                </View>
              )}
            </View>
          ) : (
            /* Default: today + tomorrow */
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { textAlign }]}>{t('home.matchesToday')}</Text>

                {isLoading ? (
                  <View style={styles.list}>
                    {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={64} />)}
                  </View>
                ) : todayMatches.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>{t('home.noMatchesToday')}</Text>
                    {tomorrowMatches.length === 0 && nextMatch && (
                      <Text style={styles.nextText}>
                        {t('home.nextMatch', {
                          date: formatMatchDate(nextMatch.kickoffUtc, { language: lang }),
                        })}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.list}>
                    {todayMatches.map((m) => <MatchCard key={m.id} match={m} />)}
                  </View>
                )}
              </View>

              {(isLoading || tomorrowMatches.length > 0) && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { textAlign }]}>{t('home.matchesTomorrow')}</Text>
                  {isLoading ? (
                    <View style={styles.list}>
                      {[0, 1, 2].map((i) => <Skeleton key={i} height={64} />)}
                    </View>
                  ) : (
                    <View style={styles.list}>
                      {tomorrowMatches.map((m) => <MatchCard key={m.id} match={m} />)}
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl, gap: spacing.xl },

  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  calendarBtnActive: {
    backgroundColor: colors.gold,
  },
  calendarBtnText: {
    color: colors.gold,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  calendarBtnTextActive: {
    color: colors.background,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
  calendarWrap: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  list: { gap: spacing.sm },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  nextText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
    textAlign: 'center',
  },
});
