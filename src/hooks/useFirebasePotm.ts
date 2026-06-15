import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PotmSelection {
  playerId: number;
  updatedAt: string;
}

export type PotmSelectionsMap = Record<string, PotmSelection>;

// Module-level singleton — one Firestore listener shared across the whole app.
let _cached: PotmSelectionsMap = {};
const _subscribers = new Set<React.Dispatch<React.SetStateAction<PotmSelectionsMap>>>();
let _unsubscribe: (() => void) | null = null;

function startListener() {
  if (_unsubscribe) return;
  const ref = doc(db, 'app_data', 'potm_selections');
  _unsubscribe = onSnapshot(
    ref,
    (snap) => {
      const data: PotmSelectionsMap = snap.exists()
        ? ((snap.data().selections as PotmSelectionsMap) ?? {})
        : {};
      _cached = data;
      _subscribers.forEach((fn) => fn(data));
    },
    (err) => {
      if (__DEV__) console.warn('[firebasePotm] Firestore error:', err.message);
    }
  );
}

/** Returns a live-updating map of { fixtureId → { playerId, updatedAt } }. */
export function useOfficialPotmMap(): PotmSelectionsMap {
  const [selections, setSelections] = useState<PotmSelectionsMap>(_cached);

  useEffect(() => {
    startListener();
    _subscribers.add(setSelections);
    // Sync immediately with any value already in cache from a prior listener cycle.
    setSelections(_cached);
    return () => {
      _subscribers.delete(setSelections);
    };
  }, []);

  return selections;
}

/** Look up the admin-selected player ID for a given fixture. Returns null if not set. */
export function getOfficialPlayerId(
  map: PotmSelectionsMap,
  fixtureId: number
): number | null {
  return map[String(fixtureId)]?.playerId ?? null;
}

/**
 * Persist the official POTM selection to Firestore.
 * Uses merge so existing selections for other fixtures are never overwritten.
 */
export async function saveOfficialPotm(
  fixtureId: number,
  playerId: number
): Promise<void> {
  const ref = doc(db, 'app_data', 'potm_selections');
  await setDoc(
    ref,
    {
      selections: {
        [String(fixtureId)]: {
          playerId,
          updatedAt: new Date().toISOString(),
        },
      },
    },
    { merge: true }
  );
}
