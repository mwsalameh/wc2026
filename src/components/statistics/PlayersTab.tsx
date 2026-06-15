import { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { useTopScorers, useTopAssists } from '@/hooks/usePlayerStats';
import { StatSection } from './StatSection';
import { PlayerStatRow } from './PlayerStatRow';
import { Skeleton } from '@/components/ui/Skeleton';

const INITIAL_COUNT = 5;
const PAGE_SIZE = 5;

function EmptyState({ message }: { message: string }) {
  const { textAlign } = useRTL();
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { textAlign }]}>{message}</Text>
    </View>
  );
}

function ShowMoreButton({ expanded, onPress }: { expanded: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const { textAlign } = useRTL();
  return (
    <Pressable style={styles.showMoreBtn} onPress={onPress}>
      <Text style={[styles.showMoreText, { textAlign }]}>
        {expanded ? t('stats.showLess') : t('stats.showMore')}
      </Text>
    </Pressable>
  );
}

export function PlayersTab() {
  const { t } = useTranslation();
  const [scorersVisible, setScorersVisible] = useState(INITIAL_COUNT);
  const [assistsVisible, setAssistsVisible] = useState(INITIAL_COUNT);

  const { data: scorers, isLoading: loadingScorers } = useTopScorers();
  const { data: assists, isLoading: loadingAssists } = useTopAssists();

  const filteredScorers = useMemo(
    () => (scorers ?? []).filter((p) => p.goals > 0).sort((a, b) => b.goals - a.goals),
    [scorers]
  );
  const filteredAssists = useMemo(
    () => (assists ?? []).filter((p) => p.assists > 0).sort((a, b) => b.assists - a.assists),
    [assists]
  );

  return (
    <View style={styles.container}>
      <StatSection title={t('stats.topScorers')}>
        {loadingScorers ? (
          [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={64} style={styles.skeletonRow} />)
        ) : !filteredScorers.length ? (
          <EmptyState message={t('stats.noData')} />
        ) : [
          ...filteredScorers.slice(0, scorersVisible).map((p, i) => (
            <PlayerStatRow
              key={p.playerId}
              rank={i + 1}
              playerId={p.playerId}
              teamId={p.teamId}
              name={p.name}
              photo={p.photo}
              teamName={p.teamName}
              teamLogo={p.teamLogo}
              value={p.goals}
              valueLabel={t('stats.goals')}
              sub={`${p.appearances} ${t('stats.apps')} · ${p.minutesPlayed}'`}
            />
          )),
          scorersVisible < filteredScorers.length ? (
            <ShowMoreButton
              key="btn"
              expanded={false}
              onPress={() => setScorersVisible((c) => c + PAGE_SIZE)}
            />
          ) : scorersVisible > INITIAL_COUNT ? (
            <ShowMoreButton
              key="btn"
              expanded={true}
              onPress={() => setScorersVisible(INITIAL_COUNT)}
            />
          ) : null,
        ]}
      </StatSection>

      <StatSection title={t('stats.topAssists')}>
        {loadingAssists ? (
          [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={64} style={styles.skeletonRow} />)
        ) : !filteredAssists.length ? (
          <EmptyState message={t('stats.noData')} />
        ) : [
          ...filteredAssists.slice(0, assistsVisible).map((p, i) => (
            <PlayerStatRow
              key={p.playerId}
              rank={i + 1}
              playerId={p.playerId}
              teamId={p.teamId}
              name={p.name}
              photo={p.photo}
              teamName={p.teamName}
              teamLogo={p.teamLogo}
              value={p.assists}
              valueLabel={t('stats.assists')}
              sub={`${p.appearances} ${t('stats.apps')} · ${p.goals} ${t('stats.goals')}`}
            />
          )),
          assistsVisible < filteredAssists.length ? (
            <ShowMoreButton
              key="btn"
              expanded={false}
              onPress={() => setAssistsVisible((c) => c + PAGE_SIZE)}
            />
          ) : assistsVisible > INITIAL_COUNT ? (
            <ShowMoreButton
              key="btn"
              expanded={true}
              onPress={() => setAssistsVisible(INITIAL_COUNT)}
            />
          ) : null,
        ]}
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
  showMoreBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  showMoreText: {
    color: colors.gold,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
});
