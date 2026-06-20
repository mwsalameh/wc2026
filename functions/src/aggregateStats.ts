import * as admin from 'firebase-admin';
import type { AxiosInstance } from 'axios';
import { fetchAllFixtures, fetchFixturePlayers, sleep } from './apiClient';
import type {
  PlayerStat,
  TeamStat,
  TeamRef,
  Score,
  BestPlayer,
  PotmEntry,
  PotmHistoryEntry,
  MatchCacheEntry,
  AggregatedStats,
} from './types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapTeamRef(raw: Record<string, unknown>): TeamRef {
  const name = (raw.name as string) ?? '';
  return {
    id: (raw.id as number) ?? 0,
    name,
    shortName: name.slice(0, 3).toUpperCase(),
    logoUrl: (raw.logo as string) ?? '',
    countryCode: '',
  };
}

function mapScore(raw: Record<string, unknown>): Score {
  const goals = raw.goals as Record<string, unknown> | undefined;
  const score = raw.score as Record<string, Record<string, unknown>> | undefined;
  return {
    home: (goals?.home as number | null) ?? null,
    away: (goals?.away as number | null) ?? null,
    homeHT: (score?.halftime?.home as number | null) ?? null,
    awayHT: (score?.halftime?.away as number | null) ?? null,
    homePens: (score?.penalty?.home as number | null) ?? null,
    awayPens: (score?.penalty?.away as number | null) ?? null,
  };
}

// ── Step 1: detect and cache new finished matches ─────────────────────────────

async function cacheNewMatches(
  db: admin.firestore.Firestore,
  client: AxiosInstance,
  processedIds: Set<number>,
): Promise<{ newCount: number }> {
  const allFixtures = await fetchAllFixtures(client);

  const completedFixtures = allFixtures.filter((f) => {
    const status = (f as Record<string, Record<string, Record<string, string>>>)
      .fixture?.status?.short;
    return ['FT', 'AET', 'PEN'].includes(status);
  });

  const newMatches = completedFixtures.filter((f) => {
    const id = (f as Record<string, Record<string, number>>).fixture?.id;
    return !processedIds.has(id);
  });

  for (const fixture of newMatches) {
    const f = fixture as Record<string, unknown>;
    const fixtureData = f.fixture as Record<string, unknown>;
    const teamsData = f.teams as Record<string, Record<string, unknown>>;
    const fixtureId = fixtureData.id as number;

    try {
      const teams = await fetchFixturePlayers(client, fixtureId);

      const entry: MatchCacheEntry = {
        fixtureId,
        kickoffUtc: fixtureData.date as string,
        homeTeam: mapTeamRef(teamsData.home),
        awayTeam: mapTeamRef(teamsData.away),
        status: (fixtureData.status as Record<string, string>).short,
        score: mapScore(f),
        teams,
      };

      await db
        .collection('wc2026_match_cache')
        .doc(String(fixtureId))
        .set({ ...entry, fetchedAt: admin.firestore.FieldValue.serverTimestamp() });

      processedIds.add(fixtureId);
      console.log(`[aggregateStats] Cached fixture ${fixtureId}`);

      // Space out requests: 1 s between player-stats fetches
      await sleep(1_000);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === 'RATE_LIMIT_EXCEEDED') {
        console.warn(`[aggregateStats] Rate limited on fixture ${fixtureId} — will retry next run`);
        break;
      }
      console.error(`[aggregateStats] Failed to cache fixture ${fixtureId}:`, msg);
    }
  }

  return { newCount: newMatches.length };
}

// ── Step 2: re-aggregate from all cached match data ───────────────────────────

function buildPlayerStats(matchDocs: admin.firestore.QueryDocumentSnapshot[]): PlayerStat[] {
  const playerMap = new Map<number, PlayerStat>();

  for (const doc of matchDocs) {
    const match = doc.data() as MatchCacheEntry;
    const matchDuration = ['AET', 'PEN'].includes(match.status) ? 120 : 90;

    for (const teamData of (match.teams as Record<string, unknown>[])) {
      const td = teamData as Record<string, unknown>;
      const team = td.team as Record<string, unknown>;

      for (const p of ((td.players as Record<string, unknown>[]) ?? [])) {
        const player = (p as Record<string, unknown>).player as Record<string, unknown>;
        const s = ((p as Record<string, unknown[]>).statistics as Record<string, unknown>[])?.[0];
        if (!s) continue;

        const games = s.games as Record<string, unknown>;
        const goals = s.goals as Record<string, unknown>;
        const cards = s.cards as Record<string, unknown>;
        const shots = s.shots as Record<string, unknown>;

        const playerId = player.id as number;
        const rawMinutes = (games?.minutes as number) ?? 0;
        // Use rawMinutes directly — the function doesn't have sub event data.
        // For non-subbed starters the API occasionally underreports (e.g. 84
        // instead of 90); we cap up to matchDuration only if no substitution
        // flag is set, matching the most conservative interpretation.
        const isStarter = games?.substitute === false;
        const minutes =
          isStarter && rawMinutes > 0 && rawMinutes < matchDuration
            ? matchDuration
            : rawMinutes;

        const g = (goals?.total as number) ?? 0;
        const a = (goals?.assists as number) ?? 0;
        const y = (cards?.yellow as number) ?? 0;
        const r = (cards?.red as number) ?? 0;
        const sh = (shots?.on as number) ?? 0;

        const existing = playerMap.get(playerId);
        if (existing) {
          existing.goals += g;
          existing.assists += a;
          existing.minutesPlayed += minutes;
          if (minutes > 0) existing.appearances += 1;
          existing.yellowCards += y;
          existing.redCards += r;
          existing.shotsOnTarget += sh;
        } else {
          playerMap.set(playerId, {
            playerId,
            name: (player.name as string) ?? '',
            photo: (player.photo as string) ?? '',
            teamId: (team.id as number) ?? 0,
            teamName: (team.name as string) ?? '',
            teamLogo: (team.logo as string) ?? '',
            goals: g,
            assists: a,
            minutesPlayed: minutes,
            appearances: minutes > 0 ? 1 : 0,
            shotsOnTarget: sh,
            yellowCards: y,
            redCards: r,
          });
        }
      }
    }
  }

  return Array.from(playerMap.values());
}

function buildTeamStats(matchDocs: admin.firestore.QueryDocumentSnapshot[]): TeamStat[] {
  const teamMap = new Map<number, TeamStat>();

  for (const doc of matchDocs) {
    const match = doc.data() as MatchCacheEntry;
    const { score, homeTeam, awayTeam } = match;
    if (score.home === null || score.away === null) continue;

    const hg = score.home;
    const ag = score.away;

    const ensureTeam = (ref: TeamRef) => {
      if (!teamMap.has(ref.id)) {
        teamMap.set(ref.id, {
          teamId: ref.id,
          teamName: ref.name,
          teamLogo: ref.logoUrl,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          cleanSheets: 0,
          played: 0,
        });
      }
      return teamMap.get(ref.id)!;
    };

    const home = ensureTeam(homeTeam);
    home.goalsFor += hg;
    home.goalsAgainst += ag;
    home.played += 1;
    if (ag === 0) home.cleanSheets += 1;

    const away = ensureTeam(awayTeam);
    away.goalsFor += ag;
    away.goalsAgainst += hg;
    away.played += 1;
    if (hg === 0) away.cleanSheets += 1;
  }

  return Array.from(teamMap.values()).map((t) => ({
    ...t,
    goalDifference: t.goalsFor - t.goalsAgainst,
  }));
}

function extractBestPlayer(
  officialPlayerId: number | null,
  teams: Record<string, unknown>[],
): BestPlayer | null {
  let fallback: BestPlayer | null = null;
  let bestRating = 0;

  for (const teamData of teams) {
    const td = teamData as Record<string, unknown>;
    const team = td.team as Record<string, unknown>;

    for (const p of ((td.players as Record<string, unknown>[]) ?? [])) {
      const player = (p as Record<string, unknown>).player as Record<string, unknown>;
      const stats = ((p as Record<string, unknown[]>).statistics as Record<string, unknown>[])?.[0];
      const games = stats?.games as Record<string, unknown> | undefined;
      const rating = parseFloat((games?.rating as string) ?? '0');
      const minutes = (games?.minutes as number) ?? 0;
      const playerId = player.id as number;

      if (officialPlayerId && playerId === officialPlayerId) {
        return {
          playerId,
          name: (player.name as string) ?? '',
          photo: (player.photo as string) ?? '',
          teamId: (team.id as number) ?? 0,
          teamName: (team.name as string) ?? '',
          teamLogo: (team.logo as string) ?? '',
          rating,
          isOfficial: true,
        };
      }

      if (rating > bestRating && minutes >= 45) {
        bestRating = rating;
        fallback = {
          playerId,
          name: (player.name as string) ?? '',
          photo: (player.photo as string) ?? '',
          teamId: (team.id as number) ?? 0,
          teamName: (team.name as string) ?? '',
          teamLogo: (team.logo as string) ?? '',
          rating,
          isOfficial: false,
        };
      }
    }
  }

  return fallback;
}

async function buildPotmData(
  db: admin.firestore.Firestore,
  matchDocs: admin.firestore.QueryDocumentSnapshot[],
): Promise<{ potmHistory: PotmHistoryEntry[]; potmLeaders: PotmEntry[] }> {
  const potmDoc = await db.collection('app_data').doc('potm_selections').get();
  const selections: Record<string, { playerId: number }> =
    potmDoc.data()?.selections ?? {};

  const history: PotmHistoryEntry[] = [];
  const leaderMap = new Map<number, PotmEntry>();

  for (const doc of matchDocs) {
    const match = doc.data() as MatchCacheEntry;
    const { fixtureId } = match;
    const officialPlayerId = selections[String(fixtureId)]?.playerId ?? null;
    const best = extractBestPlayer(officialPlayerId, match.teams as Record<string, unknown>[]);
    if (!best) continue;

    history.push({
      ...best,
      fixtureId,
      kickoffUtc: match.kickoffUtc,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      score: match.score,
      status: match.status,
    });

    const existing = leaderMap.get(best.playerId);
    if (existing) {
      existing.awards += 1;
    } else {
      leaderMap.set(best.playerId, { ...best, awards: 1 });
    }
  }

  history.sort(
    (a, b) => new Date(b.kickoffUtc).getTime() - new Date(a.kickoffUtc).getTime(),
  );

  const potmLeaders = Array.from(leaderMap.values()).sort((a, b) => b.awards - a.awards);
  return { potmHistory: history, potmLeaders };
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function runAggregation(
  db: admin.firestore.Firestore,
  client: AxiosInstance,
): Promise<void> {
  // 1. Load the list of already-processed match IDs
  const metaRef = db.collection('wc2026stats').doc('meta');
  const metaSnap = await metaRef.get();
  const processedIds = new Set<number>((metaSnap.data()?.processedMatchIds as number[]) ?? []);
  const previousCount = processedIds.size;

  // 2. Fetch and cache any new completed matches
  const { newCount } = await cacheNewMatches(db, client, processedIds);

  // Nothing changed — skip expensive re-aggregation
  if (newCount === 0) {
    console.log('[aggregateStats] No new completed matches — skipping aggregation');
    return;
  }

  console.log(`[aggregateStats] ${newCount} new match(es) found — re-aggregating from ${processedIds.size} total`);

  // 3. Load all cached match data
  const allMatchDocs = await db.collection('wc2026_match_cache').get();

  // 4. Build aggregated stats
  const players = buildPlayerStats(allMatchDocs.docs);
  const teamStats = buildTeamStats(allMatchDocs.docs);
  const { potmHistory, potmLeaders } = await buildPotmData(db, allMatchDocs.docs);

  // 5. Write aggregated document
  const aggregated: AggregatedStats = {
    players,
    teamStats,
    potmHistory,
    potmLeaders,
    processedMatchCount: allMatchDocs.size,
  };

  const batch = db.batch();

  batch.set(db.collection('wc2026stats').doc('aggregated'), {
    ...aggregated,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  batch.set(metaRef, {
    processedMatchIds: Array.from(processedIds),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    completedMatchCount: processedIds.size,
    previousCount,
  });

  await batch.commit();

  console.log(
    `[aggregateStats] Done — ${players.length} players, ${teamStats.length} teams, ${potmHistory.length} POTM entries`,
  );
}
