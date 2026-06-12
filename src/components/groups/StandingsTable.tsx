import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StandingsRow } from './StandingsRow';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import type { Standing } from '@/types/group';

interface StandingsTableProps {
  standings: Standing[];
}

function HeaderCell({ label, wide }: { label: string; wide?: boolean }) {
  return (
    <Text style={[styles.headerCell, wide && styles.wide]}>{label}</Text>
  );
}

export function StandingsTable({ standings }: StandingsTableProps) {
  const { t } = useTranslation();
  const { rowDir } = useRTL();

  const statHeaders = [
    t('standings.played'),
    t('standings.won'),
    t('standings.drawn'),
    t('standings.lost'),
    t('standings.gd'),
    t('standings.points'),
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { flexDirection: rowDir }]}>
        <Text style={styles.posHeader}>#</Text>
        <Text style={styles.teamHeader}>{' '}</Text>
        {statHeaders.map((label, i) => (
          <HeaderCell key={i} label={label} wide={i === statHeaders.length - 1} />
        ))}
      </View>
      {standings.map((s, i) => (
        <StandingsRow key={s.team.id} standing={s} isLast={i === standings.length - 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 4,
    paddingRight: spacing.sm,
  },
  posHeader: {
    width: 31,
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  teamHeader: { flex: 1, marginLeft: 38 },
  headerCell: {
    width: 28,
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  wide: { width: 36 },
});
