import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useRTL } from '@/hooks/useRTL';

interface Props {
  title: string;
  children: React.ReactNode;
}

export function StatSection({ title, children }: Props) {
  const { textAlign } = useRTL();
  const childArray = React.Children.toArray(children);

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { textAlign }]}>{title}</Text>
      <View style={styles.card}>
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childArray.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  title: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});
