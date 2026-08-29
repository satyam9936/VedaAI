import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  HelpCircle,
  BookOpen,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { AssessmentData } from '@vedaai/types';
import { 
  ChatMessage, 
  buildAssessmentChatContext, 
  sendChatMessage 
} from '@vedaai/ai-engine';

interface AIChatDrawerProps {
  assessment?: AssessmentData | null;
  selectedQuestionId?: string | null;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  assessment,
  selectedQuestionId,
  isOpen,
  onOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm **Veda AI Tutor** 👋\n\nI have access to the complete student exam submission, questions, and grading feedback. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const selectedQuestion = assessment?.questions.find(q => q.id === selectedQuestionId);
  const selectedMapping = selectedQuestionId && assessment?.answerMappings ? assessment.answerMappings[selectedQuestionId] : null;

  // Dynamic suggested prompts based on current context
  const getSuggestions = () => {
    if (selectedQuestion) {
      const qNum = selectedQuestion.subPart ? `${selectedQuestion.number}${selectedQuestion.subPart}` : selectedQuestion.number;
      return [
        `Why were marks deducted for Question ${qNum}?`,
        `Generate a full model answer for Question ${qNum}`,
        `What key concepts did the student miss in Question ${qNum}?`,
        `How can the student improve in ${assessment?.subject || 'this subject'}?`,
      ];
    }

    if (assessment) {
      return [
        `Summarize the student's top 3 weak areas`,
        `How can ${assessment.studentName || 'the student'} improve their score?`,
        `Generate model answers for all incorrect questions`,
        `Explain the overall assessment grading breakdown`,
      ];
    }

    return [
      `How does VedaAI extract and grade handwritten answer sheets?`,
      `What criteria does the AI vision model use for scoring?`,
      `How are out-of-order answers matched to question papers?`,
    ];
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const context = buildAssessmentChatContext(assessment, selectedQuestionId);
      
      const reply = await sendChatMessage(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        context
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error**: ${err.message || 'Could not get response from AI. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Chat history cleared. How can I help you evaluate this assessment?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 px-4 py-3.5 rounded-full bg-[#292929] hover:bg-black text-white shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform hover:scale-105 active:scale-95 group font-sans border border-white/10"
          title="Open Veda AI Tutor"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#FBE8DF] text-[#F15A35] flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#292929] animate-pulse" />
          </div>

          <div className="text-left">
            <span className="text-xs font-bold block leading-tight">AI Tutor</span>
            <span className="text-[10px] text-white/60 block leading-none">Ask questions</span>
          </div>

          <Sparkles className="w-3.5 h-3.5 text-[#F15A35] group-hover:rotate-12 transition-transform ml-0.5" />
        </button>
      )}

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in select-none">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-gray-200 animate-slide-in font-sans"
          >
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-[#FBE8DF] text-[#F15A35] flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#292929]">Veda AI Tutor</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {selectedQuestion 
                      ? `Focused on Question ${selectedQuestion.subPart ? `${selectedQuestion.number}${selectedQuestion.subPart}` : selectedQuestion.number}` 
                      : assessment 
                        ? `Exam: ${assessment.subject || assessment.title}` 
                        : 'Ask anything about exam evaluation'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 2 && (
                  <button
                    onClick={handleClear}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition"
                    title="Clear chat history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-[#292929] rounded-lg hover:bg-gray-50 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Context Capsule Bar */}
            {assessment && (
              <div className="px-5 py-2 bg-[#F9F9FB] border-b border-gray-100 flex items-center justify-between text-xs text-gray-600 shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <BookOpen className="w-3.5 h-3.5 text-[#F15A35]" />
                  <span className="font-semibold text-gray-800 truncate">{assessment.studentName || 'Student'}</span>
                  <span>•</span>
                  <span>Score: <strong className="text-[#292929]">{assessment.totalObtainedMarks}/{assessment.totalMaxMarks}</strong> ({assessment.percentage}%)</span>
                </div>
                {selectedQuestion && (
                  <span className="px-2 py-0.5 rounded-md bg-[#FBE8DF] text-[#F15A35] font-bold text-[10px] shrink-0">
                    Q{selectedQuestion.subPart ? `${selectedQuestion.number}${selectedQuestion.subPart}` : selectedQuestion.number} ({selectedMapping?.marksAwarded ?? 0}/{selectedQuestion.maxMarks}m)
                  </span>
                )}
              </div>
            )}

            {/* Chat Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-white to-[#F9F9FB]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#292929] text-white rounded-br-xs shadow-xs'
                        : 'bg-white border border-gray-200/90 text-gray-800 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {/* Render content with basic markdown support (bold, bullet points, code blocks) */}
                    <div className="space-y-1.5 whitespace-pre-wrap">
                      {m.content.split('\n').map((line, idx) => {
                        // Bold parsing
                        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return (
                          <div 
                            key={idx} 
                            dangerouslySetInnerHTML={{ __html: formatted }} 
                            className={line.startsWith('- ') || line.startsWith('• ') ? 'pl-2 text-gray-700' : ''}
                          />
                        );
                      })}
                    </div>

                    {/* Timestamp & Copy action */}
                    <div className={`mt-1.5 pt-1 flex items-center justify-between text-[10px] ${
                      m.role === 'user' ? 'text-white/50' : 'text-gray-400 border-t border-gray-100'
                    }`}>
                      <span>{m.timestamp}</span>
                      {m.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="hover:text-gray-600 transition flex items-center gap-1"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-2xl w-fit shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-[#F15A35] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#F15A35] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#F15A35] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-gray-400 ml-1">AI Tutor is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            <div className="px-4 py-2 bg-[#F9F9FB] border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-gray-500">
                <Sparkles className="w-3 h-3 text-[#F15A35]" />
                <span>Suggested Questions:</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {getSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    disabled={isLoading}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-[#FBE8DF] hover:text-[#F15A35] text-gray-700 text-[11px] font-medium transition border border-gray-200 shadow-2xs whitespace-nowrap active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedQuestion ? `Ask about Question ${selectedQuestion.subPart ? `${selectedQuestion.number}${selectedQuestion.subPart}` : selectedQuestion.number}...` : 'Type your question (Shift+Enter for newline)...'}
                rows={1}
                className="flex-1 max-h-24 min-h-[40px] px-3.5 py-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F15A35] focus:ring-1 focus:ring-[#F15A35] resize-none transition"
              />
              <button
                onClick={() => handleSend()}
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
      )}
    </>
  );
};
