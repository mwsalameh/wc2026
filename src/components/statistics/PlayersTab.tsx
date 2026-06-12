import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { useTopScorers, useTopAssists } from '@/hooks/usePlayerStats';
import { usePotmStats } from '@/hooks/useBestPlayer';
import { StatSection } from './StatSection';
import { PlayerStatRow } from './PlayerStatRow';
import { Skeleton } from '@/components/ui/Skeleton';

function EmptyState({ message }: { message: string }) {
  const { textAlign } = useRTL();
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { textAlign }]}>{message}</Text>
    </View>
  );
}

export function PlayersTab() {
  const { t } = useTranslation();
  const { data: scorers, isLoading: loadingScorers } = useTopScorers();
  const { data: assists, isLoading: loadingAssists } = useTopAssists();
  const { data: potmList, isLoading: loadingPotm } = usePotmStats();

  return (
    <View style={styles.container}>
      <StatSection title={t('stats.playerOfMatchAward')}>
        {loadingPotm ? (
          [0, 1, 2].map((i) => <Skeleton key={i} height={64} style={styles.skeletonRow} />)
        ) : !potmList?.length ? (
          <EmptyState message={t('stats.noData')} />
        ) : (
          potmList.map((p, i) => (
            <PlayerStatRow
              key={p.playerId}
              rank={i + 1}
              name={p.name}
              photo={p.photo}
              teamName={p.teamName}
              teamLogo={p.teamLogo}
              value={p.awards}
              valueLabel={t('stats.potmAward')}
              sub={`★ ${p.rating.toFixed(1)}`}
            />
          ))
        )}
      </StatSection>

      <StatSection title={t('stats.topScorers')}>
        {loadingScorers ? (
          [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={64} style={styles.skeletonRow} />)
        ) : !scorers?.length ? (
          <EmptyState message={t('stats.noData')} />
        ) : (
          scorers
            .filter((p) => p.goals > 0)
            .sort((a, b) => b.goals - a.goals)
            .slice(0, 10)
            .map((p, i) => (
              <PlayerStatRow
                key={p.playerId}
                rank={i + 1}
                name={p.name}
                photo={p.photo}
                teamName={p.teamName}
                teamLogo={p.teamLogo}
                value={p.goals}
                valueLabel={t('stats.goals')}
                sub={`${p.appearances} ${t('stats.apps')} · ${p.minutesPlayed}'`}
              />
            ))
        )}
      </StatSection>

      <StatSection title={t('stats.topAssists')}>
        {loadingAssists ? (
          [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={64} style={styles.skeletonRow} />)
        ) : !assists?.length ? (
          <EmptyState message={t('stats.noData')} />
        ) : (
          assists
            .filter((p) => p.assists > 0)
            .sort((a, b) => b.assists - a.assists)
            .slice(0, 10)
            .map((p, i) => (
              <PlayerStatRow
                key={p.playerId}
                rank={i + 1}
                name={p.name}
                photo={p.photo}
                teamName={p.teamName}
                teamLogo={p.teamLogo}
                value={p.assists}
                valueLabel={t('stats.assists')}
                sub={`${p.appearances} ${t('stats.apps')} · ${p.goals} ${t('stats.goals')}`}
              />
            ))
        )}
      </StatSection>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xxl },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
  },
  skeletonRow: { marginHorizontal: spacing.md, marginVertical: spacing.xs },
});
