
import React, { useEffect, useState } from 'react';
import { ESimService, ESimUsage } from '../services/eSimService';

interface UserDashboardProps {
  email: string;
  onLogout: () => void;
  onClose: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ email, onLogout, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<ESimUsage | null>(null);
  const [esims, setEsims] = useState<any[]>([]);

  useEffect(() => {
    const loadAccount = async () => {
      const users = JSON.parse(localStorage.getItem('ihavelanded_users') || '{}');
      const user = users[email];
      if (user?.orderIds?.length > 0) {
        // Fetch real order and usage data
        try {
          const list = await ESimService.getUserESims(user.orderIds);
          setEsims(list);
          const metrics = await ESimService.getUsageMetrics(list[0].iccid);
          setUsage(metrics);
        } catch (e) {
          console.error("Dashboard error:", e);
        }
      }
      setLoading(false);
    };
    loadAccount();
  }, [email]);

  const formatGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(2);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 animate-in fade-in duration-500">
      <div className="bg-slate-900 pt-24 pb-32 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">
              {email.split('@')[0]}'s Terminal
            </h1>
            <p className="text-slate-400 mt-4 font-medium">Monitoring secure global node: {email}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={onLogout} className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Sign Out</button>
            <button onClick={onClose} className="bg-airalo text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl">Return</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16">
        {loading ? (
          <div className="bg-white rounded-[3rem] p-24 text-center shadow-xl">
            <div className="w-12 h-12 border-4 border-airalo border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">Syncing Telemetry...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-16">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Usage</h3>
                   <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Online</span>
                </div>

                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="relative aspect-square">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-50" />
                      <circle 
                        cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="16" fill="transparent" 
                        strokeDasharray="276" 
                        strokeDashoffset={usage ? (276 - (276 * (usage.remainingVolume / usage.totalVolume))) : 276}
                        className="text-airalo transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-5xl font-black text-slate-900 tracking-tighter">
                        {usage ? formatGB(usage.remainingVolume) : '0.00'}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">GB Available</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Quota</p>
                       <p className="text-xl font-black text-slate-900">{usage ? formatGB(usage.totalVolume) : '0'} GB</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                       <p className="text-xl font-black text-slate-900 capitalize">{usage?.status || 'Active'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em] mb-8">Service History</h4>
                <div className="divide-y divide-slate-50">
                  {esims.map((sim, i) => (
                    <div key={i} className="py-6 flex items-center justify-between">
                       <div className="flex items-center gap-6">
                         <span className="text-3xl">{sim.flag}</span>
                         <div>
                           <p className="font-black text-slate-900">{sim.country}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sim.planName}</p>
                         </div>
                       </div>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{sim.purchasedDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-10">
               <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl">
                 <h4 className="font-black text-airalo uppercase text-[9px] tracking-[0.3em] mb-8">Support Concierge</h4>
                 <p className="text-lg font-medium leading-relaxed mb-8">Need more data or a new location pack? Our Scholar AI is ready to assist.</p>
                 <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-airalo transition-all">Chat Now</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
