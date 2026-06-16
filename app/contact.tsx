import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '@/store/languageStore';
import { useRTL } from '@/hooks/useRTL';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { BackHeader } from '@/components/ui/BackHeader';

const EMAIL = 'muhanad.wael.salameh@gmail.com';

const CONTENT = {
  en: {
    intro: 'Have a question, suggestion, or found a bug? We\'d love to hear from you.',
    button: 'Send Email',
    or: 'or copy the address below',
  },
  ar: {
    intro: 'هل لديك سؤال أو اقتراح أو اكتشفت خللاً في التطبيق؟ يسعدنا سماعك.',
    button: 'إرسال بريد إلكتروني',
    or: 'أو انسخ العنوان أدناه',
  },
} as const;

export default function ContactScreen() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { textAlign } = useRTL();
  const c = CONTENT[language as 'en' | 'ar'] ?? CONTENT.en;

  const handleEmail = () => {
    Linking.openURL(`mailto:${EMAIL}?subject=WC26 Match Center App`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackHeader title={t('info.contact')} />

      <View style={styles.body}>
        <Ionicons name="mail-outline" size={48} color={colors.gold} />

        <Text style={[styles.intro, { textAlign }]}>{c.intro}</Text>

        <Pressable
          style={({ pressed }) => [styles.emailBtn, pressed && styles.emailBtnPressed]}
          onPress={handleEmail}
        >
          <Ionicons name="send-outline" size={18} color={colors.background} />
          <Text style={styles.emailBtnText}>{c.button}</Text>
        </Pressable>

        <Text style={[styles.or, { textAlign: 'center' }]}>{c.or}</Text>

        <View style={styles.emailBox}>
          <Text style={styles.emailAddress} selectable>{EMAIL}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  intro: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.body,
    lineHeight: 24,
    textAlign: 'center',
  },

  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  emailBtnPressed: { opacity: 0.75 },
  emailBtnText: {
    color: colors.background,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
  },

  or: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },

  emailBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  emailAddress: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
});
