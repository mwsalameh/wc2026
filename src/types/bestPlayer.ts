import type { TeamRef } from './team';
import type { Score, MatchStatus } from './match';

export interface BestPlayer {
  playerId: number;
  name: string;
  photo: string;
  teamId: number;
  teamName: string;
  teamLogo: string;
  rating: number;
  isOfficial: boolean; // true = from OFFICIAL_POTM map; false = highest-rating fallback
}

export interface PotmEntry extends BestPlayer {
  awards: number;
}

export interface PotmHistoryEntry extends BestPlayer {
  fixtureId: number;
  kickoffUtc: string;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  score: Score;
  status: MatchStatus;
}
