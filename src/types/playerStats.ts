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
