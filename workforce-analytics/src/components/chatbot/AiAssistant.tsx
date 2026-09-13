import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  Zap,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendChatbotMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose }) => {
  const { role, user } = useAuth();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const employeeQuestions = [
    'How many casual and sick leave days do I have left?',
    'What is my shift schedule for this week?',
    'How do I submit a peer shift swap request?',
    'What are the attendance bonus and overtime rules?',
  ];

  const hrQuestions = [
    'Show top 3 performers in Engineering',
    'What is the average tenure across all departments?',
    'Identify employees with high attrition risk score',
    'Summarize department salary distribution and equity',
  ];

  const suggestedQuestions = role === 'Employee' ? employeeQuestions : hrQuestions;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello ${user?.name || ''}! I am **AURA AI** (powered by Gemini 3.6 Flash), your Autonomous Workforce Analytics & ESS Assistant. Ask me anything about headcount, salary benchmarks, shift allocations, leaves, or flight risks!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender,
        text: m.text,
      }));
      const replyText = await sendChatbotMessage(textToSend, historyPayload);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: typeof replyText === 'string' ? replyText : (replyText as any)?.reply || 'I have analyzed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "I'm having trouble analyzing the workforce intelligence dataset right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[460px] h-[620px] max-h-[85vh] vibe-glass border border-violet-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="bg-slate-900/90 p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-violet-500/30 flex items-center justify-center text-white">
                <Bot className="w-5 h-5 text-cyan-200 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>AURA AI Intelligence</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                    GEMINI 3.6
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                  Live Enterprise DB Connected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="btn-clear-chat"
                onClick={() =>
                  setMessages([
                    {
                      id: 'reset-1',
                      sender: 'assistant',
                      text: 'Conversation buffer cleared. How can I assist you with talent intelligence now?',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                id="btn-close-assistant"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-950/60 vibe-grid-bg">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                        : 'bg-slate-900 border border-violet-500/40 text-cyan-400 shadow-md'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-cyan-300" />}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-violet-500/20'
                        : 'bg-slate-900/90 border border-white/10 text-slate-200 rounded-tl-none shadow-xl'
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`text-[9px] mt-2 font-mono text-right ${
                        isUser ? 'text-violet-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3 text-cyan-300 text-xs italic p-3 bg-slate-900/90 rounded-2xl w-fit border border-cyan-500/30 shadow-lg">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>AURA AI is reasoning across 2,000 employee records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length <= 2 && (
            <div className="p-3 bg-slate-900/90 border-t border-white/10 space-y-1.5">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Suggested Prompts
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[11px] text-left px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-violet-500/60 text-slate-300 hover:text-white shadow-xs transition-all truncate max-w-full cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-slate-900/95 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask AURA about salary, retention, flight risks..."
              className="flex-1 bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all font-mono"
            />
            <button
              id="btn-send-chat"
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white disabled:opacity-40 transition-all shrink-0 shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
