import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { useTeamStats } from '@/hooks/usePlayerStats';
import { StatSection } from './StatSection';
import { TeamStatRow } from './TeamStatRow';
import { Skeleton } from '@/components/ui/Skeleton';

function EmptyState({ message }: { message: string }) {
  const { textAlign } = useRTL();
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { textAlign }]}>{message}</Text>
    </View>
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

function LoadingSection({ title }: { title: string }) {
  return (
    <StatSection title={title}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} height={56} style={styles.skeletonRow} />
      ))}
    </StatSection>
  );
}

export function TeamsTab() {
  const { t } = useTranslation();
  const { teams, isLoading } = useTeamStats();

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

  const byGoalsFor = [...teams].filter((t) => t.goalsFor >= 1).sort((a, b) => b.goalsFor - a.goalsFor).slice(0, 10);
  const byGoalsAgainst = [...teams].filter((t) => t.goalsAgainst >= 1).sort((a, b) => b.goalsAgainst - a.goalsAgainst).slice(0, 10);
  const byGD = [...teams].filter((t) => t.goalDifference !== 0).sort((a, b) => b.goalDifference - a.goalDifference).slice(0, 10);
  const byCleanSheets = [...teams].filter((t) => t.cleanSheets > 0).sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, 10);

  return (
    <View style={styles.container}>
      <StatSection title={t('stats.highestScoringTeams')}>
        {byGoalsFor.map((team, i) => (
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
      </StatSection>

      <StatSection title={t('stats.mostGoalsConceded')}>
        {byGoalsAgainst.map((team, i) => (
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
      </StatSection>

      <StatSection title={t('stats.bestGoalDifference')}>
        {byGD.map((team, i) => (
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
      </StatSection>

      {byCleanSheets.length > 0 && (
        <StatSection title={t('stats.cleanSheets')}>
          {byCleanSheets.map((team, i) => (
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
});
