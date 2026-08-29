/**
 * Server-side Chat Proxy for Veda AI Tutor.
 *
 * Handles intelligent query answering about student assessments, question rubrics,
 * grading rationale, score breakdowns, and generating model answers.
 */

export class ServerAiError extends Error {
  constructor(message: string, public readonly hint?: string, public readonly statusCode: number = 500) {
    super(message);
    this.name = 'ServerAiError';
  }
}

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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssessmentChatContext {
  title?: string;
  subject?: string;
  studentName?: string;
  rollNumber?: string;
  totalMaxMarks?: number;
  totalObtainedMarks?: number;
  percentage?: number;
  selectedQuestionId?: string;
  questions?: Array<{
    id: string;
    number: string;
    text: string;
    maxMarks: number;
  }>;
  answers?: Record<string, {
    questionId: string;
    questionNumber: string;
    marksAwarded: number;
    maxMarks: number;
    evaluationStatus: string;
    studentAnswerText: string;
    aiFeedback: string;
    keyPointsFound?: string[];
    missedConcepts?: string[];
  }>;
  overallSummary?: {
    summaryText: string;
    strengths: string[];
    improvements: string[];
  };
}

export async function processChatOnServer(
  messages: ChatMessage[],
  context: AssessmentChatContext | undefined,
  apiKey: string
): Promise<string> {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new ServerAiError(
      'Gemini API key is not configured on the server.',
      'Check GEMINI_API_KEY in apps/server/.env or provide your key in dashboard settings.',
      503
    );
  }

  if (!messages || messages.length === 0) {
    throw new ServerAiError('No messages provided in conversation.', undefined, 400);
  }

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
${context.questions.map(q => {
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
}).join('\n')}
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

  // Format messages into Gemini contents structure
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1536,
    }
  };

  let lastStatus = 500;
  let lastErrorText = '';

  // Multi-model low-latency fallback sequence
  for (let i = 0; i < CANDIDATE_MODELS.length; i++) {
    const model = CANDIDATE_MODELS[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText && replyText.trim().length > 0) {
          return replyText;
        }
      }

      lastStatus = response.status;
      lastErrorText = await response.text().catch(() => '');

      // On 404, 429, or 503 immediately try next candidate model
      continue;
    } catch (err: any) {
      lastErrorText = err?.message || 'Network error';
      continue;
    }
  }

  if (lastStatus === 429) {
    throw new ServerAiError(
      'Gemini Rate Limit (429): Free tier quota is temporarily exhausted.',
      'Please wait ~30 seconds, or provide your personal Gemini API key in the top bar.',
      429
    );
  }

  throw new ServerAiError(`Gemini chat error (${lastStatus})`, lastErrorText.slice(0, 300), 502);
}
