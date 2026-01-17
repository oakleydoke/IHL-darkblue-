
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
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 md:py-24 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-5 gap-8">
        {/* Main Success Card */}
        <div className="md:col-span-3 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 p-12 text-center text-white">
            <div className="w-20 h-20 bg-airalo rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-airalo/20 animate-bounce-slow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-3 uppercase">Order Success</h1>
            <p className="text-slate-400 font-medium">Network Access Provisioned: {order.id}</p>
          </div>

          <div className="p-12">
            <div className="bg-slate-50 rounded-[2rem] p-8 mb-10 text-center border border-slate-100 min-h-[400px] flex flex-col justify-center">
              {order.qrCode ? (
                <>
                  <div className="bg-white p-6 rounded-3xl inline-block shadow-lg border border-slate-100 mb-8 transform hover:scale-105 transition-transform">
                    <img src={order.qrCode} alt="Activation QR Code" className="w-56 h-56" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">Install Your eSIM</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium leading-relaxed">
                    Scan this with your phone camera. Full instructions sent to <span className="text-slate-900 font-bold">{order.email}</span>
                  </p>
                </>
              ) : (
                <div className="space-y-6 py-10">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-airalo border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5-1.5-1.5.545m-1.5 13.5v-8.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21h-7.5Z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Provisioning Carrier Node</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium leading-relaxed">
                    Your payment is verified. We are syncing your signature with the local carrier networks. 
                    <br/><br/>
                    Your activation code will arrive at <span className="text-slate-900 font-bold">{order.email}</span> within 5-10 minutes.
                  </p>
                </div>
              )}
            </div>

            <button 
              onClick={onBackToHome}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>

        {/* Account Security Sidebar */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
              </svg>
            </div>

            {isSaved ? (
              <div className="text-center py-8 animate-in zoom-in duration-500">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 border border-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-2">Account Secured</h4>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  Log in anytime with your email to track data usage.
                </p>
              </div>
            ) : (
              <>
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-6">Secure Your Data</h4>
                <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-8">
                  Create a password to monitor your real-time 5G usage and remaining GBs via your personal dashboard.
                </p>

                <form onSubmit={handleSavePassword} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Create Password</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-airalo outline-none transition-all"
                    />
                  </div>
                  <button 
                    disabled={isSaving}
                    className="w-full bg-airalo text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-airalo/20 flex items-center justify-center"
                  >
                    {isSaving ? 'Processing...' : 'Secure Account'}
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
            <h5 className="font-black uppercase text-[9px] tracking-[0.3em] text-white/40 mb-4">Activation Help</h5>
            <div className="space-y-4">
               <div className="flex gap-3 text-xs font-bold items-start group cursor-pointer">
                 <div className="w-5 h-5 bg-white/10 rounded-md flex items-center justify-center group-hover:bg-white/20">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white/60">
                     <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
                   </svg>
                 </div>
                 iOS Installation Guide
               </div>
               <div className="flex gap-3 text-xs font-bold items-start group cursor-pointer">
                 <div className="w-5 h-5 bg-white/10 rounded-md flex items-center justify-center group-hover:bg-white/20">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white/60">
                     <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
                   </svg>
                 </div>
                 Android Installation Guide
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
