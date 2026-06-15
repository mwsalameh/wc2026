import { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useFixtureById } from '@/hooks/useFixtures';
import { useRTL } from '@/hooks/useRTL';
import { MatchHeader } from '@/components/match/MatchHeader';
import { MatchTabs, type MatchTab } from '@/components/match/MatchTabs';
import { MatchOverview } from '@/components/match/MatchOverview';
import { MatchLineups } from '@/components/match/MatchLineups';
import { MatchStats } from '@/components/match/MatchStats';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { HomeButton } from '@/components/ui/ScreenHeader';

function MatchDetailSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      {/* Header hero area */}
      <View style={styles.skeletonHero}>
        <View style={styles.skeletonTeam}>
          <Skeleton width={64} height={64} style={styles.skeletonCircle} />
          <Skeleton width={80} height={14} />
        </View>
        <View style={styles.skeletonScore}>
          <Skeleton width={72} height={48} />
          <Skeleton width={60} height={20} />
        </View>
        <View style={styles.skeletonTeam}>
          <Skeleton width={64} height={64} style={styles.skeletonCircle} />
          <Skeleton width={80} height={14} />
        </View>
      </View>
      {/* Tabs */}
      <View style={styles.skeletonTabs}>
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
      </View>
      {/* Content rows */}
      <View style={styles.skeletonContent}>
        <Skeleton height={80} />
        <Skeleton height={60} />
        <Skeleton height={60} />
      </View>
    </View>
  );
}

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { isRTL, rowDir } = useRTL();
  const [activeTab, setActiveTab] = useState<MatchTab>('overview');

  const fixtureId = parseInt(id, 10);
  const { data: match, isLoading, isError, refetch, isRefetching } = useFixtureById(fixtureId);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { flexDirection: rowDir }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.white} />
        </Pressable>
        <HomeButton />
      </View>

      {isLoading && !match && <MatchDetailSkeleton />}

      {isError && !match && <ErrorBanner onRetry={refetch} />}

      {!match && !isLoading && !isError && (
        <View style={styles.notFound}>
          <Ionicons name="football-outline" size={48} color={colors.textMuted} />
          <Text style={styles.notFoundText}>{t('errors.loadFailed')}</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>{t('errors.retry')}</Text>
          </Pressable>
        </View>
      )}

      {match && (
        <>
          <MatchHeader match={match} />
          <MatchTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.gold}
                colors={[colors.gold]}
              />
            }
          >
            {activeTab === 'overview' && <MatchOverview match={match} />}
            {activeTab === 'lineups' && <MatchLineups match={match} />}
            {activeTab === 'stats' && <MatchStats match={match} />}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // Skeleton
  skeletonWrap: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  skeletonHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  skeletonTeam: { alignItems: 'center', gap: spacing.sm, flex: 1 },
  skeletonCircle: { borderRadius: 32 },
  skeletonScore: { alignItems: 'center', gap: spacing.sm, flex: 1 },
  skeletonTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  skeletonContent: { gap: spacing.md },

  // Not found
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  notFoundText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  backLink: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backLinkText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
});
