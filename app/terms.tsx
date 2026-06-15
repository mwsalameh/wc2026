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
    intro: 'By using WC 2026, you agree to the following terms and conditions. Please read them carefully.',
    sections: [
      {
        title: 'Personal Use',
        body: 'This app is provided for personal, non-commercial use only. You may not distribute, modify, or use the app or its content for commercial purposes.',
      },
      {
        title: 'Content Accuracy',
        body: 'While we strive to provide accurate and timely information, match data is sourced from third-party providers and may not always reflect the latest results. We do not guarantee the completeness or accuracy of any data shown.',
      },
      {
        title: 'No Affiliation',
        body: 'WC 2026 is an independent application and is not affiliated with, sponsored by, or endorsed by FIFA, the United States Soccer Federation, Canada Soccer, the Mexican Football Federation, or any national football federation or club.',
      },
      {
        title: 'Intellectual Property',
        body: 'Team names, logos, and other football-related imagery remain the intellectual property of their respective organizations and are displayed for identification purposes only.',
      },
      {
        title: 'Limitation of Liability',
        body: 'The developer of this app is not liable for any inaccuracies, omissions, or errors in the content provided, or for any losses or damages arising from your use of the app.',
      },
      {
        title: 'Contact',
        body: 'For questions about these terms, contact us at: muhanad.wael.salameh@gmail.com',
      },
    ],
  },
  ar: {
    updated: 'آخر تحديث: يونيو 2026',
    intro: 'باستخدامك لتطبيق كأس العالم 2026، فأنت توافق على الشروط والأحكام التالية. يُرجى قراءتها بعناية.',
    sections: [
      {
        title: 'الاستخدام الشخصي',
        body: 'هذا التطبيق مُقدَّم للاستخدام الشخصي غير التجاري فقط. لا يجوز توزيع التطبيق أو تعديله أو استخدامه أو استخدام محتواه لأغراض تجارية.',
      },
      {
        title: 'دقة المحتوى',
        body: 'نسعى جاهدين لتقديم معلومات دقيقة وحديثة، إلا أن بيانات المباريات مصدرها جهات خارجية وقد لا تعكس دائماً أحدث النتائج. لا نضمن اكتمال أو دقة البيانات المعروضة.',
      },
      {
        title: 'عدم الانتساب',
        body: 'تطبيق كأس العالم 2026 تطبيق مستقل وغير مرتبط بـ FIFA أو الاتحاد الأمريكي لكرة القدم أو Canada Soccer أو الاتحاد المكسيكي لكرة القدم أو أي اتحاد وطني أو نادٍ، كما أنه لا يحظى برعايتهم أو تأييدهم.',
      },
      {
        title: 'الملكية الفكرية',
        body: 'أسماء المنتخبات وشعاراتها وسائر الصور المرتبطة بكرة القدم هي ملك فكري لأصحابها المعنيين وتُعرض لأغراض التعريف فقط.',
      },
      {
        title: 'حدود المسؤولية',
        body: 'مطوِّر هذا التطبيق غير مسؤول عن أي معلومات غير دقيقة أو ثغرات أو أخطاء في المحتوى المقدَّم، أو عن أي خسائر أو أضرار ناجمة عن استخدامك للتطبيق.',
      },
      {
        title: 'تواصل معنا',
        body: 'للاستفسار عن هذه الشروط، تواصل معنا على: muhanad.wael.salameh@gmail.com',
      },
    ],
  },
};

export default function TermsScreen() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { textAlign } = useRTL();
  const c = CONTENT[language as 'en' | 'ar'] ?? CONTENT.en;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackHeader title={t('info.terms')} />
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
