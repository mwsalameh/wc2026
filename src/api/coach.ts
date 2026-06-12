import { apiClient } from './client';

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export const fetchCoach = async (teamId: number, preferredName?: string): Promise<any | null> => {
  const { data } = await apiClient.get('/coachs', {
    params: { team: teamId },
  });
  const coaches: any[] = data.response ?? [];

  // If a verified coach name was supplied, find them in the API response first.
  // This ensures the correct photo is used alongside the correct name.
  if (preferredName) {
    const normPref = normalize(preferredName);
    const found = coaches.find((c) => {
      const normName = normalize(c.name as string ?? '');
      // Match if either name contains the other (handles accent variants / short forms)
      return normName === normPref ||
        normName.includes(normPref) ||
        normPref.includes(normName);
    });
    if (found) return found;
    // Coach not in API at all — return a synthetic entry (name only, no photo)
    return { id: 0, name: preferredName, photo: '' };
  }

  // No override: use selection logic —
  // prefer full names over abbreviated, then most recent start date
  const ranked = coaches
    .map((c) => {
      const entries: any[] = (c.career ?? []).filter((e: any) => e.team?.id === teamId);
      if (!entries.length) return null;
      const latest = entries.sort(
        (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
      )[0];
      const isAbbreviated = /\b[A-Z]\.\s/.test(c.name as string);
      return { coach: c, start: latest.start as string, abbreviated: isAbbreviated };
    })
    .filter(Boolean) as { coach: any; start: string; abbreviated: boolean }[];

  ranked.sort((a, b) => {
    if (a.abbreviated !== b.abbreviated) return a.abbreviated ? 1 : -1;
    return new Date(b.start).getTime() - new Date(a.start).getTime();
  });

  return ranked[0]?.coach ?? coaches[0] ?? null;
};
