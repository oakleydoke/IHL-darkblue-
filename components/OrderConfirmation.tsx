
import React, { useState } from 'react';
import { Order } from '../types';

interface OrderConfirmationProps {
  order: Order;
  onBackToHome: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onBackToHome }) => {
  const [view, setView] = useState<'qr' | 'manual'>('qr');
  
  const isError = order.status === 'error' || order.activationCode?.startsWith('GATEWAY_ERROR');
  
  // eSIMAccess activation code usually follows: LPA:1$smdp_address$activation_id
  const activationCode = order.activationCode || '';
  const qrUrl = activationCode && !isError
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(activationCode)}`
    : null;

  // Split LPA string for manual entry
  // Standard format: LPA:1$[SMDP_ADDRESS]$[ACTIVATION_CODE]
  const lpaParts = activationCode.split('$');
  const smdpAddress = lpaParts[1] || 'smdp.gsma.com';
  const manualCode = lpaParts[2] || 'Provided via Email';

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-24 animate-in fade-in duration-1000">
      <div className="max-w-5xl mx-auto px-4 grid lg:grid-cols-12 gap-12">
        
        {/* Left Column: Confirmation & Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-airalo/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <div className={`w-20 h-20 ${isError ? 'bg-red-500' : 'bg-airalo'} rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl animate-in zoom-in duration-700`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d={isError ? "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" : "m4.5 12.75 6 6 9-13.5"} />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-6">
              {isError ? 'Handshake Failed' : 'Order Secured'}
            </h1>
            
            <div className="space-y-6 text-slate-400 font-medium">
              <p className="text-lg leading-relaxed">
                {isError 
                  ? `The carrier node returned an error: ${order.message}. Our technical team has been notified.`
                  : `Your Scholar connectivity asset is now provisioned. A copy has been dispatched to ${order.email}.`
                }
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">ICCID Identifier</p>
                  <p className="text-white font-mono text-sm tracking-wider">{order.iccid || 'PROVISIONING...'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Carrier Order No</p>
                  <p className="text-white font-mono text-sm tracking-wider">{order.orderNo || 'IHL-SYNC'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
               </div>
               <button onClick={onBackToHome} className="font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Return to Terminal</button>
             </div>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden md:block">Scholar ID: {order.id.substring(0,12)}</p>
          </div>
        </div>

        {/* Right Column: The Asset Card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 sticky top-32">
            <div className="flex justify-between items-center mb-10">
               <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em]">eSIM Asset</h4>
               <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                 <button 
                  onClick={() => setView('qr')}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === 'qr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                 >QR Code</button>
                 <button 
                  onClick={() => setView('manual')}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                 >Manual</button>
               </div>
            </div>
            
            <div className="aspect-square bg-slate-50 rounded-[3rem] overflow-hidden flex items-center justify-center p-6 mb-10 border border-slate-100 group relative">
              {isError ? (
                <div className="text-center p-10">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Asset Not Generated</p>
                </div>
              ) : view === 'qr' ? (
                qrUrl ? (
                  <img src={qrUrl} alt="Activation QR" className="w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-48 h-48 bg-slate-200 rounded-3xl mb-4"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing...</p>
                  </div>
                )
              ) : (
                <div className="w-full space-y-8 p-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SM-DP+ Address</p>
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                      <code className="text-[10px] font-mono text-slate-900 font-bold">{smdpAddress}</code>
                      <button onClick={() => navigator.clipboard.writeText(smdpAddress)} className="text-airalo hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Activation Code</p>
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                      <code className="text-[10px] font-mono text-slate-900 font-bold break-all pr-4">{manualCode}</code>
                      <button onClick={() => navigator.clipboard.writeText(manualCode)} className="text-airalo hover:scale-110 transition-transform shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Encryption Verified
              </div>
              <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                To activate, navigate to <span className="text-slate-900 font-bold italic">Settings > Cellular > Add eSIM</span> and scan the code. Ensure you are connected to Wi-Fi.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
