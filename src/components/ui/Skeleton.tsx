import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.skeleton, { width: width as any, height, opacity, borderRadius: radius.sm }, style]}
    />
  );
}

export function SkeletonGroupCard() {
  return (
    <View style={styles.card}>
      <Skeleton width={60} height={14} style={{ marginBottom: 8 }} />
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={20} height={14} />
          <Skeleton width={80} height={14} style={{ marginHorizontal: 8 }} />
          <Skeleton width={20} height={14} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: colors.border },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
