
import React from 'react';
import { Order } from '../types';

interface OrderConfirmationProps {
  order: Order & { debug?: { sentSlug: string, providerCode: string, webhookRequired: string } };
  onBackToHome: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onBackToHome }) => {
  const isError = order.activationCode?.startsWith('ERROR:') || 
                  order.activationCode?.startsWith('CONNECTION_ERROR:') ||
                  order.activationCode?.startsWith('GATEWAY_REJECTION:');
  
  const activationCode = order.activationCode && 
                         order.activationCode !== 'PROVISIONING_PENDING' && 
                         order.activationCode !== 'PROVISIONING_DELAYED' &&
                         !isError
    ? order.activationCode
    : null;

  const qrUrl = activationCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(activationCode)}`
    : null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 md:py-24 animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto px-4 grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className={`w-24 h-24 ${isError ? 'bg-red-500' : 'bg-airalo'} rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl animate-in zoom-in duration-700`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d={isError ? "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" : "m4.5 12.75 6 6 9-13.5"} />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">
              {isError ? 'Handshake Error' : 'Success'}
            </h1>
            
            <div className="mt-12 pt-12 border-t border-white/5">
               <p className="text-slate-400 font-medium leading-relaxed max-w-sm mx-auto mb-8">
                 {isError 
                   ? `The provider node rejected the slug. Please verify your portal settings.`
                   : `Your digital credentials have been sent to ${order.email}.`
                 }
               </p>
               
               {isError && (
                 <div className="space-y-4">
                   <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-4">API Troubleshooting</p>
                      <div className="space-y-2 font-mono text-[10px] text-slate-300">
                        <p><span className="text-white/40">Sent Slug:</span> {order.debug?.sentSlug || 'Check mapping'}</p>
                        <p><span className="text-white/40">Error Detail:</span> {order.activationCode}</p>
                      </div>
                   </div>

                   <div className="p-6 bg-slate-800 rounded-2xl text-left border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-airalo mb-4">Webhook Configuration</p>
                      <p className="text-[9px] text-slate-400 mb-3 italic">Copy this URL into your eSIMAccess "Webhook Settings" to receive live updates:</p>
                      <code className="block bg-black/50 p-3 rounded-lg text-emerald-400 text-[10px] break-all select-all">
                        {order.debug?.webhookRequired || 'https://ihavelanded.com/api/orders/webhook'}
                      </code>
                   </div>
                 </div>
               )}
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
             <button 
               onClick={onBackToHome}
               className="bg-slate-900 hover:bg-airalo text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
             >
               Return to Store
             </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 h-full flex flex-col items-center justify-center">
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em] mb-10 text-center">eSIM Asset</h4>
            
            {qrUrl ? (
              <div className="bg-white p-6 rounded-[2.5rem] shadow-inner border border-slate-100">
                <img src={qrUrl} alt="Activation QR" className="w-full aspect-square mix-blend-multiply" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className={`w-20 h-20 border-[3px] border-slate-100 ${isError ? 'border-t-red-500' : 'border-t-airalo'} rounded-full ${!isError ? 'animate-spin' : ''} mb-8`}></div>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                  {isError ? 'Gateway Rejected' : 'Syncing...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
