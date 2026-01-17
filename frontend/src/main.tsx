import './polyfills';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('Main.tsx is executing');

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <App />
  )
}
