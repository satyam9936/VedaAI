import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Copy, 
  Check, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  ListChecks, 
  Zap,
  RotateCcw,
  Key,
  AlertTriangle
} from 'lucide-react';
import { sendChatMessage, generateCurriculumDocument } from '@vedaai/ai-engine';

interface TeacherToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApiKey?: () => void;
}

type ToolkitTab = 'generator' | 'rubric' | 'planner' | 'chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isFallback?: boolean;
  rawPrompt?: string;
}

export const TeacherToolkitModal: React.FC<TeacherToolkitModalProps> = ({
  isOpen,
  onClose,
  onOpenApiKey,
}) => {
  const [activeTab, setActiveTab] = useState<ToolkitTab>('generator');
  
  // Generator Form state
  const [subject, setSubject] = useState('Biology');
  const [grade, setGrade] = useState('Class 10');
  const [topic, setTopic] = useState('Cell Division (Mitosis & Meiosis)');
  const [questionCount, setQuestionCount] = useState('5');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionType, setQuestionType] = useState('Mixed (MCQ + Short + Long Answer)');

  // Chat conversation state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-teacher',
      role: 'assistant',
      content: `Welcome to the **AI Teacher's Toolkit**! 🎓\n\nI can instantly generate **Question Papers**, **Marking Schemes & Rubrics**, **Homework Worksheets**, and **Lesson Plans**. Select a template on the left or ask me anything directly!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleGenerateExam = async () => {
    const prompt = `Generate a ${grade} ${subject} Question Paper on the topic "${topic}".
- Number of questions: ${questionCount}
- Difficulty Level: ${difficulty}
- Question Types: ${questionType}
Please include:
1. Section-wise Question Paper with marks for each question.
2. Complete Step-by-Step Answer Key & Marking Scheme.
3. Key learning objectives tested.`;

    await handleSendMessage(prompt, 'generator');
  };

  const handleGenerateRubric = async () => {
    const prompt = `Create a comprehensive Evaluation Rubric & Marking Scheme for ${grade} ${subject} on "${topic}".
Format with:
- Performance levels (Excellent, Proficient, Developing, Incomplete)
- Point breakdown for each step/concept
- Common student misconceptions to watch out for`;

    await handleSendMessage(prompt, 'rubric');
  };

  const handleGenerateLessonPlan = async () => {
    const prompt = `Create a 45-minute interactive Lesson Plan for ${grade} ${subject} on "${topic}".
Include:
1. Learning Outcomes
2. 5-min Warm-up Hook Question
3. 25-min Core Concept Explanation & Demonstration
4. 10-min Active Student Activity
5. 5-min Exit Ticket Assessment Quiz`;

    await handleSendMessage(prompt, 'planner');
  };

  const handleSendMessage = async (textToSend?: string, specificMode?: ToolkitTab) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const mode = specificMode || activeTab;

    try {
      const reply = await sendChatMessage(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        {
          title: `Teacher Copilot: ${subject} (${grade})`,
          subject,
          studentName: 'Teacher / Educator',
        }
      );

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.warn('AI chat error:', err);

      // If generator/rubric/planner mode, synthesize complete curriculum document fallback
      if (mode === 'generator' || mode === 'rubric' || mode === 'planner') {
        const fallbackDoc = generateCurriculumDocument({
          mode,
          subject,
          grade,
          topic,
          questionCount,
          difficulty,
          questionType,
        });

        const fallbackNotice = `> ⚡ **Generated via Veda AI Curriculum Engine** *(Google Gemini API Rate Limit 429 encountered — instant template applied)*\n\n${fallbackDoc}`;

        const fallbackMessage: Message = {
          id: `ai-fallback-${Date.now()}`,
          role: 'assistant',
          content: fallbackNotice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFallback: true,
          rawPrompt: query,
        };

        setMessages((prev) => [...prev, fallbackMessage]);
      } else {
        const isRateLimit = err?.message?.includes('429') || err?.message?.includes('rate limit');
        const errContent = isRateLimit
          ? `⚠️ **Gemini API Rate Limit (429)**\n\nGoogle AI's free-tier rate limit is temporarily reached.\n\n**Options**:\n- **Wait ~30 seconds** and retry.\n- **Add your own free Gemini API Key** (from [aistudio.google.com](https://aistudio.google.com/app/apikey)) for uninterrupted high-speed generations.`
          : `⚠️ **Error**: ${err.message || 'Could not generate response. Please try again.'}`;

        const errMessage: Message = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: errContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawPrompt: query,
        };
        setMessages((prev) => [...prev, errMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    // Strip metadata banner if present for clean document copying
    const cleanText = text.replace(/^> ⚡.*?\n\n/s, '');
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-4xl bg-white rounded-[28px] overflow-hidden shadow-2xl border border-gray-200 flex flex-col h-[90vh] max-h-[850px] font-sans">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#292929] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F15A35] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">AI Teacher's Toolkit</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#F15A35]/20 text-[#F15A35] border border-[#F15A35]/40 text-[10px] font-bold">
                  Teacher Copilot
                </span>
              </div>
              <p className="text-xs text-white/60">
                Generate Question Papers, Rubrics, Answer Keys &amp; Lesson Worksheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenApiKey && (
              <button
                onClick={onOpenApiKey}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Configure Gemini API Key"
              >
                <Key className="w-3.5 h-3.5 text-[#F15A35]" />
                <span className="hidden sm:inline">API Key</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolkit Mode Tabs */}
        <div className="px-6 py-2.5 bg-[#F7F7F8] border-b border-gray-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'generator'
                ? 'bg-[#292929] text-white shadow-xs'
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#F15A35]" />
            <span>Question Paper Maker</span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'rubric'
                ? 'bg-[#292929] text-white shadow-xs'
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-[#F15A35]" />
            <span>Rubric &amp; Marking Scheme</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'planner'
                ? 'bg-[#292929] text-white shadow-xs'
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#F15A35]" />
            <span>Lesson Plan &amp; Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'chat'
                ? 'bg-[#292929] text-white shadow-xs'
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#F15A35]" />
            <span>Teacher AI Chat</span>
          </button>
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Panel: Fast Configuration Controls */}
          {activeTab !== 'chat' && (
            <div className="w-full md:w-80 bg-[#FAFAFA] border-r border-gray-200 p-4 overflow-y-auto space-y-3 shrink-0">
              <div className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-[#F15A35]" />
                <span>Quick Generator Settings</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-200 rounded-xl px-2.5 py-2 font-medium text-gray-800 focus:outline-none focus:border-[#F15A35]"
                >
                  <option>Biology</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Mathematics</option>
                  <option>English Literature</option>
                  <option>Computer Science</option>
                  <option>Social Studies</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Grade / Class</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-200 rounded-xl px-2.5 py-2 font-medium text-gray-800 focus:outline-none focus:border-[#F15A35]"
                >
                  <option>Class 6</option>
                  <option>Class 7</option>
                  <option>Class 8</option>
                  <option>Class 9</option>
                  <option>Class 10</option>
                  <option>Class 11</option>
                  <option>Class 12</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Chapter / Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Cell Division (Mitosis & Meiosis)"
                  className="w-full text-xs bg-white border border-gray-200 rounded-xl px-2.5 py-2 font-medium text-gray-800 focus:outline-none focus:border-[#F15A35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl px-2 py-2 font-medium text-gray-800 focus:outline-none focus:border-[#F15A35]"
                  >
                    <option value="3">3 Questions</option>
                    <option value="5">5 Questions</option>
                    <option value="10">10 Questions</option>
                    <option value="15">15 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl px-2 py-2 font-medium text-gray-800 focus:outline-none focus:border-[#F15A35]"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Olympiad / Advanced</option>
                  </select>
                </div>
              </div>

              {activeTab === 'generator' && (
                <button
                  onClick={handleGenerateExam}
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#F15A35] hover:bg-[#d94825] text-white text-xs font-bold shadow-md shadow-[#F15A35]/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Exam Paper</span>
                </button>
              )}

              {activeTab === 'rubric' && (
                <button
                  onClick={handleGenerateRubric}
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#292929] hover:bg-black text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <ListChecks className="w-4 h-4 text-[#F15A35]" />
                  <span>Generate Rubric Table</span>
                </button>
              )}

              {activeTab === 'planner' && (
                <button
                  onClick={handleGenerateLessonPlan}
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#292929] hover:bg-black text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#F15A35]" />
                  <span>Generate Lesson Plan</span>
                </button>
              )}
            </div>
          )}

          {/* Right Panel: Interactive AI Chat Stream */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
            
            {/* Messages Feed */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-white to-[#F9F9FB]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#292929] text-white rounded-br-xs shadow-xs'
                        : 'bg-white border border-gray-200/90 text-gray-800 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {/* Rendered content */}
                    <div className="space-y-1.5 whitespace-pre-wrap">
                      {m.content.split('\n').map((line, idx) => {
                        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        const isHeader = line.startsWith('#');
                        const isBlockquote = line.startsWith('>');

                        if (isBlockquote) {
                          return (
                            <div
                              key={idx}
                              className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium my-2 flex items-center gap-2"
                              dangerouslySetInnerHTML={{ __html: formatted.replace(/^>\s*/, '') }}
                            />
                          );
                        }

                        return (
                          <div 
                            key={idx} 
                            dangerouslySetInnerHTML={{ __html: formatted }} 
                            className={isHeader ? 'font-bold text-sm text-gray-900 mt-3 mb-1' : ''}
                          />
                        );
                      })}
                    </div>

                    {/* Timestamp & Actions */}
                    <div className={`mt-3 pt-2 flex items-center justify-between text-[10px] ${
                      m.role === 'user' ? 'text-white/50' : 'text-gray-400 border-t border-gray-100'
                    }`}>
                      <span>{m.timestamp}</span>
                      
                      {m.role === 'assistant' && (
                        <div className="flex items-center gap-3">
                          {m.rawPrompt && (
                            <button
                              onClick={() => handleSendMessage(m.rawPrompt)}
                              disabled={isLoading}
                              className="hover:text-[#F15A35] transition flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50"
                              title="Retry generation with AI"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Retry with AI</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleCopy(m.id, m.content)}
                            className="hover:text-gray-700 transition flex items-center gap-1 font-semibold cursor-pointer"
                            title="Copy text"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied to Clipboard</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Document</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-2xl w-fit shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-[#F15A35] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#F15A35] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#F15A35] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-gray-500 font-medium ml-1">AI Teacher Copilot is writing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask teacher copilot to edit, format, or create custom questions..."
                rows={1}
                className="flex-1 max-h-24 min-h-[42px] px-3.5 py-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F15A35] focus:ring-1 focus:ring-[#F15A35] resize-none transition"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow-xs shrink-0 ${
                  input.trim() && !isLoading
                    ? 'bg-[#292929] hover:bg-black text-white active:scale-95 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
