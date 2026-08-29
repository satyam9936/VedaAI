/**
 * Frontend client service for Veda AI Tutor Chatbot.
 */

import { AssessmentData } from '@vedaai/types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

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

  const questions = assessment.questions.map(q => ({
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
    overallSummary: assessment.overallSummary ? {
      summaryText: assessment.overallSummary.summaryText,
      strengths: assessment.overallSummary.strengths,
      improvements: assessment.overallSummary.improvements,
    } : undefined,
  };
}

/**
 * Sends messages and exam context to the backend chat route.
 */
export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: AssessmentChatContext
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        context,
      }),
    });
  } catch {
    throw new Error('Could not reach VedaAI server for AI Tutor chat.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Chat request failed');
  }

  return data.reply;
}
