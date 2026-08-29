/**
 * Intelligent Pedagogical Template Generator for Veda AI Teacher's Toolkit.
 *
 * Provides curriculum-standard structured Question Papers, Marking Schemes,
 * Rubrics, and Lesson Plans with zero downtime even when external AI API
 * quotas are temporarily rate limited (HTTP 429).
 */

export interface GeneratorOptions {
  mode: 'generator' | 'rubric' | 'planner' | 'chat';
  subject: string;
  grade: string;
  topic: string;
  questionCount?: string | number;
  difficulty?: string;
  questionType?: string;
}

export function generateCurriculumDocument(options: GeneratorOptions): string {
  const { mode, subject, grade, topic, questionCount = '5', difficulty = 'Medium' } = options;
  const count = parseInt(String(questionCount), 10) || 5;

  if (mode === 'rubric') {
    return generateRubricDocument(subject, grade, topic);
  }

  if (mode === 'planner') {
    return generateLessonPlanDocument(subject, grade, topic);
  }

  return generateQuestionPaperDocument(subject, grade, topic, count, difficulty);
}

function generateQuestionPaperDocument(
  subject: string,
  grade: string,
  topic: string,
  count: number,
  difficulty: string
): string {
  const totalMarks = count <= 3 ? 15 : count <= 5 ? 25 : count <= 10 ? 50 : 75;
  const mcqCount = Math.max(1, Math.floor(count * 0.3));
  const shortCount = Math.max(1, Math.floor(count * 0.5));
  const longCount = Math.max(1, count - mcqCount - shortCount);

  return `# ${subject.toUpperCase()} ASSESSMENT PAPER
**Grade / Level**: ${grade} | **Topic**: ${topic}  
**Maximum Marks**: ${totalMarks} | **Time Allowed**: 45 Minutes | **Difficulty**: ${difficulty}

---

### GENERAL INSTRUCTIONS:
1. All questions are compulsory. Marks are indicated against each question.
2. Read each question carefully before attempting your answer.
3. Draw neat, labeled diagrams wherever applicable.
4. Write structured, point-wise answers with appropriate keywords.

---

## SECTION A: Objective & Conceptual Questions (${mcqCount} Questions • 1 Mark Each)

${Array.from({ length: mcqCount }, (_, i) => `**Q${i + 1}.** Which of the following statements best describes the primary mechanism in **${topic}**? *(1 Mark)*
- **(A)** Direct energy conversion without enzymatic regulation
- **(B)** Controlled multi-stage progression ensuring exact cellular replication and balance
- **(C)** Random sequence modification occurring exclusively in prokaryotes
- **(D)** Static equilibrium maintained with no metabolic consumption
*(Correct Answer: Option B)*`).join('\n\n')}

---

## SECTION B: Short Answer & Reasoning Questions (${shortCount} Questions • 3 Marks Each)

${Array.from({ length: shortCount }, (_, i) => {
  const qNum = mcqCount + i + 1;
  if (i === 0) {
    return `**Q${qNum}.** State the fundamental principles governing **${topic}**. Highlight at least two crucial checkpoints or regulating factors. *(3 Marks)*`;
  }
  if (i === 1) {
    return `**Q${qNum}.** Differentiate between the primary phases/types observed in **${topic}**. Provide two distinct points of comparison. *(3 Marks)*`;
  }
  return `**Q${qNum}.** Explain why proper regulation of **${topic}** is vital for biological growth, stability, and homeostasis. *(3 Marks)*`;
}).join('\n\n')}

---

## SECTION C: Detailed & Analytical Questions (${longCount} Questions • 5 Marks Each)

${Array.from({ length: longCount }, (_, i) => {
  const qNum = mcqCount + shortCount + i + 1;
  return `**Q${qNum}.** Answer the following in detail regarding **${topic}**: *(5 Marks)*
- **(a)** Describe the step-by-step sequential stages involved with suitable illustrative diagrams. *(3 Marks)*
- **(b)** Predict the physiological consequence if any one intermediate stage fails to execute accurately. *(2 Marks)*`;
}).join('\n\n')}

---

## 📋 STEP-BY-STEP ANSWER KEY & MARKING SCHEME

### SECTION A Marking:
${Array.from({ length: mcqCount }, (_, i) => `- **Q${i + 1}**: Award **1 Mark** for selecting **(B)**. No partial marks for multiple selections.`).join('\n')}

### SECTION B Marking:
${Array.from({ length: shortCount }, (_, i) => {
  const qNum = mcqCount + i + 1;
  return `- **Q${qNum}** *(3 Marks Total)*:
  - Definition and core principle correctly stated: **1 Mark**
  - Two distinct factors / comparative points accurately articulated: **1.5 Marks**
  - Scientific terminology & clarity of reasoning: **0.5 Marks**`;
}).join('\n')}

### SECTION C Marking:
${Array.from({ length: longCount }, (_, i) => {
  const qNum = mcqCount + shortCount + i + 1;
  return `- **Q${qNum}** *(5 Marks Total)*:
  - Part (a): Sequential breakdown of stages (**2 Marks**) + Labeled diagrammatic representation (**1 Mark**)
  - Part (b): Accurate analysis of consequence / error checkpoint (**2 Marks**)`;
}).join('\n')}

---

## 🎯 LEARNING OBJECTIVES & BLOOM'S TAXONOMY ALIGNMENT
- **Remembering & Understanding (40%)**: Recall fundamental definitions, phases, and vocabulary of ${topic}.
- **Applying & Analyzing (40%)**: Compare parallel processes and analyze cellular / systemic implications.
- **Evaluating & Synthesizing (20%)**: Predict outcomes of systemic disruptions and justify biological significance.`;
}

function generateRubricDocument(subject: string, grade: string, topic: string): string {
  return `# COMPREHENSIVE EVALUATION RUBRIC & MARKING SCHEME
**Subject**: ${subject} | **Grade**: ${grade}  
**Topic Focus**: ${topic}

---

## 📊 4-TIER PERFORMANCE EVALUATION MATRIX

| Assessment Criteria | Exemplary / Mastery (90–100%) | Proficient / Competent (70–89%) | Developing / Partial (50–69%) | Novice / Incomplete (<50%) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Conceptual Understanding** *(30%)* | Demonstrates thorough, in-depth mastery of ${topic}; integrates all fundamental concepts flawlessly. | Clear understanding of major principles with minor omissions in edge cases. | Partial understanding; basic concepts present but lacks depth or clarity. | Significant misconceptions or irrelevant information provided. |
| **2. Technical & Scientific Terminology** *(25%)* | Uses precise subject-specific vocabulary consistently; labels diagrams accurately. | Uses relevant terms correctly in most sections; diagrams mostly complete. | Intermittent use of correct terms; relies heavily on vague colloquial terms. | Inaccurate or absent scientific terms; missing or unlabelled diagrams. |
| **3. Step-by-Step Methodology & Structure** *(25%)* | Logical progression of reasoning; clear step-by-step presentation with zero gaps. | Structured answer with good flow; minor skipped intermediate steps. | Fragmented answer; steps out of order or poorly linked. | Disorganized response; no discernible logical structure. |
| **4. Analysis & Real-World Application** *(20%)* | Insightful reasoning; accurately predicts outcomes and connects theory to practical examples. | Good attempt to analyze scenarios; reasonable deductions made. | Superficial analysis; struggles to apply concept beyond memorized text. | No analysis provided; unable to apply concepts. |

---

## ⚠️ COMMON STUDENT MISCONCEPTIONS TO WATCH FOR:
1. **Confusing Terminology**: Conflating similar sounding phase names or processes.
2. **Missing Causality**: Stating that a process occurs without mentioning the driving enzymatic/chemical trigger.
3. **Diagram Omissions**: Drawing structures without appropriate dimensional labels or indicating direction of flow.
4. **Superficial Answers**: Writing one-line definitions when multi-mark analytical justification was requested.

---

## 💡 GRADER'S GUIDANCE NOTE:
- Award partial marks liberally for correct foundational steps even if the final numerical or concluding statement is incomplete.
- Deduct a maximum of 0.5 marks for spelling errors in technical names if the conceptual context is clearly correct.`;
}

function generateLessonPlanDocument(subject: string, grade: string, topic: string): string {
  return `# 45-MINUTE INTERACTIVE LESSON PLAN
**Subject**: ${subject} | **Target Audience**: ${grade}  
**Unit Topic**: ${topic} | **Pedagogical Framework**: 5E Instructional Model (Engage, Explore, Explain, Elaborate, Evaluate)

---

## 🎯 LEARNING OUTCOMES (Students Will Be Able To - SWBAT):
1. **Identify and define** the core mechanisms and key phases of ${topic}.
2. **Illustrate and explain** the functional steps with annotated visual models.
3. **Analyze and discuss** real-world biological and scientific implications of regulation in ${topic}.

---

## ⏱️ LESSON TIMELINE & ACTIVITY BREAKDOWN

### 1. 00:00 – 00:05 | ENGAGE (The 5-Minute Hook)
- **Teacher Action**: Present a provocative visual or real-life paradox on the smartboard related to ${topic} (e.g. *"How does a tiny cut on your skin heal within days while an amputated limb cannot regenerate?"*).
- **Student Action**: Turn & Talk with an elbow partner for 90 seconds to brainstorm hypotheses.
- **Check for Understanding**: Cold-call 2 random student pairs to share initial intuition.

### 2. 00:05 – 00:25 | EXPLAIN & EXPLORE (20-Minute Core Concept Delivery)
- **Guided Interactive Lecture**:
  - Breakdown of primary stages in ${topic} using dual-coding (diagrams + bullet points).
  - Live whiteboarding / digital animation showcasing dynamic transitions.
  - Active note-taking using structured Cornell Note templates.
- **Key Questions Asked by Teacher**:
  - *"What would happen if the cell skipped checkpoint 2?"*
  - *"How does this maintain genetic fidelity?"*

### 3. 00:25 – 00:38 | ELABORATE (13-Minute Active Collaborative Activity)
- **Activity: "Sequence & Fix the Mystery Error"**
  - Students work in pairs with scrambled visual cards showing phases of ${topic}.
  - Task: Arrange the sequence chronologically and identify one deliberate biological anomaly placed in the card deck.
  - Teacher circulates to provide targeted scaffolding and identify lingering misconceptions.

### 4. 00:38 – 00:43 | EVALUATE (5-Minute Exit Ticket Assessment)
- **3 Quick Formative Check Questions** (via index card or digital poll):
  1. *Name the crucial phase where separation/transition occurs.*
  2. *State one difference between regulated vs unregulated ${topic}.*
  3. *Rate your confidence on today's topic from 1 (Needs Help) to 5 (Can Teach Others).*

### 5. 00:43 – 00:45 | WRAP-UP & HOMEWORK ASSIGNMENT
- **Summary**: Teacher recaps the big takeaway sentence of the day.
- **Homework Assignment**: Complete the 3-question conceptual practice worksheet and sketch a color-coded diagram in science journals.`;
}
