import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  AlertCircle,
  HelpCircle,
  ArrowUpDown,
  FileText,
  Layers
} from 'lucide-react';
import { AssessmentData, BoundingBox } from '@vedaai/types';

interface AssessmentViewProps {
  assessment: AssessmentData;
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  assessment,
  selectedQuestionId,
  onSelectQuestion
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>('q2');
  const [mobileTab, setMobileTab] = useState<'questions' | 'answersheet'>('questions');

  const containerRef = useRef<HTMLDivElement>(null);
  const activeBoxRef = useRef<HTMLDivElement>(null);

  const selectedMapping = selectedQuestionId ? assessment.answerMappings[selectedQuestionId] : null;
  const selectedBoxes = selectedMapping?.boundingBoxes || [];

  useEffect(() => {
    if (selectedBoxes.length > 0) {
      const targetPage = selectedBoxes[0].page;
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }
    }
  }, [selectedQuestionId]);

  useEffect(() => {
    if (activeBoxRef.current && containerRef.current) {
      activeBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedQuestionId, currentPage]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.7));
  const handleZoomReset = () => setZoomLevel(1);

  const toggleExpand = (qId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedQuestionId(prev => prev === qId ? null : qId);
    onSelectQuestion(qId);
  };

  const handleSelectAndSwitch = (qId: string) => {
    onSelectQuestion(qId);
    setMobileTab('answersheet');
  };

  const pageAnswerBoxes: Array<{
    questionId: string;
    questionNumber: string;
    box: BoundingBox;
    isCurrentSelected: boolean;
  }> = [];

  Object.values(assessment.answerMappings).forEach(mapping => {
    mapping.boundingBoxes.forEach(box => {
      if (box.page === currentPage) {
        pageAnswerBoxes.push({
          questionId: mapping.questionId,
          questionNumber: mapping.questionNumber,
          box,
          isCurrentSelected: mapping.questionId === selectedQuestionId
        });
      }
    });
  });

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden select-none">
      
      {/* Mobile Top View-Toggle Bar (Questions vs Answer Sheet) matching Mobile Figma Screenshots */}
      <div className="flex lg:hidden items-center justify-center p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/60 shadow-inner">
        <button
          onClick={() => setMobileTab('questions')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
            mobileTab === 'questions'
              ? 'bg-white text-slate-900 shadow-md font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="h-4 w-4 text-orange-500" />
          <span>Questions ({assessment.questions.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('answersheet')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
            mobileTab === 'answersheet'
              ? 'bg-white text-slate-900 shadow-md font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4 text-emerald-500" />
          <span>Answer Sheet</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Panel: Extracted Questions (Matching Figma Screenshots) */}
        <div className={`w-full lg:w-[480px] xl:w-[520px] bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-5 flex-col justify-between shadow-sm overflow-hidden shrink-0 ${
          mobileTab === 'questions' ? 'flex' : 'hidden lg:flex'
        }`}>
          
          {/* Top Title Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Extracted Questions (from question paper)
              </h2>
              <p className="text-[11px] text-slate-500 font-medium pt-0.5">
                {assessment.questions.length} questions • Sub-parts split • Auto-mapped
              </p>
            </div>

            <button
              onClick={() => setExpandedQuestionId(expandedQuestionId ? null : 'q2')}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition shadow-sm shrink-0"
            >
              {expandedQuestionId ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto pt-4 space-y-3.5 pr-1">
            {assessment.questions.map((q) => {
              const mapping = assessment.answerMappings[q.id];
              const isSelected = selectedQuestionId === q.id;
              const isExpanded = expandedQuestionId === q.id;
              const isUnanswered = mapping?.isAnswered === false || !mapping;
              const isOutOfOrder = mapping?.isOutOfOrder === true;
              const isCorrect = mapping?.evaluationStatus === 'correct';

              return (
                <div
                  key={q.id}
                  onClick={() => handleSelectAndSwitch(q.id)}
                  className={`rounded-2xl border transition duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'border-orange-500 bg-white ring-2 ring-orange-500/20 shadow-md'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="p-4 space-y-3">
                    
                    {/* Card Header: Number Circle, Text, Score Badge, Badges */}
                    <div className="flex items-start justify-between gap-3">
                      
                      <div className="flex items-start gap-3">
                        {/* Numbered dark circle badge */}
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0 mt-0.5 ${
                          isSelected ? 'bg-gradient-to-tr from-orange-500 to-amber-500 shadow-md shadow-orange-500/30' : 'bg-slate-700'
                        }`}>
                          {q.subPart ? `${q.number}${q.subPart}` : q.number}
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                            {q.text}
                          </p>

                          {/* Edge Case Tags: Not Attempted / Out of Order */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {isUnanswered && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                                <HelpCircle className="h-3 w-3 text-slate-400" />
                                <span>Not Attempted</span>
                              </span>
                            )}
                            {isOutOfOrder && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                                <ArrowUpDown className="h-3 w-3 text-amber-500" />
                                <span>Out of Order</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Score Pill Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono ${
                          isUnanswered
                            ? 'bg-slate-100 text-slate-500 border border-slate-200'
                            : isCorrect
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {mapping ? `${mapping.marksAwarded}/${q.maxMarks}` : `0/${q.maxMarks}`}
                        </span>

                        <button
                          onClick={(e) => toggleExpand(q.id, e)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>

                    </div>

                    {/* Expanded AI Feedback Box */}
                    {isExpanded && mapping && (
                      <div className="pt-2 border-t border-slate-100 animate-fade-in">
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                            <span>AI Feedback</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {mapping.aiFeedback}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* Unmapped Answers Alert Section (Phase 3 Edge Case Requirement) */}
            {assessment.unmatchedAnswers && assessment.unmatchedAnswers.length > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs">
                  <AlertCircle className="h-4 w-4" />
                  <span>Unmapped Handwriting Detected ({assessment.unmatchedAnswers.length})</span>
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed font-medium">
                  The AI scanner detected extra handwritten notes on the answer sheet that do not map to any paper question.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Right Panel: Student Answer Sheet Canvas Viewer */}
        <div className={`flex-1 bg-slate-900 rounded-3xl border border-slate-800 flex-col justify-between overflow-hidden shadow-xl relative ${
          mobileTab === 'answersheet' ? 'flex' : 'hidden lg:flex'
        }`}>
          
          {/* Answer Sheet Top Navigation Bar */}
          <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white z-20">
            
            <span className="text-xs font-bold text-slate-200 tracking-wide">
              Answer Sheet
            </span>

            {/* Zoom controls */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-xs">
              <button onClick={handleZoomOut} className="p-1 hover:text-orange-400 transition" title="Zoom Out">
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] font-bold text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button onClick={handleZoomIn} className="p-1 hover:text-orange-400 transition" title="Zoom In">
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button onClick={handleZoomReset} className="p-1 hover:text-orange-400 ml-1 text-slate-500" title="Reset Zoom">
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>

            {/* Page Navigator */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-2 font-mono font-bold text-slate-200 text-[11px]">
                Page {currentPage} of {assessment.answerSheetPages.length || 1}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, assessment.answerSheetPages.length || 1))}
                disabled={currentPage >= (assessment.answerSheetPages.length || 1)}
                className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>

          {/* Handwritten Answer Canvas Container */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-auto p-4 flex items-start justify-center relative bg-slate-950/80"
          >
            <div 
              className="relative transition-transform duration-200 ease-out shadow-2xl rounded-lg overflow-hidden border border-slate-700 bg-white"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                width: '800px',
                minHeight: '1050px'
              }}
            >
              {/* Answer Sheet Image */}
              <img 
                src={assessment.answerSheetPages[currentPage - 1] || assessment.answerSheetPages[0]} 
                alt="Handwritten Answer Sheet"
                className="w-full h-auto block select-none"
              />

              {/* Bounding Box Highlights Engine */}
              <div className="absolute inset-0 pointer-events-auto">
                {pageAnswerBoxes.map((item, idx) => {
                  const { questionId, questionNumber, box, isCurrentSelected } = item;

                  return (
                    <div
                      key={`${questionId}-${idx}`}
                      ref={isCurrentSelected ? activeBoxRef : null}
                      onClick={() => onSelectQuestion(questionId)}
                      style={{
                        top: `${box.ymin}%`,
                        left: `${box.xmin}%`,
                        height: `${box.ymax - box.ymin}%`,
                        width: `${box.xmax - box.xmin}%`
                      }}
                      className={`absolute rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                        isCurrentSelected
                          ? 'border-emerald-500 bg-emerald-500/10 ring-4 ring-emerald-500/30 z-30 shadow-xl highlight-box-active'
                          : 'border-emerald-500/60 bg-emerald-500/5 hover:bg-emerald-500/10 z-10'
                      }`}
                    >
                      {/* Green Q2 Badge Tag (Matching Figma Screenshots) */}
                      <div className="absolute -top-4 left-3 px-3 py-0.5 rounded-lg text-xs font-black bg-emerald-500 text-white shadow-md">
                        Q{questionNumber}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
