const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-2.5-pro',
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-gemini-api-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Parse body safely (supports parsed object, string JSON, or raw buffer)
  let parsedBody: any = req.body;
  if (typeof parsedBody === 'string') {
    try {
      parsedBody = JSON.parse(parsedBody);
    } catch {
      res.status(400).json({ error: 'Invalid JSON body.' });
      return;
    }
  }

  // Support key from header, body, or server env
  const customHeaderKey = req.headers['x-gemini-api-key'] || req.headers['x-api-key'];
  const bodyKey = parsedBody?.apiKey;
  const envKey = process.env.GEMINI_API_KEY || '';
  const effectiveKey = (customHeaderKey || bodyKey || envKey || '').toString().trim();

  if (!effectiveKey || effectiveKey === 'your_gemini_api_key_here') {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured in Vercel Environment Variables.',
      hint: 'Add GEMINI_API_KEY in Vercel settings or provide your key using the key icon in the dashboard.',
    });
    return;
  }

  const { messages, context } = parsedBody || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Missing or invalid "messages" array.' });
    return;
  }

  // Build context summary
  let contextDescription = '';
  if (context && context.questions && context.questions.length > 0) {
    contextDescription = `
ASSESSMENT DATA CONTEXT:
- Exam Title: ${context.title || 'Standard Assessment'}
- Subject: ${context.subject || 'General'}
- Student: ${context.studentName || 'Student'} (Roll: ${context.rollNumber || 'N/A'})
- Overall Score: ${context.totalObtainedMarks ?? 0} / ${context.totalMaxMarks ?? 0} (${context.percentage ?? 0}%)
${context.selectedQuestionId ? `- User is currently viewing Question: ${context.selectedQuestionId}` : ''}

SUMMARY:
${context.overallSummary?.summaryText || 'N/A'}
Strengths: ${(context.overallSummary?.strengths || []).join(', ') || 'N/A'}
Areas to improve: ${(context.overallSummary?.improvements || []).join(', ') || 'N/A'}

QUESTIONS & EVALUATIONS:
${context.questions
  .map((q: any) => {
    const ans = context.answers ? context.answers[q.id] : null;
    return `
[Question ${q.number}] (Max: ${q.maxMarks} marks):
Question text: ${q.text}
Student answer: ${ans?.studentAnswerText || '[Unanswered]'}
Marks awarded: ${ans?.marksAwarded ?? 0} / ${q.maxMarks} (${ans?.evaluationStatus || 'unanswered'})
Feedback: ${ans?.aiFeedback || 'No feedback'}
Key points present: ${(ans?.keyPointsFound || []).join(', ') || 'None'}
Missed concepts: ${(ans?.missedConcepts || []).join(', ') || 'None'}
`;
  })
  .join('\n')}
`;
  }

  const systemInstruction = `You are "Veda AI Tutor" — an expert academic grading assistant and pedagogical tutor embedded inside the VedaAI assessment platform.
Your goals:
1. Explain grading decisions clearly and objectively based on the student's evaluated exam.
2. If asked why marks were deducted for a question, cite specific concepts that were missed according to the rubric and student's answer.
3. If asked for model answers, question papers, rubrics, or lesson plans, provide comprehensive, high-quality, formatted markdown output with bold headings and structured bullet points.
4. Keep answers friendly, constructive, formatted with markdown bullet points and bold highlights for readability.
5. If no specific exam is loaded, answer general academic and exam preparation questions.

${contextDescription}`;

  // Format messages for Gemini API
  const contents = messages.map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1536,
    },
  };

  let lastStatus = 500;
  let lastErrorText = '';
  let successfulReply: string | null = null;

  // Fast sequential cascade across low-latency candidate models
  for (let i = 0; i < CANDIDATE_MODELS.length; i++) {
    const model = CANDIDATE_MODELS[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
      const geminiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': effectiveKey,
        },
        body: JSON.stringify(payload),
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim().length > 0) {
          successfulReply = reply;
          break;
        }
      }

      lastStatus = geminiRes.status;
      lastErrorText = await geminiRes.text().catch(() => '');

      // On 404, 429, or 503, immediately try the next model without lingering
      continue;
    } catch (err: any) {
      lastErrorText = err?.message || 'Network error';
      continue;
    }
  }

  if (successfulReply) {
    res.status(200).json({ success: true, reply: successfulReply });
    return;
  }

  // If rate limited across all models
  if (lastStatus === 429) {
    res.status(429).json({
      error: 'Gemini Rate Limit (429): Google AI free-tier quota is currently busy.',
      hint: 'Please wait ~30 seconds, or add your own personal Gemini API key in the top bar.',
      status: 429,
    });
    return;
  }

  res.status(502).json({
    error: `Gemini API Error (${lastStatus})`,
    hint: lastErrorText.slice(0, 300) || 'Failed to get a response from Gemini AI. Please try again.',
  });
}
