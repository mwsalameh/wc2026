import { useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Stack } from 'expo-router';
import { auth } from '@/lib/firebase';
import { useAllFixtures } from '@/hooks/useFixtures';
import { useOfficialPotmMap, getOfficialPlayerId } from '@/hooks/useFirebasePotm';
import { useRequestBudgetStore } from '@/store/requestBudgetStore';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { formatKickoffFull } from '@/utils/dateTime';

const DAILY_LIMIT = __DEV__ ? 500 : 100;

export default function AdminIndex() {
  const { data: fixtures } = useAllFixtures();
  const potmMap = useOfficialPotmMap();
  const { count, date, reset } = useRequestBudgetStore();

  const handleResetBudget = () => {
    Alert.alert(
      'Reset API Budget',
      `Current usage: ${count}/${DAILY_LIMIT} (${date})\n\nThis resets the daily request counter to 0 so the app can make API calls again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: reset },
      ]
    );
  };

  const completedMatches = useMemo(
    () =>
      (fixtures ?? [])
        .filter((m) => ['FT', 'AET', 'PEN'].includes(m.status))
        .sort((a, b) => new Date(b.kickoffUtc).getTime() - new Date(a.kickoffUtc).getTime()),
    [fixtures]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Player of the Match' }} />
      <View style={styles.container}>
        <FlatList
          data={completedMatches}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.budgetCard}>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>API Budget ({date})</Text>
                <Text style={[styles.budgetCount, count >= DAILY_LIMIT && styles.budgetExhausted]}>
                  {count} / {DAILY_LIMIT}
                </Text>
              </View>
              <View style={styles.budgetBarBg}>
                <View style={[styles.budgetBarFill, { width: `${Math.min(count / DAILY_LIMIT * 100, 100)}%` as any }, count >= DAILY_LIMIT && styles.budgetBarExhausted]} />
              </View>
              <Pressable style={styles.resetBudgetBtn} onPress={handleResetBudget}>
                <Text style={styles.resetBudgetText}>Reset Budget Counter</Text>
              </Pressable>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No completed matches yet.</Text>
          }
          ListFooterComponent={
            <Pressable style={styles.signOutBtn} onPress={() => signOut(auth)}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          }
          renderItem={({ item: m }) => {
            const isSet = getOfficialPlayerId(potmMap, m.id) !== null;
            return (
              <Pressable
                style={[styles.row, isSet && styles.rowSet]}
                onPress={() => router.push(`/admin/potm/${m.id}` as any)}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.teams}>
                    {m.homeTeam.name}  vs  {m.awayTeam.name}
                  </Text>
                  <Text style={styles.score}>
                    {m.score.home} – {m.score.away}
                    {'  ·  '}
                    {formatKickoffFull(m.kickoffUtc, 'en')}
                  </Text>
                </View>
                <Text style={[styles.badge, isSet && styles.badgeSet]}>
                  {isSet ? '✓ Set' : 'Not set'}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  rowSet: {
    borderColor: colors.gold,
  },
  rowLeft: {
    flex: 1,
    gap: 3,
  },
  teams: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
  },
  score: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
  },
  badge: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
  },
  badgeSet: {
    color: colors.gold,
  },
  budgetCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  budgetCount: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
  },
  budgetExhausted: {
    color: '#EF4444',
  },
  budgetBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 3,
  },
  budgetBarExhausted: {
    backgroundColor: '#EF4444',
  },
  resetBudgetBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 2,
  },
  resetBudgetText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  signOutBtn: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
});
