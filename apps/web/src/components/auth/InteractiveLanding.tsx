import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Globe, 
  Zap, 
  ShieldCheck, 
  Search, 
  Play, 
  ChevronRight,
  ExternalLink,
  Layers,
  Award,
  BookOpen,
  MapPin,
  Building2,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type ExperienceStage = 'loading' | 'draw_v' | 'story_believe' | 'tap_hold' | 'intro_vedaai' | 'city_campus';

export const InteractiveLanding: React.FC<{ onSkipToLogin?: () => void }> = ({ onSkipToLogin }) => {
  const { loginAsDemo } = useAuth();
  
  const [stage, setStage] = useState<ExperienceStage>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [xp, setXp] = useState(0);
  const [showXpGain, setShowXpGain] = useState<number | null>(null);
  
  // Gesture Canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [gestureRecognized, setGestureRecognized] = useState(false);

  // Tap & Hold state
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // City Campus state
  const [selectedHub, setSelectedHub] = useState<string | null>('google');
  const [emailInput, setEmailInput] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Stage 0: Loading progress simulation
  useEffect(() => {
    if (stage === 'loading') {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage('draw_v'), 400);
            return 100;
          }
          return prev + 5;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const addXp = (amount: number) => {
    setXp((prev) => prev + amount);
    setShowXpGain(amount);
    setTimeout(() => setShowXpGain(null), 1500);
  };

  // Canvas drawing & V gesture recognition logic
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDrawnPoints([{ x: clientX - rect.left, y: clientY - rect.top }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const newPt = { x: clientX - rect.left, y: clientY - rect.top };

    setDrawnPoints((prev) => [...prev, newPt]);

    // Draw glowing green particle line
    const ctx = canvas.getContext('2d');
    if (ctx && drawnPoints.length > 0) {
      const lastPt = drawnPoints[drawnPoints.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPt.x, lastPt.y);
      ctx.lineTo(newPt.x, newPt.y);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 20;
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (drawnPoints.length > 10 && !gestureRecognized) {
      // Check for V gesture (downward trend then upward trend)
      const minY = Math.min(...drawnPoints.map((p) => p.y));
      const maxY = Math.max(...drawnPoints.map((p) => p.y));

      if (maxY - minY > 50) {
        setGestureRecognized(true);
        addXp(100);
        setTimeout(() => {
          setStage('story_believe');
        }, 1200);
      }
    }
  };

  // Tap & Hold transition handler
  const startHold = () => {
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
          addXp(200);
          setTimeout(() => setStage('intro_vedaai'), 300);
          return 100;
        }
        return prev + 4;
      });
    }, 40);
  };

  const endHold = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white font-sans overflow-hidden select-none z-50 flex flex-col justify-between">
      
      {/* Top Header Bar */}
      <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-40">
        
        {/* Brand pill */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">vedaai.app</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                BETA 2.0
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">Human AI Infrastructure</span>
          </div>
        </div>

        {/* Top XP Badge & Actions */}
        <div className="flex items-center gap-4">
          
          {/* XP Pill */}
          <div className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs shadow-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>+{xp} XP</span>

            {showXpGain && (
              <span className="absolute -bottom-6 right-2 text-xs font-black text-amber-400 animate-bounce">
                +{showXpGain} XP!
              </span>
            )}
          </div>

          <button
            onClick={loginAsDemo}
            className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition transform active:scale-95 flex items-center gap-1.5"
          >
            <span>Enter Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </header>

      {/* Main Interactive Stage Canvas Body */}
      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        
        {/* STAGE 0: LOADING SCREEN ("VedaAI") */}
        {stage === 'loading' && (
          <div className="flex flex-col items-center space-y-6 animate-fade-in text-center p-6">
            <div className="relative flex items-center justify-center">
              <div className="h-28 w-28 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
              <div className="absolute font-black text-3xl text-white tracking-tighter">
                Veda<span className="text-emerald-400">AI</span>
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                Initializing Assessment Neural Engine
              </h2>
              <span className="font-mono text-xs text-emerald-400 font-bold">{loadingProgress}%</span>
            </div>
          </div>
        )}

        {/* STAGE 1: GESTURE CANVAS ("DRAW A V") */}
        {stage === 'draw_v' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
            
            {/* Background water ripple glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-slate-950 to-slate-950 pointer-events-none" />

            <div className="z-10 text-center space-y-3 pointer-events-none mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Compass className="h-3.5 w-3.5" />
                <span>Interactive Gesture Required</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight">
                DRAW A <span className="text-emerald-400 underline decoration-emerald-500 decoration-wavy">V</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium max-w-sm">
                Trace a big "V" (for VedaAI) anywhere on the canvas below to unlock the workspace
              </p>
            </div>

            {/* Glowing Hand Pointer */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-pulse text-5xl opacity-80">
              ✍️
            </div>

            {/* Interactive Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={window.innerWidth}
              height={window.innerHeight * 0.75}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              className="absolute inset-0 cursor-crosshair z-30"
            />

            {gestureRecognized && (
              <div className="absolute z-40 bg-emerald-500 text-slate-950 px-6 py-2 rounded-full font-black text-sm shadow-2xl animate-bounce">
                ✨ V GESTURE DETECTED! +100 XP
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: NARRATIVE ("YOU BELIEVED...") */}
        {stage === 'story_believe' && (
          <div className="max-w-3xl w-full p-8 text-center space-y-8 animate-fade-in z-20">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                Chapter 01 // The Disconnect
              </span>
              <h2 className="text-4xl lg:text-6xl font-serif italic text-white leading-tight">
                "You Believed... Exams &amp; Marks Would Land You a <span className="text-emerald-400 not-italic font-sans font-black">GREAT CAREER</span>"
              </h2>
            </div>

            <div className="p-6 bg-rose-950/30 border border-rose-500/30 rounded-3xl backdrop-blur-md space-y-3">
              <div className="text-rose-400 font-black text-xl tracking-wider uppercase">
                That's Bullsh*t.
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl mx-auto">
                70% of graduates aren't working in their field. Traditional universities sell paper degrees, but modern tech companies need real verified skills.
              </p>
            </div>

            <button
              onClick={() => setStage('tap_hold')}
              className="px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl transition transform active:scale-95 inline-flex items-center gap-2"
            >
              <span>Continue the Story</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STAGE 3: TAP & HOLD BEAM */}
        {stage === 'tap_hold' && (
          <div className="flex flex-col items-center justify-center p-8 space-y-8 text-center z-20 animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                Energy Core Synapse
              </span>
              <h2 className="text-3xl font-black text-white">TAP &amp; HOLD TO UNLOCK</h2>
              <p className="text-xs text-slate-400">Hold down the reactor to build energy beam warp</p>
            </div>

            {/* Tap Hold Reactor Button */}
            <div
              onMouseDown={startHold}
              onMouseUp={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              className="relative h-40 w-40 rounded-full border-4 border-emerald-500/40 bg-slate-900 flex items-center justify-center cursor-pointer shadow-2xl transition transform active:scale-95 hover:border-emerald-400"
            >
              {/* Progress Ring */}
              <div
                className="absolute inset-0 rounded-full border-4 border-emerald-400 transition-all duration-75"
                style={{
                  clipPath: `inset(0 ${100 - holdProgress}% 0 0)`
                }}
              />
              
              <div className="flex flex-col items-center text-emerald-400 space-y-1">
                <Zap className="h-10 w-10 animate-pulse" />
                <span className="text-xs font-black tracking-wider uppercase">HOLD</span>
                <span className="text-[10px] font-mono font-bold">{holdProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: INTRODUCING VEDAAI */}
        {stage === 'intro_vedaai' && (
          <div className="max-w-3xl w-full p-8 text-center space-y-8 animate-fade-in z-20">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                Introducing VedaAI
              </span>
              <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight">
                Where Work Gets <span className="text-emerald-400">REAL</span>
              </h1>
              <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Real assessments from real teachers. Powered by AI Vision &amp; Automatic Handwriting Extraction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-white">Sub-part Extraction</h3>
                <p className="text-[11px] text-slate-400">Splits 11(a) and 11(b) automatically.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-white">Out-of-Order Mapping</h3>
                <p className="text-[11px] text-slate-400">Maps Q3 answered before Q1 effortlessly.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-white">Bounding Box Canvas</h3>
                <p className="text-[11px] text-slate-400">Precision dynamic coordinate scaling.</p>
              </div>
            </div>

            <button
              onClick={() => {
                addXp(300);
                setStage('city_campus');
              }}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm shadow-xl transition transform active:scale-95 flex items-center gap-2 mx-auto"
            >
              <span>Explore 3D City Campus</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STAGE 5: ISOMETRIC 3D CITY CAMPUS SHOWCASE */}
        {stage === 'city_campus' && (
          <div className="w-full h-full flex flex-col justify-between p-6 relative overflow-hidden animate-fade-in">
            
            {/* Background 3D Isometric City Grid Graphics */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
            
            {/* Interactive City Hub Cards */}
            <div className="z-20 max-w-sm w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span>Tech &amp; Institution Hubs</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  LIVE
                </span>
              </div>

              {/* Hub Selection Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedHub('google')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    selectedHub === 'google'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🔍</span>
                    <div>
                      <span className="text-xs font-bold block text-white">Google Hub</span>
                      <span className="text-[10px] text-slate-400">Gmail AI Rewrite Assessment</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setSelectedHub('dps')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    selectedHub === 'dps'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🏫</span>
                    <div>
                      <span className="text-xs font-bold block text-white">DPS Bokaro Hub</span>
                      <span className="text-[10px] text-slate-400">Biology Annual Exam 2026</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setSelectedHub('spotify')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    selectedHub === 'spotify'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🎵</span>
                    <div>
                      <span className="text-xs font-bold block text-white">Spotify Hub</span>
                      <span className="text-[10px] text-slate-400">Free-to-Premium Analytics</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              {/* Action Button to Enter Workspace */}
              <button
                onClick={loginAsDemo}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-xl transition flex items-center justify-center gap-2"
              >
                <span>Enter Assessment Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Bottom Waitlist Form (Matching video) */}
            <div className="z-20 max-w-md w-full mx-auto bg-slate-900/90 border border-slate-800 rounded-full p-2 flex items-center justify-between gap-2 shadow-2xl backdrop-blur-xl">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your teacher email..."
                className="flex-1 bg-transparent px-4 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (emailInput) {
                    setWaitlistSuccess(true);
                    addXp(100);
                  }
                }}
                className="px-5 py-2 rounded-full bg-white text-slate-950 font-black text-xs hover:bg-slate-200 transition"
              >
                {waitlistSuccess ? 'Joined! 🎉' : 'Join Beta'}
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Footer Navigation */}
      <footer className="h-14 px-6 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between text-xs text-slate-400 z-40">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-300">VedaAI 2.0</span>
          <span>•</span>
          <span>AI Vision Assessment Engine</span>
        </div>

        <button
          onClick={loginAsDemo}
          className="hover:text-emerald-400 font-bold transition flex items-center gap-1"
        >
          <span>Skip to Login</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </footer>

    </div>
  );
};
