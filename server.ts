import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { calculateEnrichedChart } from './src/calculations/planetLayer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Endpoint for Nominatim city search (Autocomplete)
  app.get('/api/cities', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.json([]);
      }

      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&accept-language=ru&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Hobastro/1.0 (astro@hobastro.app)'
        }
      });

      if (!response.ok) {
        return res.status(502).json({ error: 'Failed to fetch from Nominatim API' });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error in /api/cities:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // API Endpoint for Natal Chart calculation using existing calculation layer
  app.post('/api/natal-chart', (req, res) => {
    try {
      const birthData = req.body;
      if (!birthData || !birthData.date || !birthData.time || !birthData.birthCity) {
        return res.status(400).json({ error: 'Invalid birth data provided' });
      }

      const houseSystem = birthData.houseSystem || 'Placidus';
      const enrichedChart = calculateEnrichedChart(birthData, houseSystem);
      res.json(enrichedChart);
    } catch (error: any) {
      console.error('Calculation error on /api/natal-chart:', error);
      res.status(500).json({ error: error.message || 'Internal calculation error' });
    }
  });

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hobastro server running at http://localhost:${PORT}`);
  });
}

startServer();
