import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    // Preferences
    notifications: boolean;
    biometric: boolean;
    darkMode: boolean;
    voiceGuidance: boolean;
    showNetworkCard: boolean; // New setting for "Network Report Card"

    // Actions
    toggleNotifications: () => void;
    toggleBiometric: () => void;
    toggleDarkMode: () => void;
    toggleVoiceGuidance: () => void;
    toggleNetworkCard: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            notifications: true,
            biometric: false,
            darkMode: false,
            voiceGuidance: true,
            showNetworkCard: false, // Default to FALSE based on user feedback "not there at all" effectively

            toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
            toggleBiometric: () => set((state) => ({ biometric: !state.biometric })),
            toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
            toggleVoiceGuidance: () => set((state) => ({ voiceGuidance: !state.voiceGuidance })),
            toggleNetworkCard: () => set((state) => ({ showNetworkCard: !state.showNetworkCard })),
        }),
        {
            name: 'driver-settings',
        }
    )
);
