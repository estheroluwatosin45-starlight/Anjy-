import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Fade out and remove preloader once React is fully loaded and mounted
const preloader = document.getElementById('preloader');
if (preloader) {
  preloader.classList.add('preloader-fade-out');
  setTimeout(() => preloader.remove(), 600);
}

