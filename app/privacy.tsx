import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/store/languageStore';
import { useRTL } from '@/hooks/useRTL';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { BackHeader } from '@/components/ui/BackHeader';

interface Section {
  title: string;
  body: string;
}

interface Content {
  updated: string;
  intro: string;
  sections: Section[];
}

const CONTENT: Record<'en' | 'ar', Content> = {
  en: {
    updated: 'Last updated: June 2026',
    intro: 'WC 2026 is designed with your privacy in mind. We do not collect, store, or share any personal information.',
    sections: [
      {
        title: 'Information We Collect',
        body: 'This app does not collect any personal information. No account registration or sign-in is required to use the app.',
      },
      {
        title: 'Local Storage',
        body: 'The app stores only your language preference (Arabic or English) locally on your device. This data never leaves your device and is not shared with anyone.',
      },
      {
        title: 'Third-Party Services',
        body: 'Match data, team information, and statistics are fetched from API-Football (api-football.com). Their own privacy policy governs how they handle data on their end.',
      },
      {
        title: 'Analytics & Tracking',
        body: 'This app does not use any analytics, advertising, or user-tracking services.',
      },
      {
        title: 'Contact',
        body: 'For any privacy-related questions, please contact us at: muhanad.wael.salameh@gmail.com',
      },
    ],
  },
  ar: {
    updated: 'آخر تحديث: يونيو 2026',
    intro: 'تطبيق كأس العالم 2026 مُصمَّم مع مراعاة خصوصيتك. نحن لا نجمع أي بيانات شخصية أو نخزنها أو نشاركها.',
    sections: [
      {
        title: 'المعلومات التي نجمعها',
        body: 'هذا التطبيق لا يجمع أي معلومات شخصية. لا يلزم إنشاء حساب أو تسجيل الدخول لاستخدام التطبيق.',
      },
      {
        title: 'التخزين المحلي',
        body: 'يُخزِّن التطبيق فقط تفضيلك للغة (العربية أو الإنجليزية) محلياً على جهازك. هذه البيانات لا تغادر جهازك ولا تُشارَك مع أي جهة.',
      },
      {
        title: 'خدمات الطرف الثالث',
        body: 'بيانات المباريات ومعلومات المنتخبات والإحصائيات مقدَّمة من API-Football (api-football.com). تنطبق سياسة الخصوصية الخاصة بهم على البيانات من جانبهم.',
      },
      {
        title: 'التحليلات والتتبع',
        body: 'لا يستخدم هذا التطبيق أي خدمات تحليلات أو إعلانات أو تتبع للمستخدمين.',
      },
      {
        title: 'تواصل معنا',
        body: 'لأي استفسارات تتعلق بالخصوصية، يُرجى التواصل معنا على: muhanad.wael.salameh@gmail.com',
      },
    ],
  },
};

export default function PrivacyScreen() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { textAlign } = useRTL();
  const c = CONTENT[language as 'en' | 'ar'] ?? CONTENT.en;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackHeader title={t('info.privacy')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={[styles.updated, { textAlign }]}>{c.updated}</Text>
        <Text style={[styles.intro, { textAlign }]}>{c.intro}</Text>

        {c.sections.map((s) => (
          <View key={s.title} style={styles.card}>
            <Text style={[styles.sectionTitle, { textAlign }]}>{s.title}</Text>
            <Text style={[styles.bodyText, { textAlign }]}>{s.body}</Text>
          </View>
        ))}

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
  updated: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
  intro: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.body,
    lineHeight: 24,
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
  },
  bodyText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    lineHeight: 24,
  },
});
