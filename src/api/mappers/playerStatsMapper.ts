import type { PlayerStat } from '@/types/playerStats';

export function mapPlayerStat(raw: any): PlayerStat {
  const stats = raw.statistics?.[0] ?? {};
  return {
    playerId: raw.player?.id ?? 0,
    name: raw.player?.name ?? '',
    photo: raw.player?.photo ?? '',
    teamId: stats.team?.id ?? 0,
    teamName: stats.team?.name ?? '',
    teamLogo: stats.team?.logo ?? '',
    goals: stats.goals?.total ?? 0,
    assists: stats.goals?.assists ?? 0,
    minutesPlayed: stats.games?.minutes ?? 0,
    shotsOnTarget: stats.shots?.on ?? 0,
    yellowCards: stats.cards?.yellow ?? 0,
    redCards: stats.cards?.red ?? 0,
    appearances: stats.games?.appearences ?? 0,
  };
}

export function mapPlayerStats(rawList: any[]): PlayerStat[] {
  return rawList.map(mapPlayerStat);
}
