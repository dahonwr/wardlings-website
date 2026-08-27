import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Proxy endpoint for Cloudflare Worker OG Free Mint Application API
  app.post('/api/og-apply', async (req, res) => {
    try {
      const workerUrl = 'https://wardlings-og-api.xethrial.workers.dev/';
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://wardlings.xyz'
        },
        body: JSON.stringify(req.body)
      });

      const status = response.status;
      let data: any;
      try {
        data = await response.json();
      } catch {
        data = { success: response.ok };
      }

      return res.status(status).json(data);
    } catch (err: any) {
      console.error('Proxy error forwarding OG application:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to communicate with OG application service.'
      });
    }
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
