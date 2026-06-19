import { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { useTopYellowCards } from '@/hooks/usePlayerStats';
import { StatSection } from './StatSection';
import { PlayerStatRow } from './PlayerStatRow';
import { TeamStatRow } from './TeamStatRow';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PlayerStat } from '@/types/playerStats';

const INITIAL_COUNT = 5;
const MAX_COUNT = 20;

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

function aggregateByTeam(players: PlayerStat[], cardKey: 'yellowCards' | 'redCards') {
  const map = new Map<number, { teamId: number; teamName: string; teamLogo: string; count: number }>();
  for (const p of players) {
    if (!map.has(p.teamId)) {
      map.set(p.teamId, { teamId: p.teamId, teamName: p.teamName, teamLogo: p.teamLogo, count: 0 });
    }
    map.get(p.teamId)!.count += p[cardKey];
  }
  return Array.from(map.values())
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_COUNT);
}

export function DisciplineTab() {
  const { t } = useTranslation();
  const { data: allPlayers, isLoading } = useTopYellowCards();

  const [yellowVisible, setYellowVisible] = useState(INITIAL_COUNT);
  const [teamYellowVisible, setTeamYellowVisible] = useState(INITIAL_COUNT);
  const [redVisible, setRedVisible] = useState(INITIAL_COUNT);
  const [teamRedVisible, setTeamRedVisible] = useState(INITIAL_COUNT);

  const topYellow = useMemo(
    () =>
      (allPlayers ?? [])
        .filter((p) => p.yellowCards > 0)
        .sort((a, b) => b.yellowCards - a.yellowCards)
        .slice(0, MAX_COUNT),
    [allPlayers]
  );
  const topRed = useMemo(
    () =>
      (allPlayers ?? [])
        .filter((p) => p.redCards > 0)
        .sort((a, b) => b.redCards - a.redCards)
        .slice(0, MAX_COUNT),
    [allPlayers]
  );

  const teamYellow = useMemo(() => (allPlayers ? aggregateByTeam(allPlayers, 'yellowCards') : []), [allPlayers]);
  const teamRed = useMemo(() => (allPlayers ? aggregateByTeam(allPlayers, 'redCards') : []), [allPlayers]);

  return (
    <View style={styles.container}>
      <StatSection title={t('stats.yellowCards')}>
        {isLoading ? (
          [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={64} style={styles.skeletonRow} />)
        ) : !topYellow.length ? (
          <EmptyState message={t('stats.noData')} />
        ) : [
          ...topYellow.slice(0, yellowVisible).map((p, i) => (
            <PlayerStatRow
              key={p.playerId}
              rank={i + 1}
              playerId={p.playerId}
              teamId={p.teamId}
              name={p.name}
              photo={p.photo}
              teamName={p.teamName}
              teamLogo={p.teamLogo}
              value={p.yellowCards}
              valueLabel={t('stats.cards')}
            />
          )),
          yellowVisible < topYellow.length ? (
            <ShowMoreButton key="btn" expanded={false} onPress={() => setYellowVisible(MAX_COUNT)} />
          ) : yellowVisible > INITIAL_COUNT ? (
            <ShowMoreButton key="btn" expanded={true} onPress={() => setYellowVisible(INITIAL_COUNT)} />
          ) : null,
        ]}
      </StatSection>

      {(isLoading || teamYellow.length > 0) && (
        <StatSection title={t('stats.teamYellowCards')}>
          {isLoading ? (
            [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={56} style={styles.skeletonRow} />)
          ) : [
            ...teamYellow.slice(0, teamYellowVisible).map((team, i) => (
              <TeamStatRow
                key={team.teamId}
                rank={i + 1}
                teamId={team.teamId}
                teamName={team.teamName}
                teamLogo={team.teamLogo}
                value={team.count}
                valueLabel={t('stats.cards')}
                valueColor='#F4C842'
              />
            )),
            teamYellowVisible < teamYellow.length ? (
              <ShowMoreButton key="btn" expanded={false} onPress={() => setTeamYellowVisible(MAX_COUNT)} />
            ) : teamYellowVisible > INITIAL_COUNT ? (
              <ShowMoreButton key="btn" expanded={true} onPress={() => setTeamYellowVisible(INITIAL_COUNT)} />
            ) : null,
          ]}
        </StatSection>
      )}

      <StatSection title={t('stats.redCards')}>
        {isLoading ? (
          [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={64} style={styles.skeletonRow} />)
        ) : !topRed.length ? (
          <EmptyState message={t('stats.noData')} />
        ) : [
          ...topRed.slice(0, redVisible).map((p, i) => (
            <PlayerStatRow
              key={p.playerId}
              rank={i + 1}
              playerId={p.playerId}
              teamId={p.teamId}
              name={p.name}
              photo={p.photo}
              teamName={p.teamName}
              teamLogo={p.teamLogo}
              value={p.redCards}
              valueLabel={t('stats.cards')}
              valueColor={colors.loss}
            />
          )),
          redVisible < topRed.length ? (
            <ShowMoreButton key="btn" expanded={false} onPress={() => setRedVisible(MAX_COUNT)} />
          ) : redVisible > INITIAL_COUNT ? (
            <ShowMoreButton key="btn" expanded={true} onPress={() => setRedVisible(INITIAL_COUNT)} />
          ) : null,
        ]}
      </StatSection>

      {(isLoading || teamRed.length > 0) && (
        <StatSection title={t('stats.teamRedCards')}>
          {isLoading ? (
            [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={56} style={styles.skeletonRow} />)
          ) : [
            ...teamRed.slice(0, teamRedVisible).map((team, i) => (
              <TeamStatRow
                key={team.teamId}
                rank={i + 1}
                teamId={team.teamId}
                teamName={team.teamName}
                teamLogo={team.teamLogo}
                value={team.count}
                valueLabel={t('stats.cards')}
                valueColor={colors.loss}
              />
            )),
            teamRedVisible < teamRed.length ? (
              <ShowMoreButton key="btn" expanded={false} onPress={() => setTeamRedVisible(MAX_COUNT)} />
            ) : teamRedVisible > INITIAL_COUNT ? (
              <ShowMoreButton key="btn" expanded={true} onPress={() => setTeamRedVisible(INITIAL_COUNT)} />
            ) : null,
          ]}
        </StatSection>
      )}
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
