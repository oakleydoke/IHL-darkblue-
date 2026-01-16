
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface ScholarAIProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
}

const ScholarAI: React.FC<ScholarAIProps> = ({ isOpen, onClose, userEmail }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: 'Arrive connected. I am your personal Scholar Connectivity Assistant. How can I facilitate your arrival today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: `
            You are "Scholar AI", the dedicated support agent for "I Have Landed".
            Context: The user ${userEmail ? `is logged in as ${userEmail}` : 'is exploring premium plans'}.
            Tone: High-end concierge. Professional, minimalist, and elite. 
            Goal: Help students with eSIM installation (iOS/Android), roaming setup, and usage tracking.
            Network Partners: Verizon (USA), Vodafone (UK/EU), Orange (France/Spain).
            Constraint: Be extremely concise. Maximum 2 sentences. Use elegant language.
          `
        }
      });

      const text = response.text || "I apologize, our global node is momentarily unresponsive. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Service temporarily restricted. Please contact our support desk directly." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[200] w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-100">
      <div className="bg-slate-900 p-10 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-airalo rounded-2xl flex items-center justify-center shadow-lg shadow-airalo/20 ring-4 ring-airalo/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.527 3.653 1.438 5.155l-1.353 4.057a1 1 0 001.265 1.265l4.057-1.353A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-[0.2em] leading-none">Scholar AI</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Concierge • Connectivity</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-6 rounded-3xl text-sm font-medium leading-relaxed ${
              m.role === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none shadow-xl' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-6 rounded-3xl rounded-tl-none flex gap-2">
              <span className="w-1.5 h-1.5 bg-airalo rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-airalo rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-airalo rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-8 border-t border-slate-100 bg-white shrink-0">
        <div className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your inquiry..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 pr-16 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-airalo/10 focus:border-airalo outline-none transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit"
            className="absolute right-3 top-3 bottom-3 aspect-square bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-airalo transition-all transform active:scale-95 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
          </button>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
           <div className="h-px bg-slate-300 w-8"></div>
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">I Have Landed Intelligence</span>
           <div className="h-px bg-slate-300 w-8"></div>
        </div>
      </form>
    </div>
  );
};

export default ScholarAI;
