import type { Standing } from '@/types/group';
import type { TeamRef } from '@/types/team';

function mapTeamRef(raw: any): TeamRef {
  return {
    id: raw.team.id,
    name: raw.team.name,
    shortName: raw.team.name?.slice(0, 3).toUpperCase() ?? '',
    logoUrl: raw.team.logo ?? '',
    countryCode: '',
  };
}

export function mapStanding(raw: any): Standing {
  const form = (raw.form ?? '')
    .split('')
    .filter((c: string) => ['W', 'D', 'L'].includes(c)) as ('W' | 'D' | 'L')[];

  return {
    position: raw.rank,
    team: mapTeamRef(raw),
    played: raw.all?.played ?? 0,
    won: raw.all?.win ?? 0,
    drawn: raw.all?.draw ?? 0,
    lost: raw.all?.lose ?? 0,
    goalsFor: raw.all?.goals?.for ?? 0,
    goalsAgainst: raw.all?.goals?.against ?? 0,
    goalDifference: raw.goalsDiff ?? 0,
    points: raw.points ?? 0,
    form: form.slice(-5),
    qualified: null,
  };
}

// WC 2026 has 12 groups. api-football may label them "Group A"–"Group L"
// or numbered "Group 1"–"Group 12". Map both to A–L.
const NUM_TO_LETTER: Record<string, string> = {
  '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E', '6': 'F',
  '7': 'G', '8': 'H', '9': 'I', '10': 'J', '11': 'K', '12': 'L',
};

export function mapStandings(rawGroups: any[]): Record<string, Standing[]> {
  const result: Record<string, Standing[]> = {};

  if (__DEV__) {
    console.log('[Standings] raw group count:', rawGroups.length);
    if (rawGroups[0]?.[0]) {
      console.log('[Standings] first entry sample:', JSON.stringify({
        group: rawGroups[0][0].group,
        team: rawGroups[0][0].team?.name,
        rank: rawGroups[0][0].rank,
      }));
    }
  }

  for (const group of rawGroups) {
    const groupName: string = group[0]?.group ?? '';

    // Handle "Group Stage - Group A", "Group A", "Group 1", etc.
    let key = '';
    const letterMatch = groupName.match(/Group\s+([A-L])\s*$/i);
    if (letterMatch) {
      key = letterMatch[1].toUpperCase();
    } else {
      const numMatch = groupName.match(/Group\s+(\d+)\s*$/i);
      if (numMatch && NUM_TO_LETTER[numMatch[1]]) {
        key = NUM_TO_LETTER[numMatch[1]];
      }
    }

    if (key) result[key] = group.map(mapStanding);
  }
  return result;
}
