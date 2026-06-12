import { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface Props {
  uri?: string | null;
  size: number;
  radius?: number;
  backgroundColor?: string;
}

export function PlayerAvatar({ uri, size, radius, backgroundColor }: Props) {
  const [failed, setFailed] = useState(false);
  const br = radius ?? size / 2;
  const bg = backgroundColor ?? colors.surfaceElevated;
  const iconSize = Math.round(size * 0.55);

  const showFallback = !uri || failed;

  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: br, backgroundColor: bg },
      ]}
    >
      {showFallback ? (
        <Ionicons name="person" size={iconSize} color={colors.textMuted} />
      ) : (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: br }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
