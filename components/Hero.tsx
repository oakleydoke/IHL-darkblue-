
import React, { useState, useRef, useEffect } from 'react';
import { TOP_COUNTRIES } from '../constants';
import { Country } from '../types';

interface HeroProps {
  onSelectCountry: (country: Country) => void;
}

const Hero: React.FC<HeroProps> = ({ onSelectCountry }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredCountries(TOP_COUNTRIES.slice(0, 6)); // Show top 6 as "trending"
    } else {
      const filtered = TOP_COUNTRIES.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.code.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    setQuery(country.name);
    setShowSuggestions(false);
    onSelectCountry(country);
  };

  return (
    <div className="relative overflow-hidden bg-slate-900 pt-16 pb-24 md:pt-24 md:pb-32 lg:pb-48">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1523240715639-99a8088fb98b?q=80&w=2000&auto=format&fit=crop" 
          alt="Modern University Life" 
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 bg-airalo/20 border border-airalo/30 px-4 py-1.5 rounded-full text-white text-xs font-bold mb-8 shadow-lg shadow-airalo/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-airalo opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-airalo"></span>
              </span>
              STUDENT EXCLUSIVE: 15% OFF WITH .EDU EMAIL
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
              Arrive Ready to <span className="text-airalo underline decoration-airalo/30 underline-offset-8">Succeed</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed max-w-xl font-medium">
              Secure your premium data connection before you board. High-speed 5G connectivity on global tier-1 networks.
            </p>

            <div className="relative max-w-md mb-12" ref={dropdownRef}>
              <div className="bg-white rounded-2xl p-1.5 flex items-center shadow-2xl focus-within:ring-4 ring-airalo/20 transition-all border border-white/10">
                <div className="pl-4 pr-2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  value={query}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where are you studying?" 
                  className="flex-1 py-3.5 text-slate-800 focus:outline-none text-base font-semibold placeholder:text-slate-400"
                />
                <button className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black hover:bg-airalo transition-all text-sm uppercase tracking-widest shadow-xl">
                  Explore
                </button>
              </div>

              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3">
                      {query.trim() === '' ? 'Trending Destinations' : 'Search Results'}
                    </span>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto py-2 custom-scrollbar">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <button
                          key={country.id}
                          onClick={() => handleSelect(country)}
                          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{country.flag}</span>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{country.name}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Network Active • {country.code}</p>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-airalo">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center">
                        <p className="text-slate-400 text-sm font-medium">No destinations found for "{query}"</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">Premium Study Abroad Connectivity</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-10 opacity-50 filter grayscale contrast-125 brightness-150">
              <span className="text-white font-black text-2xl tracking-tighter">VERIZON</span>
              <span className="text-white font-black text-2xl italic tracking-tighter">vodafone</span>
              <span className="text-white font-black text-2xl tracking-tighter">T-MOBILE</span>
              <span className="text-white font-black text-2xl tracking-tighter">ORANGE</span>
            </div>
          </div>

          <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="relative z-10 w-full aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-slate-800/80">
              <img 
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1000&q=80" 
                alt="Student Lifestyle" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
            </div>
            <div className="absolute -top-8 -right-8 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl flex items-center gap-4 z-20 border border-slate-100 animate-bounce-slow">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a.75.75 0 0 1-1.5 0V3.106l-14.15 14.15a.75.75 0 1 1-1.06-1.06l14.15-14.15H4.448a.75.75 0 0 1 0-1.5h15.504z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Network Status</p>
                <p className="text-slate-900 font-black text-lg">5G Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
