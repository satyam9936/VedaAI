import React, { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { AssessmentData, BoundingBox } from '@vedaai/types';

interface AnswerSheetViewerProps {
  assessment: AssessmentData;
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
}

export const AnswerSheetViewer: React.FC<AnswerSheetViewerProps> = ({
  assessment,
  selectedQuestionId,
  onSelectQuestion,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showAllBoundingBoxes, setShowAllBoundingBoxes] = useState<boolean>(true);
  
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

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
  const handleZoomReset = () => setZoomLevel(1);

  const pageAnswerBoxes: Array<{
    questionId: string;
    questionNumber: string;
    box: BoundingBox;
    isCurrentSelected: boolean;
    isOutOfOrder: boolean;
  }> = [];

  Object.values(assessment.answerMappings).forEach(mapping => {
    mapping.boundingBoxes.forEach(box => {
      if (box.page === currentPage) {
        pageAnswerBoxes.push({
          questionId: mapping.questionId,
          questionNumber: mapping.questionNumber,
          box,
          isCurrentSelected: mapping.questionId === selectedQuestionId,
          isOutOfOrder: mapping.isOutOfOrder
        });
      }
    });
  });

  const pageUnmatchedBoxes = assessment.unmatchedAnswers.filter(u => u.page === currentPage);
  const totalPages = assessment.answerSheetPages.length;

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden">
      
      {/* Top Control Bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 z-20 shadow-md">
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileCheck className="h-4 w-4 text-indigo-400" />
            <span>Student Answer Sheet</span>
          </span>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-2 font-mono font-medium text-slate-200">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {selectedMapping && selectedMapping.boundingBoxes.length > 1 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Q{selectedMapping.questionNumber} spans {selectedMapping.boundingBoxes.length} pages</span>
            <div className="flex gap-1 ml-1">
              {selectedMapping.boundingBoxes.map(b => (
                <button
                  key={b.page}
                  onClick={() => setCurrentPage(b.page)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    currentPage === b.page ? 'bg-indigo-500 text-white' : 'bg-indigo-900 text-indigo-300'
                  }`}
                >
                  Pg {b.page}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllBoundingBoxes(prev => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition ${
              showAllBoundingBoxes
                ? 'bg-veda-500/10 text-veda-300 border-veda-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle visibility of all mapped answer regions"
          >
            {showAllBoundingBoxes ? <Eye className="h-3.5 w-3.5 text-veda-400" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Highlights</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-1.5 py-0.5 text-xs text-slate-300">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-white transition"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-semibold text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-white transition"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1 hover:text-white ml-1 text-slate-500 hover:text-slate-300"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Viewer Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex items-start justify-center relative bg-slate-950/60"
      >
        <div 
          className="relative transition-transform duration-200 ease-out shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-white"
          style={{ 
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            width: '800px',
            minHeight: '1050px'
          }}
        >
          <img 
            src={assessment.answerSheetPages[currentPage - 1] || assessment.answerSheetPages[0]} 
            alt={`Student Answer Sheet Page ${currentPage}`}
            className="w-full h-auto block select-none pointer-events-none"
          />

          <div className="absolute inset-0 pointer-events-auto">
            
            {pageAnswerBoxes.map((item, idx) => {
              const { questionId, questionNumber, box, isCurrentSelected, isOutOfOrder } = item;
              
              if (!showAllBoundingBoxes && !isCurrentSelected) return null;

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
                  className={`absolute rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
                    isCurrentSelected
                      ? 'border-veda-500 bg-veda-500/15 shadow-xl ring-4 ring-veda-500/40 z-30 highlight-box-active'
                      : isOutOfOrder
                        ? 'border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 z-10'
                        : 'border-emerald-500/70 bg-emerald-500/10 hover:bg-emerald-500/20 z-10'
                  }`}
                >
                  <div className={`absolute -top-7 left-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow-md flex items-center gap-1.5 ${
                    isCurrentSelected
                      ? 'bg-veda-600 text-white shadow-veda-500/50 ring-2 ring-veda-400'
                      : isOutOfOrder
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-emerald-600 text-white'
                  }`}>
                    <span>Ans {questionNumber}</span>
                    {isOutOfOrder && <span className="text-[9px] uppercase tracking-wider bg-slate-950/40 px-1 rounded">Out of Order</span>}
                    {isCurrentSelected && <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />}
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-2 right-2 p-2 bg-slate-900/90 backdrop-blur-md rounded border border-slate-700 text-white text-[11px] pointer-events-none z-40">
                    <span className="font-semibold text-veda-300">Click to view Q{questionNumber} grading</span>
                  </div>
                </div>
              );
            })}

            {pageUnmatchedBoxes.map((unmatched) => (
              <div
                key={unmatched.id}
                style={{
                  top: `${unmatched.boundingBox.ymin}%`,
                  left: `${unmatched.boundingBox.xmin}%`,
                  height: `${unmatched.boundingBox.ymax - unmatched.boundingBox.ymin}%`,
                  width: `${unmatched.boundingBox.xmax - unmatched.boundingBox.xmin}%`
                }}
                className="absolute rounded-lg border-2 border-dashed border-rose-500 bg-rose-500/10 hover:bg-rose-500/20 z-20 cursor-pointer group transition"
              >
                <div className="absolute -top-7 left-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-600 text-white shadow-md flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Unmatched Extra Answer</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-2 right-2 p-2 bg-slate-900/95 rounded border border-rose-500/50 text-white text-[11px] pointer-events-none z-40">
                  <p className="font-semibold text-rose-300">{unmatched.aiNote}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

    </div>
  );
};
