import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RequestBudgetStore {
  date: string;
  count: number;
  increment: () => void;
  reset: () => void;
  isNearLimit: () => boolean;
  isAtLimit: () => boolean;
}

const today = () => new Date().toISOString().split('T')[0];
const DAILY_LIMIT = __DEV__ ? 500 : 7500;

export const useRequestBudgetStore = create<RequestBudgetStore>()(
  persist(
    (set, get) => ({
      date: today(),
      count: 0,
      increment: () => {
        const now = today();
        set((state) => ({
          date: now,
          count: state.date === now ? state.count + 1 : 1,
        }));
      },
      reset: () => set({ date: today(), count: 0 }),
      isNearLimit: () => { const s = get(); return s.date === today() && s.count >= DAILY_LIMIT - 10; },
      isAtLimit: () => { const s = get(); return s.date === today() && s.count >= DAILY_LIMIT; },
    }),
    {
      name: 'wc2026-request-budget',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ date: state.date, count: state.count }),
    },
  ),
);
