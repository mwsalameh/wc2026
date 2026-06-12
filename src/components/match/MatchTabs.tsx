import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';

export type MatchTab = 'overview' | 'lineups' | 'stats';

interface MatchTabsProps {
  activeTab: MatchTab;
  onTabChange: (tab: MatchTab) => void;
}

const TABS: { key: MatchTab; labelKey: string }[] = [
  { key: 'overview', labelKey: 'match.overview' },
  { key: 'lineups', labelKey: 'match.lineups' },
  { key: 'stats', labelKey: 'match.stats' },
];

export function MatchTabs({ activeTab, onTabChange }: MatchTabsProps) {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const displayTabs = isRTL ? [...TABS].reverse() : TABS;

  return (
    <View style={styles.container}>
      {displayTabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabChange(tab.key)}
            hitSlop={8}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.gold,
  },
  label: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  activeLabel: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
  },
});
