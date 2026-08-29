import React, { useRef, useState } from 'react';
import { Upload, Camera } from 'lucide-react';

interface UploadCardProps {
  titleSuffix: 'Question Paper' | 'Answer Sheet';
  onFilesSelected: (files: File[]) => void;
  onOpenCamera?: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  titleSuffix,
  onFilesSelected,
  onOpenCamera,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit per file

    const invalidType = selectedFiles.some((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return !validTypes.includes(file.type) && !['pdf', 'png', 'jpg', 'jpeg'].includes(ext || '');
    });

    if (invalidType) {
      setError('Please select valid PDF, PNG, or JPG files.');
      return;
    }

    const oversized = selectedFiles.some((file) => file.size > maxSizeBytes);
    if (oversized) {
      setError('One or more files exceed the 10MB limit.');
      return;
    }

    setError(null);
    onFilesSelected(selectedFiles);
  };

  return (
    <div
      onClick={handleClick}
      className="w-full lg:w-[400px] h-[170px] sm:h-[190px] bg-white border-2 border-dashed border-[#D9D9D9] hover:border-[#F15A35] active:border-[#F15A35] rounded-[20px] flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-200 group select-none relative"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Icon inside light gray rounded square */}
      <div className="w-[40px] sm:w-[46px] h-[40px] sm:h-[46px] rounded-xl bg-[#F3F3F3] group-hover:bg-[#FBE8DF] flex items-center justify-center text-[#292929] group-hover:text-[#F15A35] transition-colors mb-2">
        <Upload className="w-5 sm:w-5 h-5 sm:h-5 stroke-[2]" />
      </div>

      {/* Text: "Upload Question Paper" / "Upload Answer Sheet" */}
      <div className="text-[15px] sm:text-[17px] font-semibold text-center leading-tight font-sans">
        <span className="text-[#292929]">Upload </span>
        <span className="text-[#F15A35]">{titleSuffix}</span>
      </div>

      {/* Subtext with Camera action badge */}
      <div className="flex items-center gap-2 mt-1.5 font-sans">
        <span className="text-[12px] text-[#A0A0A0]">
          PDF / Images • Max 10MB
        </span>

        {onOpenCamera && (
          <>
            <span className="text-gray-300 text-xs">•</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCamera();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3F3F3] hover:bg-[#FBE8DF] text-[#292929] hover:text-[#F15A35] text-[11px] font-bold transition border border-gray-200/80 shadow-2xs active:scale-95 z-10"
              title="Click to take photo with camera"
            >
              <Camera className="w-3 h-3 text-[#F15A35]" />
              <span>Camera</span>
            </button>
          </>
        )}
      </div>

      {/* Validation Error Message */}
      {error && (
        <span className="text-[12px] font-medium text-red-500 mt-1 text-center absolute bottom-2 px-2 truncate max-w-full">
          {error}
        </span>
      )}
    </div>
  );
};
