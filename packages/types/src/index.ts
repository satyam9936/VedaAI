export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'evaluator' | 'admin';
  institution: string;
  department: string;
  avatarUrl?: string;
  authProvider?: 'google' | 'github' | 'email' | 'demo';
  googleId?: string;
  githubUsername?: string;
}

export interface Question {
  id: string;
  number: string;
  rawNumber: string;
  subPart?: string;
  text: string;
  maxMarks: number;
  section?: string;
  expectedKeywords?: string[];
}

export interface BoundingBox {
  page: number;
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  label?: string;
}

export type AnswerStatus = 'ANSWERED' | 'UNANSWERED' | 'UNMAPPED';

export type EvaluationStatus = 'correct' | 'partial' | 'incorrect' | 'unanswered' | 'needs_review';

export interface AnswerMapping {
  questionId: string;
  questionNumber: string;
  isAnswered: boolean;
  isOutOfOrder: boolean;
  status?: AnswerStatus;
  actualOrderIndex?: number;
  studentAnswerText: string;
  boundingBoxes: BoundingBox[];
  marksAwarded: number;
  maxMarks: number;
  evaluationStatus: EvaluationStatus;
  aiFeedback: string;
  keyPointsFound?: string[];
  missedConcepts?: string[];
}

export interface UnmatchedAnswer {
  id: string;
  studentAnswerText: string;
  page: number;
  boundingBox: BoundingBox;
  aiNote: string;
}

export interface OverallSummary {
  summaryText: string;
  strengths: string[];
  improvements: string[];
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  outOfOrderCount: number;
  accuracyPercentage: number;
}

export interface AssessmentData {
  id: string;
  title: string;
  subject: string;
  studentName: string;
  rollNumber: string;
  date: string;
  questionPaperPages: string[];
  answerSheetPages: string[];
  questions: Question[];
  answerMappings: Record<string, AnswerMapping>;
  unmatchedAnswers: UnmatchedAnswer[];
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  overallSummary: OverallSummary;
}

export type ProcessingStep = 
  | 'idle' 
  | 'uploading' 
  | 'extracting_questions' 
  | 'scanning_handwriting' 
  | 'mapping_answers' 
  | 'grading_insights' 
  | 'complete' 
  | 'error';

export interface ProcessingStatus {
  step: ProcessingStep;
  progressPercentage: number;
  message: string;
}
