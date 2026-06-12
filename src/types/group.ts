import type { TeamRef } from './team';
import type { Match } from './match';

export interface Standing {
  position: number;
  team: TeamRef;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  qualified?: 'direct' | 'third-place' | null;
}

export interface Group {
  id: string;
  teams: Standing[];
  matches: Match[];
}
