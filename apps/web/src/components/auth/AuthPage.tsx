import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Building, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InteractiveLanding } from './InteractiveLanding';

export const AuthPage: React.FC = () => {
  const { login, loginWithGoogle, loginWithGitHub, register, loginAsDemo } = useAuth();
  const [showInteractiveLanding, setShowInteractiveLanding] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  
  const [email, setEmail] = useState('madhur.rastogi@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regInstitution, setRegInstitution] = useState('');

  if (showInteractiveLanding) {
    return <InteractiveLanding onSkipToLogin={() => setShowInteractiveLanding(false)} />;
  }

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      login(email, password);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regName.trim() && regEmail.trim()) {
      register(regName, regEmail, regPassword, regInstitution);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden select-none">
      
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-veda-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Branding Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center text-white font-black text-2xl shadow-xl">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-2xl tracking-tight text-white">VedaAI</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-veda-500/10 text-veda-400 border border-veda-500/20 font-medium">
                  Portal for Teachers
                </span>
              </div>
              <p className="text-xs text-slate-400">AI Assessment Extraction &amp; Answer Mapping Platform</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Automated Question Extraction &amp; Handwriting Region Mapping
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload printed question papers alongside handwritten student answer sheets to instantly extract questions, map out-of-order answers, and view animated bounding box highlights.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="p-2 rounded-lg bg-veda-500/10 text-veda-400 border border-veda-500/20 shrink-0">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-200 block">Sub-part Extraction (11a, 11b)</span>
                <span className="text-slate-400 text-[11px]">Treats printed sub-parts as separate entries while preserving original numbering.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-200 block">Out-of-Order &amp; Multi-Page Mapping</span>
                <span className="text-slate-400 text-[11px]">Handles answers answered out of sequence and multi-page answer spans.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-200 block">AI Grading &amp; Bounding Boxes</span>
                <span className="text-slate-400 text-[11px]">Computes marks, correctness feedback, and exact canvas region coordinates.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Card Column */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-xl relative space-y-5">
            
            {/* Social OAuth Buttons: Google & GitHub */}
            <div className="space-y-3">
              
              {/* Google Button */}
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-md transition flex items-center justify-center gap-3 transform active:scale-95 group"
              >
                {/* Official Google G Logo */}
                <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={loginWithGitHub}
                className="w-full py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 shadow-md transition flex items-center justify-center gap-3 transform active:scale-95 group"
              >
                {/* Official GitHub Octocat Logo SVG */}
                <svg className="h-4.5 w-4.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>Continue with GitHub</span>
              </button>

              {/* Quick Demo Login Banner */}
              <div className="p-2.5 bg-gradient-to-r from-veda-950/60 to-indigo-950/60 border border-veda-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Quick Evaluator Demo</span>
                </div>
                <button
                  type="button"
                  onClick={loginAsDemo}
                  className="px-2.5 py-1 rounded-lg bg-veda-600 hover:bg-veda-500 text-white text-[11px] font-semibold transition"
                >
                  Demo Sign In
                </button>
              </div>

            </div>

            {/* Divider OR */}
            <div className="flex items-center gap-3 my-2">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">OR EMAIL</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  activeTab === 'signin'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  activeTab === 'register'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Sign In Form */}
            {activeTab === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Teacher Email Address
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@school.edu"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-veda-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-veda-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-veda-600 hover:bg-veda-500 text-white text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>Sign In with Email</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Full Teacher Name
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Satyam Rastogi"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-veda-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    School / Institution Name
                  </label>
                  <div className="relative">
                    <Building className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={regInstitution}
                      onChange={(e) => setRegInstitution(e.target.value)}
                      placeholder="Delhi Public School, Bokaro"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-veda-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="teacher@school.edu"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-veda-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-veda-600 hover:bg-veda-500 text-white text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
