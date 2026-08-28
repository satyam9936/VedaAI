import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface UploadCardProps {
  titleSuffix: 'Question Paper' | 'Answer Sheet';
  onFilesSelected: (files: File[]) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  titleSuffix,
  onFilesSelected,
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
      <div className="w-[44px] sm:w-[50px] h-[44px] sm:h-[50px] rounded-xl bg-[#F3F3F3] group-hover:bg-[#FBE8DF] flex items-center justify-center text-[#292929] group-hover:text-[#F15A35] transition-colors mb-2.5 sm:mb-3">
        <Upload className="w-5 sm:w-6 h-5 sm:h-6 stroke-[2]" />
      </div>

      {/* Text: "Upload Question Paper" / "Upload Answer Sheet" */}
      <div className="text-[16px] sm:text-[18px] font-medium text-center leading-tight font-sans">
        <span className="text-[#292929]">Upload </span>
        <span className="text-[#F15A35]">{titleSuffix}</span>
      </div>

      {/* Subtext: "Select single or multiple files • Max 10MB" */}
      <span className="text-[13px] sm:text-[14px] font-normal text-[#A0A0A0] mt-1 sm:mt-1.5 font-sans">
        Max 10MB
      </span>

      {/* Validation Error Message */}
      {error && (
        <span className="text-[12px] font-medium text-red-500 mt-1 text-center absolute bottom-2 px-2 truncate max-w-full">
          {error}
        </span>
      )}
    </div>
  );
};
