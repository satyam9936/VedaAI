import { processChatOnServer, ServerAiError } from '../apps/server/src/chatProxy';

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0 || apiKey === 'your_gemini_api_key_here') {
    res.status(503).json({
      error: 'Gemini API key is not configured in Vercel Environment Variables.',
      hint: 'Add GEMINI_API_KEY in your Vercel Project Settings -> Environment Variables.',
    });
    return;
  }

  const { messages, context } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Missing or invalid "messages" array.' });
    return;
  }

  try {
    const reply = await processChatOnServer(messages, context, apiKey);
    res.status(200).json({ success: true, reply });
  } catch (err: any) {
    if (err instanceof ServerAiError) {
      res.status(err.statusCode || 500).json({ error: err.message, hint: err.hint });
    } else {
      console.error('[Vercel Chat Error]:', err);
      res.status(500).json({ error: err.message || 'Failed to process chat response.' });
    }
  }
}
