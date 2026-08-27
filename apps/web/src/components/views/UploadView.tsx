import React, { useState } from 'react';
import { ArrowRight, AlertCircle, X, Key } from 'lucide-react';

interface UploadViewProps {
  onStartProcessing: (qpFiles: File[], ansFiles: File[]) => void;
  onUseDemoPreset: () => void;
  hasApiKey: boolean;
  onOpenApiKey: () => void;
  error: { message: string; hint?: string } | null;
  onDismissError: () => void;
}

const TeacherAvatarIllustration = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Soft Peach Background Circle */}
    <circle cx="70" cy="70" r="44" fill="#fdeee9" />
    <circle cx="70" cy="70" r="54" stroke="#ffdcd0" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
    
    {/* Teacher Character Graphic */}
    <g transform="translate(37, 29)">
      {/* Hair Bun */}
      <circle cx="33" cy="11" r="10" fill="#22181c" />

      {/* Face & Neck */}
      <path d="M 23 40 C 23 47 43 47 43 40 L 41 30 L 25 30 Z" fill="#fcd0ba" />
      <ellipse cx="33" cy="27" rx="14" ry="16" fill="#fde0d0" />
      
      {/* Hair Front & Bangs */}
      <path d="M 19 23 C 19 14 27 11 33 11 C 39 11 47 14 47 23 C 44 19 39 18 33 19 C 27 18 22 19 19 23 Z" fill="#35262a" />
      <path d="M 19 22 C 16 26 16 32 17 38 C 18 34 20 28 22 24 Z" fill="#35262a" />
      <path d="M 47 22 C 50 26 50 32 49 38 C 48 34 46 28 44 24 Z" fill="#35262a" />

      {/* Glasses Frame */}
      <rect x="21" y="20" width="10" height="8" rx="2.5" fill="none" stroke="#1e293b" strokeWidth="1.8" />
      <rect x="35" y="20" width="10" height="8" rx="2.5" fill="none" stroke="#1e293b" strokeWidth="1.8" />
      <line x1="31" y1="24" x2="35" y2="24" stroke="#1e293b" strokeWidth="1.8" />

      {/* Eyes & Smile */}
      <circle cx="26" cy="24" r="1.5" fill="#1e293b" />
      <circle cx="40" cy="24" r="1.5" fill="#1e293b" />
      <path d="M 30 33 Q 33 36 36 33" stroke="#e07a5f" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* White Shirt Collar */}
      <path d="M 23 44 L 33 54 L 43 44 L 39 68 L 27 68 Z" fill="#ffffff" />
      
      {/* Dark Suit Jacket */}
      <path d="M 14 48 C 14 44 23 44 23 44 L 27 68 L 10 68 C 9 60 11 52 14 48 Z" fill="#2d3748" />
      <path d="M 52 48 C 52 44 43 44 43 44 L 39 68 L 56 68 C 57 60 55 52 52 48 Z" fill="#2d3748" />

      {/* Notebook / Binder held in hands */}
      <rect x="22" y="49" width="22" height="22" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      <rect x="20" y="49" width="4" height="22" rx="1" fill="#ff5023" />
      <line x1="27" y1="55" x2="39" y2="55" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="60" x2="37" y2="60" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Hands holding notebook */}
      <ellipse cx="20" cy="61" rx="3" ry="2.5" fill="#fcd0ba" />
      <ellipse cx="44" cy="61" rx="3" ry="2.5" fill="#fcd0ba" />
    </g>

    {/* Orbiting Orange Badges matching Target Figma Screenshot */}

    {/* Top Right Badge (1 o'clock) - Clock */}
    <g transform="translate(100, 22)">
      <circle cx="10" cy="10" r="10" fill="#ff5023" />
      <circle cx="10" cy="10" r="4.5" stroke="#ffffff" strokeWidth="1.3" fill="none" />
      <polyline points="10 7.5, 10 10, 12 10" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>

    {/* Right Middle Badge (3-4 o'clock) - Cloud Sync */}
    <g transform="translate(110, 64)">
      <circle cx="10" cy="10" r="10" fill="#ff5023" />
      <path d="M 6.8 12.2 C 5.7 12.2 5 11.3 5 10.1 C 5 8.5 6.4 8 7.3 8 C 7.7 6.6 9.8 6.1 11.3 7.2 C 12.2 6.3 14 6.8 14 8.4 C 14.9 8.4 15.4 9.5 15 10.6 C 15.4 12.2 14 12.2 13.1 12.2 Z" fill="#ffffff" />
    </g>

    {/* Bottom Middle Badge (6 o'clock) - Checklist */}
    <g transform="translate(60, 110)">
      <circle cx="10" cy="10" r="10" fill="#ff5023" />
      <rect x="6" y="6.5" width="8" height="7" rx="1.2" fill="none" stroke="#ffffff" strokeWidth="1.2" />
      <line x1="8" y1="9" x2="12" y2="9" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="8" y1="11" x2="11" y2="11" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
    </g>

    {/* Left Middle Badge (9 o'clock) - Document */}
    <g transform="translate(18, 48)">
      <circle cx="10" cy="10" r="10" fill="#ff5023" />
      <rect x="6" y="6" width="8" height="8" rx="1.2" fill="none" stroke="#ffffff" strokeWidth="1.2" />
      <line x1="8.5" y1="8.5" x2="11.5" y2="8.5" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="8.5" y1="11" x2="11.5" y2="11" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  </svg>
);

export const UploadView: React.FC<UploadViewProps> = ({
  onStartProcessing,
  onUseDemoPreset,
  hasApiKey,
  onOpenApiKey,
  error,
  onDismissError
}) => {
  const [qpFile, setQpFile] = useState<File | null>(null);
  const [ansFile, setAnsFile] = useState<File | null>(null);

  const handleQpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQpFile(e.target.files[0]);
      onDismissError();
    }
  };

  const handleAnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnsFile(e.target.files[0]);
      onDismissError();
    }
  };

  const isReady = Boolean(qpFile && ansFile);

  const handleSubmit = () => {
    if (qpFile && ansFile) {
      onStartProcessing([qpFile], [ansFile]);
    } else {
      onUseDemoPreset();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 space-y-6 animate-fade-in select-none overflow-y-auto bg-[#f5f5f7]/70 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm">

      {/* Error Banner */}
      {error && (
        <div className="w-full max-w-3xl p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-bold text-rose-900">{error.message}</p>
            {error.hint && (
              <p className="text-xs font-medium text-rose-700/90 leading-relaxed">{error.hint}</p>
            )}
          </div>
          <button
            onClick={onDismissError}
            className="p-1 text-rose-400 hover:text-rose-700 transition shrink-0"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Missing Key Banner */}
      {!hasApiKey && (
        <div className="w-full max-w-3xl p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Key className="h-4.5 w-4.5 text-amber-500 shrink-0" />
            <p className="text-xs font-semibold text-amber-900">
              No Gemini API key set. <span className="font-normal text-amber-700">Add a free key to evaluate custom files, or test with sample exam below.</span>
            </p>
          </div>
          <button
            onClick={onOpenApiKey}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shrink-0"
          >
            Add Key
          </button>
        </div>
      )}
      
      {/* Title & Coral Highlight Pill INLINE matching Target Screenshot */}
      <div className="text-center space-y-2 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1e293b] tracking-tight flex items-center justify-center gap-3 flex-wrap">
          <span>Upload</span>
          <span className="bg-[#ffdcd0] text-[#ff5023] px-4 py-1 rounded-2xl font-black inline-block leading-snug">
            Question Paper &amp; Answer Sheets
          </span>
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Upload both files to get started
        </p>
      </div>

      {/* Central Teacher Avatar Graphic matching Target Screenshot */}
      <div className="relative flex items-center justify-center py-1">
        <TeacherAvatarIllustration />
      </div>

      {/* Dual Upload Zone Outer Container matching Target Screenshot */}
      <div className="p-5 md:p-7 bg-[#f4f5f7]/90 rounded-[32px] border border-slate-200/80 shadow-sm w-full max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          
          {/* Question Paper Upload Box */}
          <div className="relative border-2 border-dashed border-[#d1d5db] hover:border-[#ff5023] bg-white rounded-[24px] p-7 text-center cursor-pointer transition-all duration-200 shadow-xs group">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleQpChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="flex flex-col items-center space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#f1f5f9] text-slate-800 group-hover:bg-[#ffdcd0] group-hover:text-[#ff5023] transition">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 16V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-extrabold text-[#1e293b] block">
                  Upload <span className="text-[#ff5023]">Question Paper</span>
                </span>
                <span className="text-[11px] font-semibold text-[#94a3b8] block">
                  {qpFile ? qpFile.name : 'Max 10MB'}
                </span>
              </div>
            </div>
          </div>

          {/* Answer Sheet Upload Box */}
          <div className="relative border-2 border-dashed border-[#d1d5db] hover:border-[#ff5023] bg-white rounded-[24px] p-7 text-center cursor-pointer transition-all duration-200 shadow-xs group">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleAnsChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="flex flex-col items-center space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#f1f5f9] text-slate-800 group-hover:bg-[#ffdcd0] group-hover:text-[#ff5023] transition">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 16V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-extrabold text-[#1e293b] block">
                  Upload <span className="text-[#ff5023]">Answer Sheet</span>
                </span>
                <span className="text-[11px] font-semibold text-[#94a3b8] block">
                  {ansFile ? ansFile.name : 'Max 10MB'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Primary Action Button matching Target Screenshot */}
      <div className="flex flex-col items-center space-y-2 pt-1">
        <button
          onClick={handleSubmit}
          className={`px-8 py-3 rounded-full font-bold text-xs transition-all duration-200 flex items-center gap-2 transform active:scale-95 shadow-xs ${
            isReady
              ? 'bg-[#ff5023] hover:bg-[#e04017] text-white shadow-orange-500/20'
              : 'bg-[#9ea2a7] hover:bg-[#8d9196] text-white'
          }`}
        >
          <span>Start Mapping</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-[11px] font-semibold text-[#94a3b8] text-center">
          Once both files are uploaded, you'll be able to map answers with questions
        </p>
      </div>

    </div>
  );
};

