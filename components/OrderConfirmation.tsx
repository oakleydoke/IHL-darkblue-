
import React, { useState } from 'react';
import { Order } from '../types';
import { AuthService } from '../services/authService';

interface OrderConfirmationProps {
  order: Order;
  onBackToHome: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onBackToHome }) => {
  const [password, setPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      AuthService.register(order.email, password, order.id);
      setIsSaving(false);
      setIsSaved(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 md:py-24 animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto px-4 grid lg:grid-cols-5 gap-12">
        {/* Main Confirmation Panel */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-airalo/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="w-24 h-24 bg-airalo rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-airalo/30 animate-in zoom-in duration-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Payment Success</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">Order Reference: {order.id.slice(-8).toUpperCase()}</p>
            
            <div className="mt-12 pt-12 border-t border-white/5">
               <div className="flex items-center justify-center gap-4 mb-6">
                 <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-400">
                      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1 1 0 0 0 .894 0L19 7.161V6a2 2 0 0 0-2-2H3Z" />
                      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                    </svg>
                 </div>
                 <h3 className="text-xl font-black tracking-tight">Check Your Email</h3>
               </div>
               <p className="text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                 Your digital eSIM activation guide and QR code have been dispatched to <span className="text-white font-bold">{order.email}</span>.
               </p>
               <div className="mt-8 flex items-center justify-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                   Direct Carrier Fulfillment Active
                 </p>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl">
               {order.items?.[0]?.country?.flag || '🌍'}
             </div>
             <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{order.items?.[0]?.plan?.name || 'Academic Access'}</h4>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">High-Speed 5G Telemetry Provisioned</p>
             </div>
             <button 
               onClick={onBackToHome}
               className="bg-slate-900 hover:bg-airalo text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-3"
             >
               Go to Dashboard
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                 <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
               </svg>
             </button>
          </div>
        </div>

        {/* Persistence / Security Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 relative overflow-hidden h-full flex flex-col">
            {isSaved ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 border border-emerald-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-10 h-10">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em] mb-4">Node Secured</h4>
                <p className="text-slate-500 font-medium leading-relaxed mb-10 text-sm">
                  Your biometric bridge is encrypted. Access usage telemetry on any global device.
                </p>
                <button onClick={onBackToHome} className="text-airalo font-black text-[10px] uppercase tracking-widest hover:underline">Launch Console</button>
              </div>
            ) : (
              <>
                <div className="mb-10">
                   <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em] mb-4">Account Storage</h4>
                   <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                     Your connectivity node is currently linked to this browser. Create a password to enable remote telemetry tracking.
                   </p>
                </div>

                <form onSubmit={handleSavePassword} className="space-y-6 flex-1">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Access Password</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-airalo/10 outline-none transition-all"
                    />
                  </div>
                  <button 
                    disabled={isSaving}
                    className="w-full bg-airalo text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-airalo/20 flex items-center justify-center"
                  >
                    {isSaving ? 'Encrypting...' : 'Secure Account'}
                  </button>
                </form>

                <div className="mt-12 pt-10 border-t border-slate-50">
                   <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      AES-256 Node Encryption Active
                   </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
