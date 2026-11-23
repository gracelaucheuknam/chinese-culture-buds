import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

/** CSS `url()` helpers that follow Vite `base` (GitHub Pages vs local). */
{
  const base = import.meta.env.BASE_URL;
  const root = document.documentElement;
  // Absolute URLs: a relative url() inside a CSS variable resolves against the stylesheet, not the page
  const abs = (path: string) => new URL(`${base}${path}`, document.baseURI).href;
  root.style.setProperty('--asset-ui-panel', `url('${abs('assets/ui/panel.webp')}')`);
  root.style.setProperty('--asset-ui-card', `url('${abs('assets/ui/card.webp')}')`);
  root.style.setProperty('--asset-ui-star', `url('${abs('assets/ui/icon_star.webp')}')`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
