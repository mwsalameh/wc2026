import type { Match, MatchStatus, TournamentRound, Score, Venue, MatchEvent } from '@/types/match';
import type { TeamRef } from '@/types/team';

const NUM_TO_LETTER: Record<string, string> = {
  '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E', '6': 'F',
  '7': 'G', '8': 'H', '9': 'I', '10': 'J', '11': 'K', '12': 'L',
};

function extractGroupId(round: string): string | undefined {
  const letterMatch = round.match(/Group\s+([A-L])\s*$/i);
  if (letterMatch) return letterMatch[1].toUpperCase();
  const numMatch = round.match(/Group\s+(\d+)\s*$/i);
  if (numMatch && NUM_TO_LETTER[numMatch[1]]) return NUM_TO_LETTER[numMatch[1]];
  return undefined;
}

const STATUS_MAP: Record<string, MatchStatus> = {
  NS: 'NS', '1H': 'LIVE', '2H': 'LIVE', HT: 'HT', ET: 'LIVE',
  P: 'LIVE', FT: 'FT', AET: 'AET', PEN: 'PEN', PST: 'PST', CANC: 'CANC',
};

const ROUND_MAP: Record<string, TournamentRound> = {
  'Group Stage': 'Group Stage',
  'Round of 32': 'Round of 32',
  'Round of 16': 'Round of 16',
  'Quarter-finals': 'Quarter-Finals',
  'Semi-finals': 'Semi-Finals',
  '3rd Place Final': 'Third Place',
  Final: 'Final',
};

function mapTeamRef(raw: any): TeamRef {
  return {
    id: raw.id,
    name: raw.name,
    shortName: raw.name?.slice(0, 3).toUpperCase() ?? '',
    logoUrl: raw.logo ?? '',
    countryCode: '',
  };
}

function mapScore(raw: any): Score {
  return {
    home: raw.goals?.home ?? null,
    away: raw.goals?.away ?? null,
    homeHT: raw.score?.halftime?.home ?? null,
    awayHT: raw.score?.halftime?.away ?? null,
    homePens: raw.score?.penalty?.home ?? null,
    awayPens: raw.score?.penalty?.away ?? null,
  };
}

function mapVenue(raw: any): Venue {
  return {
    id: raw.fixture?.venue?.id ?? 0,
    name: raw.fixture?.venue?.name ?? '',
    city: raw.fixture?.venue?.city ?? '',
    country: raw.teams?.home?.name ?? '',
  };
}

function mapEvent(raw: any, homeTeamId: number): MatchEvent {
  return {
    minute: raw.time?.elapsed ?? 0,
    extraMinute: raw.time?.extra ?? null,
    teamId: raw.team?.id ?? 0,
    teamSide: (raw.team?.id ?? 0) === homeTeamId ? 'home' : 'away',
    playerName: raw.player?.name ?? '',
    playerId: raw.player?.id ?? 0,
    assistName: raw.assist?.name ?? null,
    assistId: raw.assist?.id ?? null,
    type: raw.type ?? '',
    detail: raw.detail ?? '',
  };
}

export function mapFixture(raw: any): Match {
  const homeTeamId = raw.teams?.home?.id ?? 0;
  return {
    id: raw.fixture.id,
    homeTeam: mapTeamRef(raw.teams.home),
    awayTeam: mapTeamRef(raw.teams.away),
    kickoffUtc: raw.fixture.date,
    venue: mapVenue(raw),
    status: STATUS_MAP[raw.fixture.status.short] ?? 'NS',
    elapsed: raw.fixture.status.elapsed ?? undefined,
    extra: raw.fixture.status.extra ?? undefined,
    score: mapScore(raw),
    groupId: extractGroupId(raw.league?.round ?? ''),
    round: ROUND_MAP[raw.league?.round] ?? 'Group Stage',
    referee: raw.fixture?.referee ?? undefined,
    events: Array.isArray(raw.events)
      ? raw.events.map((e: any) => mapEvent(e, homeTeamId))
      : [],
  };
}

export function mapFixtures(rawList: any[]): Match[] {
  return rawList.map(mapFixture);
}
