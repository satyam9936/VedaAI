/**
 * Frontend client service for Veda AI Tutor & Teacher Copilot Chat.
 */

import { AssessmentData } from '@vedaai/types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

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
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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

/**
 * Converts an AssessmentData object to the format needed by the Chat endpoint.
 */
export function buildAssessmentChatContext(
  assessment: AssessmentData | null | undefined,
  selectedQuestionId: string | null = null
): AssessmentChatContext | undefined {
  if (!assessment) return undefined;

  const questions = assessment.questions.map((q) => ({
    id: q.id,
    number: q.subPart ? `${q.number}${q.subPart}` : q.number,
    text: q.text,
    maxMarks: q.maxMarks,
  }));

  const answers: Record<string, any> = {};
  Object.entries(assessment.answerMappings).forEach(([qId, mapping]) => {
    answers[qId] = {
      questionId: mapping.questionId,
      questionNumber: mapping.questionNumber,
      marksAwarded: mapping.marksAwarded,
      maxMarks: mapping.maxMarks,
      evaluationStatus: mapping.evaluationStatus,
      studentAnswerText: mapping.studentAnswerText,
      aiFeedback: mapping.aiFeedback,
      keyPointsFound: mapping.keyPointsFound,
      missedConcepts: mapping.missedConcepts,
    };
  });

  return {
    title: assessment.title,
    subject: assessment.subject,
    studentName: assessment.studentName,
    rollNumber: assessment.rollNumber,
    totalMaxMarks: assessment.totalMaxMarks,
    totalObtainedMarks: assessment.totalObtainedMarks,
    percentage: assessment.percentage,
    selectedQuestionId: selectedQuestionId || undefined,
    questions,
    answers,
    overallSummary: assessment.overallSummary
      ? {
          summaryText: assessment.overallSummary.summaryText,
          strengths: assessment.overallSummary.strengths,
          improvements: assessment.overallSummary.improvements,
        }
      : undefined,
  };
}

/**
 * Generates an intelligent built-in knowledge response for VedaAI platform questions
 * or active assessment evaluations when live API quota is temporarily rate-limited.
 */
export function generateKnowledgeFallbackResponse(
  query: string,
  context?: AssessmentChatContext
): string | null {
  const q = query.toLowerCase().trim();

  // 1. "How does VedaAI extract and grade handwritten answer sheets?"
  if (
    q.includes('extract') &&
    (q.includes('handwritten') || q.includes('answer sheet') || q.includes('grade') || q.includes('work'))
  ) {
    return `### 📝 How VedaAI Extracts & Grades Handwritten Answer Sheets

VedaAI uses an end-to-end multimodal vision AI pipeline designed specifically for handwritten academic evaluations:

1. **📄 High-Resolution Dual Ingestion**:
   - Both the **Question Paper** (or rubric) and the **Student Handwritten Answer Sheet** are normalized and converted into high-fidelity image buffers.

2. **🔍 Vision OCR & Layout Decomposition**:
   - The multimodal AI model reads cursive, printed, and mixed handwriting across all pages while mapping visual diagram elements and mathematical formulas.

3. **🔀 Out-of-Order Question Mapping**:
   - Students frequently answer questions out of sequence. VedaAI scans all pages, detects handwritten question labels (e.g. *Q3(b)*, *Ans 1*), and dynamically links each response back to the corresponding question in the paper.

4. **🎯 Rubric & Concept-Based Scoring**:
   - Rather than simple keyword matching, the AI evaluates **semantic understanding**, step-by-step logic, and required criteria. Partial marks are awarded accurately based on the question's rubric.

5. **📍 Bounding Box Localization**:
   - The AI returns exact pixel coordinates \`[ymin, xmin, ymax, xmax]\` for each answered section, allowing interactive on-canvas highlights on the answer sheet.

6. **💡 Pedagogical Feedback**:
   - For every question, VedaAI identifies **Key Points Found** and **Missed Concepts**, generating clear feedback and personalized improvement suggestions.`;
  }

  // 2. "What criteria does the AI vision model use for scoring?"
  if (q.includes('criteria') || (q.includes('scoring') && q.includes('model')) || q.includes('rubric')) {
    return `### ⚖️ AI Vision Scoring Criteria in VedaAI

VedaAI adheres to strict pedagogical evaluation standards:

- **Rubric Alignment**: Adheres strictly to the maximum marks allocated per question and sub-part.
- **Conceptual Accuracy**: Identifies essential definitions, formulas, key steps, and analytical reasoning.
- **Partial Credit Distribution**: Evaluates step-by-step working so students receive fair credit for correct intermediate steps even if the final calculation is incomplete.
- **No Hallucination or Bias**: Answers are evaluated solely on what is legibly written on the student's submission.
- **Constructive Breakdown**: Every mark deduction is tied directly to missing concepts or factual inaccuracies.`;
  }

  // 3. "How are out-of-order answers matched?"
  if (q.includes('out-of-order') || q.includes('out of order') || (q.includes('match') && q.includes('question'))) {
    return `### 🔀 Out-of-Order Answer Matching in VedaAI

When students write answers out of sequence across multiple pages:

1. **Global Scan**: VedaAI processes all answer sheet pages holistically rather than in a rigid sequential queue.
2. **Header & Context Detection**: It reads handwritten indicators such as \`Q4\`, \`Ans. 2 (a)\`, or section markers.
3. **Semantic Correlation**: If a student forgets to write a question number, the AI analyzes the subject matter of the text and aligns it with the most matching question from the question paper.
4. **Visual Indicator**: Successfully mapped out-of-order answers are flagged with the **Out of Order** badge in the question navigation list.`;
  }

  // 4. Assessment-specific: Why were marks deducted for a specific question?
  if (context && context.questions && context.questions.length > 0) {
    const matchedQ = context.questions.find((quest) => {
      const qNum = quest.number.toLowerCase();
      return (
        (q.includes(`q${qNum}`) || q.includes(`question ${qNum}`) || q.includes(`question no ${qNum}`)) &&
        (q.includes('mark') || q.includes('deduct') || q.includes('why') || q.includes('feedback') || q.includes('miss'))
      );
    });

    if (matchedQ) {
      const ans = context.answers ? context.answers[matchedQ.id] : null;
      if (ans) {
        return `### 📋 Question ${ans.questionNumber} Evaluation Breakdown

- **Question**: *${matchedQ.text}*
- **Score Awarded**: **${ans.marksAwarded} / ${ans.maxMarks} marks** (${ans.evaluationStatus.toUpperCase()})

**Student Answer:**
> "${ans.studentAnswerText || '[No written response]'}"

**AI Feedback & Rationale:**
${ans.aiFeedback || 'Evaluation completed based on rubric.'}

${ans.keyPointsFound && ans.keyPointsFound.length > 0 ? `**✅ Key Concepts Present:**\n${ans.keyPointsFound.map((k) => `- ${k}`).join('\n')}\n` : ''}
${ans.missedConcepts && ans.missedConcepts.length > 0 ? `**❌ Missed Concepts:**\n${ans.missedConcepts.map((m) => `- ${m}`).join('\n')}\n` : ''}`;
      }
    }

    // 5. Weak areas / Improvement summary
    if (q.includes('weak') || q.includes('improve') || q.includes('summary') || q.includes('breakdown')) {
      const strengths = context.overallSummary?.strengths || [];
      const improvements = context.overallSummary?.improvements || [];
      return `### 📊 Assessment Summary & Student Performance

- **Student**: **${context.studentName || 'Student'}** (Roll: ${context.rollNumber || 'N/A'})
- **Total Score**: **${context.totalObtainedMarks ?? 0} / ${context.totalMaxMarks ?? 0}** (${context.percentage ?? 0}%)
- **Subject**: ${context.subject || context.title || 'General'}

${context.overallSummary?.summaryText ? `**Overall Summary:**\n${context.overallSummary.summaryText}\n` : ''}

${strengths.length > 0 ? `**🌟 Key Strengths:**\n${strengths.map((s) => `- ${s}`).join('\n')}\n` : ''}
${improvements.length > 0 ? `**📈 Priority Areas for Improvement:**\n${improvements.map((i) => `- ${i}`).join('\n')}\n` : ''}`;
    }
  }

  return null;
}

/**
 * Direct client-side Gemini fallback caller (used when user provides client key or backend is rate-limited).
 */
async function callGeminiChatDirect(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context: AssessmentChatContext | undefined,
  apiKey: string
): Promise<string> {
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
  .map((q) => {
    const ans = context.answers ? context.answers[q.id] : null;
    return `
[Question ${q.number}] (Max: ${q.maxMarks} marks):
Question: ${q.text}
Student answer: ${ans?.studentAnswerText || '[Unanswered]'}
Marks: ${ans?.marksAwarded ?? 0} / ${q.maxMarks} (${ans?.evaluationStatus || 'unanswered'})
Feedback: ${ans?.aiFeedback || 'No feedback'}
`;
  })
  .join('\n')}
`;
  }

  const systemInstruction = `You are "Veda AI Tutor" — an expert academic grading assistant and pedagogical tutor embedded inside the VedaAI assessment platform.
Your goals:
1. Explain grading decisions clearly and objectively based on the student's evaluated exam.
2. If asked for model answers, question papers, rubrics, or lesson plans, provide comprehensive, high-quality, formatted markdown output with bold headings and structured bullet points.
3. Keep answers friendly, constructive, formatted with markdown bullet points and bold highlights for readability.
4. If no specific exam is loaded, answer general academic and exam preparation questions.

${contextDescription}`;

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const payload = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1536,
    },
  };

  let lastStatus = 500;
  for (let i = 0; i < CANDIDATE_MODELS.length; i++) {
    const model = CANDIDATE_MODELS[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim(),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim().length > 0) return reply;
      }

      lastStatus = res.status;
      continue;
    } catch {
      continue;
    }
  }

  // Check if we can satisfy via knowledge base fallback
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const fallback = generateKnowledgeFallbackResponse(lastUserMsg, context);
  if (fallback) return fallback;

  throw new Error(`All Gemini models are currently rate-limited (${lastStatus}). Please wait a moment and retry.`);
}

/**
 * Sends messages and exam context to the backend chat route, falling back to direct client call or built-in knowledge.
 */
export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: AssessmentChatContext,
  customApiKey?: string | null
): Promise<string> {
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('VEDA_GEMINI_API_KEY') : null;
  const effectiveKey = (customApiKey || storedKey || '').trim();
  const lastUserMsg = messages[messages.length - 1]?.content || '';

  // Try backend first
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (effectiveKey) {
      headers['x-gemini-api-key'] = effectiveKey;
    }

    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages,
        context,
        apiKey: effectiveKey || undefined,
      }),
    });

    const rawText = await response.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }

    if (response.ok && data?.reply) {
      return data.reply;
    }

    // If backend returned 429 or 503 or failed, and user has client API key, try direct client-side
    if (effectiveKey && (response.status === 429 || response.status === 502 || response.status === 503 || !response.ok)) {
      console.warn('Backend chat returned', response.status, '— trying direct Gemini API with user key...');
      return await callGeminiChatDirect(messages, context, effectiveKey);
    }

    // If rate limited, check for knowledge base answer before throwing
    const fallbackAnswer = generateKnowledgeFallbackResponse(lastUserMsg, context);
    if (fallbackAnswer) {
      return fallbackAnswer;
    }

    if (response.status === 429 || data?.error?.includes('429')) {
      throw new Error(
        'Gemini API Rate Limit (429): Google AI free-tier quota is currently busy. Please wait ~15 seconds or add your free personal Gemini API key using the Key icon 🔑 in the top bar.'
      );
    }

    throw new Error(data?.error || data?.hint || `Server returned status ${response.status}`);
  } catch (err: any) {
    // If backend was unreachable but we have a client key, try direct client-side
    if (effectiveKey) {
      try {
        return await callGeminiChatDirect(messages, context, effectiveKey);
      } catch (directErr: any) {
        const fallback = generateKnowledgeFallbackResponse(lastUserMsg, context);
        if (fallback) return fallback;
        throw new Error(directErr?.message || err?.message || 'Chat request failed');
      }
    }

    // Check knowledge fallback before giving up
    const fallback = generateKnowledgeFallbackResponse(lastUserMsg, context);
    if (fallback) return fallback;

    if (err?.message?.includes('429')) {
      throw new Error(
        'Gemini API Rate Limit (429): Google AI free-tier quota is busy. Please wait ~15-30 seconds or add your personal Gemini API key in the top bar.'
      );
    }

    throw err;
  }
}

