import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { StandingsTable } from '@/components/groups/StandingsTable';
import { CompetitionRules } from '@/components/groups/CompetitionRules';
import { MatchCard } from '@/components/ui/MatchCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useAllStandings } from '@/hooks/useStandings';
import { useAllFixtures } from '@/hooks/useFixtures';
import { useRTL } from '@/hooks/useRTL';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { LangButton } from '@/components/ui/ScreenHeader';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { isRTL, rowDir, textAlign } = useRTL();

  const { data: standings, isLoading: sLoading, isError: sError, refetch: sRefetch } = useAllStandings();
  const { data: allFixtures, isLoading: fLoading } = useAllFixtures();

  const groupStandings = standings?.[id] ?? [];

  // Derive group membership from standings (standings correctly map teams → groups)
  // because league.round in fixtures is the matchday number, not the group letter.
  const groupTeamIds = new Set(groupStandings.map((s) => s.team.id));
  const groupMatches = (allFixtures ?? []).filter(
    (m) => groupTeamIds.size > 0 && (groupTeamIds.has(m.homeTeam.id) || groupTeamIds.has(m.awayTeam.id))
  );

  const isLoading = sLoading || fLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection: rowDir }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={colors.white}
          />
        </Pressable>
        <Text style={styles.title}>{t('groups.group', { id })}</Text>
        <LangButton />
      </View>

      {sError ? (
        <ErrorBanner onRetry={sRefetch} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionLabel, { textAlign }]}>{t('standings.pos')}</Text>
          {isLoading ? (
            <View style={{ gap: 8 }}>
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={44} />)}
            </View>
          ) : (
            <StandingsTable standings={groupStandings} />
          )}

          <Text style={[styles.sectionLabel, { marginTop: spacing.xl, textAlign }]}>
            {t('groups.matches')}
          </Text>
          <View style={{ gap: spacing.sm }}>
            {isLoading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} height={64} />)
            ) : groupMatches.length === 0 ? (
              <Text style={[styles.empty, { textAlign }]}>{t('home.noMatchesToday')}</Text>
            ) : (
              groupMatches.map((m) => <MatchCard key={m.id} match={m} />)
            )}
          </View>

          <CompetitionRules />
        </ScrollView>
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
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.gold,
    fontFamily: fontFamily.display,
    fontSize: 32,
    letterSpacing: 1,
  },
  content: { padding: spacing.lg, gap: spacing.sm },
  sectionLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
