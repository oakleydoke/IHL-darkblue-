
import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../types';
import { ESimService } from '../services/eSimService';

interface OrderConfirmationProps {
  order: Order;
  onBackToHome: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order: initialOrder, onBackToHome }) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isResyncing, setIsResyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const pollCountRef = useRef(0);
  
  const isError = order.status === 'error';
  const isManual = order.status === 'manual_fulfillment' as any;
  const isPending = order.status === 'pending' || !order.activationCode || order.iccid === 'ALLOCATING';
  
  const shouldPoll = (isPending || isManual) && !isError;

  const syncSteps = [
    { label: "Carrier Handshake", detail: "Establishing secure link to local registry" },
    { label: "Node Authorization", detail: "Validating Tier-1 network priority" },
    { label: "Identity Encryption", detail: "Generating unique RSA digital asset keys" },
    { label: "Satellite Sync", detail: "Propagating asset across global cell nodes" },
    { label: "Final Validation", detail: "Confirming 5G ready status" }
  ];

  const currentStep = Math.min(Math.floor(progress / 20), 4);

  const handleResync = async () => {
    if (isResyncing) return;
    setIsResyncing(true);
    try {
      const updatedOrder = await ESimService.getOrderByStripeSession(order.id);
      if (updatedOrder && updatedOrder.status === 'completed') {
        setOrder(updatedOrder);
        setProgress(100);
      }
    } catch (e) {
      console.warn("Registry sync retry...");
    } finally {
      setIsResyncing(false);
      pollCountRef.current += 1;
    }
  };

  useEffect(() => {
    let interval: any;
    if (shouldPoll) {
      // Visual progress bar that mimics a 45s wait
      const progressTimer = setInterval(() => {
        setProgress(prev => (prev < 95 ? prev + 0.5 : prev));
      }, 250);

      // Actual data polling every 8 seconds
      interval = setInterval(() => {
        if (pollCountRef.current < 20) {
          handleResync();
        } else {
          clearInterval(interval);
        }
      }, 8000);

      return () => {
        clearInterval(interval);
        clearInterval(progressTimer);
      };
    }
  }, [shouldPoll]);

  const qrUrl = order.activationCode && !isPending && !isManual && !isError
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(order.activationCode)}`
    : null;

  return (
    <div className="min-h-screen bg-white py-12 md:py-24 selection:bg-airalo/10">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-12 gap-16">
        
        <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left duration-700">
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-airalo/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex items-center justify-between mb-20">
              <div className={`w-24 h-24 ${isError ? 'bg-red-500' : shouldPoll ? 'bg-amber-500 shadow-amber-500/20' : 'bg-airalo shadow-airalo/20'} rounded-[2.5rem] flex items-center justify-center shadow-2xl relative transition-all duration-1000`}>
                {shouldPoll && (
                  <div className="absolute inset-0 bg-white rounded-[2.5rem] animate-ping opacity-10"></div>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10 text-white relative z-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d={isError ? "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" : shouldPoll ? "M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5-1.5-3-1m-5.01 4.485a2.25 2.25 0 1 1-4.48 0 2.25 2.25 0 0 1 4.48 0ZM7.5 21V11.25" : "m4.5 12.75 6 6 9-13.5"} />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-2">Protocol Status</p>
                <div className="flex items-center gap-2 justify-end">
                   <div className={`w-2.5 h-2.5 ${shouldPoll ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'} rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]`}></div>
                   <span className="text-xs font-black uppercase tracking-widest text-white">
                    {shouldPoll ? 'High-Demand Sync' : 'Asset Verified'}
                   </span>
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic mb-10 leading-[0.85]">
              {isError ? 'Link Error' : shouldPoll ? 'Bespoke Sync' : 'Scholar Secured'}
            </h1>
            
            <div className="space-y-12 text-slate-400 font-medium max-w-xl">
              <p className="text-xl leading-relaxed">
                {isError 
                  ? `Infrastructure interrupt detected. Please verify your student credentials.`
                  : shouldPoll
                  ? `We are manually orchestrating your digital asset across the global carrier registry. Tier-1 network routing takes architectural time to guarantee 5G priority.`
                  : `Handshake successful. Your premium digital connectivity asset is now active and linked to your Scholar profile.`
                }
              </p>
              
              <div className="grid grid-cols-2 gap-16 pt-12 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-3">Asset Registry</p>
                  <p className="text-white font-mono text-sm tracking-[0.2em] font-bold">
                    {order.iccid && order.iccid !== 'ALLOCATING' ? order.iccid : 'SYNCHRONIZING...'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-3">Node Token</p>
                  <p className="text-white font-mono text-sm tracking-[0.2em] font-bold">{order.id.substring(0,12).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {shouldPoll && (
              <div className="mt-20 space-y-6">
                <div className="flex justify-between items-end mb-2">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-airalo">Stage {currentStep + 1}: {syncSteps[currentStep].label}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-airalo transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,167,181,0.5)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic">
                  {syncSteps[currentStep].detail}...
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-[3rem] p-10 flex items-center justify-between group cursor-pointer border border-slate-100 hover:bg-slate-900 hover:border-slate-900 transition-all duration-500" onClick={onBackToHome}>
             <div className="flex items-center gap-8">
               <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-airalo group-hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
               </div>
               <div>
                 <p className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-400 mb-1 group-hover:text-slate-500">Navigation</p>
                 <button className="font-black text-lg text-slate-900 group-hover:text-white">Return to Dashboard</button>
               </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-10 md:p-14 sticky top-32">
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.5em] mb-12">Digital Provisioning</h4>
            
            <div className="aspect-square bg-slate-50 rounded-[3.5rem] overflow-hidden flex items-center justify-center p-12 mb-12 border border-slate-100 relative group">
              {shouldPoll ? (
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-10 text-amber-500 shadow-xl shadow-amber-500/5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 animate-spin-slow">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Syncing Registry</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Please do not disconnect.<br/>Handshake persistent.</p>
                </div>
              ) : qrUrl ? (
                <div className="relative w-full h-full animate-in zoom-in-95 duration-700">
                  <img src={qrUrl} alt="Activation QR" className="w-full h-full mix-blend-multiply" />
                  <div className="absolute inset-0 border-[20px] border-white/20 pointer-events-none rounded-[2rem]"></div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 border-4 border-slate-100 border-t-airalo rounded-full animate-spin mx-auto mb-8 shadow-xl"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Handshake Initializing</p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className={`w-3 h-3 rounded-full ${shouldPoll ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'} shadow-lg`}></div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">
                    {shouldPoll ? 'Architectural Validation' : 'Security Cleared'}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-widest">
                    {shouldPoll ? 'Monitoring Carrier Node...' : 'Direct 5G Link Established'}
                  </p>
                </div>
              </div>
              
              {!shouldPoll && !isError && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed px-2">
                     Installation: Open <span className="text-slate-900">Settings</span> > <span className="text-slate-900">Cellular</span> > <span className="text-slate-900">Add eSIM</span>. Scan the digital asset above while connected to Wi-Fi.
                   </p>
                   <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-airalo transition-all">Download PDF Credentials</button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
