import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRTL } from '@/hooks/useRTL';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { GroupCard } from '@/components/groups/GroupCard';
import { CompetitionRules } from '@/components/groups/CompetitionRules';
import { SkeletonGroupCard } from '@/components/ui/Skeleton';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useAllStandings } from '@/hooks/useStandings';
import { WC_2026 } from '@/constants/tournament';
import { colors, spacing } from '@/constants/theme';

const GROUPS = WC_2026.GROUPS;

export default function GroupsScreen() {
  const { t } = useTranslation();
  const { rowDir } = useRTL();
  const { data: standings, isLoading, isError, refetch } = useAllStandings();

  const pairs = GROUPS.reduce<string[][]>((acc, _, i) => {
    if (i % 2 === 0) acc.push([GROUPS[i], GROUPS[i + 1]]);
    return acc;
  }, []);

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={t('groups.title')} />
        <ErrorBanner onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('groups.title')} />
      <FlatList
        data={pairs}
        keyExtractor={(item) => item.join('-')}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<CompetitionRules />}
        renderItem={({ item: [gA, gB] }) => (
          <View style={[styles.row, { flexDirection: rowDir }]}>
            {isLoading || !standings ? (
              <>
                <View style={styles.cardWrap}><SkeletonGroupCard /></View>
                <View style={styles.cardWrap}><SkeletonGroupCard /></View>
              </>
            ) : (
              <>
                <View style={styles.cardWrap}>
                  <GroupCard groupId={gA} standings={standings[gA] ?? []} />
                </View>
                {gB && (
                  <View style={styles.cardWrap}>
                    <GroupCard groupId={gB} standings={standings[gB] ?? []} />
                  </View>
                )}
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.md },
  row: { gap: spacing.md },
  cardWrap: { flex: 1 },
});
