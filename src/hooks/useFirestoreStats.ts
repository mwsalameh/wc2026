import { useReducer, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlayerStat, TeamStat } from '@/types/playerStats';
import type { PotmEntry, PotmHistoryEntry } from '@/types/bestPlayer';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AggregatedStats {
  players: PlayerStat[];
  teamStats: TeamStat[];
  potmHistory: PotmHistoryEntry[];
  potmLeaders: PotmEntry[];
  processedMatchCount: number;
}

export interface FirestoreStatsResult {
  players: PlayerStat[] | undefined;
  teamStats: TeamStat[] | undefined;
  potmHistory: PotmHistoryEntry[] | undefined;
  potmLeaders: PotmEntry[] | undefined;
  isLoading: boolean;
}

// ── Module-level singleton ────────────────────────────────────────────────────
// One Firestore listener is shared across every hook subscriber so the app
// never opens more than one snapshot connection regardless of how many
// components call useFirestoreStats().

let _cached: AggregatedStats | null = null;
let _isLoading = __DEV__; // only meaningful in dev builds
const _subscribers = new Set<() => void>();
let _unsubscribe: (() => void) | null = null;

function startStatsListener(): void {
  // No-op in production builds. __DEV__ is a compile-time constant: Metro
  // strips this entire branch when building for the App Store / Play Store,
  // so there is zero runtime cost in production.
  if (!__DEV__ || _unsubscribe) return;

  const ref = doc(db, 'wc2026stats', 'aggregated');
  _unsubscribe = onSnapshot(
    ref,
    (snap) => {
      _isLoading = false;
      _cached = snap.exists() ? (snap.data() as AggregatedStats) : null;
      _subscribers.forEach((fn) => fn());
    },
    () => {
      // Firestore error (offline, permissions) — fall through to API path
      _isLoading = false;
      _subscribers.forEach((fn) => fn());
    },
  );
}

// ── Public hook ───────────────────────────────────────────────────────────────

/**
 * Returns pre-aggregated statistics written by the Cloud Function.
 *
 * In development builds (__DEV__ === true):
 *   - Opens a real-time Firestore listener on /wc2026stats/aggregated
 *   - Returns `isLoading: true` until the first snapshot arrives
 *   - Returns `undefined` fields if the document doesn't exist yet (Cloud
 *     Function not deployed), which causes hooks to fall back to the API path
 *
 * In production builds (__DEV__ === false):
 *   - The Firestore listener never starts
 *   - Returns `{ isLoading: false, players/teamStats/potm*: undefined }`
 *   - All callers transparently fall back to the existing API-based path
 *
 * This hook is intentionally a no-op in production so the current App Store
 * build is completely unaffected. Flip to production by removing the __DEV__
 * guard once the feature is validated and ready to ship.
 */
export function useFirestoreStats(): FirestoreStatsResult {
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!__DEV__) return;
    startStatsListener();
    _subscribers.add(rerender);
    // Sync immediately in case the listener already has data from a prior mount
    rerender();
    return () => {
      _subscribers.delete(rerender);
    };
  }, []);

  if (!__DEV__) {
    return { players: undefined, teamStats: undefined, potmHistory: undefined, potmLeaders: undefined, isLoading: false };
  }

  return {
    players: _cached?.players,
    teamStats: _cached?.teamStats,
    potmHistory: _cached?.potmHistory,
    potmLeaders: _cached?.potmLeaders,
    isLoading: _isLoading,
  };
}
