import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './api/index';

const startServer = async () => {
  const PORT = 3000;
  
  // Initialize Vite dev server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  
  // Use Vite's connect instance as a middleware
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Development server running on http://localhost:${PORT}`);
  });
};

startServer();
