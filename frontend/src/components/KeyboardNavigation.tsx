import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Global keyboard navigation component.
 * Allows navigation back/forward using Alt + Arrow Left / Alt + Arrow Right
 * or simple Arrow keys if desired (configured below).
 * 
 * Current configuration: LEFT ARROW for back, RIGHT ARROW for forward.
 */
export function KeyboardNavigation() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Avoid interfering with inputs
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
                return;
            }
            if ((e.target as HTMLElement).isContentEditable) {
                return;
            }

            // Configuration: Use ArrowLeft for Back, ArrowRight for Forward
            if (e.key === 'ArrowLeft') {
                navigate(-1);
            } else if (e.key === 'ArrowRight') {
                navigate(1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    return null;
}
