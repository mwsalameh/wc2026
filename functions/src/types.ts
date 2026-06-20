// Types mirrored from the app — kept separate so the function package has no
// dependency on Expo/React Native modules.

export interface PlayerStat {
  playerId: number;
  name: string;
  photo: string;
  teamId: number;
  teamName: string;
  teamLogo: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  shotsOnTarget: number;
  yellowCards: number;
  redCards: number;
  appearances: number;
}

export interface TeamStat {
  teamId: number;
  teamName: string;
  teamLogo: string;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  cleanSheets: number;
  played: number;
}

// Minimal team reference stored in Firestore — only the fields the POTM row renders.
export interface TeamRef {
  id: number;
  name: string;
  shortName: string;
  logoUrl: string;
  countryCode: string;
}

export interface Score {
  home: number | null;
  away: number | null;
  homeHT: number | null;
  awayHT: number | null;
  homePens: number | null;
  awayPens: number | null;
}

export interface BestPlayer {
  playerId: number;
  name: string;
  photo: string;
  teamId: number;
  teamName: string;
  teamLogo: string;
  rating: number;
  isOfficial: boolean;
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
  status: string;
}

// Stored in /wc2026stats/aggregated
export interface AggregatedStats {
  players: PlayerStat[];
  teamStats: TeamStat[];
  potmHistory: PotmHistoryEntry[];
  potmLeaders: PotmEntry[];
  processedMatchCount: number;
}

// Stored in /wc2026_match_cache/{fixtureId}
export interface MatchCacheEntry {
  fixtureId: number;
  kickoffUtc: string;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  status: string;
  score: Score;
  // Raw /fixtures/players response — kept for re-aggregation when logic changes
  teams: unknown[];
}
