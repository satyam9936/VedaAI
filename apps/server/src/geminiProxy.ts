/**
 * Server-side Gemini Vision API proxy.
 *
 * This is the server-side equivalent of the browser-based aiService.ts.
 * It receives uploaded file buffers, converts them to base64, sends them
 * to the Gemini API using the server's API key, and returns structured
 * assessment data.
 */

import sharp from 'sharp';
import {
  AssessmentData,
  AnswerMapping,
  BoundingBox,
  Question,
  UnmatchedAnswer,
} from '@vedaai/types';

// ---------------------------------------------------------------------------
// Model config — keep in sync with the client-side aiService.ts
// ---------------------------------------------------------------------------

const MODEL = 'gemini-3.6-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const MAX_INLINE_BYTES = 18 * 1024 * 1024;
const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 85; // sharp uses 0-100 integer

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageImage {
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  sourceName: string;
  pageNumber: number;
  /** data: URL for the frontend viewer */
  dataUrl: string;
}

export class ServerAiError extends Error {
  constructor(message: string, public readonly hint?: string, public readonly statusCode: number = 500) {
    super(message);
    this.name = 'ServerAiError';
  }
}

// ---------------------------------------------------------------------------
// File → PageImage conversion (server-side, using sharp instead of Canvas)
// ---------------------------------------------------------------------------

export async function fileBuffersToPages(
  files: Array<{ buffer: Buffer; originalname: string; mimetype: string }>
): Promise<PageImage[]> {
  const pages: PageImage[] = [];

  for (const file of files) {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      // For PDFs, we'll use sharp to convert each page
      // sharp doesn't natively handle multi-page PDFs, so we process page 1
      // For multi-page PDF support, we convert the whole PDF
      const pdfPages = await rasterizePdfServer(file.buffer, file.originalname);
      pages.push(...pdfPages);
    } else if (file.mimetype.startsWith('image/')) {
      const page = await normalizeImageServer(file.buffer, file.originalname);
      pages.push(page);
    } else {
      throw new ServerAiError(
        `Unsupported file type "${file.mimetype || file.originalname}". Upload a PDF, PNG, or JPG.`,
        undefined,
        400
      );
    }
  }

  return pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
}

async function normalizeImageServer(buffer: Buffer, filename: string): Promise<PageImage> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const srcW = metadata.width ?? 800;
  const srcH = metadata.height ?? 600;

  const ratio = Math.min(1, MAX_EDGE_PX / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * ratio));
  const height = Math.max(1, Math.round(srcH * ratio));

  const jpegBuffer = await image
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  const base64 = jpegBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  return {
    base64,
    mimeType: 'image/jpeg',
    width,
    height,
    sourceName: filename,
    pageNumber: 1,
    dataUrl,
  };
}

async function rasterizePdfServer(buffer: Buffer, filename: string): Promise<PageImage[]> {
  // sharp can handle single-page PDFs. For multi-page, we extract each page.
  // sharp uses libvips which supports PDF rendering via poppler.
  const pages: PageImage[] = [];

  try {
    // First, check how many pages the PDF has
    const metadata = await sharp(buffer, { density: 200 }).metadata();
    const pageCount = metadata.pages ?? 1;

    for (let i = 0; i < pageCount; i++) {
      const image = sharp(buffer, { page: i, density: 200 });
      const pageMeta = await image.metadata();
      const srcW = pageMeta.width ?? 800;
      const srcH = pageMeta.height ?? 600;

      const ratio = Math.min(1, MAX_EDGE_PX / Math.max(srcW, srcH));
      const width = Math.max(1, Math.round(srcW * ratio));
      const height = Math.max(1, Math.round(srcH * ratio));

      const jpegBuffer = await image
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: JPEG_QUALITY })
        .toBuffer();

      const base64 = jpegBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      pages.push({
        base64,
        mimeType: 'image/jpeg',
        width,
        height,
        sourceName: filename,
        pageNumber: i + 1,
        dataUrl,
      });
    }
  } catch (err) {
    throw new ServerAiError(
      `Could not open PDF "${filename}". It may be corrupt or password-protected.`,
      'Try re-scanning or removing the password.',
      400
    );
  }

  return pages;
}

// ---------------------------------------------------------------------------
// Payload size estimation
// ---------------------------------------------------------------------------

function estimatePayloadBytes(pages: PageImage[]): number {
  return pages.reduce((sum, p) => sum + Math.ceil(p.base64.length * 0.75), 0);
}

// ---------------------------------------------------------------------------
// Gemini API call
// ---------------------------------------------------------------------------

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

/**
 * Main entry point: process uploaded files through Gemini Vision API.
 * Returns a fully structured AssessmentData object.
 */
export async function processAssessmentOnServer(
  qpFiles: Array<{ buffer: Buffer; originalname: string; mimetype: string }>,
  ansFiles: Array<{ buffer: Buffer; originalname: string; mimetype: string }>,
  apiKey: string
): Promise<AssessmentData> {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new ServerAiError(
      'No Gemini API key configured on the server.',
      'Set GEMINI_API_KEY in your .env file.',
      503
    );
  }

  if (qpFiles.length === 0 || ansFiles.length === 0) {
    throw new ServerAiError(
      'Upload both a question paper and an answer sheet.',
      undefined,
      400
    );
  }

  // Convert files to page images
  const qpPages = await fileBuffersToPages(qpFiles);
  const ansPages = await fileBuffersToPages(ansFiles);

  // Check total payload size
  const bytes = estimatePayloadBytes(qpPages) + estimatePayloadBytes(ansPages);
  if (bytes > MAX_INLINE_BYTES) {
    throw new ServerAiError(
      `Your files render to ~${Math.round(bytes / 1024 / 1024)}MB, over Gemini's 20MB inline limit.`,
      'Upload fewer pages at a time, or split the answer sheet.',
      413
    );
  }

  // Call Gemini Vision API
  const raw = await callGeminiVisionAPI(qpPages, ansPages, apiKey.trim());

  // Convert to AssessmentData
  return toAssessmentData(raw, qpPages, ansPages);
}

async function callGeminiVisionAPI(
  qpPages: PageImage[],
  ansPages: PageImage[],
  apiKey: string
): Promise<WireResult> {
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

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.1,
          maxOutputTokens: 65536,
        },
      }),
    });
  } catch {
    throw new ServerAiError(
      'Could not reach the Gemini API from the server.',
      'Check internet connection and firewall settings.',
      502
    );
  }

  if (!response.ok) throw await describeHttpError(response);

  const data = await response.json();

  if (data.promptFeedback?.blockReason) {
    throw new ServerAiError(
      `Gemini blocked the request (${data.promptFeedback.blockReason}).`,
      'This usually means a page was misread as unsafe content.',
      422
    );
  }

  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new ServerAiError('Gemini returned no result for your pages.', 'Try clearer scans.', 502);
  }

  const finish = candidate.finishReason;
  if (finish === 'MAX_TOKENS') {
    throw new ServerAiError('The answer sheet produced more output than one request allows.', 'Upload fewer pages.', 413);
  }
  if (finish === 'SAFETY' || finish === 'RECITATION') {
    throw new ServerAiError(`Gemini stopped early (${finish}).`, undefined, 422);
  }

  const text: string = (candidate.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new ServerAiError(
      `Gemini returned an empty response (finishReason: ${finish ?? 'unknown'}).`,
      'Try again, or upload fewer pages.',
      502
    );
  }

  try {
    return JSON.parse(stripCodeFence(text)) as WireResult;
  } catch {
    throw new ServerAiError('Gemini returned a response that was not valid JSON.', 'Try again.', 502);
  }
}

async function describeHttpError(response: Response): Promise<ServerAiError> {
  let detail = '';
  try {
    const body = await response.json();
    detail = body?.error?.message ?? '';
  } catch { /* non-JSON */ }

  if (response.status === 400 && /API key not valid/i.test(detail)) {
    return new ServerAiError('The server\'s Gemini API key is not valid.', 'Update GEMINI_API_KEY in .env.', 502);
  }
  if (response.status === 403) {
    return new ServerAiError('Gemini rejected the server key (403).', 'Check key restrictions.', 502);
  }
  if (response.status === 404) {
    return new ServerAiError(`Model "${MODEL}" is not available (404).`, detail || 'Try updating the model name.', 502);
  }
  if (response.status === 429) {
    return new ServerAiError('Gemini rate limit exceeded (429).', 'Wait a minute and retry.', 429);
  }
  if (response.status >= 500) {
    return new ServerAiError(`Gemini server error (${response.status}).`, 'Retry shortly.', 502);
  }
  return new ServerAiError(`Gemini request failed (${response.status}).`, detail || undefined, 502);
}

function stripCodeFence(text: string): string {
  const fenced = text.match(/^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/);
  return fenced ? fenced[1] : text;
}

// ---------------------------------------------------------------------------
// Wire → app model (mirrors client-side toAssessmentData)
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
    throw new ServerAiError(
      'Gemini could not find any questions on the question paper.',
      'Make sure the question paper is right-side up and in focus.',
      422
    );
  }

  const validIds = new Set(questions.map((q) => q.id));
  const answerMappings: Record<string, AnswerMapping> = {};

  for (const a of raw.answers ?? []) {
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
