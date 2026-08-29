import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Check, 
  Trash2, 
  Sparkles,
  AlertCircle,
  Maximize2
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleSuffix: 'Question Paper' | 'Answer Sheet';
  onAttachFiles: (files: File[]) => void;
}

interface CapturedPage {
  id: string;
  dataUrl: string;
  blob: Blob;
  pageNumber: number;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  titleSuffix,
  onAttachFiles,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPages, setCapturedPages] = useState<CapturedPage[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [flashEffect, setFlashEffect] = useState<boolean>(false);

  // Start camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPages([]);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please enable camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Unable to access camera. Please check your camera permissions.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Trigger flash animation
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const newPage: CapturedPage = {
          id: `page-${Date.now()}-${Math.random()}`,
          dataUrl,
          blob,
          pageNumber: capturedPages.length + 1,
        };

        setCapturedPages((prev) => [...prev, newPage]);
      },
      'image/jpeg',
      0.92
    );
  };

  const handleDeletePage = (id: string) => {
    setCapturedPages((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, index) => ({ ...p, pageNumber: index + 1 }));
    });
  };

  const handleDone = () => {
    if (capturedPages.length === 0) return;

    const files: File[] = capturedPages.map((page, i) => {
      const prefix = titleSuffix.replace(/\s+/g, '_');
      const filename = `${prefix}_Page_${i + 1}.jpg`;
      return new File([page.blob], filename, { type: 'image/jpeg' });
    });

    onAttachFiles(files);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-[#1E1E1E] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F15A35]/20 flex items-center justify-center text-[#F15A35]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight font-sans">
                Capture {titleSuffix}
              </h2>
              <p className="text-[11px] sm:text-xs text-white/50 font-sans">
                Align paper within the frame and capture each page
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Viewport Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[380px] overflow-hidden">
          
          {/* Flash Effect */}
          {flashEffect && (
            <div className="absolute inset-0 bg-white z-30 animate-flash pointer-events-none" />
          )}

          {cameraError ? (
            <div className="p-6 text-center max-w-md space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white/90">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-white transition inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />

              {/* Document Alignment Frame Guidelines */}
              <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-[#F15A35]" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-[#F15A35]" />
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-medium text-white/70 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                    Hold paper steady &amp; flat
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-[#F15A35]" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-[#F15A35]" />
                </div>
              </div>

              {/* Switch Camera Button */}
              <button
                onClick={toggleFacingMode}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white/90 flex items-center justify-center backdrop-blur-sm border border-white/20 transition active:scale-95"
                title="Switch Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Captured Pages Strip */}
        {capturedPages.length > 0 && (
          <div className="px-5 py-2.5 bg-[#171717] border-t border-white/10 flex items-center gap-3 overflow-x-auto shrink-0">
            <span className="text-[11px] font-semibold text-white/50 shrink-0">
              {capturedPages.length} Page{capturedPages.length > 1 ? 's' : ''}:
            </span>
            <div className="flex items-center gap-2.5">
              {capturedPages.map((page) => (
                <div
                  key={page.id}
                  className="relative group w-14 h-16 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0"
                >
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 left-1 text-[9px] font-bold text-white bg-black/70 px-1 rounded">
                    P{page.pageNumber}
                  </span>
                  <button
                    onClick={() => handleDeletePage(page.id)}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    title="Delete page"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="px-5 py-4 bg-[#1E1E1E] border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-xs text-white/60">
            {capturedPages.length > 0 ? (
              <span className="text-[#F15A35] font-semibold">
                {capturedPages.length} {capturedPages.length === 1 ? 'photo' : 'photos'} ready
              </span>
            ) : (
              <span>Tap shutter to take photo</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Shutter Capture Button */}
            {!cameraError && (
              <button
                onClick={handleCapture}
                className="w-14 h-14 rounded-full bg-white hover:bg-white/90 flex items-center justify-center p-1 shadow-lg shadow-white/10 active:scale-95 transition"
                title="Take Photo"
              >
                <div className="w-full h-full rounded-full border-2 border-black flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#F15A35]" />
                </div>
              </button>
            )}

            {/* Attach Photos to Upload Button */}
            {capturedPages.length > 0 && (
              <button
                onClick={handleDone}
                className="px-4 py-2.5 rounded-full bg-[#F15A35] hover:bg-[#d94825] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#F15A35]/30 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Attach {capturedPages.length} {capturedPages.length === 1 ? 'Photo' : 'Photos'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
