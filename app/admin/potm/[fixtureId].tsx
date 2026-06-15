import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchFixturePlayers } from '@/api/fixtures';
import { useAllFixtures } from '@/hooks/useFixtures';
import { useOfficialPotmMap, getOfficialPlayerId, saveOfficialPotm } from '@/hooks/useFirebasePotm';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';

interface PlayerRow {
  playerId: number;
  name: string;
  photo: string;
  teamName: string;
  teamLogo: string;
  rating: number;
  minutes: number;
}

export default function AdminPotmSelector() {
  const { fixtureId: paramStr } = useLocalSearchParams<{ fixtureId: string }>();
  const fixtureId = Number(paramStr);
  const [saving, setSaving] = useState(false);

  const { data: fixtures } = useAllFixtures();
  const match = fixtures?.find((m) => m.id === fixtureId);

  const potmMap = useOfficialPotmMap();
  const currentPlayerId = getOfficialPlayerId(potmMap, fixtureId);

  const { data: playersData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.fixturePlayers(fixtureId),
    queryFn: () => fetchFixturePlayers(fixtureId),
    staleTime: STALE_TIMES.FIXTURE_PLAYERS,
    enabled: fixtureId > 0,
  });

  const players: PlayerRow[] = (playersData ?? [])
    .flatMap((teamData: any) =>
      (teamData.players ?? []).map((p: any) => ({
        playerId: p.player.id as number,
        name: (p.player.name ?? '') as string,
        photo: (p.player.photo ?? '') as string,
        teamName: (teamData.team.name ?? '') as string,
        teamLogo: (teamData.team.logo ?? '') as string,
        rating: parseFloat(p.statistics?.[0]?.games?.rating ?? '0'),
        minutes: (p.statistics?.[0]?.games?.minutes ?? 0) as number,
      }))
    )
    .filter((p: PlayerRow) => p.minutes > 0)
    .sort((a: PlayerRow, b: PlayerRow) => b.rating - a.rating);

  const handleSelect = (playerId: number, playerName: string) => {
    Alert.alert(
      'Set Player of the Match',
      `Set "${playerName}" as the official FIFA Player of the Match?\n\nThis will update immediately for all users.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setSaving(true);
            try {
              await saveOfficialPotm(fixtureId, playerId);
              Alert.alert('Saved ✓', `"${playerName}" is now the official Player of the Match.`);
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Failed to save. Check your internet connection.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const matchTitle = match
    ? `${match.homeTeam.name} vs ${match.awayTeam.name}`
    : 'Match';

  return (
    <>
      <Stack.Screen options={{ title: matchTitle }} />
      <View style={styles.container}>
        {match && (
          <View style={styles.matchHeader}>
            <Text style={styles.matchScore}>
              {match.score.home} – {match.score.away}
            </Text>
            {currentPlayerId ? (
              <Text style={styles.currentLabel}>
                ✓ POTM set (Player ID: {currentPlayerId})
              </Text>
            ) : (
              <Text style={styles.notSetLabel}>No POTM selected yet</Text>
            )}
          </View>
        )}

        {isLoading || saving ? (
          <ActivityIndicator color={colors.gold} style={styles.loader} />
        ) : (
          <FlatList
            data={players}
            keyExtractor={(p) => String(p.playerId)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>No player data available.</Text>
            }
            renderItem={({ item: p }) => {
              const isCurrent = p.playerId === currentPlayerId;
              return (
                <Pressable
                  style={[styles.playerRow, isCurrent && styles.playerRowCurrent]}
                  onPress={() => handleSelect(p.playerId, p.name)}
                >
                  {p.photo ? (
                    <Image source={{ uri: p.photo }} style={styles.photo} />
                  ) : (
                    <View style={[styles.photo, styles.photoPlaceholder]} />
                  )}
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{p.name}</Text>
                    <Text style={styles.teamName}>{p.teamName}</Text>
                  </View>
                  <View style={styles.rightCol}>
                    {p.rating > 0 && (
                      <Text style={styles.rating}>{p.rating.toFixed(1)}</Text>
                    )}
                    <Text style={styles.minutes}>{p.minutes}'</Text>
                  </View>
                  {isCurrent && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  matchHeader: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  matchScore: {
    color: colors.textPrimary,
    fontFamily: fontFamily.display,
    fontSize: fontSize.h1,
  },
  currentLabel: {
    color: colors.gold,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.small,
  },
  notSetLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
  },
  loader: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  playerRowCurrent: {
    borderColor: colors.gold,
  },
  photo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  photoPlaceholder: {
    backgroundColor: colors.surfaceElevated,
  },
  playerInfo: {
    flex: 1,
    gap: 2,
  },
  playerName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
  },
  teamName: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rating: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.small,
  },
  minutes: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
  },
  checkmark: {
    color: colors.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.body,
  },
});
