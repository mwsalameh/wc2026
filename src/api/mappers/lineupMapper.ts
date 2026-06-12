import type { Lineup, Player, MatchLineups, Coach } from '@/types/lineup';
import type { TeamRef } from '@/types/team';

function mapPlayer(raw: any): Player {
  const id = raw.player?.id ?? 0;
  // /fixtures/lineups endpoint omits the photo field; build the URL from player id
  const photo =
    raw.player?.photo ||
    (id > 0 ? `https://media.api-sports.io/football/players/${id}.png` : undefined);
  return {
    id,
    name: raw.player?.name ?? '',
    number: raw.player?.number ?? 0,
    position: raw.player?.pos ?? '',
    photo,
    grid: raw.player?.grid ?? undefined,
  };
}

function mapCoach(raw: any): Coach | undefined {
  if (!raw?.coach) return undefined;
  return {
    id: raw.coach.id ?? 0,
    name: raw.coach.name ?? '',
    photo: raw.coach.photo ?? undefined,
  };
}

function mapLineup(raw: any): Lineup {
  const teamRef: TeamRef = {
    id: raw.team?.id ?? 0,
    name: raw.team?.name ?? '',
    shortName: raw.team?.name?.slice(0, 3).toUpperCase() ?? '',
    logoUrl: raw.team?.logo ?? '',
    countryCode: '',
  };
  return {
    team: teamRef,
    formation: raw.formation ?? '',
    startXI: (raw.startXI ?? []).map((p: any) => mapPlayer(p)),
    substitutes: (raw.substitutes ?? []).map((p: any) => mapPlayer(p)),
    coach: mapCoach(raw),
  };
}

export function mapMatchLineups(rawList: any[]): MatchLineups {
  return {
    home: rawList[0] ? mapLineup(rawList[0]) : null,
    away: rawList[1] ? mapLineup(rawList[1]) : null,
  };
}
