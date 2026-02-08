import { create } from 'zustand';

type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

interface ToastState {
    open: boolean;
    message: string;
    severity: ToastSeverity;
    showToast: (message: string, severity?: ToastSeverity) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    open: false,
    message: '',
    severity: 'info',
    showToast: (message, severity = 'info') => set({ open: true, message, severity }),
    hideToast: () => set({ open: false })
}));
