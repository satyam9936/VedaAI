import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { UploadView } from './components/views/UploadView';
import { ExtractingView } from './components/views/ExtractingView';
import { AssessmentView } from './components/views/AssessmentView';
import { ApiKeyDrawer } from './components/ApiKeyDrawer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AssessmentData, ProcessingStatus } from '@vedaai/types';
import { SAMPLE_BIOLOGY_ASSESSMENT, processAssessmentWithAI, AiEngineError } from '@vedaai/ai-engine';

type ViewMode = 'upload' | 'extracting' | 'assessment';

function MainDashboard() {
  const { isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>('exams');
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  
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

  const handleStartProcessing = async (qpFiles: File[], ansFiles: File[]) => {
    setProcessingError(null);
    setViewMode('extracting');
    setProcessingStatus({
      step: 'uploading',
      progressPercentage: 5,
      message: 'Reading your files...'
    });

    try {
      const result = await processAssessmentWithAI(
        qpFiles,
        ansFiles,
        geminiApiKey,
        (status) => setProcessingStatus(status)
      );

      setAssessment(result);
      setSelectedQuestionId(result.questions[0]?.id ?? null);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setViewMode('assessment');
      setIsSidebarCollapsed(true); // Max workspace canvas viewing as in Screenshot 4

    } catch (err) {
      // Previously this silently fell back to the hardcoded biology sample, which made
      // every failure look like a bad AI result instead of a broken request.
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

  const handleUseDemoPreset = () => {
    setProcessingError(null);
    setViewMode('extracting');
    setProcessingStatus({
      step: 'scanning_handwriting',
      progressPercentage: 65,
      message: 'Loading sample assessment...'
    });

    setTimeout(() => {
      setAssessment(SAMPLE_BIOLOGY_ASSESSMENT);
      setSelectedQuestionId('q2');
      setViewMode('assessment');
      setIsSidebarCollapsed(true);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 1200);
  };

  // Authentication gating removed per user request: app loads directly into workspace

  return (
    <div className="min-h-screen bg-[#ebebeb] text-slate-900 flex p-3 lg:p-4 gap-4 font-sans antialiased overflow-hidden select-none">
      
      {/* Figma Left Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        activeNav={activeNav}
        onSelectNav={(nav) => {
          setActiveNav(nav);
          if (nav === 'exams' && viewMode === 'assessment') {
            // Keep on assessment
          }
        }}
      />

      {/* Main Right Layout Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        {/* Top Header Navigation */}
        <TopHeader
          onBack={() => setViewMode('upload')}
          title="Exams"
          onOpenApiKey={() => setIsApiKeyOpen(true)}
        />

        {/* View Router: Upload | Extracting | Assessment */}
        {viewMode === 'upload' && (
          <UploadView
            onStartProcessing={handleStartProcessing}
            onUseDemoPreset={handleUseDemoPreset}
            hasApiKey={Boolean(geminiApiKey)}
            onOpenApiKey={() => setIsApiKeyOpen(true)}
            error={processingError}
            onDismissError={() => setProcessingError(null)}
          />
        )}

        {viewMode === 'extracting' && (
          <ExtractingView
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

      </div>

      {/* Gemini API Key Drawer */}
      <ApiKeyDrawer
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        currentApiKey={geminiApiKey}
        onSaveApiKey={handleSaveApiKey}
      />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}

export default App;
