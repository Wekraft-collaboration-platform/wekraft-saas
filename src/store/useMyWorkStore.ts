import { create } from "zustand";

interface MyWorkStore {
  isOpen: boolean;
  activeTab: string;
  setIsOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  toggle: () => void;
}

export const useMyWorkStore = create<MyWorkStore>((set) => ({
  isOpen: false,
  activeTab: "tasks",
  setIsOpen: (open) => set({ isOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
