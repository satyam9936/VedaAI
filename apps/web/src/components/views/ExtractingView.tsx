import React from 'react';

interface ExtractingViewProps {
  progressMessage?: string;
  progressPercentage?: number;
}

export const ExtractingView: React.FC<ExtractingViewProps> = ({
  progressMessage = 'Extracting...',
  progressPercentage
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm animate-fade-in select-none space-y-6">
      
      {/* Exact Vector Coral 4-Point AI Sparkles Illustration matching Figma Screenshot */}
      <div className="relative flex items-center justify-center py-4">
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform hover:scale-105 transition duration-300">
          <defs>
            <linearGradient id="starGradMain" x1="35" y1="10" x2="105" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff7247" />
              <stop offset="100%" stopColor="#ff4112" />
            </linearGradient>
            <linearGradient id="starGradSub" x1="20" y1="60" x2="64" y2="106" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff8560" />
              <stop offset="100%" stopColor="#ff5023" />
            </linearGradient>
          </defs>
          
          {/* Top-Left Dot */}
          <circle cx="32" cy="34" r="6.5" fill="#ff683f" />

          {/* Main Large Curved 4-Point Star (Top Right) */}
          <path 
            d="M 76 12 Q 76 52 116 52 Q 76 52 76 92 Q 76 52 36 52 Q 76 52 76 12 Z" 
            fill="url(#starGradMain)" 
          />

          {/* Secondary Curved 4-Point Star (Bottom Left) */}
          <path 
            d="M 44 60 Q 44 84 68 84 Q 44 84 44 108 Q 44 84 20 84 Q 44 84 44 60 Z" 
            fill="url(#starGradSub)" 
          />

          {/* Small Curved 4-Point Star (Bottom Right) */}
          <path 
            d="M 98 74 Q 98 84 108 84 Q 98 84 98 94 Q 98 84 88 84 Q 98 84 98 74 Z" 
            fill="#ff815c" 
          />
        </svg>
      </div>

      {/* Title & Subtitle matching Figma Screenshot 1 */}
      <div className="text-center space-y-1 max-w-sm">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Extracting...
        </h2>
        <p className="text-xs font-semibold text-slate-400">
          This may take a while
        </p>
      </div>

      {/* Progress Message if present */}
      {progressMessage && progressMessage !== 'Extracting...' && (
        <div className="w-full max-w-xs space-y-2 pt-2">
          {progressPercentage !== undefined && (
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-[#ff5023] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
          <p className="text-[11px] font-semibold text-[#ff5023] text-center">
            {progressMessage}
          </p>
        </div>
      )}

    </div>
  );
};

