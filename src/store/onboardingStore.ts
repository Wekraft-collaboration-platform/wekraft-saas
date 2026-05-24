import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingState {
  currentStep: number | null; // null means no active tour step running
  completedSteps: number[];
  isActive: boolean; // Is the global driver.js running right now?
  setActiveStep: (stepId: number | null) => void;
  markStepComplete: (stepId: number) => void;
  setTourActive: (active: boolean) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: null,
      completedSteps: [],
      isActive: false,
      setActiveStep: (stepId) => set({ currentStep: stepId }),
      markStepComplete: (stepId) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(stepId)
            ? state.completedSteps
            : [...state.completedSteps, stepId],
          currentStep: null, // Clear active guide once completed
          isActive: false,
        })),
      setTourActive: (active) => set({ isActive: active }),
      resetOnboarding: () =>
        set({ currentStep: null, completedSteps: [], isActive: false }),
    }),
    {
      name: "wekraft-onboarding-store",
    }
  )
);
