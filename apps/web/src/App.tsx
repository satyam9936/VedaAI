import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DashboardShell } from './components/DashboardShell';
import { UploadPage, FileData } from './components/UploadPage';
import { ExtractionPage } from './components/ExtractionPage';
import { AssessmentView } from './components/views/AssessmentView';
import { ApiKeyDrawer } from './components/ApiKeyDrawer';
import { AssessmentData, ProcessingStatus } from '@vedaai/types';
import { 
  SAMPLE_BIOLOGY_ASSESSMENT, 
  processAssessmentWithAI, 
  AiEngineError 
} from '@vedaai/ai-engine';

export type ViewMode = 'upload' | 'extracting' | 'assessment';

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>('exams');

  const [qpFiles, setQpFiles] = useState<FileData[]>([]);
  const [ansFiles, setAnsFiles] = useState<FileData[]>([]);

  const [assessment, setAssessment] = useState<AssessmentData>(SAMPLE_BIOLOGY_ASSESSMENT);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>('q2');
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [processingError, setProcessingError] = useState<{ message: string; hint?: string } | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('VEDA_GEMINI_API_KEY');
    if (savedKey) setGeminiApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string | null) => {
    setGeminiApiKey(key);
    if (key) {
      localStorage.setItem('VEDA_GEMINI_API_KEY', key);
    } else {
      localStorage.removeItem('VEDA_GEMINI_API_KEY');
    }
  };

  const handleSelectQpFiles = (files: FileData[]) => {
    setQpFiles(files);
  };

  const handleRemoveQpFiles = () => {
    setQpFiles([]);
  };

  const handleSelectAnsFiles = (files: FileData[]) => {
    setAnsFiles(files);
  };

  const handleRemoveAnsFiles = () => {
    setAnsFiles([]);
  };

  const handleStartMapping = async () => {
    setProcessingError(null);
    setViewMode('extracting');
    setIsSidebarCollapsed(true);

    const qpRawFiles = qpFiles.map((f) => f.file);
    const ansRawFiles = ansFiles.map((f) => f.file);

    // If real uploaded files exist and Gemini API key is configured, execute real AI Vision engine
    if (qpRawFiles.length > 0 && ansRawFiles.length > 0 && geminiApiKey) {
      setProcessingStatus({
        step: 'uploading',
        progressPercentage: 10,
        message: `Reading ${qpRawFiles.length} question paper file(s) & ${ansRawFiles.length} answer sheet file(s)...`
      });

      try {
        const result = await processAssessmentWithAI(
          qpRawFiles,
          ansRawFiles,
          geminiApiKey,
          (status) => setProcessingStatus(status)
        );

        setAssessment(result);
        setSelectedQuestionId(result.questions[0]?.id ?? 'q1');

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        setViewMode('assessment');
      } catch (err) {
        console.error('Error processing assessment:', err);
        setProcessingError(
          err instanceof AiEngineError
            ? { message: err.message, hint: err.hint }
            : { message: err instanceof Error ? err.message : 'Something went wrong while processing your files.' }
        );
        setProcessingStatus(null);
        setViewMode('upload');
      }
    } else {
      // Demo pipeline with step-by-step progress update
      setProcessingStatus({
        step: 'scanning_handwriting',
        progressPercentage: 45,
        message: 'Scanning handwriting & extracting questions...'
      });

      setTimeout(() => {
        setProcessingStatus({
          step: 'mapping_answers',
          progressPercentage: 85,
          message: 'Mapping student answers to questions...'
        });
      }, 1200);

      setTimeout(() => {
        setAssessment(SAMPLE_BIOLOGY_ASSESSMENT);
        setSelectedQuestionId('q2');
        setViewMode('assessment');
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 2500);
    }
  };

  const handleLoadSampleCase = () => {
    // Populate sample files and trigger demo pipeline
    const dummyQp = new File(['dummy qp'], 'Class_10_maths_unit_test.pdf', { type: 'application/pdf' });
    const dummyAns = new File(['dummy ans'], 'student_1_answer_sheet.pdf', { type: 'application/pdf' });
    
    const qpData: FileData = { file: dummyQp, name: 'Class_10_maths_unit_test.pdf', sizeText: '2MB', pageCountText: '2 Pages' };
    const ansData: FileData = { file: dummyAns, name: 'student_1_answer_sheet.pdf', sizeText: '8MB', pageCountText: '6 Pages' };
    
    setQpFiles([qpData]);
    setAnsFiles([ansData]);

    setProcessingError(null);
    setViewMode('extracting');
    setIsSidebarCollapsed(true);

    setProcessingStatus({
      step: 'scanning_handwriting',
      progressPercentage: 45,
      message: 'Scanning handwriting & extracting questions...'
    });

    setTimeout(() => {
      setProcessingStatus({
        step: 'mapping_answers',
        progressPercentage: 85,
        message: 'Mapping student answers to questions...'
      });
    }, 1200);

    setTimeout(() => {
      setAssessment(SAMPLE_BIOLOGY_ASSESSMENT);
      setSelectedQuestionId('q2');
      setViewMode('assessment');
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 2500);
  };

  const handleBackHeader = () => {
    if (viewMode === 'extracting' || viewMode === 'assessment') {
      setViewMode('upload');
      setIsSidebarCollapsed(false);
    }
  };

  return (
    <>
      <DashboardShell
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        activeNav={activeNav}
        onSelectNav={(nav) => setActiveNav(nav)}
        onBackHeader={handleBackHeader}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        hasApiKey={Boolean(geminiApiKey)}
      >
        {viewMode === 'extracting' && (
          <ExtractionPage 
            progressMessage={processingStatus?.message}
            progressPercentage={processingStatus?.progressPercentage}
          />
        )}

        {viewMode === 'assessment' && (
          <AssessmentView
            assessment={assessment}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={(qId) => setSelectedQuestionId(qId)}
          />
        )}

        {viewMode === 'upload' && (
          <UploadPage
            qpFiles={qpFiles}
            ansFiles={ansFiles}
            onSelectQpFiles={handleSelectQpFiles}
            onRemoveQpFiles={handleRemoveQpFiles}
            onSelectAnsFiles={handleSelectAnsFiles}
            onRemoveAnsFiles={handleRemoveAnsFiles}
            onStartMapping={handleStartMapping}
            onLoadSampleCase={handleLoadSampleCase}
          />
        )}
      </DashboardShell>

      {/* Gemini API Key Settings Drawer */}
      <ApiKeyDrawer
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        currentApiKey={geminiApiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </>
  );
}

export default App;
