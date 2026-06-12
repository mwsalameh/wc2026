import { create } from 'zustand';

interface BracketStore {
  selectedTeamId: number | null;
  selectTeam: (id: number) => void;
  clearSelection: () => void;
}

export const useBracketStore = create<BracketStore>((set) => ({
  selectedTeamId: null,
  selectTeam: (id) =>
    set((state) => ({ selectedTeamId: state.selectedTeamId === id ? null : id })),
  clearSelection: () => set({ selectedTeamId: null }),
}));
