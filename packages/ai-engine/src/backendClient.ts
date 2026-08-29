/**
 * Backend proxy client for VedaAI.
 *
 * Pre-renders uploaded files (PDFs / images) into high-fidelity page rasters
 * in the browser using PDF.js and sends structured page images to the backend server.
 * The backend handles the Gemini Vision API call securely.
 */

import { AssessmentData, ProcessingStatus } from '@vedaai/types';
import { filesToPages } from './fileUtils';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

export interface BackendStatus {
  available: boolean;
  hasApiKey: boolean;
}

/**
 * Check if the backend server is available and has an API key configured.
 */
export async function checkBackendHealth(): Promise<BackendStatus> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) return { available: false, hasApiKey: false };

    const data = await response.json();
    return {
      available: true,
      hasApiKey: Boolean(data.hasApiKey),
    };
  } catch {
    return { available: false, hasApiKey: false };
  }
}

/**
 * Send files to the backend server for AI assessment processing.
 *
 * @param questionPaperFiles - Question paper file(s)
 * @param answerSheetFiles - Answer sheet file(s)
 * @param onProgress - Progress callback
 * @param customApiKey - Optional custom API key
 * @returns AssessmentData from the backend
 */
export async function processAssessmentViaBackend(
  questionPaperFiles: File[],
  answerSheetFiles: File[],
  onProgress: (status: ProcessingStatus) => void,
  customApiKey?: string | null
): Promise<AssessmentData> {
  onProgress({
    step: 'uploading',
    progressPercentage: 15,
    message: `Rendering ${questionPaperFiles.length} QP & ${answerSheetFiles.length} answer file(s)...`,
  });

  // Client-side high-performance parallel rendering
  const qpPages = await filesToPages(questionPaperFiles, (curr, total, fileName) => {
    onProgress({
      step: 'uploading',
      progressPercentage: 10 + Math.round((curr / total) * 12),
      message: `Rendering QP page ${curr}/${total} (${fileName})...`,
    });
  });

  const ansPages = await filesToPages(answerSheetFiles, (curr, total, fileName) => {
    onProgress({
      step: 'uploading',
      progressPercentage: 22 + Math.round((curr / total) * 13),
      message: `Rendering answer sheet page ${curr}/${total} (${fileName})...`,
    });
  });

  onProgress({
    step: 'extracting_questions',
    progressPercentage: 38,
    message: `Sending ${qpPages.length} QP page(s) & ${ansPages.length} answer page(s) to Gemini Vision AI...`,
  });

  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('VEDA_GEMINI_API_KEY') : null;
  const effectiveKey = (customApiKey || storedKey || '').trim();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (effectiveKey) {
    headers['x-gemini-api-key'] = effectiveKey;
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/assess`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        qpPages,
        ansPages,
        apiKey: effectiveKey || undefined,
      }),
    });
  } catch {
    throw Object.assign(new Error('Could not connect to the VedaAI backend server.'), {
      hint: 'Make sure the backend server is running on port 3001 (npm run dev:server).',
    });
  }

  onProgress({
    step: 'scanning_handwriting',
    progressPercentage: 65,
    message: 'Gemini AI is reading handwriting & extracting questions (this may take 20-40s)...',
  });

  const rawText = await response.text();
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw Object.assign(new Error(`Server error (${response.status}): ${rawText.slice(0, 200)}`), {
      hint: 'Check server logs for details.',
    });
  }

  if (!response.ok) {
    throw Object.assign(new Error(data.error || `Server error (${response.status})`), {
      hint: data.hint,
    });
  }

  onProgress({
    step: 'mapping_answers',
    progressPercentage: 90,
    message: 'Mapping student answers to questions...',
  });

  if (!data.success || !data.assessment) {
    throw Object.assign(new Error('Server returned an invalid response structure.'), {
      hint: 'Please try again.',
    });
  }

  onProgress({
    step: 'complete',
    progressPercentage: 100,
    message: 'Assessment complete!',
  });

  return data.assessment as AssessmentData;
}
