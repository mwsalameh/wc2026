import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { BracketTree } from '@/components/bracket/BracketTree';
import { useBracketData } from '@/hooks/useBracketData';

export default function BracketScreen() {
  const { t } = useTranslation();
  const bracketData = useBracketData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <ScreenHeader title={t('bracket.title')} />
      </View>
      <BracketTree
        r32={bracketData.r32}
        r16={bracketData.r16}
        qf={bracketData.qf}
        sf={bracketData.sf}
        final={bracketData.final}
        thirdPlace={bracketData.thirdPlace}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerWrapper: {},
});
