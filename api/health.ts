export default function handler(_req: any, res: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasApiKey = Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'your_gemini_api_key_here');
  
  res.status(200).json({
    status: 'ok',
    hasApiKey,
    timestamp: new Date().toISOString(),
  });
}
