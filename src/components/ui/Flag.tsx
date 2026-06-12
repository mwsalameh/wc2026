import { Image, StyleSheet, View } from 'react-native';
import { getFlagUrl } from '@/utils/flagUrl';
import { colors, radius } from '@/constants/theme';

const SIZE = { sm: 20, md: 28, lg: 44 } as const;

interface FlagProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Flag({ countryCode, size = 'md' }: FlagProps) {
  const dim = SIZE[size];
  const wrapStyle = [styles.wrapper, { width: dim * 1.4, height: dim, borderRadius: radius.sm }];

  if (!countryCode) {
    return <View style={wrapStyle} />;
  }

  return (
    <View style={wrapStyle}>
      <Image
        source={{ uri: getFlagUrl(countryCode, size) }}
        style={[styles.image, { borderRadius: radius.sm }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { overflow: 'hidden', backgroundColor: colors.border },
  image: { width: '100%', height: '100%' },
});
