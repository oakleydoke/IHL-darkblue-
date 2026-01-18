
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ENV } from './config';

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
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
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
      if (!ENV.GEMINI_API_KEY) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        config: {
          thinkingConfig: { thinkingBudget: 2500 },
          systemInstruction: `
            You are "Scholar AI", technical support for the "I Have Landed" admin.
            We are integrating eSIMAccess V1 (docs.esimaccess.com).
            
            TECHNICAL CHECKS FOR THE USER:
            1. **IP Whitelisting**: The user MUST go to Profile > API Settings in the portal and add their Vercel/Server IP. If they don't know it, they should check the logs for the error "100003".
            2. **Wallet Balance**: Check "My Account" in the portal. Orders fail with "800102" if balance is $0.
            3. **Favorites**: The package MUST be "hearted" (favorited) in the Offer List before the API can buy it.
            4. **Slug vs PackageCode**: In the API request body, the key is "packageCode", but the value should be the "Slug" from the portal (e.g., 'united-states-5gb-30d').
            5. **Signature**: Our code uses SHA256(AppKey + AppSecret + Timestamp). Ensure no spaces.
            
            Tone: Architectural, precise, and sophisticated.
          `
        }
      });

      const text = response.text || "Connection link restricted. Please retry.";
      setMessages(prev => [...prev, { role: 'assistant', text }]);
    } catch (error) {
      console.error("Scholar AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Service link interrupted." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[200] w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-100">
      <div className="bg-slate-900 p-10 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-airalo/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 bg-airalo rounded-2xl flex items-center justify-center shadow-lg shadow-airalo/20 ring-4 ring-airalo/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.527 3.653 1.438 5.155l-1.353 4.057a1 1 0 001.265 1.265l4.057-1.353A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-[0.25em] leading-none">Scholar AI</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-3">Elite Tech Concierge</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 bg-[#f8f9fb] custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
            <div className={`max-w-[85%] p-7 rounded-[2.5rem] text-sm font-medium leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none shadow-xl' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-6 rounded-[1.5rem] rounded-tl-none flex gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 bg-airalo rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-airalo rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-airalo rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-10 border-t border-slate-100 bg-white shrink-0">
        <div className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Technical inquiry..."
            className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-7 py-6 pr-20 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-airalo/10 focus:border-airalo outline-none transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={isTyping}
            className="absolute right-3 top-3 bottom-3 aspect-square bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-airalo transition-all transform active:scale-95 shadow-lg disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScholarAI;
