import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { PlayersTab } from '@/components/statistics/PlayersTab';
import { PotmTab } from '@/components/statistics/PotmTab';
import { TeamsTab } from '@/components/statistics/TeamsTab';
import { DisciplineTab } from '@/components/statistics/DisciplineTab';
import { QUERY_KEYS } from '@/config/queryClient';
import type { Match } from '@/types/match';

const TABS = ['players', 'potm', 'teams', 'discipline'] as const;
type StatTab = typeof TABS[number];

export default function StatisticsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<StatTab>('players');
  const [refreshing, setRefreshing] = useState(false);
  const { rowDir, textAlign } = useRTL();
  const queryClient = useQueryClient();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    // Step 1: Refresh fixture list (1 request). Spinner stays visible here.
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fixtures });
    setRefreshing(false);

    // Step 2: Throttled background refresh of player stats.
    // Covers two cases:
    //   (a) Matches completed in the last 24h — stats may still be updating.
    //   (b) Any completed match whose cached player data is empty or missing —
    //       caused by a rate-limit response (HTTP 200, response:[]) being
    //       cached as valid data before the API client was fixed.
    // Requests are spaced 2 seconds apart to stay under the rate limit.
    const fixtures = queryClient.getQueryData<Match[]>(QUERY_KEYS.fixtures) ?? [];
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const toRefresh = fixtures.filter((m) => {
      if (!['FT', 'AET', 'PEN'].includes(m.status)) return false;
      const isRecent = new Date(m.kickoffUtc).getTime() > cutoff;
      const state = queryClient.getQueryState(QUERY_KEYS.fixturePlayers(m.id));
      const isPoisoned =
        !state ||
        state.status === 'error' ||
        state.data === undefined ||
        (Array.isArray(state.data) && (state.data as any[]).length === 0);
      return isRecent || isPoisoned;
    });
    for (const match of toRefresh) {
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fixturePlayers(match.id) });
    }
  }, [queryClient]);

  const tabLabels: Record<StatTab, string> = {
    players: t('stats.players'),
    potm: t('stats.potmTab'),
    teams: t('stats.teams'),
    discipline: t('stats.discipline'),
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('stats.title')} />

      <View style={[styles.tabBar, { flexDirection: rowDir }]}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive, { textAlign }]}
              numberOfLines={1}
            >
              {tabLabels[tab]}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      >
        {activeTab === 'players' && <PlayersTab />}
        {activeTab === 'potm' && <PotmTab />}
        {activeTab === 'teams' && <TeamsTab />}
        {activeTab === 'discipline' && <DisciplineTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: colors.gold,
  },
  tabLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  tabLabelActive: {
    color: colors.background,
    fontFamily: fontFamily.bodySemiBold,
  },
  content: { flex: 1, paddingTop: spacing.md },
});
