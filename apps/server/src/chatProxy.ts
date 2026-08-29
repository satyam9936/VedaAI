/**
 * Server-side Chat Proxy for Veda AI Tutor.
 *
 * Handles intelligent query answering about student assessments, question rubrics,
 * grading rationale, score breakdowns, and generating model answers.
 */

import { ServerAiError } from './geminiProxy.js';

const MODEL = 'gemini-3.6-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

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
      'Check GEMINI_API_KEY in apps/server/.env',
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
3. If asked for model answers or study tips, provide clear, concise, step-by-step educational explanations.
4. Keep answers friendly, constructive, formatted with markdown bullet points and bold highlights for readability.
5. If no specific exam is loaded, answer general academic and exam preparation questions.

${contextDescription}`;

  // Format messages into Gemini contents structure
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey.trim()
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        }
      })
    });
  } catch (err) {
    throw new ServerAiError('Could not connect to Gemini AI chat services.', undefined, 502);
  }

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new ServerAiError(`Gemini chat error (${response.status})`, errBody, 502);
  }

  const data = await response.json();
  const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!replyText) {
    throw new ServerAiError('Gemini returned an empty response.', undefined, 502);
  }

  return replyText;
}
