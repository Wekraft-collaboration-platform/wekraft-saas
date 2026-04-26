import { create } from "zustand";

interface KayaStore {
  isOpen: boolean;
  threadId: string;
  setIsOpen: (open: boolean) => void;
  toggleKaya: () => void;
  createNewSession: () => void;
}

export const useKayaStore = create<KayaStore>((set) => ({
  isOpen: false,
  threadId: crypto.randomUUID(),
  setIsOpen: (open) => set({ isOpen: open }),
  toggleKaya: () => set((state) => ({ isOpen: !state.isOpen })),
  createNewSession: () => set({ threadId: crypto.randomUUID() }),
}));
