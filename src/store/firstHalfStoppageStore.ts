import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The API only exposes the referee-announced first-half added time while a
// fixture's status is exactly 'HT' (fixture.status.extra). Once the second
// half kicks off, that field is reused for the second half's added time, so
// the value must be captured the moment it appears and kept here forever —
// it can never be recovered from the API again after HT has passed.
interface FirstHalfStoppageStore {
  byFixtureId: Record<number, number>;
  record: (fixtureId: number, minutes: number) => void;
  get: (fixtureId: number) => number | null;
}

export const useFirstHalfStoppageStore = create<FirstHalfStoppageStore>()(
  persist(
    (set, get) => ({
      byFixtureId: {},
      record: (fixtureId, minutes) => {
        if (get().byFixtureId[fixtureId] === minutes) return;
        set((state) => ({ byFixtureId: { ...state.byFixtureId, [fixtureId]: minutes } }));
      },
      get: (fixtureId) => get().byFixtureId[fixtureId] ?? null,
    }),
    {
      name: 'wc2026-first-half-stoppage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ byFixtureId: state.byFixtureId }),
    },
  ),
);
