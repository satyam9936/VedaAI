import { AssessmentData } from '@vedaai/types';

export function generateBiologyQuestionPaperSVG(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050">
    <rect width="800" height="1050" fill="#ffffff"/>
    <rect x="0" y="0" width="800" height="110" fill="#1e293b"/>
    <text x="400" y="45" font-family="Inter, sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">DELHI PUBLIC SCHOOL - BOKARO STEEL CITY</text>
    <text x="400" y="75" font-family="Inter, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Subject: Biology &amp; Physiology | Annual Examination | Max Marks: 25</text>
    
    <text x="50" y="160" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q1. Which blood vessel carries blood away from the heart? [2 Marks]</text>
    <text x="50" y="230" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q2. Which of the following organelles is primarily involved in photosynthesis? [2 Marks]</text>
    <text x="50" y="300" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q3. Explain the role of chloroplasts in photosynthesis, naming the main pigments... [2 Marks]</text>
    <text x="50" y="380" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q4. Describe the flow of blood through the human heart starting from right atrium... [2 Marks]</text>
    <text x="50" y="460" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q5. Draw a labelled diagram of an alveolus showing capillaries and air space... [2 Marks]</text>
    <text x="50" y="540" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q6. Draw a neat labelled diagram of the human digestive system... [5 Marks]</text>
    <text x="50" y="620" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q7. Draw and label a nephron (Bowman's capsule, glomerulus, proximal tubule)... [5 Marks]</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateBiologyAnswerSheetSVG(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050">
    <rect width="800" height="1050" fill="#fcfdfa"/>
    <g stroke="#f1f5f9" stroke-width="1">
      ${Array.from({ length: 32 }).map((_, i) => `<line x1="0" y1="${80 + i * 30}" x2="800" y2="${80 + i * 30}" />`).join('')}
    </g>
    <line x1="100" y1="0" x2="100" y2="1050" stroke="#fca5a5" stroke-width="2" stroke-dasharray="4 2"/>
    
    <text x="40" y="115" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Q1.</text>
    <text x="120" y="115" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Photosynthesis is the process used by green plants and some other organisms</text>
    <text x="120" y="145" font-family="Kalam, cursive" font-size="18" fill="#1e293b">to convert light energy into chemical energy.</text>

    <!-- Chemical Equation Box -->
    <rect x="180" y="180" width="460" height="45" fill="#ffffff" stroke="#334155" stroke-width="1.5" rx="4"/>
    <text x="410" y="210" font-family="Kalam, cursive" font-size="18" font-weight="bold" fill="#0f172a" text-anchor="middle">6CO₂ + 6H₂O  ——(Light/Chlorophyll)——&gt;  C₆H₁₂O₆ + 6O₂</text>

    <!-- Plant Sunlight Diagram Sketch -->
    <g transform="translate(320, 240)">
      <!-- Sun -->
      <circle cx="200" cy="40" r="18" fill="#fde047" stroke="#ca8a04" stroke-width="1.5"/>
      <path d="M200 12 L200 4 M200 68 L200 76 M172 40 L164 40 M228 40 L236 40" stroke="#ca8a04" stroke-width="2"/>
      <text x="230" y="45" font-family="Kalam, cursive" font-size="16" fill="#1e293b">Sunlight</text>

      <!-- Plant stem & leaves -->
      <path d="M200 130 C195 90 205 70 200 50" stroke="#16a34a" stroke-width="4" fill="none"/>
      <!-- Leaf left -->
      <path d="M198 90 Q150 70 170 110 Q195 100 198 90 Z" fill="#4ade80" stroke="#15803d" stroke-width="1.5"/>
      <!-- Leaf right -->
      <path d="M202 80 Q250 60 230 100 Q205 90 202 80 Z" fill="#4ade80" stroke="#15803d" stroke-width="1.5"/>

      <!-- Arrows -->
      <text x="90" y="90" font-family="Kalam, cursive" font-size="15" fill="#1e293b">Carbon dioxide</text>
      <path d="M140 95 L170 95" stroke="#334155" stroke-width="1.5" marker-end="url(#arrow)"/>

      <text x="260" y="90" font-family="Kalam, cursive" font-size="15" fill="#1e293b">Oxygen</text>
      <path d="M225 95 L255 95" stroke="#334155" stroke-width="1.5"/>

      <!-- Roots & Water -->
      <path d="M200 130 L185 165 M200 130 L200 170 M200 130 L215 160" stroke="#78350f" stroke-width="2"/>
      <text x="240" y="160" font-family="Kalam, cursive" font-size="15" fill="#1e293b">Water</text>
    </g>

    <!-- Q2 Handwritten Answer Section (Target Bounding Box) -->
    <g transform="translate(0, 480)">
      <text x="40" y="45" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Q2.</text>
      <text x="120" y="45" font-family="Kalam, cursive" font-size="18" fill="#1e293b">The process mainly occurs in the chloroplast of the plant cell. It has</text>
      <text x="120" y="75" font-family="Kalam, cursive" font-size="18" fill="#1e293b">two main stages:</text>
      <text x="120" y="105" font-family="Kalam, cursive" font-size="18" fill="#1e293b">1. Light reaction — Captures light energy.</text>
      <text x="120" y="135" font-family="Kalam, cursive" font-size="18" fill="#1e293b">2. Dark reaction — Uses energy to make glucose.</text>
    </g>

    <!-- Page footer -->
    <text x="700" y="1010" font-family="Inter, sans-serif" font-size="12" fill="#94a3b8">Page 1 of 4</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_BIOLOGY_ASSESSMENT: AssessmentData = {
  id: 'biology-annual-2026',
  title: 'Biology & Physiology Annual Exam',
  subject: 'Exams',
  studentName: 'Madhur Rastogi',
  rollNumber: '1042',
  date: 'August 27, 2026',
  questionPaperPages: [generateBiologyQuestionPaperSVG()],
  answerSheetPages: [generateBiologyAnswerSheetSVG()],
  totalMaxMarks: 25,
  totalObtainedMarks: 20,
  percentage: 80,
  questions: [
    {
      id: 'q1',
      number: '1',
      rawNumber: '1',
      text: 'Which blood vessel carries blood away from the heart?',
      maxMarks: 2,
      section: 'Section A: General Biology'
    },
    {
      id: 'q2',
      number: '2',
      rawNumber: '2',
      text: 'Which of the following organelles is primarily involved in photosynthesis?',
      maxMarks: 2,
      section: 'Section A: Cell Biology'
    },
    {
      id: 'q3',
      number: '3',
      rawNumber: '3',
      text: 'Explain the role of chloroplasts in photosynthesis, naming the main pigments involved and briefly outlining the two major stages of the process.',
      maxMarks: 2,
      section: 'Section A: Plant Physiology'
    },
    {
      id: 'q4',
      number: '4',
      rawNumber: '4',
      text: 'Describe the flow of blood through the human heart starting from the right atrium and ending at the aorta; include the names of valves crossed.',
      maxMarks: 2,
      section: 'Section B: Human Anatomy'
    },
    {
      id: 'q5',
      number: '5',
      rawNumber: '5',
      text: 'Draw a labelled diagram of an alveolus showing capillaries and air space (label alveolar sac, capillary, and direction of gas exchange).',
      maxMarks: 2,
      section: 'Section B: Respiration'
    },
    {
      id: 'q6',
      number: '6',
      rawNumber: '6',
      text: 'Draw a neat labelled diagram of the human digestive system (stomach, small intestine, large intestine, liver, pancreas) and label the site where most absorption occurs.',
      maxMarks: 5,
      section: 'Section B: Digestion'
    },
    {
      id: 'q7',
      number: '7',
      rawNumber: '7',
      text: "Draw and label a nephron (Bowman's capsule, glomerulus, proximal tubule, loop of Henle, distal tubule, collecting duct).",
      maxMarks: 5,
      section: 'Section B: Excretion'
    },
    {
      id: 'q8',
      number: '8',
      rawNumber: '8',
      text: 'Explain the structural differences between palisade mesophyll and spongy mesophyll...',
      maxMarks: 5,
      section: 'Section C: Plant Histology'
    }
  ],
  answerMappings: {
    'q1': {
      questionId: 'q1',
      questionNumber: '1',
      isAnswered: true,
      isOutOfOrder: false,
      studentAnswerText: 'Arteries carry oxygenated blood away from the heart to body organs.',
      boundingBoxes: [
        { page: 1, ymin: 9.0, xmin: 12.0, ymax: 15.0, xmax: 95.0, label: 'Page 1 - Ans 1' }
      ],
      marksAwarded: 2,
      maxMarks: 2,
      evaluationStatus: 'correct',
      aiFeedback: 'Correctly identified arteries as the primary blood vessels carrying blood away from the heart.'
    },
    'q2': {
      questionId: 'q2',
      questionNumber: '2',
      isAnswered: true,
      isOutOfOrder: false,
      studentAnswerText: 'The process mainly occurs in the chloroplast of the plant cell. It has two main stages: 1. Light reaction — Captures light energy. 2. Dark reaction — Uses energy to make glucose.',
      boundingBoxes: [
        { page: 1, ymin: 47.0, xmin: 4.5, ymax: 67.0, xmax: 97.5, label: 'Page 1 - Ans 2' }
      ],
      marksAwarded: 2,
      maxMarks: 2,
      evaluationStatus: 'correct',
      aiFeedback: 'Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis. Keep it up!',
      keyPointsFound: ['Chloroplast identified', 'Light & dark reaction stages mentioned']
    },
    'q3': {
      questionId: 'q3',
      questionNumber: '3',
      isAnswered: true,
      isOutOfOrder: false,
      studentAnswerText: 'Chloroplast contains chlorophyll pigment which traps light energy during thylakoid reactions.',
      boundingBoxes: [
        { page: 1, ymin: 17.0, xmin: 12.0, ymax: 42.0, xmax: 95.0, label: 'Page 1 - Ans 3' }
      ],
      marksAwarded: 2,
      maxMarks: 2,
      evaluationStatus: 'correct',
      aiFeedback: 'Detailed explanation of thylakoids and chlorophyll pigment role.'
    },
    'q4': {
      questionId: 'q4',
      questionNumber: '4',
      isAnswered: false,
      isOutOfOrder: false,
      studentAnswerText: '[No response found on answer sheet]',
      boundingBoxes: [],
      marksAwarded: 0,
      maxMarks: 2,
      evaluationStatus: 'incorrect',
      aiFeedback: 'Question was left unattempted. Review cardiac cycle and valve pathways.'
    },
    'q5': {
      questionId: 'q5',
      questionNumber: '5',
      isAnswered: true,
      isOutOfOrder: false,
      studentAnswerText: 'Alveolus diagram drawn with capillary network.',
      boundingBoxes: [
        { page: 1, ymin: 70.0, xmin: 12.0, ymax: 82.0, xmax: 95.0, label: 'Page 1 - Ans 5' }
      ],
      marksAwarded: 2,
      maxMarks: 2,
      evaluationStatus: 'correct',
      aiFeedback: 'Neat alveolar diagram with accurate gas diffusion arrows.'
    },
    'q6': {
      questionId: 'q6',
      questionNumber: '6',
      isAnswered: true,
      isOutOfOrder: false,
      studentAnswerText: 'Digestive system diagram including stomach, small intestine, and liver.',
      boundingBoxes: [
        { page: 1, ymin: 83.0, xmin: 12.0, ymax: 95.0, xmax: 95.0, label: 'Page 1 - Ans 6' }
      ],
      marksAwarded: 4,
      maxMarks: 5,
      evaluationStatus: 'partial',
      aiFeedback: 'Well labeled organs, missed explicit callout for jejunum absorption site.'
    },
    'q7': {
      questionId: 'q7',
      questionNumber: '7',
      isAnswered: true,
      isOutOfOrder: false,
      studentAnswerText: "Nephron diagram with Bowman's capsule and Loop of Henle.",
      boundingBoxes: [
        { page: 1, ymin: 88.0, xmin: 12.0, ymax: 98.0, xmax: 95.0, label: 'Page 1 - Ans 7' }
      ],
      marksAwarded: 5,
      maxMarks: 5,
      evaluationStatus: 'correct',
      aiFeedback: 'Flawless nephron anatomy diagram and renal tubule labels.'
    },
    'q8': {
      questionId: 'q8',
      questionNumber: '8',
      isAnswered: true,
      isOutOfOrder: true,
      studentAnswerText: 'Palisade mesophyll cells are elongated with high chloroplast density.',
      boundingBoxes: [
        { page: 1, ymin: 92.0, xmin: 12.0, ymax: 99.0, xmax: 95.0, label: 'Page 1 - Ans 8' }
      ],
      marksAwarded: 3,
      maxMarks: 5,
      evaluationStatus: 'partial',
      aiFeedback: 'Answered out of order.'
    }
  },
  unmatchedAnswers: [],
  overallSummary: {
    summaryText: 'Madhur demonstrated excellent understanding of Cell Biology and Photosynthesis. High accuracy in organelle identification.',
    strengths: ['Photosynthesis chemical equation & diagram precision', 'High score in cellular biology questions'],
    improvements: ['Review cardiac cycle & blood flow pathway (Q4)'],
    totalQuestions: 8,
    answeredCount: 7,
    unansweredCount: 1,
    outOfOrderCount: 1,
    accuracyPercentage: 80
  }
};
