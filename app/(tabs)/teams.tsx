import { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';
import { useTeamsList, type TeamListItem } from '@/hooks/useTeamsList';
import { useTeamName } from '@/hooks/useTeamName';
import { useLanguageStore } from '@/store/languageStore';
import { getTeamNameAr } from '@/constants/teamNamesAr';
import { useRTL } from '@/hooks/useRTL';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

function TeamRow({ item }: { item: TeamListItem }) {
  const { t } = useTranslation();
  const name = useTeamName(item.team.name);
  const { rowDir, isRTL, textAlign } = useRTL();
  return (
    <Pressable
      style={({ pressed }) => [styles.row, { flexDirection: rowDir }, pressed && { opacity: 0.75 }]}
      onPress={() => router.push(`/team/${item.team.id}`)}
    >
      <Image source={{ uri: item.team.logoUrl }} style={styles.logo} resizeMode="contain" />
      <View style={styles.rowContent}>
        <Text style={[styles.teamName, { textAlign }]}>{name}</Text>
        <Text style={[styles.groupLabel, { textAlign }]}>{t('groups.group', { id: item.groupId })}</Text>
      </View>
      <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.textMuted} />
    </Pressable>
  );
}

export default function TeamsScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const { teams, isLoading, isError, refetch } = useTeamsList();
  const { language } = useLanguageStore();
  const { isRTL } = useRTL();

  const filtered = useMemo(() => {
    if (!query.trim()) return teams;
    const q = query.trim().toLowerCase();
    return teams.filter((item) => {
      if (item.team.name.toLowerCase().includes(q)) return true;
      return getTeamNameAr(item.team.name).includes(q);
    });
  }, [teams, query, language]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('teams.title')} />
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('teams.search')}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          textAlign={isRTL ? 'right' : 'left'}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {isError ? (
        <ErrorBanner onRetry={refetch} />
      ) : isLoading ? (
        <View style={styles.skeletons}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} height={60} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.team.id)}
          renderItem={({ item }) => <TeamRow item={item} />}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('teams.noResults')}</Text>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchIcon: { flexShrink: 0 },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    height: 44,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    minHeight: 60,
  },
  logo: { width: 36, height: 36 },
  rowContent: { flex: 1, gap: 2 },
  teamName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
  },
  groupLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  skeletons: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
});
