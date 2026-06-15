import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { BackHeader } from '@/components/ui/BackHeader';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  labelKey: 'about' | 'privacy' | 'terms' | 'contact';
  icon: IoniconsName;
  route: '/about' | '/privacy' | '/terms' | '/contact';
}

const MENU_ITEMS: MenuItem[] = [
  { labelKey: 'about',   icon: 'information-circle-outline', route: '/about'   },
  { labelKey: 'privacy', icon: 'shield-checkmark-outline',   route: '/privacy' },
  { labelKey: 'terms',   icon: 'document-text-outline',      route: '/terms'   },
  { labelKey: 'contact', icon: 'mail-outline',               route: '/contact' },
];

export default function InfoScreen() {
  const { t } = useTranslation();
  const { isRTL, rowDir } = useRTL();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackHeader title={t('info.menuTitle')} />

      <View style={styles.list}>
        {MENU_ITEMS.map((item, index) => (
          <Pressable
            key={item.labelKey}
            style={({ pressed }) => [
              styles.row,
              { flexDirection: rowDir },
              pressed && styles.pressed,
              index < MENU_ITEMS.length - 1 && styles.rowBorder,
            ]}
            onPress={() => router.push(item.route)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={20} color={colors.gold} />
            </View>
            <Text style={[styles.label, { flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>
              {t(`info.${item.labelKey}`)}
            </Text>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={16}
              color={colors.textMuted}
            />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.6 },
  iconWrap: {
    width: 32,
    alignItems: 'center',
  },
  label: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.body,
  },
});
