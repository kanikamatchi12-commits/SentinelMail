import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  initializeStore,
  getAllAnalyses,
  getAnalysisById,
  deleteAnalysis,
  processAndSaveEmail,
  updateAnalysisStatus,
  updateAnalysisReview,
  resetDemoData,
  getAnalyticsData,
  getSampleEmails,
  getAllAlerts,
  getAlertById,
  saveOrSimulateAlert,
} from './server/store.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SentinelMail Forensic Engine',
    timestamp: new Date().toISOString(),
    gemini_available: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Run forensic analysis on raw email text or uploaded .eml
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { rawEmail, filename, caseId, title, analystName, evidenceSource, is_demo } = req.body;
    if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.trim()) {
      return res.status(400).json({ error: 'Please provide raw email headers or .eml source text.' });
    }

    const analysis = await processAndSaveEmail(rawEmail, filename, {
      caseId,
      title,
      analystName,
      evidenceSource,
      is_demo,
    });
    return res.status(201).json(analysis);
  } catch (error: any) {
    console.error('Error analyzing email:', error);
    return res.status(500).json({
      error: 'Failed to analyze email headers.',
      details: error?.message || 'Unknown forensic engine error',
    });
  }
});

// Update case status
app.patch(['/api/analyses/:id/status', '/api/analysis/:id/status'], (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }
    const updated = updateAnalysisStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update case status.' });
  }
});

// Update review status, disposition, and analyst notes
app.patch(['/api/analyses/:id/review', '/api/analysis/:id/review'], (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, disposition, analyst_notes, actorName } = req.body;
    const updated = updateAnalysisReview(id, { status, disposition, analyst_notes }, actorName || 'SOC Analyst');
    if (!updated) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update case review.' });
  }
});

// Reset demo data to default clean state for live presentations
app.post('/api/demo/reset', async (_req: Request, res: Response) => {
  try {
    const records = await resetDemoData();
    return res.json({ success: true, count: records.length, message: 'Demo data reseeded.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to reset demo records.' });
  }
});

// List all past analyses
app.get('/api/analyses', (req: Request, res: Response) => {
  try {
    const { query, category, minScore, maxScore } = req.query;
    let list = getAllAnalyses();

    if (query && typeof query === 'string') {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.subject.toLowerCase().includes(q) ||
          a.from_address.toLowerCase().includes(q) ||
          (a.filename && a.filename.toLowerCase().includes(q))
      );
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      list = list.filter((a) => a.threat_category.toLowerCase() === category.toLowerCase());
    }

    if (minScore) {
      const min = Number(minScore);
      if (!isNaN(min)) list = list.filter((a) => a.risk_score >= min);
    }

    if (maxScore) {
      const max = Number(maxScore);
      if (!isNaN(max)) list = list.filter((a) => a.risk_score <= max);
    }

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve analyses.' });
  }
});

// Get single analysis by id (supports both plural and singular endpoints)
app.get(['/api/analyses/:id', '/api/analysis/:id'], (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = getAnalysisById(id);
    if (!item) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve analysis.' });
  }
});

// Delete analysis
app.delete(['/api/analyses/:id', '/api/analysis/:id'], (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = deleteAnalysis(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }
    return res.json({ success: true, message: 'Record deleted.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete analysis.' });
  }
});

// Analytics aggregated metrics
app.get('/api/analytics', (_req: Request, res: Response) => {
  try {
    const data = getAnalyticsData();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate analytics.' });
  }
});

// Pre-built sample emails for 1-click test/demo
app.get('/api/samples', (_req: Request, res: Response) => {
  try {
    const samples = getSampleEmails();
    res.json(samples);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve sample emails.' });
  }
});

app.get('/api/samples/:id', (req: Request, res: Response) => {
  try {
    const samples = getSampleEmails();
    const sample = samples.find((s) => s.id === req.params.id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found.' });
    }
    return res.json(sample);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve sample.' });
  }
});

// List all generated & simulated threat alerts
app.get('/api/alerts', (_req: Request, res: Response) => {
  try {
    const alerts = getAllAlerts();
    return res.json(alerts);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve alerts.' });
  }
});

// Get single alert
app.get('/api/alerts/:id', (req: Request, res: Response) => {
  try {
    const alert = getAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found.' });
    }
    return res.json(alert);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve alert.' });
  }
});

// Save or dispatch simulation for a threat alert
app.post('/api/alerts', (req: Request, res: Response) => {
  try {
    const alertData = req.body;
    if (!alertData || !alertData.case_id || !alertData.title) {
      return res.status(400).json({ error: 'Valid alert data with case_id and title is required.' });
    }

    if (!alertData.id) {
      alertData.id = `ALT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!alertData.created_at) {
      alertData.created_at = new Date().toISOString();
    }

    const saved = saveOrSimulateAlert(alertData, alertData.analyst_name || 'SOC Analyst');
    return res.status(201).json(saved);
  } catch (error: any) {
    console.error('Error saving alert:', error);
    return res.status(500).json({ error: 'Failed to save or simulate threat alert.' });
  }
});

async function startServer() {
  // Initialize sample data & store
  await initializeStore();

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SentinelMail server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
