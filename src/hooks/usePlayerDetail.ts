import { useQuery } from '@tanstack/react-query';
import { fetchPlayerDetail } from '@/api/player';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';
import type { PlayerDetail } from '@/types/playerDetail';

export function usePlayerDetail(playerId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.playerById(playerId),
    queryFn: async (): Promise<PlayerDetail | null> => {
      const { wc: wcRaw, prev: prevRaw } = await fetchPlayerDetail(playerId);

      // Player bio comes from whichever call returned data first
      const playerSource = wcRaw[0] ?? prevRaw[0];
      if (!playerSource) return null;
      const { player } = playerSource;

      // WC stats: the API call was already filtered to league=WC, so statistics[0] is the WC entry
      const wcEntry: any = wcRaw[0]?.statistics?.[0] ?? null;

      // Club stats: search previous season. International competitions have league.country === 'World',
      // so any entry without that is a club competition.
      const prevStats: any[] = prevRaw[0]?.statistics ?? [];
      const clubEntry: any = prevStats.find((s: any) => s.league?.country !== 'World') ?? null;

      return {
        profile: {
          id: player.id ?? playerId,
          name: player.name ?? '',
          age: player.age ?? 0,
          birthDate: player.birth?.date ?? null,
          birthPlace: player.birth?.place ?? null,
          birthCountry: player.birth?.country ?? null,
          nationality: player.nationality ?? null,
          height: player.height ?? null,
          weight: player.weight ?? null,
          photo: player.photo ?? '',
          injured: player.injured ?? false,
        },
        wcStats: wcEntry ? {
          teamId: wcEntry.team?.id ?? 0,
          teamName: wcEntry.team?.name ?? '',
          teamLogo: wcEntry.team?.logo ?? '',
          position: wcEntry.games?.position ?? '',
          number: wcEntry.games?.number ?? null,
          appearances: wcEntry.games?.appearences ?? 0,
          minutes: wcEntry.games?.minutes ?? 0,
          goals: wcEntry.goals?.total ?? 0,
          assists: wcEntry.goals?.assists ?? 0,
          shotsOnTarget: wcEntry.shots?.on ?? 0,
          yellowCards: wcEntry.cards?.yellow ?? 0,
          redCards: wcEntry.cards?.red ?? 0,
          rating: wcEntry.games?.rating ?? null,
          passAccuracy: wcEntry.passes?.accuracy ?? null,
          dribbles: wcEntry.dribbles?.success ?? null,
        } : null,
        club: clubEntry ? {
          id: clubEntry.team?.id ?? 0,
          name: clubEntry.team?.name ?? '',
          logo: clubEntry.team?.logo ?? '',
        } : null,
      };
    },
    staleTime: STALE_TIMES.PLAYER_DETAIL,
    enabled: playerId > 0,
  });
}
