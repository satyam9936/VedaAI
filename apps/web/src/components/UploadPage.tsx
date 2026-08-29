import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import teacherMascot from '../assets/teacher-mascot.png';
import { UploadCard } from './UploadCard';
import { UploadedFileCard } from './UploadedFileCard';
import { CameraCaptureModal } from './CameraCaptureModal';

export interface FileData {
  file: File;
  name: string;
  sizeText: string;
  pageCountText: string;
}

interface UploadPageProps {
  qpFiles: FileData[];
  ansFiles: FileData[];
  onSelectQpFiles: (files: FileData[]) => void;
  onRemoveQpFiles: () => void;
  onSelectAnsFiles: (files: FileData[]) => void;
  onRemoveAnsFiles: () => void;
  onStartMapping: () => void;
  onLoadSampleCase?: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  qpFiles,
  ansFiles,
  onSelectQpFiles,
  onRemoveQpFiles,
  onSelectAnsFiles,
  onRemoveAnsFiles,
  onStartMapping,
  onLoadSampleCase,
}) => {
  const [cameraModalType, setCameraModalType] = useState<'Question Paper' | 'Answer Sheet' | null>(null);

  const isBothUploaded = qpFiles.length > 0 && ansFiles.length > 0;

  const handleQpUpload = (files: File[]) => {
    const fileDatas: FileData[] = files.map((file, i) => {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        file,
        name: file.name,
        sizeText: `${sizeInMb}MB`,
        pageCountText: files.length > 1 ? `Page ${i + 1}` : '1 Page',
      };
    });
    onSelectQpFiles(fileDatas);
  };

  const handleAnsUpload = (files: File[]) => {
    const fileDatas: FileData[] = files.map((file, i) => {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        file,
        name: file.name,
        sizeText: `${sizeInMb}MB`,
        pageCountText: files.length > 1 ? `Page ${i + 1}` : '1 Page',
      };
    });
    onSelectAnsFiles(fileDatas);
  };

  const getCombinedMetadata = (files: FileData[]) => {
    if (files.length === 0) return { name: '', sizeText: '', fileCount: 0 };
    if (files.length === 1) {
      return {
        name: files[0].name,
        sizeText: files[0].sizeText,
        fileCount: 1,
        pageCountText: files[0].pageCountText,
      };
    }
    const totalBytes = files.reduce((acc, f) => acc + f.file.size, 0);
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
    return {
      name: `${files[0].name} (+${files.length - 1} more)`,
      sizeText: `${totalMb}MB`,
      fileCount: files.length,
      pageCountText: `${files.length} Files`,
    };
  };

  const qpMeta = getCombinedMetadata(qpFiles);
  const ansMeta = getCombinedMetadata(ansFiles);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start pt-4 sm:pt-6 lg:pt-[30px] px-3 sm:px-6 select-none overflow-y-auto pb-safe">
      
      {/* Main Heading with Fluid Typography */}
      <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-center tracking-tight flex items-center justify-center flex-wrap gap-x-1.5 sm:gap-x-2 leading-[1.2] lg:leading-[1.15] font-sans">
        <span className="text-[#292929]">Upload</span>
        <span className="bg-[#FBE8DF] text-[#F15A35] px-2.5 sm:px-[10px] py-[3px] rounded-[7px] border-b-2 border-[#F15A35] inline-block">
          Question Paper & Answer Sheets
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base lg:text-[18px] font-normal text-[#292929] text-center mt-1.5 sm:mt-2.5 font-sans">
        Upload files or take photos with camera to get started
      </p>

      {/* AI Teacher Mascot PNG Asset */}
      <div className="w-[110px] sm:w-[130px] lg:w-[155px] h-[110px] sm:h-[130px] lg:h-[155px] my-2 sm:my-3.5 flex items-center justify-center shrink-0">
        <img
          src={teacherMascot}
          alt="AI Teacher Mascot"
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Upload Container (Supports selecting multiple files & camera snaps) */}
      <div className="w-full max-w-[850px] min-h-[190px] lg:h-[220px] bg-white rounded-[22px] p-3 sm:p-[12px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3.5 border border-[#E3E3E3]/60 shrink-0">
        {/* Left Upload Card: Question Paper */}
        {qpFiles.length > 0 ? (
          <UploadedFileCard
            fileName={qpMeta.name}
            fileSizeText={qpMeta.sizeText}
            fileCount={qpMeta.fileCount}
            pageCountText={qpMeta.pageCountText}
            onRemove={onRemoveQpFiles}
          />
        ) : (
          <UploadCard
            titleSuffix="Question Paper"
            onFilesSelected={handleQpUpload}
            onOpenCamera={() => setCameraModalType('Question Paper')}
          />
        )}

        {/* Right Upload Card: Answer Sheet */}
        {ansFiles.length > 0 ? (
          <UploadedFileCard
            fileName={ansMeta.name}
            fileSizeText={ansMeta.sizeText}
            fileCount={ansMeta.fileCount}
            pageCountText={ansMeta.pageCountText}
            onRemove={onRemoveAnsFiles}
          />
        ) : (
          <UploadCard
            titleSuffix="Answer Sheet"
            onFilesSelected={handleAnsUpload}
            onOpenCamera={() => setCameraModalType('Answer Sheet')}
          />
        )}
      </div>

      {/* Start Mapping Button, Help Text & Sample Case Preset */}
      <div className="flex flex-col items-center mt-5 sm:mt-6 mb-4">
        <button
          disabled={!isBothUploaded}
          onClick={onStartMapping}
          className={`w-full max-w-[175px] h-[44px] rounded-[23px] font-medium text-[14px] flex items-center justify-center gap-1.5 transition-all shadow-sm font-sans ${
            isBothUploaded
              ? 'bg-[#292929] hover:bg-black active:scale-95 text-white cursor-pointer'
              : 'bg-[#B5B5B5] text-[#E5E5E5] cursor-not-allowed'
          }`}
        >
          <span>Start Mapping</span>
          <span className="text-[16px] leading-none">→</span>
        </button>

        {/* Help Text */}
        <span className="text-[12px] sm:text-[13px] font-normal text-[#8A8A8A] mt-2.5 sm:mt-3 text-center px-4 font-sans">
          Once both files are uploaded, you'll be able to map answers with questions
        </span>

        {/* Sample Assessment Case Preset Button */}
        {onLoadSampleCase && (
          <button
            onClick={onLoadSampleCase}
            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FBE8DF] hover:bg-[#fcd9ca] text-[#F15A35] text-xs font-semibold transition border border-[#F15A35]/30 shadow-xs cursor-pointer active:scale-95 font-sans"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F15A35]" />
            <span>Try Sample Assessment Case (Physics & Biology Exam)</span>
          </button>
        )}
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraModalType !== null}
        onClose={() => setCameraModalType(null)}
        titleSuffix={cameraModalType || 'Question Paper'}
        onAttachFiles={(files) => {
          if (cameraModalType === 'Question Paper') {
            handleQpUpload(files);
          } else if (cameraModalType === 'Answer Sheet') {
            handleAnsUpload(files);
          }
        }}
      />

    </div>
  );
};

