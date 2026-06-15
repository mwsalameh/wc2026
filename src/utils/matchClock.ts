import type { Match } from '@/types/match';

export function matchClockLabel(match: Match): string {
  if (match.status !== 'LIVE') return '';
  const base = match.elapsed ?? 0;
  const extra = match.extra;
  if (extra && extra > 0) return `${base}' +${extra}`;
  return `${base}'`;
}
