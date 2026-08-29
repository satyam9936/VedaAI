export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey.trim().length === 0 || apiKey === 'your_gemini_api_key_here') {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured in Vercel Environment Variables.',
      hint: 'Go to Vercel -> Project Settings -> Environment Variables and add GEMINI_API_KEY.',
    });
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
3. If asked for model answers or study tips, provide clear, concise, step-by-step educational explanations.
4. Keep answers friendly, constructive, formatted with markdown bullet points and bold highlights for readability.
5. If no specific exam is loaded, answer general academic and exam preparation questions.

${contextDescription}`;

  // Format messages for Gemini API
  const contents = messages.map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const model = 'gemini-3.6-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey.trim(),
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => '');
      res.status(502).json({
        error: `Gemini API Error (${geminiRes.status})`,
        hint: errText.slice(0, 300),
      });
      return;
    }

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      res.status(502).json({ error: 'Gemini returned an empty reply.' });
      return;
    }

    res.status(200).json({ success: true, reply });
  } catch (err: any) {
    console.error('[Vercel Serverless Chat Error]:', err);
    res.status(500).json({
      error: err?.message || 'Failed to communicate with Gemini AI.',
    });
  }
}
