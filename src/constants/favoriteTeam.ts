export const FAVORITE_TEAM_NAME = 'Jordan';

export function isFavoriteTeam(name?: string | null): boolean {
  if (!name) return false;
  return name.toLowerCase().includes('jordan');
}
