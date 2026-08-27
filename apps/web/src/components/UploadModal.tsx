import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import { ProcessingStatus } from '@vedaai/types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProcessing: (qpFiles: File[], ansFiles: File[]) => void;
  processingStatus: ProcessingStatus | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onStartProcessing,
  processingStatus
}) => {
  const [qpFiles, setQpFiles] = useState<File[]>([]);
  const [ansFiles, setAnsFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isProcessing = processingStatus && processingStatus.step !== 'idle' && processingStatus.step !== 'complete' && processingStatus.step !== 'error';

  const handleQpDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setQpFiles(Array.from(e.target.files));
      setErrorMsg(null);
    }
  };

  const handleAnsDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAnsFiles(Array.from(e.target.files));
      setErrorMsg(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qpFiles.length === 0) {
      setErrorMsg('Please upload at least 1 Question Paper file (PDF or Image).');
      return;
    }
    if (ansFiles.length === 0) {
      setErrorMsg('Please upload at least 1 Student Answer Sheet file (PDF or Image).');
      return;
    }
    onStartProcessing(qpFiles, ansFiles);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-veda-500/10 rounded-xl border border-veda-500/20 text-veda-400">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Upload Assessment &amp; Answer Sheet</h2>
              <p className="text-xs text-slate-400">Upload Question Paper and Student Handwritten Answer Sheet (PDFs or Images)</p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Processing Screen vs Upload Form */}
        {isProcessing ? (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-slate-800 border-t-veda-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-veda-400">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-base font-semibold text-slate-100">
                AI Pipeline Processing...
              </h3>
              <p className="text-xs text-veda-400 font-medium">
                {processingStatus?.message || 'Processing files...'}
              </p>
            </div>

            <div className="w-full max-w-md bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-veda-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${processingStatus?.progressPercentage || 10}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md text-left text-xs text-slate-400">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-850 border border-slate-800">
                <CheckCircle className={`h-4 w-4 ${processingStatus?.progressPercentage && processingStatus.progressPercentage >= 35 ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>Question Extraction (sub-parts 11a, 11b)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-850 border border-slate-800">
                <CheckCircle className={`h-4 w-4 ${processingStatus?.progressPercentage && processingStatus.progressPercentage >= 60 ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>Handwriting OCR &amp; Bounding Boxes</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-850 border border-slate-800">
                <CheckCircle className={`h-4 w-4 ${processingStatus?.progressPercentage && processingStatus.progressPercentage >= 80 ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>Out-of-Order &amp; Multi-page Mapping</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-850 border border-slate-800">
                <CheckCircle className={`h-4 w-4 ${processingStatus?.progressPercentage && processingStatus.progressPercentage >= 95 ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>AI Marks &amp; Feedback Insights</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-6 space-y-6">
            
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Question Paper Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  1. Question Paper (PDF or Images)
                </label>
                <div className="relative border-2 border-dashed border-slate-700 hover:border-veda-500/50 bg-slate-850/50 hover:bg-slate-800/80 rounded-xl p-5 text-center cursor-pointer transition group">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    onChange={handleQpDrop}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center space-y-2">
                    <FileText className="h-8 w-8 text-slate-500 group-hover:text-veda-400 transition" />
                    <span className="text-xs font-medium text-slate-300">
                      {qpFiles.length > 0 ? `${qpFiles.length} File(s) Selected` : 'Click or Drop Question Paper'}
                    </span>
                    <span className="text-[11px] text-slate-500">PDF, PNG, JPG supported</span>
                  </div>
                </div>
                {qpFiles.length > 0 && (
                  <div className="text-[11px] text-slate-400 truncate">
                    {qpFiles.map((f: File) => f.name).join(', ')}
                  </div>
                )}
              </div>

              {/* Answer Sheet Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  2. Student Handwritten Answer Sheet
                </label>
                <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-850/50 hover:bg-slate-800/80 rounded-xl p-5 text-center cursor-pointer transition group">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    onChange={handleAnsDrop}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center space-y-2">
                    <ImageIcon className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 transition" />
                    <span className="text-xs font-medium text-slate-300">
                      {ansFiles.length > 0 ? `${ansFiles.length} File(s) Selected` : 'Click or Drop Answer Sheet'}
                    </span>
                    <span className="text-[11px] text-slate-500">Handwritten pages (PDF or Images)</span>
                  </div>
                </div>
                {ansFiles.length > 0 && (
                  <div className="text-[11px] text-slate-400 truncate">
                    {ansFiles.map((f: File) => f.name).join(', ')}
                  </div>
                )}
              </div>

            </div>

            <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-veda-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">AI Processing Guarantee:</span> The system automatically detects questions &amp; sub-parts, maps answers (including out-of-order and multi-page spanning), highlights exact regions, and calculates AI marks.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-veda-600 to-indigo-600 hover:from-veda-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-veda-600/30 transition"
              >
                <Sparkles className="h-4 w-4" />
                <span>Extract &amp; Map Assessment</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
