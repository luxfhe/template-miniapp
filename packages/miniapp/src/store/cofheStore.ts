import { create } from "zustand";

interface FHEState {
  isInitialized: boolean;
  setIsInitialized: (isInitialized: boolean) => void;
}

export const useFHEStore = create<FHEState>(
  (set: (state: Partial<FHEState>) => void) => ({
    isInitialized: false,
    setIsInitialized: (isInitialized: boolean) => set({ isInitialized }),
  })
);
