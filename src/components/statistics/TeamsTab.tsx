import { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { useTeamStats } from '@/hooks/usePlayerStats';
import { StatSection } from './StatSection';
import { TeamStatRow } from './TeamStatRow';
import { Skeleton } from '@/components/ui/Skeleton';

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

function LoadingSection({ title }: { title: string }) {
  return (
    <StatSection title={title}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} height={56} style={styles.skeletonRow} />
      ))}
    </StatSection>
  );
}

function gdColor(gd: number) {
  if (gd > 0) return colors.win;
  if (gd < 0) return colors.loss;
  return colors.textMuted;
}

function formatGD(gd: number) {
  return gd > 0 ? `+${gd}` : `${gd}`;
}

export function TeamsTab() {
  const { t } = useTranslation();
  const { teams, isLoading } = useTeamStats();

  const [scoringVisible, setScoringVisible] = useState(INITIAL_COUNT);
  const [concededVisible, setConcededVisible] = useState(INITIAL_COUNT);
  const [gdVisible, setGdVisible] = useState(INITIAL_COUNT);
  const [cleanVisible, setCleanVisible] = useState(INITIAL_COUNT);

  const byGoalsFor = useMemo(
    () => [...teams].filter((t) => t.goalsFor >= 1).sort((a, b) => b.goalsFor - a.goalsFor).slice(0, MAX_COUNT),
    [teams]
  );
  const byGoalsAgainst = useMemo(
    () => [...teams].filter((t) => t.goalsAgainst >= 1).sort((a, b) => b.goalsAgainst - a.goalsAgainst).slice(0, MAX_COUNT),
    [teams]
  );
  const byGD = useMemo(
    () => [...teams].filter((t) => t.goalDifference !== 0).sort((a, b) => b.goalDifference - a.goalDifference).slice(0, MAX_COUNT),
    [teams]
  );
  const byCleanSheets = useMemo(
    () => [...teams].filter((t) => t.cleanSheets > 0).sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, MAX_COUNT),
    [teams]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSection title={t('stats.highestScoringTeams')} />
        <LoadingSection title={t('stats.mostGoalsConceded')} />
      </View>
    );
  }

  if (!teams.length) {
    return (
      <View style={styles.container}>
        <EmptyState message={t('stats.noData')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatSection title={t('stats.highestScoringTeams')}>
        {byGoalsFor.slice(0, scoringVisible).map((team, i) => (
          <TeamStatRow
            key={team.teamId}
            rank={i + 1}
            teamId={team.teamId}
            teamName={team.teamName}
            teamLogo={team.teamLogo}
            value={team.goalsFor}
            valueLabel={t('stats.goals')}
          />
        ))}
        {scoringVisible < byGoalsFor.length ? (
          <ShowMoreButton expanded={false} onPress={() => setScoringVisible(MAX_COUNT)} />
        ) : scoringVisible > INITIAL_COUNT ? (
          <ShowMoreButton expanded={true} onPress={() => setScoringVisible(INITIAL_COUNT)} />
        ) : null}
      </StatSection>

      <StatSection title={t('stats.mostGoalsConceded')}>
        {byGoalsAgainst.slice(0, concededVisible).map((team, i) => (
          <TeamStatRow
            key={team.teamId}
            rank={i + 1}
            teamId={team.teamId}
            teamName={team.teamName}
            teamLogo={team.teamLogo}
            value={team.goalsAgainst}
            valueLabel={t('stats.goals')}
            valueColor={colors.loss}
          />
        ))}
        {concededVisible < byGoalsAgainst.length ? (
          <ShowMoreButton expanded={false} onPress={() => setConcededVisible(MAX_COUNT)} />
        ) : concededVisible > INITIAL_COUNT ? (
          <ShowMoreButton expanded={true} onPress={() => setConcededVisible(INITIAL_COUNT)} />
        ) : null}
      </StatSection>

      <StatSection title={t('stats.bestGoalDifference')}>
        {byGD.slice(0, gdVisible).map((team, i) => (
          <TeamStatRow
            key={team.teamId}
            rank={i + 1}
            teamId={team.teamId}
            teamName={team.teamName}
            teamLogo={team.teamLogo}
            value={formatGD(team.goalDifference)}
            valueLabel={t('stats.gd')}
            valueColor={gdColor(team.goalDifference)}
          />
        ))}
        {gdVisible < byGD.length ? (
          <ShowMoreButton expanded={false} onPress={() => setGdVisible(MAX_COUNT)} />
        ) : gdVisible > INITIAL_COUNT ? (
          <ShowMoreButton expanded={true} onPress={() => setGdVisible(INITIAL_COUNT)} />
        ) : null}
      </StatSection>

      {byCleanSheets.length > 0 && (
        <StatSection title={t('stats.cleanSheets')}>
          {byCleanSheets.slice(0, cleanVisible).map((team, i) => (
            <TeamStatRow
              key={team.teamId}
              rank={i + 1}
              teamId={team.teamId}
              teamName={team.teamName}
              teamLogo={team.teamLogo}
              value={team.cleanSheets}
              valueLabel={t('stats.cleanSheets')}
            />
          ))}
          {cleanVisible < byCleanSheets.length ? (
            <ShowMoreButton expanded={false} onPress={() => setCleanVisible(MAX_COUNT)} />
          ) : cleanVisible > INITIAL_COUNT ? (
            <ShowMoreButton expanded={true} onPress={() => setCleanVisible(INITIAL_COUNT)} />
          ) : null}
        </StatSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xxl },
  empty: { padding: spacing.xxl, alignItems: 'center' },
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
