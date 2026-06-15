import { useState, useMemo } from 'react';
import { ScrollView, View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useAllFixtures } from '@/hooks/useFixtures';
import { useTeamsList } from '@/hooks/useTeamsList';
import { useTeamName } from '@/hooks/useTeamName';
import { useRTL } from '@/hooks/useRTL';
import { useSquad } from '@/hooks/useSquad';
import { useCoach, useCoachOverride } from '@/hooks/useCoach';
import { MatchCard } from '@/components/ui/MatchCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { SquadTab } from '@/components/team/SquadTab';
import { HomeButton } from '@/components/ui/ScreenHeader';

type TeamTab = 'matches' | 'squad';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const teamId = parseInt(id, 10);
  const [activeTab, setActiveTab] = useState<TeamTab>('matches');

  const { teams, isLoading: teamsLoading } = useTeamsList();
  const { data: allFixtures, isLoading: fixturesLoading } = useAllFixtures();
  const { data: squadPlayers = [], isLoading: squadLoading } = useSquad(teamId);

  const { isRTL, rowDir, textAlign } = useRTL();

  const teamItem = useMemo(() => teams.find((t) => t.team.id === teamId), [teams, teamId]);
  const teamName = useTeamName(teamItem?.team.name ?? '');

  // Base coach from API (original behavior, fires immediately — Arab teams rely on this)
  const { data: coach, isLoading: coachLoading } = useCoach(teamId);
  // Override coach — only fires for non-Arab teams listed in coachOverrides.ts
  const { data: coachOverride } = useCoachOverride(teamId, teamItem?.team.name);
  // Prefer the verified override when available, otherwise use the API selection
  const displayCoach = coachOverride ?? coach;

  const teamMatches = useMemo(() => {
    if (!allFixtures) return [];
    return allFixtures
      .filter((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId)
      .sort((a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime());
  }, [allFixtures, teamId]);

  const isLoading = teamsLoading || fixturesLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header: back ← Title → lang  (reversed in RTL) */}
      <View style={[styles.header, { flexDirection: rowDir }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[styles.backBtn, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}
        >
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={colors.white}
          />
        </Pressable>

        {teamName ? (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {teamName}
          </Text>
        ) : (
          <View style={styles.headerTitlePlaceholder} />
        )}

        <HomeButton />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.skeletons}>
            <Skeleton height={100} />
            {[0, 1, 2].map((i) => <Skeleton key={i} height={64} />)}
          </View>
        ) : teamItem ? (
          <>
            {/* Team hero */}
            <View style={styles.teamHero}>
              <Image
                source={{ uri: teamItem.team.logoUrl }}
                style={styles.heroCrest}
                resizeMode="contain"
              />
              <Text style={styles.teamName}>{teamName}</Text>
              <Text style={styles.groupBadge}>
                {t('groups.group', { id: teamItem.groupId })}
              </Text>
            </View>

            {/* Tab bar */}
            <View style={[styles.tabBar, { flexDirection: rowDir }]}>
              {(['matches', 'squad'] as TeamTab[]).map((tab) => (
                <Pressable
                  key={tab}
                  style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === tab && styles.tabLabelActive,
                      { textAlign },
                    ]}
                  >
                    {tab === 'matches' ? t('teams.matches') : t('teams.squad')}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Tab content */}
            {activeTab === 'matches' ? (
              teamMatches.length === 0 ? (
                <Text style={styles.empty}>{t('teams.noResults')}</Text>
              ) : (
                <View style={styles.matchList}>
                  {teamMatches.map((m) => <MatchCard key={m.id} match={m} />)}
                </View>
              )
            ) : (
              <SquadTab
                players={squadPlayers}
                isLoading={squadLoading}
                coach={displayCoach}
                coachLoading={coachLoading}
              />
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ── Header ──
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
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerTitlePlaceholder: { flex: 1 },

  content: { paddingBottom: spacing.xxl },

  // ── Team hero ──
  teamHero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  heroCrest: { width: 88, height: 88 },
  teamName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.display,
    fontSize: 36,
    letterSpacing: 1,
    textAlign: 'center',
  },
  groupBadge: {
    color: colors.gold,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── Tab bar ──
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  tabItemActive: { backgroundColor: colors.gold },
  tabLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  tabLabelActive: {
    color: colors.background,
    fontFamily: fontFamily.bodySemiBold,
  },

  // ── Matches tab ──
  matchList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  skeletons: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
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
});
