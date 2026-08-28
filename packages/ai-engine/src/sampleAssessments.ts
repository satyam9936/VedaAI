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
    <text x="50" y="700" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q8. Explain the structural differences between palisade mesophyll and spongy mesophyll... [5 Marks]</text>
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
    
    <!-- Q1 Answer -->
    <text x="40" y="115" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Q1.</text>
    <text x="120" y="115" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Arteries carry oxygenated blood away from the heart to body organs.</text>
    <text x="120" y="145" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Veins return deoxygenated blood back to the heart chambers.</text>

    <!-- Q3 Chemical Equation & Plant Diagram -->
    <text x="40" y="185" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Q3.</text>
    <text x="120" y="185" font-family="Kalam, cursive" font-size="17" fill="#1e293b">Photosynthesis equation with thylakoid chlorophyll pigment reaction:</text>
    <rect x="180" y="200" width="460" height="40" fill="#ffffff" stroke="#334155" stroke-width="1.5" rx="4"/>
    <text x="410" y="226" font-family="Kalam, cursive" font-size="17" font-weight="bold" fill="#0f172a" text-anchor="middle">6CO₂ + 6H₂O  ——(Light/Chlorophyll)——&gt;  C₆H₁₂O₆ + 6O₂</text>

    <!-- Plant Sunlight Diagram Sketch -->
    <g transform="translate(300, 245)">
      <circle cx="200" cy="30" r="16" fill="#fde047" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="225" y="35" font-family="Kalam, cursive" font-size="14" fill="#1e293b">Sunlight</text>
      <path d="M200 110 C195 80 205 60 200 45" stroke="#16a34a" stroke-width="3.5" fill="none"/>
      <path d="M198 80 Q160 60 175 95 Q195 90 198 80 Z" fill="#4ade80" stroke="#15803d" stroke-width="1.5"/>
      <path d="M202 70 Q240 50 225 85 Q205 80 202 70 Z" fill="#4ade80" stroke="#15803d" stroke-width="1.5"/>
      <text x="100" y="80" font-family="Kalam, cursive" font-size="14" fill="#1e293b">CO₂ In</text>
      <text x="245" y="80" font-family="Kalam, cursive" font-size="14" fill="#1e293b">O₂ Out</text>
    </g>

    <!-- Q2 Handwritten Answer Section -->
    <g transform="translate(0, 470)">
      <text x="40" y="45" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Q2.</text>
      <text x="120" y="45" font-family="Kalam, cursive" font-size="18" fill="#1e293b">The process mainly occurs in the chloroplast of the plant cell. It has</text>
      <text x="120" y="75" font-family="Kalam, cursive" font-size="18" fill="#1e293b">two main stages:</text>
      <text x="120" y="105" font-family="Kalam, cursive" font-size="18" fill="#1e293b">1. Light reaction — Captures light energy in thylakoid membrane.</text>
      <text x="120" y="135" font-family="Kalam, cursive" font-size="18" fill="#1e293b">2. Dark reaction — Uses NADPH &amp; ATP energy to synthesize glucose.</text>
    </g>

    <!-- Q5 Alveolus Sketch Answer Section -->
    <g transform="translate(0, 650)">
      <text x="40" y="40" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Q5.</text>
      <text x="120" y="40" font-family="Kalam, cursive" font-size="17" fill="#1e293b">Alveolus sac showing pulmonary capillary gas exchange (O₂ into blood, CO₂ out).</text>
    </g>

    <!-- Q6 Digestive System Diagram Section -->
    <g transform="translate(0, 750)">
      <text x="40" y="40" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Q6.</text>
      <text x="120" y="40" font-family="Kalam, cursive" font-size="17" fill="#1e293b">Human digestive tract diagram: Esophagus -&gt; Stomach -&gt; Small Intestine (Jejunum).</text>
    </g>

    <!-- Q7 Nephron Diagram Section -->
    <g transform="translate(0, 850)">
      <text x="40" y="40" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Q7.</text>
      <text x="120" y="40" font-family="Kalam, cursive" font-size="17" fill="#1e293b">Nephron structure: Bowman's capsule, Glomerulus, Loop of Henle, Collecting duct.</text>
    </g>

    <!-- Q8 Out of Order Answer Section -->
    <g transform="translate(0, 940)">
      <text x="40" y="35" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Q8.</text>
      <text x="120" y="35" font-family="Kalam, cursive" font-size="17" fill="#1e293b">Palisade mesophyll cells are vertically elongated with dense chloroplast density.</text>
    </g>

    {/* Page footer */}
    <text x="700" y="1010" font-family="Inter, sans-serif" font-size="12" fill="#94a3b8">Page 1 of 1</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_BIOLOGY_ASSESSMENT: AssessmentData = {
  id: 'biology-annual-2026',
  title: 'Biology & Physiology Annual Exam',
  subject: 'Exams',
  studentName: 'Satyam Rastogi',
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
      studentAnswerText: 'Arteries carry oxygenated blood away from the heart to body organs. Veins return deoxygenated blood back to the heart chambers.',
      boundingBoxes: [
        { page: 1, ymin: 9.0, xmin: 4.0, ymax: 15.5, xmax: 96.0, label: 'Page 1 - Ans 1' }
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
      studentAnswerText: 'The process mainly occurs in the chloroplast of the plant cell. It has two main stages: 1. Light reaction — Captures light energy in thylakoid membrane. 2. Dark reaction — Uses NADPH & ATP energy to synthesize glucose.',
      boundingBoxes: [
        { page: 1, ymin: 45.0, xmin: 4.0, ymax: 60.0, xmax: 96.0, label: 'Page 1 - Ans 2' }
      ],
      marksAwarded: 2,
      maxMarks: 2,
      evaluationStatus: 'correct',
      aiFeedback: 'Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis and listed both stages.',
      keyPointsFound: ['Chloroplast identified', 'Light & dark reaction stages mentioned']
    },
    'q3': {
      questionId: 'q3',
      questionNumber: '3',
      isAnswered: true,
      isOutOfOrder: false,
      studentAnswerText: 'Chloroplast contains chlorophyll pigment which traps light energy. Chemical equation: 6CO2 + 6H2O -> C6H12O6 + 6O2.',
      boundingBoxes: [
        { page: 1, ymin: 16.0, xmin: 4.0, ymax: 43.5, xmax: 96.0, label: 'Page 1 - Ans 3' }
      ],
      marksAwarded: 2,
      maxMarks: 2,
      evaluationStatus: 'correct',
      aiFeedback: 'Detailed explanation of thylakoid chlorophyll pigment role with correct balanced chemical equation.'
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
      evaluationStatus: 'unanswered',
      aiFeedback: 'Question was left unattempted by the student. Review cardiac cycle and heart valve pathways.'
    },
    'q5': {
      questionId: 'q5',
      questionNumber: '5',
      isAnswered: true,
      isOutOfOrder: false,
      studentAnswerText: 'Alveolus sac showing pulmonary capillary gas exchange (O2 into blood, CO2 out).',
      boundingBoxes: [
        { page: 1, ymin: 62.0, xmin: 4.0, ymax: 71.0, xmax: 96.0, label: 'Page 1 - Ans 5' }
      ],
      marksAwarded: 2,
      maxMarks: 2,
      evaluationStatus: 'correct',
      aiFeedback: 'Neat alveolar diagram with accurate gas diffusion direction arrows.'
    },
    'q6': {
      questionId: 'q6',
      questionNumber: '6',
      isAnswered: true,
      isOutOfOrder: false,
      studentAnswerText: 'Human digestive tract diagram: Esophagus -> Stomach -> Small Intestine (Jejunum).',
      boundingBoxes: [
        { page: 1, ymin: 72.0, xmin: 4.0, ymax: 81.0, xmax: 96.0, label: 'Page 1 - Ans 6' }
      ],
      marksAwarded: 4,
      maxMarks: 5,
      evaluationStatus: 'partial',
      aiFeedback: 'Well labeled organs, minor deduction for omitting villi microanatomy callout.'
    },
    'q7': {
      questionId: 'q7',
      questionNumber: '7',
      isAnswered: true,
      isOutOfOrder: false,
      studentAnswerText: "Nephron structure: Bowman's capsule, Glomerulus, Loop of Henle, Collecting duct.",
      boundingBoxes: [
        { page: 1, ymin: 82.0, xmin: 4.0, ymax: 90.0, xmax: 96.0, label: 'Page 1 - Ans 7' }
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
      studentAnswerText: 'Palisade mesophyll cells are vertically elongated with dense chloroplast density.',
      boundingBoxes: [
        { page: 1, ymin: 90.5, xmin: 4.0, ymax: 97.0, xmax: 96.0, label: 'Page 1 - Ans 8' }
      ],
      marksAwarded: 3,
      maxMarks: 5,
      evaluationStatus: 'partial',
      aiFeedback: 'Accurate tissue description, but answered out of order at the bottom of the page.'
    }
  },
  unmatchedAnswers: [],
  overallSummary: {
    summaryText: 'Satyam demonstrated excellent understanding of Cell Biology and Plant Physiology. High accuracy in organelle identification and renal anatomy diagrams.',
    strengths: ['Photosynthesis chemical equation & diagram precision', 'High score in cellular biology and nephron anatomy questions'],
    improvements: ['Review cardiac cycle & blood flow pathway (Q4)'],
    totalQuestions: 8,
    answeredCount: 7,
    unansweredCount: 1,
    outOfOrderCount: 1,
    accuracyPercentage: 80
  }
};
