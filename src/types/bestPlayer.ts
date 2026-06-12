export interface BestPlayer {
  playerId: number;
  name: string;
  photo: string;
  teamId: number;
  teamName: string;
  teamLogo: string;
  rating: number;
}

export interface PotmEntry extends BestPlayer {
  awards: number;
}
