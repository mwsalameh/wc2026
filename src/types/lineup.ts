import type { TeamRef } from './team';

export interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  photo?: string;
  grid?: string;
  captain?: boolean;
  injured?: boolean;
}

export interface Coach {
  id: number;
  name: string;
  photo?: string;
}

export interface Lineup {
  team: TeamRef;
  formation: string;
  startXI: Player[];
  substitutes: Player[];
  coach?: Coach;
}

export interface MatchLineups {
  home: Lineup | null;
  away: Lineup | null;
}
