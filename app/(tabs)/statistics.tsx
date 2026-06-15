import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { PlayersTab } from '@/components/statistics/PlayersTab';
import { PotmTab } from '@/components/statistics/PotmTab';
import { TeamsTab } from '@/components/statistics/TeamsTab';
import { DisciplineTab } from '@/components/statistics/DisciplineTab';

const TABS = ['players', 'potm', 'teams', 'discipline'] as const;
type StatTab = typeof TABS[number];

export default function StatisticsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<StatTab>('players');
  const { rowDir, textAlign } = useRTL();

  const tabLabels: Record<StatTab, string> = {
    players: t('stats.players'),
    potm: t('stats.potmTab'),
    teams: t('stats.teams'),
    discipline: t('stats.discipline'),
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('stats.title')} />

      <View style={[styles.tabBar, { flexDirection: rowDir }]}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive, { textAlign }]}
              numberOfLines={1}
            >
              {tabLabels[tab]}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {activeTab === 'players' && <PlayersTab />}
        {activeTab === 'potm' && <PotmTab />}
        {activeTab === 'teams' && <TeamsTab />}
        {activeTab === 'discipline' && <DisciplineTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: colors.gold,
  },
  tabLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  tabLabelActive: {
    color: colors.background,
    fontFamily: fontFamily.bodySemiBold,
  },
  content: { flex: 1, paddingTop: spacing.md },
});
