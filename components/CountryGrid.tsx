
import React from 'react';
import { Country } from '../types';
import { TOP_COUNTRIES } from '../constants';

interface CountryGridProps {
  onSelectCountry: (country: Country) => void;
}

const CountryGrid: React.FC<CountryGridProps> = ({ onSelectCountry }) => {
  return (
    <section id="destinations" className="max-w-7xl mx-auto px-4 py-24">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Study Destinations</h2>
          <p className="text-slate-500">Curated connectivity for the world's top 12 study abroad hubs.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-airalo font-bold uppercase text-[10px] tracking-widest cursor-default">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Network Status: Normal
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {TOP_COUNTRIES.map((country) => (
          <div 
            key={country.id}
            onClick={() => onSelectCountry(country)}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                src={country.image} 
                alt={country.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">{country.code}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{country.flag}</span>
                  <span className="font-bold text-xl leading-none">{country.name}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-full p-2 group-hover:bg-airalo transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CountryGrid;
