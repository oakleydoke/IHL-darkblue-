
import React, { useState, useEffect } from 'react';
import { Country, eSIMPlan } from '../types';
import { ESimService } from '../services/eSimService';

interface PlanModalProps {
  country: Country;
  onClose: () => void;
  onAddToCart: (plan: eSIMPlan) => void;
}

const PlanModal: React.FC<PlanModalProps> = ({ country, onClose, onAddToCart }) => {
  const [syncedPlans, setSyncedPlans] = useState<eSIMPlan[]>(country.plans);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncFailed, setSyncFailed] = useState(false);

  useEffect(() => {
    const syncPrices = async () => {
      // Add a small safety delay so users see the high-end sync state
      const timer = setTimeout(() => {
        if (isSyncing) {
          setIsSyncing(false);
          setSyncFailed(true);
        }
      }, 1500);

      try {
        const liveRates = await ESimService.fetchLivePricing(country.code);
        if (liveRates && liveRates.length > 0) {
          const updated = country.plans.map((plan, idx) => ({
            ...plan,
            price: liveRates[idx]?.price || plan.price
          }));
          setSyncedPlans(updated);
        } else {
          setSyncFailed(true);
        }
      } catch (e) {
        console.error("Failed to sync live catalog", e);
        setSyncFailed(true);
      } finally {
        clearTimeout(timer);
        setIsSyncing(false);
      }
    };
    syncPrices();
  }, [country]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{country.name} Global Access</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : syncFailed ? 'bg-slate-300' : 'bg-emerald-500'}`}></span>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  {isSyncing ? 'Syncing Regional Catalog...' : syncFailed ? 'Local Catalog (Offline)' : 'Suggested Retail Price Verified'}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {syncedPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`border-2 rounded-2xl p-6 flex flex-col transition-all duration-500 ${isSyncing ? 'opacity-50 grayscale scale-95' : 'border-slate-100 hover:border-airalo shadow-sm hover:shadow-xl'}`}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block bg-slate-900 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">
                      Scholar
                    </span>
                    {!isSyncing && !syncFailed && (
                      <div className="text-emerald-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">{plan.name}</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">High Speed Data</p>
                        <p className="font-bold text-slate-800 text-sm">{plan.data}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Access Period</p>
                        <p className="font-bold text-slate-800 text-sm">{plan.validity}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Scholar Rate</p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                          {plan.currency} {plan.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onAddToCart(plan)}
                    disabled={isSyncing}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-airalo transition-all shadow-xl disabled:bg-slate-100 disabled:text-slate-400 active:scale-95 transform"
                  >
                    {isSyncing ? 'Syncing...' : 'Select Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tier-1 Carriers Only</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Catalog Sync</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 max-w-xs text-center md:text-right leading-relaxed">
              Pricing is globally indexed to the <span className="text-slate-900">latest carrier retail catalogs</span>. Instant digital delivery guaranteed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;
