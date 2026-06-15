import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/store/languageStore';
import { useRTL } from '@/hooks/useRTL';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { BackHeader } from '@/components/ui/BackHeader';

const CONTENT = {
  en: {
    tagline: 'Your unofficial companion for the 2026 FIFA World Cup',
    featuresTitle: 'Features',
    features: [
      'Live scores & match events',
      'Full match schedules',
      'Group stage standings',
      'Knockout bracket',
      'Team squads & coaching staff',
      'Player & team statistics',
    ],
    hostTitle: 'Host Countries',
    host: 'United States · Canada · Mexico',
    dataTitle: 'Data Source',
    data: 'Match data provided by API-Football (api-football.com).',
    disclaimer: 'This app is not affiliated with, sponsored by, or endorsed by FIFA or any national football federation.',
    version: 'Version 1.0.0',
  },
  ar: {
    tagline: 'رفيقك غير الرسمي لكأس العالم FIFA 2026',
    featuresTitle: 'المميزات',
    features: [
      'نتائج مباشرة وأحداث المباريات',
      'جداول المباريات الكاملة',
      'ترتيب دور المجموعات',
      'أدوار خروج المغلوب',
      'قوائم المنتخبات والطاقم التدريبي',
      'إحصائيات اللاعبين والمنتخبات',
    ],
    hostTitle: 'الدول المضيفة',
    host: 'الولايات المتحدة · كندا · المكسيك',
    dataTitle: 'مصدر البيانات',
    data: 'بيانات المباريات مقدَّمة من API-Football (api-football.com).',
    disclaimer: 'هذا التطبيق غير تابع لـ FIFA أو أي اتحاد كرة قدم وطني، ولا يحظى برعايتهم أو تأييدهم.',
    version: 'الإصدار 1.0.0',
  },
} as const;

export default function AboutScreen() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { isRTL, textAlign } = useRTL();
  const c = CONTENT[language as 'en' | 'ar'] ?? CONTENT.en;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackHeader title={t('info.about')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* App identity */}
        <View style={styles.heroSection}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>WC</Text>
            <Text style={styles.logoYear}>2026</Text>
          </View>
          <Text style={[styles.tagline, { textAlign }]}>{c.tagline}</Text>
        </View>

        {/* Features */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{c.featuresTitle}</Text>
          {c.features.map((f) => (
            <View key={f} style={[styles.featureRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.bullet}>•</Text>
              <Text style={[styles.featureText, { textAlign }]}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Host */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{c.hostTitle}</Text>
          <Text style={[styles.bodyText, { textAlign }]}>{c.host}</Text>
        </View>

        {/* Data source */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{c.dataTitle}</Text>
          <Text style={[styles.bodyText, { textAlign }]}>{c.data}</Text>
        </View>

        {/* Disclaimer */}
        <Text style={[styles.disclaimer, { textAlign }]}>{c.disclaimer}</Text>

        {/* Version */}
        <Text style={styles.version}>{c.version}</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  heroSection: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.gold,
    fontFamily: fontFamily.display,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: 2,
  },
  logoYear: {
    color: colors.gold,
    fontFamily: fontFamily.display,
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 1,
  },
  tagline: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.body,
    textAlign: 'center',
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  featureRow: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  bullet: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  featureText: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  bodyText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    lineHeight: 22,
  },

  disclaimer: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
    lineHeight: 20,
    textAlign: 'center',
  },
  version: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
