import {
  AssessmentData,
  AnswerMapping,
  BoundingBox,
  ProcessingStatus,
  Question,
  UnmatchedAnswer,
} from '@vedaai/types';
import { SAMPLE_BIOLOGY_ASSESSMENT } from './sampleAssessments';
import { filesToPages, estimatePayloadBytes, PageImage } from './fileUtils';

/**
 * Model choice is a moving target — keep this in one place.
 * gemini-1.5-flash was shut down 2025-09-29 (and was already unavailable to new projects
 * from 2025-04-29). gemini-2.5-flash then also closed to new users, with Google's own 404
 * body pointing at gemini-3.6-flash as the replacement. If this 404s again, the error we
 * surface quotes Google's recommended successor — put that string here.
 */
const MODEL = 'gemini-3.6-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** Gemini rejects inline requests over 20MB. */
const MAX_INLINE_BYTES = 18 * 1024 * 1024;

export class AiEngineError extends Error {
  constructor(message: string, public readonly hint?: string) {
    super(message);
    this.name = 'AiEngineError';
  }
}

/**
 * Runs the real extraction pipeline. Progress reflects what is ACTUALLY happening.
 * Throws AiEngineError on failure — it no longer pretends to succeed by returning
 * the hardcoded biology sample, which is what made every failure look like a bad
 * AI result instead of a broken request.
 */
export async function processAssessmentWithAI(
  questionPaperFiles: File[],
  answerSheetFiles: File[],
  geminiApiKey: string | null,
  onProgress: (status: ProcessingStatus) => void
): Promise<AssessmentData> {
  if (!geminiApiKey || geminiApiKey.trim().length === 0) {
    throw new AiEngineError(
      'No Gemini API key set, so nothing can be read from your files.',
      'Open the key icon in the top bar and paste a free key from aistudio.google.com/app/apikey.'
    );
  }
  if (questionPaperFiles.length === 0 || answerSheetFiles.length === 0) {
    throw new AiEngineError('Upload both a question paper and an answer sheet.');
  }

  onProgress({ step: 'uploading', progressPercentage: 10, message: 'Reading and rendering your files...' });

  const qpPages = await filesToPages(questionPaperFiles);
  const ansPages = await filesToPages(answerSheetFiles);

  const bytes = estimatePayloadBytes(qpPages) + estimatePayloadBytes(ansPages);
  if (bytes > MAX_INLINE_BYTES) {
    throw new AiEngineError(
      `Your files render to ~${Math.round(bytes / 1024 / 1024)}MB, over Gemini's 20MB inline limit.`,
      'Upload fewer pages at a time, or split the answer sheet.'
    );
  }

  onProgress({
    step: 'extracting_questions',
    progressPercentage: 30,
    message: `Sending ${qpPages.length} question page(s) + ${ansPages.length} answer page(s) to Gemini...`,
  });

  const raw = await callGeminiVisionAPI(qpPages, ansPages, geminiApiKey.trim(), onProgress);

  onProgress({ step: 'mapping_answers', progressPercentage: 90, message: 'Mapping answers to questions...' });

  const assessment = toAssessmentData(raw, qpPages, ansPages);

  onProgress({ step: 'complete', progressPercentage: 100, message: 'Extraction complete!' });
  return assessment;
}

/** Kept so the "Load Sample Exam" button still works without a key. */
export function getSampleAssessment(): AssessmentData {
  return SAMPLE_BIOLOGY_ASSESSMENT;
}

// ---------------------------------------------------------------------------
// Wire schema
//
// responseSchema CANNOT express a free-form map (Record<string, AnswerMapping>) —
// additionalProperties does not exist in the proto and is dropped. So we ask for
// ARRAYS and build the keyed map ourselves in toAssessmentData().
// Boxes are requested as four separate 0-1000 integers rather than a 4-element
// array, which removes any ambiguity about axis order.
// ---------------------------------------------------------------------------

const BOX_PROPS = {
  page: { type: 'integer', description: '1-based page number of the ANSWER SHEET' },
  ymin: { type: 'integer', description: 'Top edge, 0-1000, normalized to that page' },
  xmin: { type: 'integer', description: 'Left edge, 0-1000' },
  ymax: { type: 'integer', description: 'Bottom edge, 0-1000' },
  xmax: { type: 'integer', description: 'Right edge, 0-1000' },
} as const;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    subject: { type: 'string' },
    studentName: { type: 'string' },
    rollNumber: { type: 'string' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Stable slug, e.g. "q1" or "q11a"' },
          number: { type: 'string' },
          subPart: { type: 'string', description: 'e.g. "a"; empty string if none' },
          text: { type: 'string' },
          maxMarks: { type: 'integer' },
          section: { type: 'string' },
          expectedKeywords: { type: 'array', items: { type: 'string' } },
        },
        required: ['id', 'number', 'text', 'maxMarks'],
        propertyOrdering: ['id', 'number', 'subPart', 'text', 'maxMarks', 'section', 'expectedKeywords'],
      },
    },
    answers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          questionId: { type: 'string', description: 'MUST match a questions[].id' },
          isAnswered: { type: 'boolean' },
          isOutOfOrder: { type: 'boolean' },
          studentAnswerText: { type: 'string' },
          boxes: { type: 'array', items: { type: 'object', properties: BOX_PROPS, required: ['page', 'ymin', 'xmin', 'ymax', 'xmax'] } },
          marksAwarded: { type: 'integer' },
          maxMarks: { type: 'integer' },
          evaluationStatus: { type: 'string', enum: ['correct', 'partial', 'incorrect', 'unanswered', 'needs_review'] },
          aiFeedback: { type: 'string' },
          keyPointsFound: { type: 'array', items: { type: 'string' } },
          missedConcepts: { type: 'array', items: { type: 'string' } },
        },
        required: ['questionId', 'isAnswered', 'isOutOfOrder', 'studentAnswerText', 'boxes', 'marksAwarded', 'maxMarks', 'evaluationStatus', 'aiFeedback'],
        propertyOrdering: ['questionId', 'isAnswered', 'isOutOfOrder', 'studentAnswerText', 'boxes', 'marksAwarded', 'maxMarks', 'evaluationStatus', 'aiFeedback', 'keyPointsFound', 'missedConcepts'],
      },
    },
    unmatchedAnswers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          studentAnswerText: { type: 'string' },
          box: { type: 'object', properties: BOX_PROPS, required: ['page', 'ymin', 'xmin', 'ymax', 'xmax'] },
          aiNote: { type: 'string' },
        },
        required: ['studentAnswerText', 'box', 'aiNote'],
      },
    },
    overallSummary: {
      type: 'object',
      properties: {
        summaryText: { type: 'string' },
        strengths: { type: 'array', items: { type: 'string' } },
        improvements: { type: 'array', items: { type: 'string' } },
      },
      required: ['summaryText', 'strengths', 'improvements'],
    },
  },
  required: ['title', 'subject', 'studentName', 'questions', 'answers', 'overallSummary'],
  propertyOrdering: ['title', 'subject', 'studentName', 'rollNumber', 'questions', 'answers', 'unmatchedAnswers', 'overallSummary'],
};

const SYSTEM_PROMPT = `You are an expert exam evaluator and document vision parser.

You are given the pages of a QUESTION PAPER followed by the pages of a single student's
HANDWRITTEN ANSWER SHEET. Each image is preceded by a text label saying exactly which
document and page it is. Read the actual images. Never invent content that is not visible.

TASKS
1. Extract every question from the QUESTION PAPER pages, in paper order. Split sub-parts into
   separate entries (Q11 with parts (a) and (b) becomes two entries: number "11" subPart "a",
   and number "11" subPart "b"). Capture the marks shown for each, and the section heading.
2. Read the student's handwriting on the ANSWER SHEET pages. For each extracted question,
   decide whether it was answered, and transcribe the answer verbatim.
3. Set isOutOfOrder true when the answer's physical position on the sheet does not follow the
   question paper's order (e.g. Q5 answered before Q3).
4. For every answered question give boxes: the region(s) of the ANSWER SHEET containing that
   answer. Coordinates are integers 0-1000 normalized to the page they appear on, where
   ymin/ymax measure from the TOP and xmin/xmax from the LEFT. Use the page number from that
   page's label. An answer spanning two pages gets one box per page. Leave boxes empty ([]) for
   unanswered questions.
5. Grade each answer against the question: marksAwarded (never above maxMarks), evaluationStatus,
   and specific aiFeedback naming what was right or missing. Use "unanswered" status and 0 marks
   for blanks.
6. Put handwriting that matches no question into unmatchedAnswers.
7. If the student's name or roll number is written on the sheet, extract it; otherwise use "Unknown".

Every answers[].questionId MUST exactly match one questions[].id.`;

interface WireBox { page: number; ymin: number; xmin: number; ymax: number; xmax: number }
interface WireResult {
  title?: string;
  subject?: string;
  studentName?: string;
  rollNumber?: string;
  questions?: Array<{ id: string; number: string; subPart?: string; text: string; maxMarks: number; section?: string; expectedKeywords?: string[] }>;
  answers?: Array<{ questionId: string; isAnswered: boolean; isOutOfOrder: boolean; studentAnswerText: string; boxes: WireBox[]; marksAwarded: number; maxMarks: number; evaluationStatus: AnswerMapping['evaluationStatus']; aiFeedback: string; keyPointsFound?: string[]; missedConcepts?: string[] }>;
  unmatchedAnswers?: Array<{ studentAnswerText: string; box: WireBox; aiNote: string }>;
  overallSummary?: { summaryText: string; strengths: string[]; improvements: string[] };
}

async function callGeminiVisionAPI(
  qpPages: PageImage[],
  ansPages: PageImage[],
  apiKey: string,
  onProgress: (status: ProcessingStatus) => void
): Promise<WireResult> {
  // Interleave a text label before each image so the model can cite page numbers reliably.
  const parts: Array<Record<string, unknown>> = [{ text: SYSTEM_PROMPT }];

  parts.push({ text: `--- QUESTION PAPER (${qpPages.length} page(s)) ---` });
  qpPages.forEach((p, i) => {
    parts.push({ text: `QUESTION PAPER page ${i + 1}:` });
    parts.push({ inlineData: { mimeType: p.mimeType, data: p.base64 } });
  });

  parts.push({ text: `--- STUDENT HANDWRITTEN ANSWER SHEET (${ansPages.length} page(s)) ---` });
  ansPages.forEach((p, i) => {
    parts.push({ text: `ANSWER SHEET page ${i + 1}:` });
    parts.push({ inlineData: { mimeType: p.mimeType, data: p.base64 } });
  });

  onProgress({
    step: 'scanning_handwriting',
    progressPercentage: 55,
    message: 'Gemini is reading the handwriting (this can take 30-60s)...',
  });

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      // Header beats ?key= in the URL: query strings leak into logs and referrers.
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.1,
          // Deliberately generous, and no thinkingConfig. These models think by default,
          // and thinking plus a small output cap returns EMPTY parts with
          // finishReason MAX_TOKENS. Capping high avoids that without sending a
          // thinkingBudget/thinkingLevel field whose name differs across model
          // generations (2.5 wants thinkingBudget, 3.x wants thinkingLevel).
          maxOutputTokens: 65536,
        },
      }),
    });
  } catch (err) {
    throw new AiEngineError(
      'Could not reach the Gemini API.',
      'Check your internet connection, and any ad blocker or VPN blocking googleapis.com.'
    );
  }

  if (!response.ok) throw await describeHttpError(response);

  const data = await response.json();

  if (data.promptFeedback?.blockReason) {
    throw new AiEngineError(
      `Gemini blocked the request (${data.promptFeedback.blockReason}).`,
      'This usually means a page was misread as unsafe content. Try re-scanning it.'
    );
  }

  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new AiEngineError('Gemini returned no result for your pages.', 'Try clearer, higher-contrast scans.');
  }

  const finish = candidate.finishReason;
  if (finish === 'MAX_TOKENS') {
    throw new AiEngineError(
      'The answer sheet produced more output than one request allows.',
      'Upload fewer pages at a time.'
    );
  }
  if (finish === 'SAFETY' || finish === 'RECITATION') {
    throw new AiEngineError(`Gemini stopped early (${finish}) and returned nothing usable.`);
  }

  // Text can be split across multiple parts — parts[0] alone silently truncates the JSON.
  const text: string = (candidate.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new AiEngineError(
      `Gemini returned an empty response (finishReason: ${finish ?? 'unknown'}).`,
      'Try again, or upload fewer pages.'
    );
  }

  try {
    return JSON.parse(stripCodeFence(text)) as WireResult;
  } catch {
    throw new AiEngineError(
      'Gemini returned a response that was not valid JSON.',
      'Try again — this is usually transient.'
    );
  }
}

async function describeHttpError(response: Response): Promise<AiEngineError> {
  let detail = '';
  try {
    const body = await response.json();
    detail = body?.error?.message ?? '';
  } catch {
    /* non-JSON error body */
  }

  if (response.status === 400 && /API key not valid/i.test(detail)) {
    return new AiEngineError('Your Gemini API key is not valid.', 'Generate a fresh key at aistudio.google.com/app/apikey.');
  }
  if (response.status === 403) {
    return new AiEngineError(
      'Gemini rejected the key (403).',
      'The key may be restricted, or the Generative Language API is not enabled for its project.'
    );
  }
  if (response.status === 404) {
    return new AiEngineError(
      `The model "${MODEL}" is not available to your API key (404).`,
      detail || 'Your key may be too old or region-restricted. Try model "gemini-flash-latest".'
    );
  }
  if (response.status === 429) {
    return new AiEngineError('Gemini rate limit / free-tier quota exceeded (429).', 'Wait a minute and retry.');
  }
  if (response.status >= 500) {
    return new AiEngineError(`Gemini is having server trouble (${response.status}).`, 'Retry in a moment.');
  }
  return new AiEngineError(`Gemini request failed (${response.status}).`, detail || undefined);
}

function stripCodeFence(text: string): string {
  // Belt and braces: with responseMimeType json there should be no fence, but a
  // stray ```json wrapper is a classic cause of "valid response, unparseable".
  const fenced = text.match(/^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/);
  return fenced ? fenced[1] : text;
}

// ---------------------------------------------------------------------------
// Wire -> app model
// ---------------------------------------------------------------------------

function toAssessmentData(raw: WireResult, qpPages: PageImage[], ansPages: PageImage[]): AssessmentData {
  const questions: Question[] = (raw.questions ?? []).map((q, i) => ({
    id: q.id || `q${i + 1}`,
    number: String(q.number ?? i + 1),
    rawNumber: String(q.number ?? i + 1),
    subPart: q.subPart || undefined,
    text: q.text ?? '',
    maxMarks: clampInt(q.maxMarks, 0, 100),
    section: q.section || undefined,
    expectedKeywords: q.expectedKeywords,
  }));

  if (questions.length === 0) {
    throw new AiEngineError(
      'Gemini could not find any questions on the question paper.',
      'Make sure the question paper page is right-side up, in focus, and fully in frame.'
    );
  }

  const validIds = new Set(questions.map((q) => q.id));
  const answerMappings: Record<string, AnswerMapping> = {};

  for (const a of raw.answers ?? []) {
    // Drop hallucinated ids rather than letting them create phantom rows.
    if (!validIds.has(a.questionId)) continue;

    const question = questions.find((q) => q.id === a.questionId)!;
    const maxMarks = clampInt(a.maxMarks ?? question.maxMarks, 0, 100) || question.maxMarks;

    answerMappings[a.questionId] = {
      questionId: a.questionId,
      questionNumber: question.subPart ? `${question.number}${question.subPart}` : question.number,
      isAnswered: Boolean(a.isAnswered),
      isOutOfOrder: Boolean(a.isOutOfOrder),
      status: a.isAnswered ? 'ANSWERED' : 'UNANSWERED',
      studentAnswerText: a.studentAnswerText || '[No response found on answer sheet]',
      boundingBoxes: a.isAnswered ? toPercentBoxes(a.boxes, ansPages.length, question) : [],
      marksAwarded: clampInt(a.marksAwarded, 0, maxMarks),
      maxMarks,
      evaluationStatus: a.isAnswered ? a.evaluationStatus ?? 'needs_review' : 'unanswered',
      aiFeedback: a.aiFeedback || 'No feedback returned.',
      keyPointsFound: a.keyPointsFound,
      missedConcepts: a.missedConcepts,
    };
  }

  // Any question Gemini skipped is still shown, as unanswered, so counts stay honest.
  for (const q of questions) {
    if (answerMappings[q.id]) continue;
    answerMappings[q.id] = {
      questionId: q.id,
      questionNumber: q.subPart ? `${q.number}${q.subPart}` : q.number,
      isAnswered: false,
      isOutOfOrder: false,
      status: 'UNANSWERED',
      studentAnswerText: '[No response found on answer sheet]',
      boundingBoxes: [],
      marksAwarded: 0,
      maxMarks: q.maxMarks,
      evaluationStatus: 'unanswered',
      aiFeedback: 'No answer was located for this question.',
    };
  }

  const unmatchedAnswers: UnmatchedAnswer[] = (raw.unmatchedAnswers ?? []).map((u, i) => ({
    id: `unmatched-${i + 1}`,
    studentAnswerText: u.studentAnswerText,
    page: clampInt(u.box?.page ?? 1, 1, ansPages.length),
    boundingBox: toPercentBox(u.box, ansPages.length),
    aiNote: u.aiNote,
  }));

  const mappings = Object.values(answerMappings);
  const totalMaxMarks = questions.reduce((s, q) => s + q.maxMarks, 0);
  const totalObtainedMarks = mappings.reduce((s, m) => s + m.marksAwarded, 0);
  const answeredCount = mappings.filter((m) => m.isAnswered).length;

  return {
    id: `gemini-${qpPages[0]?.sourceName ?? 'assessment'}`,
    title: raw.title || 'Extracted Assessment',
    subject: raw.subject || 'Exams',
    studentName: raw.studentName || 'Unknown',
    rollNumber: raw.rollNumber || '—',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    // THE critical wiring: without these the viewer renders <img src={undefined}>
    // and the highlight boxes float over a blank rectangle.
    questionPaperPages: qpPages.map((p) => p.dataUrl),
    answerSheetPages: ansPages.map((p) => p.dataUrl),
    questions,
    answerMappings,
    unmatchedAnswers,
    totalMaxMarks,
    totalObtainedMarks,
    percentage: totalMaxMarks > 0 ? Math.round((totalObtainedMarks / totalMaxMarks) * 100) : 0,
    overallSummary: {
      summaryText: raw.overallSummary?.summaryText || 'No summary returned.',
      strengths: raw.overallSummary?.strengths ?? [],
      improvements: raw.overallSummary?.improvements ?? [],
      totalQuestions: questions.length,
      answeredCount,
      unansweredCount: questions.length - answeredCount,
      outOfOrderCount: mappings.filter((m) => m.isOutOfOrder).length,
      accuracyPercentage: totalMaxMarks > 0 ? Math.round((totalObtainedMarks / totalMaxMarks) * 100) : 0,
    },
  };
}

/**
 * Gemini boxes are 0-1000 integers; AssessmentView positions overlays with CSS
 * percentages. Convert the whole box on one consistent scale — the old code tested
 * each coordinate individually against 100, so a box like {ymin:50, xmin:120} had
 * its two axes interpreted on different scales.
 */
function toPercentBoxes(boxes: WireBox[] | undefined, pageCount: number, question: Question): BoundingBox[] {
  return (boxes ?? [])
    .map((b) => toPercentBox(b, pageCount, question))
    .filter((b) => b.ymax > b.ymin && b.xmax > b.xmin);
}

function toPercentBox(box: WireBox | undefined, pageCount: number, question?: Question): BoundingBox {
  const b = box ?? { page: 1, ymin: 0, xmin: 0, ymax: 0, xmax: 0 };
  const label = question
    ? `Page ${b.page} - Ans ${question.subPart ? `${question.number}${question.subPart}` : question.number}`
    : undefined;

  return {
    page: clampInt(b.page, 1, Math.max(1, pageCount)),
    ymin: toPercent(b.ymin),
    xmin: toPercent(b.xmin),
    ymax: toPercent(b.ymax),
    xmax: toPercent(b.xmax),
    label,
  };
}

function toPercent(v: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, (n / 1000) * 100));
}

function clampInt(v: number, min: number, max: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
