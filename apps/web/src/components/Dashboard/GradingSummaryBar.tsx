import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  Sparkles, 
  UserCheck 
} from 'lucide-react';
import { AssessmentData } from '@vedaai/types';

interface GradingSummaryBarProps {
  assessment: AssessmentData;
}

export const GradingSummaryBar: React.FC<GradingSummaryBarProps> = ({ assessment }) => {
  const { overallSummary } = assessment;

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 shadow-lg text-slate-100">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-veda-500 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center text-veda-400">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">{assessment.studentName}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                Roll No: {assessment.rollNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {assessment.title} | {assessment.date}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Score</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {assessment.totalObtainedMarks} / {assessment.totalMaxMarks} <span className="text-xs">({assessment.percentage}%)</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-veda-500/10 text-veda-400 border border-veda-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Answered</span>
              <span className="text-sm font-bold font-mono text-slate-200">
                {overallSummary.answeredCount} / {overallSummary.totalQuestions}
              </span>
            </div>
          </div>

          <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Unanswered</span>
              <span className="text-sm font-bold font-mono text-rose-400">
                {overallSummary.unansweredCount} Qs
              </span>
            </div>
          </div>

          <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Out of Order</span>
              <span className="text-sm font-bold font-mono text-amber-400">
                {overallSummary.outOfOrderCount} Qs
              </span>
            </div>
          </div>

        </div>

        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 max-w-sm space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-veda-400 font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>AI Teacher Insights</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
            {overallSummary.summaryText}
          </p>
        </div>

      </div>
    </div>
  );
};
