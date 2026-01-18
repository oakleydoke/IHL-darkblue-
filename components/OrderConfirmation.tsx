
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
  const manualCode = lpaParts[2] || 'Syncing...';

  const handleResync = async () => {
    setIsResyncing(true);
    try {
      // Re-run the verification
      const updatedOrder = await ESimService.getOrderByStripeSession(order.id);
      setOrder(updatedOrder);
    } catch (e) {
      console.error("Resync failed", e);
    } finally {
      setIsResyncing(false);
    }
  };

  // Auto-retry once after 10 seconds if pending
  useEffect(() => {
    if (isPending && !isError) {
      const timer = setTimeout(() => {
        handleResync();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isPending]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-24 animate-in fade-in duration-1000">
      <div className="max-w-5xl mx-auto px-4 grid lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-airalo/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <div className={`w-20 h-20 ${isError ? 'bg-red-500' : isPending ? 'bg-amber-500 animate-pulse' : 'bg-airalo'} rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl transition-colors duration-500`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d={isError ? "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" : isPending ? "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" : "m4.5 12.75 6 6 9-13.5"} />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-6">
              {isError ? 'Node Error' : isPending ? 'Carrier Sync' : 'Order Secured'}
            </h1>
            
            <div className="space-y-6 text-slate-400 font-medium">
              <p className="text-lg leading-relaxed">
                {isError 
                  ? `Gateway error: ${order.message}. Payment recorded.`
                  : isPending
                  ? `Payment confirmed. The carrier node is provisioning your ICCID. This usually takes 30-60 seconds.`
                  : `Your Scholar connectivity asset is provisioned. A copy has been dispatched to ${order.email}.`
                }
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">ICCID Identifier</p>
                  <p className="text-white font-mono text-sm tracking-wider">{order.iccid || 'SYNCING...'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Order Tracking</p>
                  <p className="text-white font-mono text-sm tracking-wider">{order.orderNo || 'IHL-SYNC'}</p>
                </div>
              </div>
            </div>

            {isPending && !isError && (
              <button 
                onClick={handleResync}
                disabled={isResyncing}
                className="mt-10 w-full bg-white/10 border border-white/20 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isResyncing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Attempting Handshake...
                  </>
                ) : 'Manual Node Refresh'}
              </button>
            )}
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
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Provisioning Blocked</p>
                </div>
              ) : isPending ? (
                <div className="text-center p-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carrier Node Active...</p>
                </div>
              ) : view === 'qr' ? (
                qrUrl ? (
                  <img src={qrUrl} alt="Activation QR" className="w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-48 h-48 bg-slate-200 rounded-3xl mb-4"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Finalizing Digital Asset...</p>
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
                <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                {isPending ? 'Encrypting Connection...' : 'Encryption Verified'}
              </div>
              <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                To activate, navigate to <span className="text-slate-900 font-bold italic">Settings &gt; Cellular &gt; Add eSIM</span> and scan the code. Ensure you are connected to Wi-Fi.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
