import { create } from "zustand";

interface UpgradeModalStore {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useUpgradeModalStore = create<UpgradeModalStore>((set) => ({
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
