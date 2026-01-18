
import React, { useState, useEffect, useRef } from 'react';
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
  const pollCountRef = useRef(0);
  
  const isError = order.status === 'error';
  const isManual = order.status === 'manual_fulfillment' as any;
  const isPending = order.status === 'pending' || !order.activationCode;
  
  const activationCode = order.activationCode || '';
  const qrUrl = activationCode && !isError && !isPending && !isManual
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(activationCode)}`
    : null;

  const handleResync = async () => {
    if (isResyncing || isManual) return;
    setIsResyncing(true);
    try {
      const updatedOrder = await ESimService.getOrderByStripeSession(order.id);
      if (updatedOrder && updatedOrder.status) {
        setOrder(updatedOrder);
      }
    } catch (e) {
      console.warn("Retrying connectivity handshake...");
    } finally {
      setIsResyncing(false);
      pollCountRef.current += 1;
    }
  };

  useEffect(() => {
    if (isPending && !isError && !isManual) {
      const interval = setInterval(handleResync, 10000);
      return () => clearInterval(interval);
    }
  }, [isPending, isError, isManual]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-24 selection:bg-airalo/10">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left duration-700">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-airalo/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex items-center justify-between mb-16">
              <div className={`w-20 h-20 ${isError ? 'bg-red-500' : isManual ? 'bg-amber-500' : 'bg-airalo'} rounded-[2rem] flex items-center justify-center shadow-2xl relative`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-white relative z-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d={isError ? "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" : isManual ? "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" : "m4.5 12.75 6 6 9-13.5"} />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Service Channel</p>
                <div className="flex items-center gap-2 justify-end">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">{isManual ? 'Priority Concierge' : 'Automated Node'}</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-8 leading-[0.9]">
              {isError ? 'Node Error' : isManual ? 'Manual Securing' : 'Scholar Secured'}
            </h1>
            
            <div className="space-y-8 text-slate-400 font-medium">
              <p className="text-xl leading-relaxed max-w-lg">
                {isError 
                  ? `An interrupt occurred. Our engineering desk has been notified.`
                  : isManual
                  ? `High-demand node detected. A dedicated connectivity specialist is manually securing your Tier-1 asset to ensure 5G priority. ETA: < 10 mins.`
                  : `Provisioning complete. Your premium digital asset is now active.`
                }
              </p>
              
              <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-3">ICCID Identifier</p>
                  <p className="text-white font-mono text-sm tracking-widest font-bold">{order.iccid || 'Bespoke Sync...'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-3">Order Token</p>
                  <p className="text-white font-mono text-sm tracking-widest font-bold">{order.id.substring(0,12).toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-6 group cursor-pointer" onClick={onBackToHome}>
               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
               </div>
               <div>
                 <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-1">Navigation</p>
                 <button className="font-black text-sm text-slate-900">Return to Terminal</button>
               </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 sticky top-32">
            <div className="flex justify-between items-center mb-12">
               <div>
                 <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em] mb-1">eSIM Asset</h4>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Delivery</p>
               </div>
            </div>
            
            <div className="aspect-square bg-slate-50 rounded-[3rem] overflow-hidden flex items-center justify-center p-8 mb-12 border border-slate-100 relative">
              {isManual ? (
                <div className="text-center p-10">
                  <div className="w-24 h-24 bg-amber-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 animate-pulse">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Concierge Desk Active</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">A copy will be sent to your email shortly.</p>
                </div>
              ) : qrUrl ? (
                <img src={qrUrl} alt="Activation QR" className="w-full h-full mix-blend-multiply" />
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-airalo rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing with Node...</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                Secure Infrastructure Linked
              </div>
              <p className="text-[11px] font-semibold text-slate-400 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100">
                For manual assistance, provide Token: <span className="text-slate-900 font-black">{order.id.substring(0,8).toUpperCase()}</span> to Scholar AI.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
