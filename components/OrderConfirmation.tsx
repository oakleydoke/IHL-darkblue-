
import React from 'react';
import { Order } from '../types';

interface OrderConfirmationProps {
  order: Order;
  onBackToHome: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onBackToHome }) => {
  const qrUrl = order.activationCode && order.activationCode !== 'PROVISIONING_PENDING'
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(order.activationCode)}`
    : null;

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
                 <h3 className="text-xl font-black tracking-tight">Installation Guide Sent</h3>
               </div>
               <p className="text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                 We've dispatched your digital credentials to <span className="text-white font-bold">{order.email}</span>. Please scan the QR code to the right to begin installation.
               </p>
               <div className="mt-8 flex items-center justify-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                   Direct Carrier Provisioning Success
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
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Ready for immediate activation</p>
             </div>
             <button 
               onClick={onBackToHome}
               className="bg-slate-900 hover:bg-airalo text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
             >
               Return to Store
             </button>
          </div>
        </div>

        {/* QR Code / Delivery Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden h-full flex flex-col items-center justify-center">
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em] mb-10 text-center">Scan to Install eSIM</h4>
            
            {qrUrl ? (
              <div className="bg-white p-6 rounded-[2.5rem] shadow-inner border border-slate-100 animate-in zoom-in duration-500">
                <img src={qrUrl} alt="eSIM Activation QR Code" className="w-full aspect-square mix-blend-multiply" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 border-[3px] border-slate-100 border-t-airalo rounded-full animate-spin mb-8"></div>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Provisioning Node...</p>
              </div>
            )}

            <div className="mt-12 space-y-6 w-full">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Activation Code (Manual)</p>
                <code className="text-[11px] font-mono font-bold text-slate-600 break-all bg-white px-3 py-2 rounded-lg block">
                  {order.activationCode || 'Provisioning...'}
                </code>
              </div>
              
              <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                 Single Use Activation Code
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
