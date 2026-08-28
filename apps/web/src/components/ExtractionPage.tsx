import React from 'react';

interface ExtractionPageProps {
  progressMessage?: string;
  progressPercentage?: number;
}

export const ExtractionPage: React.FC<ExtractionPageProps> = ({
  progressMessage = 'This may take a while',
  progressPercentage,
}) => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative bg-white select-none">
      

      {/* Centered Loading AI Star Sparkle Animation & Typography */}
      <div className="flex flex-col items-center justify-center gap-4 z-10">
        
        {/* Sparkle Graphics Cluster (3 Orange 4-Point Stars + Orbiting Dots) */}
        <div className="relative w-28 h-28 flex items-center justify-center animate-sparkle">
          {/* Main Top-Right Large Sparkle Star */}
          <svg
            className="w-16 h-16 text-[#FF6338] absolute top-1 right-2 drop-shadow-sm"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
          </svg>

          {/* Bottom-Left Medium Sparkle Star */}
          <svg
            className="w-10 h-10 text-[#FF6338] absolute bottom-2 left-3 drop-shadow-sm"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
          </svg>

          {/* Small Sparkle Star */}
          <svg
            className="w-5 h-5 text-[#FF6338] opacity-80 absolute bottom-6 right-1"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
          </svg>

          {/* Orbiting Orange Dots */}
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6338] absolute top-4 left-3 opacity-90" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6338] absolute bottom-4 left-10 opacity-75" />
        </div>

        {/* Text Details */}
        <div className="flex flex-col items-center gap-1.5 text-center mt-2 px-4">
          <h2 className="text-[23px] font-bold text-[#333333] tracking-tight">
            Extracting...
          </h2>
          <p className="text-[14px] font-medium text-[#777777] max-w-md">
            {progressMessage}
          </p>

          {/* Progress Bar indicator if percentage is available */}
          {progressPercentage !== undefined && (
            <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#F15A35] to-[#FF6338] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
