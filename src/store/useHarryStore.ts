import { create } from "zustand";

interface HarryStore {
  isOpen: boolean;
  threadId: string;
  setIsOpen: (open: boolean) => void;
  toggleHarry: () => void;
  createNewSession: () => void;
}

export const useHarryStore = create<HarryStore>((set) => ({
  isOpen: false,
  threadId: crypto.randomUUID(),
  setIsOpen: (open) => set({ isOpen: open }),
  toggleHarry: () => set((state) => ({ isOpen: !state.isOpen })),
  createNewSession: () => set({ threadId: crypto.randomUUID() }),
}));
