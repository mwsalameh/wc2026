import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { default: IconName; focused: IconName }> = {
  index:      { default: 'home-outline',      focused: 'home' },
  groups:     { default: 'grid-outline',      focused: 'grid' },
  bracket:    { default: 'trophy-outline',    focused: 'trophy' },
  teams:      { default: 'shirt-outline',     focused: 'shirt' },
  statistics: { default: 'bar-chart-outline', focused: 'bar-chart' },
};

const TAB_LABEL_KEYS: Record<string, string> = {
  index:      'tabs.home',
  groups:     'tabs.groups',
  bracket:    'tabs.bracket',
  teams:      'tabs.teams',
  statistics: 'tabs.statistics',
};

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const { isRTL } = useRTL();

  const orderedRoutes = isRTL ? [...state.routes].reverse() : [...state.routes];

  return (
    <View style={styles.bar}>
      {orderedRoutes.map((route) => {
        const originalIndex = state.routes.findIndex((r) => r.key === route.key);
        const isFocused = state.index === originalIndex;
        const icons = TAB_ICONS[route.name];
        const labelKey = TAB_LABEL_KEYS[route.name];
        if (!icons || !labelKey) return null;

        const color = isFocused ? colors.tabActive : colors.tabInactive;

        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          >
            <Ionicons name={isFocused ? icons.focused : icons.default} size={24} color={color} />
            <Text style={[styles.label, { color }]}>{t(labelKey)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
  },
});
