import type { MatchStats } from '@/types/match';

function getStat(stats: any[], type: string): number {
  const found = stats.find((s: any) => s.type === type);
  const val = found?.value;
  if (val === null || val === undefined) return 0;
  if (typeof val === 'string') return parseInt(val.replace('%', ''), 10) || 0;
  return val;
}

export function mapMatchStats(rawList: any[]): MatchStats | null {
  if (!rawList || rawList.length < 2) return null;
  const homeStats = rawList[0]?.statistics ?? [];
  const awayStats = rawList[1]?.statistics ?? [];

  return {
    possession: {
      home: getStat(homeStats, 'Ball Possession'),
      away: getStat(awayStats, 'Ball Possession'),
    },
    shots: {
      home: getStat(homeStats, 'Total Shots'),
      away: getStat(awayStats, 'Total Shots'),
    },
    shotsOnTarget: {
      home: getStat(homeStats, 'Shots on Goal'),
      away: getStat(awayStats, 'Shots on Goal'),
    },
    corners: {
      home: getStat(homeStats, 'Corner Kicks'),
      away: getStat(awayStats, 'Corner Kicks'),
    },
    fouls: {
      home: getStat(homeStats, 'Fouls'),
      away: getStat(awayStats, 'Fouls'),
    },
    yellowCards: {
      home: getStat(homeStats, 'Yellow Cards'),
      away: getStat(awayStats, 'Yellow Cards'),
    },
    redCards: {
      home: getStat(homeStats, 'Red Cards'),
      away: getStat(awayStats, 'Red Cards'),
    },
  };
}
