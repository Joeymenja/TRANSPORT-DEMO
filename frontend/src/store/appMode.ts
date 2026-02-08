import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppModeState {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
    setDemoMode: (isDemo: boolean) => void;
}

export const useAppMode = create<AppModeState>()(
    persist(
        (set) => ({
            isDemoMode: true, // Default to demo mode for now
            toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
            setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
        }),
        {
            name: 'app-mode-storage',
        }
    )
);
