
import React, { useState } from 'react';
import { GoogleSheetsService } from '../services/googleSheetsService';

const EnterToWin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate entry recording
    const success = await GoogleSheetsService.recordSignup(email, 'GIVEAWAY_ENTRY');
    
    if (success) {
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-airalo/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="bg-white/5 border border-white/10 p-12 md:p-16 rounded-[3rem] backdrop-blur-xl text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Monthly Scholarship Draw
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            Win 10GB Data Packs
          </h2>
          <p className="text-slate-400 font-medium mb-12 text-lg max-w-xl mx-auto">
            We give away <span className="text-white font-bold">10x 10GB vouchers</span> every month to help students stay connected. Enter your university email below.
          </p>

          {status === 'success' ? (
            <div className="bg-white/10 border border-white/20 p-8 rounded-3xl animate-in zoom-in duration-500">
               <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                  </svg>
               </div>
               <h4 className="text-white font-bold mb-1">Entry Confirmed!</h4>
               <p className="text-slate-400 text-sm">Winners are announced on the 1st of every month.</p>
               <button onClick={() => setStatus('idle')} className="mt-6 text-airalo text-[10px] font-black uppercase tracking-widest hover:underline">
                 Enter another email
               </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-sm focus:ring-2 focus:ring-airalo outline-none transition-all placeholder:text-slate-600"
              />
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-airalo hover:text-white transition-all transform active:scale-95 shadow-2xl disabled:opacity-50"
              >
                {status === 'loading' ? 'Syncing...' : 'Enter Draw'}
              </button>
            </form>
          )}
          
          <p className="mt-8 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            Entries are synced to the I Have Landed Global Ledger.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EnterToWin;
