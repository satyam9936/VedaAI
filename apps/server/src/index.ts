/**
 * VedaAI Express.js Backend Server
 *
 * This server acts as a proxy between the frontend and the Gemini Vision API.
 * The API key is stored securely in the server's .env file — users never
 * need to configure it on the frontend.
 *
 * Routes:
 *   GET  /api/health   — Health check (also reports whether API key is configured)
 *   POST /api/assess   — Upload question paper + answer sheet files, get AI assessment
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

// Load .env from the server's own directory (not the monorepo root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple paths — npm workspaces run from the monorepo root
const envPaths = [
  resolve(__dirname, '..', '.env'),           // apps/server/src/../.env
  resolve(process.cwd(), 'apps', 'server', '.env'),  // monorepo-root/apps/server/.env
  resolve(process.cwd(), '.env'),             // cwd/.env
];

const envPath = envPaths.find((p) => existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  No .env file found. Tried:', envPaths);
}

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { processAssessmentOnServer, ServerAiError } from './geminiProxy.js';
import { processChatOnServer } from './chatProxy.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env.PORT || '3001', 10);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// ---------------------------------------------------------------------------
// Express setup
// ---------------------------------------------------------------------------

const app = express();

// CORS — allow the frontend origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In development, also allow any localhost
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// ---------------------------------------------------------------------------
// Rate limiting (simple in-memory, per-IP)
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

// ---------------------------------------------------------------------------
// File upload config (multer — in-memory storage)
// ---------------------------------------------------------------------------

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
    files: 20, // max 20 files total
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Upload PDF, PNG, JPG, or WebP.`));
    }
  },
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/health
 * Health check — also tells the frontend whether the API key is configured.
 */
app.get('/api/health', (_req, res) => {
  const hasKey = GEMINI_API_KEY.length > 0 && GEMINI_API_KEY !== 'your_gemini_api_key_here';
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/assess
 * Main assessment endpoint.
 *
 * Expects multipart/form-data with:
 *   - questionPaper: one or more files (question paper pages)
 *   - answerSheet:   one or more files (answer sheet pages)
 */
app.post(
  '/api/assess',
  upload.fields([
    { name: 'questionPaper', maxCount: 10 },
    { name: 'answerSheet', maxCount: 10 },
  ]),
  async (req, res) => {
    // Rate limit check
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      res.status(429).json({
        error: 'Too many requests. Please wait a minute before trying again.',
        hint: 'The server allows 10 assessment requests per minute.',
      });
      return;
    }

    // Validate API key is configured
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      res.status(503).json({
        error: 'Gemini API key not configured on the server.',
        hint: 'Set GEMINI_API_KEY in the server\'s .env file.',
      });
      return;
    }

    // Extract uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const qpFiles = files?.questionPaper || [];
    const ansFiles = files?.answerSheet || [];

    if (qpFiles.length === 0) {
      res.status(400).json({
        error: 'No question paper file(s) uploaded.',
        hint: 'Upload at least one question paper file in the "questionPaper" field.',
      });
      return;
    }

    if (ansFiles.length === 0) {
      res.status(400).json({
        error: 'No answer sheet file(s) uploaded.',
        hint: 'Upload at least one answer sheet file in the "answerSheet" field.',
      });
      return;
    }

    console.log(
      `[assess] Processing ${qpFiles.length} QP file(s) + ${ansFiles.length} answer file(s) from ${clientIp}`
    );

    try {
      const assessment = await processAssessmentOnServer(
        qpFiles.map((f) => ({ buffer: f.buffer, originalname: f.originalname, mimetype: f.mimetype })),
        ansFiles.map((f) => ({ buffer: f.buffer, originalname: f.originalname, mimetype: f.mimetype })),
        GEMINI_API_KEY
      );

      console.log(`[assess] ✓ Success — ${assessment.questions.length} questions extracted`);
      res.json({ success: true, assessment });
    } catch (err) {
      if (err instanceof ServerAiError) {
        console.error(`[assess] ✗ ${err.message}`);
        res.status(err.statusCode).json({
          error: err.message,
          hint: err.hint,
        });
      } else {
        console.error('[assess] ✗ Unexpected error:', err);
        res.status(500).json({
          error: 'An unexpected error occurred while processing your files.',
          hint: 'Check server logs for details.',
        });
      }
    }
  }
);

/**
 * POST /api/chat
 * Interactive AI Assistant Chatbot endpoint for exam queries, grading explanations & model answers.
 *
 * Body JSON:
 *   - messages: Array<{ role: 'user' | 'assistant', content: string }>
 *   - context: AssessmentChatContext (optional)
 */
app.post('/api/chat', async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({
      error: 'Too many requests. Please wait a moment before sending another message.',
    });
    return;
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    res.status(503).json({
      error: 'Gemini API key not configured on the server.',
      hint: 'Set GEMINI_API_KEY in apps/server/.env',
    });
    return;
  }

  const { messages, context } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Missing or invalid "messages" array.' });
    return;
  }

  try {
    const reply = await processChatOnServer(messages, context, GEMINI_API_KEY);
    res.json({ success: true, reply });
  } catch (err: any) {
    if (err instanceof ServerAiError) {
      console.error(`[chat] ✗ ${err.message}`);
      res.status(err.statusCode).json({ error: err.message, hint: err.hint });
    } else {
      console.error('[chat] ✗ Unexpected error:', err);
      res.status(500).json({ error: 'Failed to process chat response.' });
    }
  }
});

// ---------------------------------------------------------------------------
// Error handlers
// ---------------------------------------------------------------------------

// Multer error handler
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'File too large. Maximum size is 20MB per file.' });
      return;
    }
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }
  if (err?.message?.includes('Unsupported file type')) {
    res.status(400).json({ error: err.message });
    return;
  }
  next(err);
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  const hasKey = GEMINI_API_KEY.length > 0 && GEMINI_API_KEY !== 'your_gemini_api_key_here';
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║         🚀 VedaAI Backend Server             ║');
  console.log(`  ║         Running on port ${PORT}                 ║`);
  console.log('  ╠══════════════════════════════════════════════╣');
  console.log(`  ║  API Key: ${hasKey ? '✅ Configured' : '❌ NOT SET — add to .env'}       ║`);
  console.log(`  ║  Health:  http://localhost:${PORT}/api/health    ║`);
  console.log(`  ║  Assess:  POST http://localhost:${PORT}/api/assess║`);
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
  if (!hasKey) {
    console.log('  ⚠️  Set GEMINI_API_KEY in apps/server/.env to enable AI processing.');
    console.log('  📎  Get a free key at: https://aistudio.google.com/app/apikey');
    console.log('');
  }
});
