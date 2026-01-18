
import React, { useEffect, useState } from 'react';
import { ESimService, ESimUsage } from '../services/eSimService';
import { AuthService } from '../services/authService';

interface UserDashboardProps {
  email: string;
  onLogout: () => void;
  onClose: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ email, onLogout, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [esims, setEsims] = useState<any[]>([]);
  const [selectedUsage, setSelectedUsage] = useState<ESimUsage | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const users = JSON.parse(localStorage.getItem('ihavelanded_users') || '{}');
      const user = users[email];
      
      if (user && user.orderIds) {
        const data = await ESimService.getUserESims(user.orderIds);
        setEsims(data);
        if (data.length > 0) {
          const usage = await ESimService.getUsageMetrics(data[0].iccid);
          setSelectedUsage(usage);
        }
      } else {
        // Fallback for demo/mock purposes if no direct link found
        const mockUsage = await ESimService.getUsageMetrics('89860400000000000001');
        setSelectedUsage(mockUsage);
      }
      setLoading(false);
    };
    fetchData();
  }, [email]);

  const formatGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(2);
  const domain = email.split('@')[1]?.replace('.edu', '').toUpperCase() || 'SCHOLAR';

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20 animate-in fade-in duration-700">
      <div className="bg-slate-900 text-white pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-airalo/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-airalo/20 border border-airalo/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">
                {domain} INSTITUTIONAL ACCESS
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Node: Active</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase">{email.split('@')[0]}</h1>
            <p className="text-slate-400 mt-4 font-medium text-lg">Managing your secure connectivity bridge.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogout}
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
            >
              Sign Out
            </button>
            <button 
              onClick={onClose}
              className="bg-airalo hover:bg-white hover:text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-airalo/20"
            >
              Marketplace
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12">
        {loading ? (
          <div className="bg-white rounded-[3rem] shadow-2xl p-32 flex flex-col items-center justify-center text-center border border-slate-100">
             <div className="w-20 h-20 border-[3px] border-airalo border-t-transparent rounded-full animate-spin mb-8"></div>
             <p className="font-black text-slate-900 uppercase tracking-[0.4em] text-[10px]">Syncing Telemetry...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {selectedUsage && (
                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                  <div className="p-10 md:p-16">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-slate-100">
                          {esims[0]?.flag || '🌍'}
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{esims[0]?.country || 'Global'} Connection</h3>
                          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mt-3">High-Speed 5G • {selectedUsage.carrier}</p>
                        </div>
                      </div>
                      <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] ring-1 ring-emerald-100">
                        Line Provisioned
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-20 items-center">
                      <div className="relative aspect-square">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-slate-50" />
                          <circle 
                            cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="20" fill="transparent" 
                            strokeDasharray="276" 
                            strokeDashoffset={276 - (276 * (selectedUsage.remainingVolume / selectedUsage.totalVolume))}
                            className="text-airalo transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <p className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
                            {formatGB(selectedUsage.remainingVolume)}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Gigabytes Left</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-4">
                           <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Asset</span>
                              <span className="text-2xl font-black text-slate-900">{formatGB(selectedUsage.totalVolume)}GB</span>
                           </div>
                           <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Used Today</span>
                              <span className="text-2xl font-black text-slate-900">{formatGB(selectedUsage.usedVolume)}GB</span>
                           </div>
                        </div>
                        
                        <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white">
                          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Activation Status</p>
                          <p className="text-2xl font-black italic">Valid for 28 Days</p>
                          <div className="mt-6 flex items-center gap-3">
                             <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-airalo w-[80%]"></div>
                             </div>
                             <span className="text-[10px] font-black text-white/40">80%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em]">Transaction History</h4>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {esims.length > 0 ? esims.map((sim) => (
                    <div key={sim.iccid} className="px-12 py-10 flex items-center justify-between group hover:bg-slate-50 transition-all cursor-default">
                      <div className="flex items-center gap-8">
                        <span className="text-4xl group-hover:scale-110 transition-transform">{sim.flag}</span>
                        <div>
                          <p className="font-black text-slate-900 text-lg tracking-tight">{sim.country}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: {sim.id.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-800 text-sm">{sim.planName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Verified {sim.purchasedDate}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-20 text-center">
                       <p className="text-slate-400 font-medium italic">No past transactions on this account node.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12">
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em] mb-12">Carrier Node Specs</h4>
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">ICCID Identifier</p>
                    <p className="text-xs font-mono font-bold text-slate-700 break-all">{selectedUsage?.iccid || 'NOT_ASSIGNED'}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Network Access Point</p>
                    <p className="text-xs font-bold text-slate-700">LPA:1$SM-DP.GSMA.COM</p>
                  </div>
                </div>
                <div className="mt-12 pt-10 border-t border-slate-100">
                  <button className="text-airalo font-black text-[10px] uppercase tracking-[0.3em] hover:text-slate-900 transition-colors flex items-center gap-3">
                    View Network Logs
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 group-hover:scale-125 transition-all duration-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32">
                    <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0 0-3.75h-5.25Z" />
                    <path d="M12.75 12h9v5.25a3.375 3.375 0 0 1-3.375 3.375h-5.625V12ZM11.25 12v8.625H5.625A3.375 3.375 0 0 1 2.25 17.25V12h9Z" />
                  </svg>
                </div>
                <h4 className="font-black uppercase text-[10px] tracking-[0.4em] text-airalo mb-10">Referral Program</h4>
                <p className="text-4xl font-black mb-2">$15.00</p>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-12">Credits Accrued</p>
                <button className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-airalo hover:text-white transition-all">
                  Claim Rewards
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
