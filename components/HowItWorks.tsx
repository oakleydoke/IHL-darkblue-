
import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      id: 'step-1',
      number: '01',
      label: 'Preparation',
      title: 'Find Your Destination',
      description: 'Search for your primary study hub. We focus on 12 key global locations with direct tier-1 carrier partnerships.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      )
    },
    {
      id: 'step-2',
      number: '02',
      label: 'Deployment',
      title: 'Choose & Install',
      description: 'Select a data pack. Receive a digital QR code instantly, verified against the latest global carrier inventory.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
        </svg>
      )
    },
    {
      id: 'step-3',
      number: '03',
      label: 'Connectivity',
      title: 'Activate & Go',
      description: 'Once you land, enable your line. Zero physical SIM waste, 100% digital provisioning.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 0 1 0-5.303m5.304 0a3.75 3.75 0 0 1 0 5.303m-7.425 2.122a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.808-3.808-9.982 0-13.79m13.788 0c3.808 3.808 3.808 9.982 0 13.79M12 12h.008v.008H12V12Z" />
        </svg>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 relative order-2 lg:order-1">
            <div className="relative z-10 mx-auto w-full max-w-[320px] aspect-[9/18.5] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
              <div className="absolute inset-0 bg-white flex flex-col">
                <div className="h-6 bg-slate-900 w-full"></div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <div className="w-4 h-4 bg-airalo rounded-sm"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1 h-3 bg-slate-200 rounded-full"></div>
                      <div className="w-1 h-4 bg-slate-200 rounded-full"></div>
                      <div className="w-1 h-5 bg-airalo rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="h-3 w-1/2 bg-slate-100 rounded-full"></div>
                    <div className="h-20 w-full bg-slate-50 rounded-2xl border border-slate-100 flex items-center p-4 gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">🇺🇸</div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-2/3 bg-slate-200 rounded-full"></div>
                        <div className="h-2 w-1/3 bg-slate-300 rounded-full"></div>
                      </div>
                    </div>
                    <div className="pt-8 text-center">
                       <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-emerald-500">
                           <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                         </svg>
                       </div>
                       <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active 5G</h4>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Verizon Wireless</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-airalo/5 blur-[100px] rounded-full -z-10"></div>
          </div>

          <div className="flex-1 order-1 lg:order-2">
            <div className="mb-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-airalo mb-4">The Connectivity Protocol</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                Three Steps to <span className="text-airalo">Digital</span> Freedom
              </h3>
              <p className="mt-6 text-slate-500 font-medium leading-relaxed max-w-xl">
                Experience the world's most advanced connectivity platform for international students. No physical SIMs, no contracts, and absolutely no roaming fees.
              </p>
            </div>

            <div className="space-y-8">
              {steps.map((step, idx) => (
                <div key={step.id} className="group relative flex gap-8 p-6 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 border border-transparent hover:border-slate-100">
                  <div className="shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                      {step.icon}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black text-airalo uppercase tracking-widest leading-none">Phase {step.number}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{step.label}</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-800 mb-3 tracking-tight">{step.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-sm">
                      {step.description}
                    </p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="absolute top-[80px] left-[43px] bottom-[-20px] w-px bg-slate-100 group-hover:bg-airalo/20 transition-colors"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
