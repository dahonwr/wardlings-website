import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Sheets whitelist source-of-truth configuration
const SHEET_CONFIG = {
  SHEET_ID: process.env.GOOGLE_SHEET_ID || '16YuotUZIWPms-M_DwoRVcw9W5iitSbFU4_yG_IlVUuc',
  GID: process.env.GOOGLE_SHEET_GID || '0',
  OG_COLUMN: process.env.OG_COLUMN || 'A',
  GTD_COLUMN: process.env.GTD_COLUMN || 'B',
  FCFS_COLUMN: process.env.FCFS_COLUMN || 'C',
  CACHE_TTL_MS: 3000 // 3-second live cache
};

function columnLetterToIndex(letter: string): number {
  let index = 0;
  const str = (letter || '').trim().toUpperCase();
  for (let i = 0; i < str.length; i++) {
    index = index * 26 + (str.charCodeAt(i) - 64);
  }
  return Math.max(0, index - 1);
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

let cachedSheetData: { timestamp: number; csvText: string } | null = null;

async function fetchGoogleSheetCsv(): Promise<string> {
  const now = Date.now();
  if (cachedSheetData && now - cachedSheetData.timestamp < SHEET_CONFIG.CACHE_TTL_MS) {
    return cachedSheetData.csvText;
  }

  const exportUrl = `https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.SHEET_ID}/export?format=csv&gid=${SHEET_CONFIG.GID}&_t=${now}`;
  
  const response = await fetch(exportUrl, {
    method: 'GET',
    headers: {
      Accept: 'text/csv, text/plain, */*'
    }
  });

  if (!response.ok) {
    throw new Error(`Google Sheets export returned status ${response.status}`);
  }

  const csvText = await response.text();
  cachedSheetData = {
    timestamp: now,
    csvText
  };

  return csvText;
}

async function performWalletCheck(walletInput: string) {
  const normalized = walletInput.trim().toLowerCase();
  if (!normalized) {
    return {
      found: false,
      wallet: walletInput.trim(),
      allocations: []
    };
  }

  const csvText = await fetchGoogleSheetCsv();
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return {
      found: false,
      wallet: walletInput.trim(),
      allocations: []
    };
  }

  // Parse header row
  const headerParts = parseCsvLine(lines[0]).map((h) => h.toUpperCase().trim());
  let ogIdx = headerParts.findIndex((h) => h.includes('OG'));
  let gtdIdx = headerParts.findIndex((h) => h.includes('GTD') || h.includes('GUARANTEED'));
  let fcfsIdx = headerParts.findIndex((h) => h.includes('FCFS'));

  // Fallback to configured column letters (A=0, B=1, C=2)
  if (ogIdx === -1) ogIdx = columnLetterToIndex(SHEET_CONFIG.OG_COLUMN);
  if (gtdIdx === -1) gtdIdx = columnLetterToIndex(SHEET_CONFIG.GTD_COLUMN);
  if (fcfsIdx === -1) fcfsIdx = columnLetterToIndex(SHEET_CONFIG.FCFS_COLUMN);

  const hasHeader = headerParts.some(
    (h) => h.includes('OG') || h.includes('GTD') || h.includes('FCFS') || h.includes('ADDRESS')
  );
  const startIndex = hasHeader ? 1 : 0;

  const foundAllocations = new Set<'OG' | 'GTD' | 'FCFS'>();

  for (let i = startIndex; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);

    // Search Column A (OG)
    if (ogIdx >= 0 && cols.length > ogIdx) {
      const cell = cols[ogIdx]?.trim().toLowerCase();
      if (cell && cell === normalized) {
        foundAllocations.add('OG');
      }
    }

    // Search Column B (GTD)
    if (gtdIdx >= 0 && cols.length > gtdIdx) {
      const cell = cols[gtdIdx]?.trim().toLowerCase();
      if (cell && cell === normalized) {
        foundAllocations.add('GTD');
      }
    }

    // Search Column C (FCFS)
    if (fcfsIdx >= 0 && cols.length > fcfsIdx) {
      const cell = cols[fcfsIdx]?.trim().toLowerCase();
      if (cell && cell === normalized) {
        foundAllocations.add('FCFS');
      }
    }
  }

  // Canonical ordering: OG, GTD, FCFS
  const allocations: ('OG' | 'GTD' | 'FCFS')[] = [];
  if (foundAllocations.has('OG')) allocations.push('OG');
  if (foundAllocations.has('GTD')) allocations.push('GTD');
  if (foundAllocations.has('FCFS')) allocations.push('FCFS');

  return {
    found: allocations.length > 0,
    wallet: walletInput.trim(),
    allocations
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Safe Google Sheets Wallet Checker API endpoint
  app.get('/api/check-wallet', async (req, res) => {
    try {
      const wallet = (req.query.wallet as string) || '';
      if (!wallet.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address is required'
        });
      }

      const result = await performWalletCheck(wallet);
      return res.json({
        success: true,
        ...result
      });
    } catch (err: any) {
      console.error('Error checking wallet allocation in Google Sheet:', err);
      return res.status(502).json({
        success: false,
        error: 'Unable to check allocation right now. Please try again.'
      });
    }
  });

  app.post('/api/check-wallet', async (req, res) => {
    try {
      const wallet = req.body?.wallet || '';
      if (!wallet.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address is required'
        });
      }

      const result = await performWalletCheck(wallet);
      return res.json({
        success: true,
        ...result
      });
    } catch (err: any) {
      console.error('Error checking wallet allocation in Google Sheet:', err);
      return res.status(502).json({
        success: false,
        error: 'Unable to check allocation right now. Please try again.'
      });
    }
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
