import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';
import { HomeButton } from './ScreenHeader';

interface BackHeaderProps {
  title: string;
}

export function BackHeader({ title }: BackHeaderProps) {
  const { isRTL, rowDir } = useRTL();
  return (
    <View style={[styles.container, { flexDirection: rowDir }]}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
        <Ionicons
          name={isRTL ? 'arrow-forward' : 'arrow-back'}
          size={22}
          color={colors.white}
        />
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <HomeButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    alignItems: 'flex-start',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
    textAlign: 'center',
  },
});
