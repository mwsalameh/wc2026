import { create } from 'zustand';

interface RequestBudgetStore {
  date: string;
  count: number;
  increment: () => void;
  isNearLimit: () => boolean;
  isAtLimit: () => boolean;
}

const today = () => new Date().toISOString().split('T')[0];

export const useRequestBudgetStore = create<RequestBudgetStore>((set, get) => ({
  date: today(),
  count: 0,
  increment: () => {
    const now = today();
    set((state) => ({
      date: now,
      count: state.date === now ? state.count + 1 : 1,
    }));
  },
  isNearLimit: () => get().count >= 90,
  isAtLimit: () => get().count >= 100,
}));
