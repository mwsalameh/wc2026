import { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { usePotmStats } from '@/hooks/useBestPlayer';
import { StatSection } from './StatSection';
import { PlayerStatRow } from './PlayerStatRow';
import { PotmHistoryRow } from './PotmHistoryRow';
import { Skeleton } from '@/components/ui/Skeleton';

const INITIAL_LEADERS = 3;
const INITIAL_HISTORY = 10;
const PAGE_SIZE = 5;
const MIN_AWARDS = 2;

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

export function PotmTab() {
  const { t } = useTranslation();
  const [leadersVisible, setLeadersVisible] = useState(INITIAL_LEADERS);
  const [historyVisible, setHistoryVisible] = useState(INITIAL_HISTORY);
  const { awardLeaders, history, isLoading } = usePotmStats();

  const eligibleLeaders = useMemo(
    () => awardLeaders.filter((p) => p.awards >= MIN_AWARDS),
    [awardLeaders]
  );

  // Hide leaders section entirely once loading is done and no one qualifies
  const showLeadersSection = isLoading || eligibleLeaders.length > 0;

  return (
    <View style={styles.container}>
      {/* Section 1: Most Awards — only players with ≥2 awards */}
      {showLeadersSection && (
        <StatSection title={t('stats.potmMostAwards')}>
          {isLoading && eligibleLeaders.length === 0 ? (
            [0, 1, 2].map((i) => <Skeleton key={i} height={64} style={styles.skeletonRow} />)
          ) : [
            ...eligibleLeaders.slice(0, leadersVisible).map((p, i) => (
              <PlayerStatRow
                key={p.playerId}
                rank={i + 1}
                playerId={p.playerId}
                teamId={p.teamId}
                name={p.name}
                photo={p.photo}
                teamName={p.teamName}
                teamLogo={p.teamLogo}
                value={p.awards}
                valueLabel={t('stats.potmAward')}
                sub={`★ ${p.rating.toFixed(1)}`}
              />
            )),
            leadersVisible < eligibleLeaders.length ? (
              <ShowMoreButton
                key="btn"
                expanded={false}
                onPress={() => setLeadersVisible((c) => c + PAGE_SIZE)}
              />
            ) : leadersVisible > INITIAL_LEADERS ? (
              <ShowMoreButton
                key="btn"
                expanded={true}
                onPress={() => setLeadersVisible(INITIAL_LEADERS)}
              />
            ) : null,
          ]}
        </StatSection>
      )}

      {/* Section 2: Per-match history, newest first */}
      <StatSection title={t('stats.potmHistory')}>
        {isLoading && history.length === 0 ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} height={64} style={styles.skeletonRow} />)
        ) : !history.length ? (
          <EmptyState message={t('stats.noData')} />
        ) : [
          ...history.slice(0, historyVisible).map((entry) => (
            <PotmHistoryRow key={entry.fixtureId} entry={entry} />
          )),
          historyVisible < history.length ? (
            <ShowMoreButton
              key="btn"
              expanded={false}
              onPress={() => setHistoryVisible((c) => c + PAGE_SIZE)}
            />
          ) : historyVisible > INITIAL_HISTORY ? (
            <ShowMoreButton
              key="btn"
              expanded={true}
              onPress={() => setHistoryVisible(INITIAL_HISTORY)}
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
