
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
    features: {
        billing: boolean;
        payroll: boolean;
        driverView: boolean;
    };
    toggleFeature: (feature: keyof PreferencesState['features']) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            features: {
                billing: false,
                payroll: false,
                driverView: false,
            },
            toggleFeature: (feature) =>
                set((state) => ({
                    features: {
                        ...state.features,
                        [feature]: !state.features[feature],
                    },
                })),
        }),
        {
            name: 'app-preferences', // unique name
        }
    )
);
