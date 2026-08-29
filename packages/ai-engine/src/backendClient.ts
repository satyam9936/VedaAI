/**
 * Backend proxy client for VedaAI.
 *
 * Instead of calling the Gemini API directly from the browser (which requires
 * the user to provide their own API key), this module sends files to the
 * Express.js backend server which holds the API key securely in .env.
 *
 * The frontend never sees or needs the API key.
 */

import { AssessmentData, ProcessingStatus } from '@vedaai/types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Backend server URL. In development, the Express server runs on port 3001.
 * In production, set VITE_BACKEND_URL to your deployed server URL.
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// ---------------------------------------------------------------------------
// Health check — is the backend available and configured?
// ---------------------------------------------------------------------------

export interface BackendStatus {
  available: boolean;
  hasApiKey: boolean;
}

/**
 * Check if the backend server is available and has an API key configured.
 * Returns { available: false } if the server is unreachable.
 */
export async function checkBackendHealth(): Promise<BackendStatus> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      signal: AbortSignal.timeout(5000), // 5s timeout
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

// ---------------------------------------------------------------------------
// Process assessment via backend
// ---------------------------------------------------------------------------

export interface BackendError {
  message: string;
  hint?: string;
}

/**
 * Send files to the backend server for AI assessment processing.
 * The backend handles the Gemini API call with its own key.
 *
 * @param questionPaperFiles - Question paper file(s)
 * @param answerSheetFiles - Answer sheet file(s)
 * @param onProgress - Progress callback (limited steps since we can't stream from server)
 * @returns AssessmentData from the backend
 * @throws Error with { message, hint } on failure
 */
export async function processAssessmentViaBackend(
  questionPaperFiles: File[],
  answerSheetFiles: File[],
  onProgress: (status: ProcessingStatus) => void
): Promise<AssessmentData> {
  onProgress({
    step: 'uploading',
    progressPercentage: 10,
    message: `Uploading ${questionPaperFiles.length} question paper(s) & ${answerSheetFiles.length} answer sheet(s) to server...`,
  });

  // Build FormData with files
  const formData = new FormData();
  questionPaperFiles.forEach((file) => formData.append('questionPaper', file));
  answerSheetFiles.forEach((file) => formData.append('answerSheet', file));

  onProgress({
    step: 'extracting_questions',
    progressPercentage: 25,
    message: 'Server is processing your files...',
  });

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/assess`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type — browser auto-sets it with the boundary for FormData
    });
  } catch {
    throw Object.assign(new Error('Could not reach the VedaAI server.'), {
      hint: 'Make sure the backend server is running (npm run dev:server).',
    });
  }

  onProgress({
    step: 'scanning_handwriting',
    progressPercentage: 60,
    message: 'AI is reading handwriting and evaluating answers (this may take 30-60s)...',
  });

  const data = await response.json();

  if (!response.ok) {
    throw Object.assign(new Error(data.error || `Server error (${response.status})`), {
      hint: data.hint,
    });
  }

  onProgress({
    step: 'mapping_answers',
    progressPercentage: 90,
    message: 'Mapping answers to questions...',
  });

  if (!data.success || !data.assessment) {
    throw Object.assign(new Error('Server returned an invalid response.'), {
      hint: 'Try again.',
    });
  }

  onProgress({
    step: 'complete',
    progressPercentage: 100,
    message: 'Assessment complete!',
  });

  return data.assessment as AssessmentData;
}
