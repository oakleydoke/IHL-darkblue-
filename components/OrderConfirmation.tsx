
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { ESimService } from '../services/eSimService';

interface OrderConfirmationProps {
  order: Order;
  onBackToHome: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order: initialOrder, onBackToHome }) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [view, setView] = useState<'qr' | 'manual'>('qr');
  const [isResyncing, setIsResyncing] = useState(false);
  
  const isError = order.status === 'error' || order.activationCode?.startsWith('GATEWAY_ERROR');
  const isPending = order.status === 'pending' || !order.activationCode;
  
  const activationCode = order.activationCode || '';
  const qrUrl = activationCode && !isError && !isPending
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(activationCode)}`
    : null;

  const lpaParts = activationCode.split('$');
  const smdpAddress = lpaParts[1] || 'smdp.gsma.com';
  const manualCode = lpaParts[2] || 'Provisioning...';

  const handleResync = async () => {
    if (isResyncing) return;
    setIsResyncing(true);
    try {
      const updatedOrder = await ESimService.getOrderByStripeSession(order.id);
      setOrder(updatedOrder);
    } catch (e) {
      console.warn("Auto-sync interval wait...");
    } finally {
      setIsResyncing(false);
    }
  };

  // Professional Auto-Sync: Poll every 8 seconds if pending
  useEffect(() => {
    if (isPending && !isError) {
      const interval = setInterval(() => {
        handleResync();
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isPending, isError]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-24 selection:bg-airalo/10">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-12 gap-12">
        
        {/* Left Column: Status & Certificate */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left duration-700">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 text-white shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-airalo/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex items-center justify-between mb-16">
              <div className={`w-20 h-20 ${isError ? 'bg-red-500' : isPending ? 'bg-airalo animate-pulse' : 'bg-airalo'} rounded-[2rem] flex items-center justify-center shadow-2xl shadow-airalo/20`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d={isError ? "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" : isPending ? "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" : "m4.5 12.75 6 6 9-13.5"} />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Security Status</p>
                <div className="flex items-center gap-2 justify-end">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">Encrypted Handshake</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-8 leading-[0.9]">
              {isError ? 'Node Error' : isPending ? 'Securing Asset' : 'Scholar Secured'}
            </h1>
            
            <div className="space-y-8 text-slate-400 font-medium">
              <p className="text-xl leading-relaxed max-w-lg">
                {isError 
                  ? `An interrupt occurred in the carrier node. Our engineering desk has been notified. Error: ${order.message}`
                  : isPending
                  ? `Authentication successful. Your premium connectivity asset is being provisioned across our global infrastructure.`
                  : `Provisioning complete. Your high-speed 5G connectivity asset is now live and linked to your Scholar profile.`
                }
              </p>
              
              <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-3">ICCID Identifier</p>
                  <p className="text-white font-mono text-sm tracking-widest font-bold">{order.iccid || 'AUTHENTICATING...'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-3">Global Order Tracking</p>
                  <p className="text-white font-mono text-sm tracking-widest font-bold">{order.orderNo || 'SYNC-PND'}</p>
                </div>
              </div>
            </div>

            {isPending && !isError && (
              <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-airalo rounded-full animate-ping"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-airalo">Synchronizing with carrier node...</p>
                </div>
                <button onClick={handleResync} className="text-white/40 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${isResyncing ? 'animate-spin' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-6">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group cursor-pointer hover:bg-slate-900 hover:text-white transition-all" onClick={onBackToHome}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
               </div>
               <div>
                 <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-1">Navigation</p>
                 <button onClick={onBackToHome} className="font-black text-sm text-slate-900 hover:text-airalo transition-colors">Return to Main Terminal</button>
               </div>
             </div>
             <div className="text-right hidden md:block">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Certificate</p>
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">{order.id.substring(0,16)}</p>
             </div>
          </div>
        </div>

        {/* Right Column: Digital Asset QR */}
        <div className="lg:col-span-5 animate-in fade-in slide-in-from-right duration-1000 delay-200">
          <div className="bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 p-8 md:p-12 sticky top-32">
            <div className="flex justify-between items-center mb-12">
               <div>
                 <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em] mb-1">eSIM Asset</h4>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Delivery Node</p>
               </div>
               <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                 <button 
                  onClick={() => setView('qr')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'qr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                 >QR Code</button>
                 <button 
                  onClick={() => setView('manual')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                 >Manual</button>
               </div>
            </div>
            
            <div className="aspect-square bg-slate-50 rounded-[3rem] overflow-hidden flex items-center justify-center p-8 mb-12 border border-slate-100 group relative">
              {isError ? (
                <div className="text-center p-10">
                  <div className="w-20 h-20 bg-red-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Activation Halted</p>
                </div>
              ) : isPending ? (
                <div className="text-center p-10 flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-airalo border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-airalo">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Establishing Secure Carrier Link...</p>
                </div>
              ) : view === 'qr' ? (
                qrUrl ? (
                  <div className="relative w-full h-full p-4 bg-white rounded-[2rem] shadow-inner group-hover:scale-105 transition-transform duration-700">
                    <img src={qrUrl} alt="Activation QR" className="w-full h-full mix-blend-multiply" />
                    <div className="absolute inset-0 border border-slate-100 rounded-[2rem] pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-48 h-48 bg-slate-200 rounded-3xl mb-4"></div>
                  </div>
                )
              ) : (
                <div className="w-full space-y-10 p-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">SM-DP+ Address</p>
                    <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between group/row">
                      <code className="text-xs font-mono text-slate-900 font-bold">{smdpAddress}</code>
                      <button onClick={() => navigator.clipboard.writeText(smdpAddress)} className="text-slate-300 hover:text-airalo transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Activation Code</p>
                    <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between group/row">
                      <code className="text-xs font-mono text-slate-900 font-bold break-all pr-4">{manualCode}</code>
                      <button onClick={() => navigator.clipboard.writeText(manualCode)} className="text-slate-300 hover:text-airalo transition-all shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <div className={`w-2.5 h-2.5 rounded-full ${isPending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></div>
                {isPending ? 'Syncing Node Registry...' : 'Registry Synchronized'}
              </div>
              <p className="text-[11px] font-semibold text-slate-400 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100">
                Installation: Navigate to <span className="text-slate-900 font-black italic">Settings &gt; Cellular &gt; Add eSIM</span>. Scan the digital asset above while connected to a stable Wi-Fi network.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
