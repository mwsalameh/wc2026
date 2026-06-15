export interface PlayerProfile {
  id: number;
  name: string;
  age: number;
  birthDate: string | null;    // "1987-06-24"
  birthPlace: string | null;
  birthCountry: string | null;
  nationality: string | null;
  height: string | null;       // "170 cm"
  weight: string | null;       // "72 kg"
  photo: string;
  injured: boolean;
}

export interface PlayerWcStats {
  teamId: number;
  teamName: string;
  teamLogo: string;
  position: string;
  number: number | null;
  appearances: number;
  minutes: number;
  goals: number;
  assists: number;
  shotsOnTarget: number;
  yellowCards: number;
  redCards: number;
  rating: string | null;       // "8.50"
  passAccuracy: number | null;
  dribbles: number | null;
}

export interface PlayerClub {
  id: number;
  name: string;
  logo: string;
}

export interface PlayerDetail {
  profile: PlayerProfile;
  wcStats: PlayerWcStats | null;
  club: PlayerClub | null;
}
