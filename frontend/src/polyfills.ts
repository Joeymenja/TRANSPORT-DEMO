import { Buffer } from 'buffer';

// Polyfills for Vite / Browser
if (typeof window !== 'undefined') {
    (window as any).Buffer = (window as any).Buffer || Buffer;
    (window as any).process = (window as any).process || { env: {} };
    (window as any).global = window;
}
