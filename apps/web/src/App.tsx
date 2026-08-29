import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DashboardShell } from './components/DashboardShell';
import { UploadPage, FileData } from './components/UploadPage';
import { ExtractionPage } from './components/ExtractionPage';
import { AssessmentView } from './components/views/AssessmentView';
import { ApiKeyDrawer } from './components/ApiKeyDrawer';
import { AIChatDrawer } from './components/AIChatDrawer';
import { TeacherToolkitModal } from './components/TeacherToolkitModal';
import { AssessmentData, ProcessingStatus } from '@vedaai/types';
import { 
  SAMPLE_BIOLOGY_ASSESSMENT, 
  processAssessmentWithAI, 
  AiEngineError,
  checkBackendHealth,
  processAssessmentViaBackend,
  BackendStatus,
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
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isTeacherToolkitOpen, setIsTeacherToolkitOpen] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [processingError, setProcessingError] = useState<{ message: string; hint?: string } | null>(null);

  // Backend server status
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    available: false,
    hasApiKey: false,
  });
  const [backendChecked, setBackendChecked] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then((status) => {
      setBackendStatus(status);
      setBackendChecked(true);
      if (status.available && status.hasApiKey) {
        console.log('✅ VedaAI backend server connected — AI ready without API key!');
      } else if (status.available) {
        console.log('⚠️ Backend server running but no API key configured in .env');
      } else {
        console.log('ℹ️ Backend server not available — using client-side mode');
      }
    });
  }, []);

  useEffect(() => {
    const savedKey = localStorage.getItem('VEDA_GEMINI_API_KEY');
    if (savedKey) setGeminiApiKey(savedKey);
  }, []);

  // Determine if AI is ready (backend available OR user has a key)
  const isAiReady = (backendStatus.available && backendStatus.hasApiKey) || Boolean(geminiApiKey);

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

    // Check if we have real files to process
    if (qpRawFiles.length > 0 && ansRawFiles.length > 0) {
      // Strategy: try backend first (no key needed), fallback to client-side
      const useBackend = backendStatus.available && backendStatus.hasApiKey;

      if (useBackend) {
        // ── Route 1: Backend proxy (recommended) ──
        try {
          const result = await processAssessmentViaBackend(
            qpRawFiles,
            ansRawFiles,
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
        } catch (err: any) {
          console.error('Backend processing failed:', err);

          // If backend fails and user has their own key, try client-side
          if (geminiApiKey) {
            console.log('Falling back to client-side Gemini call...');
            await processClientSide(qpRawFiles, ansRawFiles);
          } else {
            setProcessingError({
              message: err?.message || 'Server processing failed.',
              hint: err?.hint || 'Try again, or add your own Gemini API key as a fallback.',
            });
            setProcessingStatus(null);
            setViewMode('upload');
          }
        }
      } else if (geminiApiKey) {
        // ── Route 2: Client-side Gemini call (user's own key) ──
        await processClientSide(qpRawFiles, ansRawFiles);
      } else {
        // ── No backend AND no key ──
        // Run the demo pipeline
        runDemoPipeline();
      }
    } else {
      // No real files — demo pipeline
      runDemoPipeline();
    }
  };

  /** Process files using the client-side Gemini API call (requires user's API key) */
  const processClientSide = async (qpRawFiles: File[], ansRawFiles: File[]) => {
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
  };

  /** Run the demo pipeline with sample data (no API key needed) */
  const runDemoPipeline = () => {
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

    runDemoPipeline();
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
        hasApiKey={isAiReady}
        backendConnected={backendStatus.available && backendStatus.hasApiKey}
        onOpenTeacherToolkit={() => setIsTeacherToolkitOpen(true)}
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
        backendConnected={backendStatus.available && backendStatus.hasApiKey}
      />

      {/* Veda AI Tutor Chatbot Drawer */}
      <AIChatDrawer
        assessment={viewMode === 'assessment' ? assessment : null}
        selectedQuestionId={selectedQuestionId}
        isOpen={isChatOpen}
        onOpen={() => setIsChatOpen(true)}
        onClose={() => setIsChatOpen(false)}
      />

      {/* AI Teacher's Toolkit Modal */}
      <TeacherToolkitModal
        isOpen={isTeacherToolkitOpen}
        onClose={() => setIsTeacherToolkitOpen(false)}
      />
    </>
  );
}

export default App;
