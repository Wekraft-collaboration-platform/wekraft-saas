import { create } from "zustand";

interface KayaStore {
  isOpen: boolean;
  threadId: string;
  initialPrompt: string;
  setIsOpen: (open: boolean) => void;
  setInitialPrompt: (prompt: string) => void;
  openWithPrompt: (prompt: string) => void;
  toggleKaya: () => void;
  createNewSession: () => void;
}

export const useKayaStore = create<KayaStore>((set) => ({
  isOpen: false,
  threadId: crypto.randomUUID(),
  initialPrompt: "",
  setIsOpen: (open) => set({ isOpen: open }),
  setInitialPrompt: (prompt) => set({ initialPrompt: prompt }),
  openWithPrompt: (prompt) => set({ isOpen: true, initialPrompt: prompt }),
  toggleKaya: () => set((state) => ({ isOpen: !state.isOpen })),
  createNewSession: () => set({ threadId: crypto.randomUUID() }),
}));
