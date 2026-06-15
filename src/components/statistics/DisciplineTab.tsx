import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { useTopYellowCards } from '@/hooks/usePlayerStats';
import { StatSection } from './StatSection';
import { PlayerStatRow } from './PlayerStatRow';
import { TeamStatRow } from './TeamStatRow';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PlayerStat } from '@/types/playerStats';

function EmptyState({ message }: { message: string }) {
  const { textAlign } = useRTL();
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { textAlign }]}>{message}</Text>
    </View>
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
    .slice(0, 10);
}

export function DisciplineTab() {
  const { t } = useTranslation();
  const { data: allPlayers, isLoading } = useTopYellowCards();

  // Derive filtered lists from the shared all-players dataset
  const topYellow = useMemo(
    () =>
      (allPlayers ?? [])
        .filter((p) => p.yellowCards > 0)
        .sort((a, b) => b.yellowCards - a.yellowCards)
        .slice(0, 10),
    [allPlayers]
  );
  const topRed = useMemo(
    () =>
      (allPlayers ?? [])
        .filter((p) => p.redCards > 0)
        .sort((a, b) => b.redCards - a.redCards)
        .slice(0, 10),
    [allPlayers]
  );

  // Team aggregation uses ALL players (comprehensive, no cutoff)
  const teamYellow = useMemo(() => (allPlayers ? aggregateByTeam(allPlayers, 'yellowCards') : []), [allPlayers]);
  const teamRed = useMemo(() => (allPlayers ? aggregateByTeam(allPlayers, 'redCards') : []), [allPlayers]);

  return (
    <View style={styles.container}>
      <StatSection title={t('stats.yellowCards')}>
        {isLoading ? (
          [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={64} style={styles.skeletonRow} />)
        ) : !topYellow.length ? (
          <EmptyState message={t('stats.noData')} />
        ) : (
          topYellow.map((p, i) => (
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
          ))
        )}
      </StatSection>

      {teamYellow.length > 0 && (
        <StatSection title={t('stats.teamYellowCards')}>
          {teamYellow.map((team, i) => (
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
          ))}
        </StatSection>
      )}

      <StatSection title={t('stats.redCards')}>
        {isLoading ? (
          [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={64} style={styles.skeletonRow} />)
        ) : !topRed.length ? (
          <EmptyState message={t('stats.noData')} />
        ) : (
          topRed.map((p, i) => (
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
          ))
        )}
      </StatSection>

      {teamRed.length > 0 && (
        <StatSection title={t('stats.teamRedCards')}>
          {teamRed.map((team, i) => (
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
          ))}
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
});
