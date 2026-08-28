import React from 'react';
import { X } from 'lucide-react';

interface UploadedFileCardProps {
  fileName: string;
  fileSizeText: string;
  pageCountText?: string;
  fileCount?: number;
  onRemove: () => void;
}

export const UploadedFileCard: React.FC<UploadedFileCardProps> = ({
  fileName,
  fileSizeText,
  pageCountText = '2 Pages',
  fileCount = 1,
  onRemove,
}) => {
  const isMultiple = fileCount > 1;

  return (
    <div className="w-full lg:w-[400px] h-[170px] sm:h-[190px] bg-white border-2 border-dashed border-[#D9D9D9] rounded-[20px] flex items-center justify-center p-3 sm:p-4 relative select-none">
      
      {/* Uploaded File Inner Pill Card */}
      <div className="w-full max-w-[320px] bg-[#F5F5F5] rounded-[16px] p-3 sm:p-3.5 px-3.5 sm:px-4 flex items-center gap-3 sm:gap-3.5 relative shadow-sm border border-[#E3E3E3]">
        
        {/* File Red/Orange Badge Icon */}
        <div className="w-8 sm:w-9 h-9 sm:h-10 rounded-lg bg-[#E53935] text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
          <span className="text-[9px] sm:text-[10px] font-black tracking-wider leading-none">
            {isMultiple ? 'FILES' : 'PDF'}
          </span>
        </div>

        {/* File Details */}
        <div className="flex flex-col min-w-0 flex-1 justify-center leading-tight">
          <span 
            className="font-bold text-[14px] sm:text-[15px] text-[#292929] truncate block font-sans"
            title={fileName}
          >
            {fileName}
          </span>
          <span className="text-[12px] sm:text-[13px] text-[#7F7F7F] font-normal block truncate mt-0.5 sm:mt-1 font-sans">
            {isMultiple ? `${fileCount} Files` : pageCountText} • {fileSizeText}
          </span>
        </div>

        {/* Circular Remove X Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#444444] hover:bg-black text-white flex items-center justify-center transition shadow-md"
          title="Remove file"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

      </div>

    </div>
  );
};
