import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Search, 
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { AssessmentData, AnswerMapping, EvaluationStatus } from '@vedaai/types';

interface QuestionSidebarProps {
  assessment: AssessmentData;
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
}

type FilterType = 'all' | 'answered' | 'unanswered' | 'out_of_order' | 'subparts';

export const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
  assessment,
  selectedQuestionId,
  onSelectQuestion,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const filteredQuestions = assessment.questions.filter(q => {
    const mapping = assessment.answerMappings[q.id];
    
    if (filter === 'answered' && !mapping?.isAnswered) return false;
    if (filter === 'unanswered' && mapping?.isAnswered) return false;
    if (filter === 'out_of_order' && !mapping?.isOutOfOrder) return false;
    if (filter === 'subparts' && !q.subPart) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const numMatch = q.number.toLowerCase().includes(query);
      const textMatch = q.text.toLowerCase().includes(query);
      const ansMatch = mapping?.studentAnswerText.toLowerCase().includes(query);
      return numMatch || textMatch || ansMatch;
    }

    return true;
  });

  const toggleExpand = (qId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedQuestionId(prev => prev === qId ? null : qId);
  };

  const getStatusBadge = (status: EvaluationStatus, isAnswered: boolean, isOutOfOrder: boolean) => {
    if (!isAnswered) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-medium flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          <span>Unanswered</span>
        </span>
      );
    }
    if (isOutOfOrder) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Out of Order</span>
        </span>
      );
    }
    switch (status) {
      case 'correct':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Correct</span>
          </span>
        );
      case 'partial':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Partial Credit</span>
          </span>
        );
      case 'incorrect':
        return (
          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-medium flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Incorrect</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 overflow-hidden">
      
      {/* Top Section: Header & Filters */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-veda-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Extracted Questions ({filteredQuestions.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Printed Order</span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search question, sub-part or answer..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-veda-500 transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'all' 
                ? 'bg-veda-600 text-white shadow-sm' 
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({assessment.questions.length})
          </button>

          <button
            onClick={() => setFilter('answered')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'answered' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Answered
          </button>

          <button
            onClick={() => setFilter('unanswered')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'unanswered' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Unanswered ({assessment.overallSummary.unansweredCount})
          </button>

          <button
            onClick={() => setFilter('out_of_order')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'out_of_order' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Out of Order ({assessment.overallSummary.outOfOrderCount})
          </button>

          <button
            onClick={() => setFilter('subparts')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'subparts' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Sub-parts
          </button>
        </div>
      </div>

      {/* Question List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No questions match the selected filter or search query.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const mapping: AnswerMapping | undefined = assessment.answerMappings[q.id];
            const isSelected = selectedQuestionId === q.id;
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q.id)}
                className={`rounded-xl border transition cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-850 border-veda-500 shadow-md shadow-veda-500/10 ring-1 ring-veda-500/50'
                    : 'bg-slate-850/60 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-veda-500" />
                )}

                <div className="p-3.5 space-y-2">
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                        isSelected 
                          ? 'bg-veda-500 text-white' 
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}>
                        Q{q.number}
                      </span>
                      {q.subPart && (
                        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                          sub-part ({q.subPart})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-300">
                        {mapping ? `${mapping.marksAwarded}/${q.maxMarks}` : `0/${q.maxMarks}`} pts
                      </span>
                      {mapping && getStatusBadge(mapping.evaluationStatus, mapping.isAnswered, mapping.isOutOfOrder)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-2">
                    {q.text}
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60 text-[11px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectQuestion(q.id);
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition ${
                        isSelected && mapping?.isAnswered
                          ? 'bg-veda-500/20 text-veda-300 border border-veda-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Target className="h-3 w-3 text-veda-400" />
                      <span>{mapping?.isAnswered ? 'Locate on Answer Sheet' : 'No Answer Region'}</span>
                      {mapping?.boundingBoxes && mapping.boundingBoxes.length > 1 && (
                        <span className="text-[10px] px-1 bg-indigo-500/20 text-indigo-300 rounded">
                          {mapping.boundingBoxes.length} pages
                        </span>
                      )}
                    </button>

                    <button
                      onClick={(e) => toggleExpand(q.id, e)}
                      className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 flex items-center gap-1"
                      title="Toggle AI Feedback details"
                    >
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>AI Insights</span>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>

                  {isExpanded && mapping && (
                    <div className="mt-2 pt-2.5 border-t border-slate-800 space-y-2.5 text-xs animate-fade-in">
                      
                      {mapping.studentAnswerText && (
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Extracted Handwriting (OCR):
                          </span>
                          <p className="font-handwriting text-sm text-blue-300 leading-relaxed">
                            "{mapping.studentAnswerText}"
                          </p>
                        </div>
                      )}

                      <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-800/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                          <span>AI Evaluation Note</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          {mapping.aiFeedback}
                        </p>
                      </div>

                      {mapping.keyPointsFound && mapping.keyPointsFound.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-emerald-400 block">Key Concepts Covered:</span>
                          <ul className="space-y-0.5">
                            {mapping.keyPointsFound.map((pt, i) => (
                              <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {mapping.missedConcepts && mapping.missedConcepts.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-rose-400 block">Missed / Partial Concepts:</span>
                          <ul className="space-y-0.5">
                            {mapping.missedConcepts.map((m, i) => (
                              <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1">
                                <AlertCircle className="h-3 w-3 text-rose-400 shrink-0 mt-0.5" />
                                <span>{m}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
