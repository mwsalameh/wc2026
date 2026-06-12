export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';

export interface Team {
  id: number;
  name: string;
  nameAr: string;
  shortName: string;
  countryCode: string;
  logoUrl: string;
  group: string;
  confederation: Confederation;
}

export interface TeamRef {
  id: number;
  name: string;
  shortName: string;
  logoUrl: string;
  countryCode: string;
}
