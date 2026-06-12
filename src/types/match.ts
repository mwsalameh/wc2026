import type { TeamRef } from './team';

export type MatchStatus = 'NS' | 'LIVE' | 'HT' | 'FT' | 'AET' | 'PEN' | 'PST' | 'CANC';

export type TournamentRound =
  | 'Group Stage'
  | 'Round of 32'
  | 'Round of 16'
  | 'Quarter-Finals'
  | 'Semi-Finals'
  | 'Third Place'
  | 'Final';

export interface Score {
  home: number | null;
  away: number | null;
  homeHT: number | null;
  awayHT: number | null;
  homePens?: number | null;
  awayPens?: number | null;
}

export interface Venue {
  id: number;
  name: string;
  city: string;
  country: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
}

export type EventType = 'Goal' | 'Card' | 'subst' | 'Var';

export interface MatchEvent {
  minute: number;
  extraMinute: number | null;
  teamId: number;
  teamSide: 'home' | 'away';
  playerName: string;
  playerId: number;
  assistName: string | null;
  assistId: number | null;
  type: EventType;
  detail: string;
}

export interface Match {
  id: number;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  kickoffUtc: string;
  venue: Venue;
  referee?: string;
  status: MatchStatus;
  elapsed?: number;
  extra?: number;
  score: Score;
  groupId?: string;
  round: TournamentRound;
  stats?: MatchStats;
  events: MatchEvent[];
}
