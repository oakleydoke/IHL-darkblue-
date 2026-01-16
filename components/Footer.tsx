
import React from 'react';

const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-10 scale-90 -ml-4 origin-left">
              <svg width="160" height="60" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 8C0 3.58172 3.58172 0 8 0H146C150.418 0 154 3.58172 154 8V40C154 44.4183 150.418 48 146 48H32L18 58V48H8C3.58172 48 0 44.4183 0 40V8Z" fill="white"/>
                <path d="M1 9C1 5.13401 4.13401 2 8 2H145C148.866 2 152 5.13401 152 9V39C152 42.866 148.866 46 145 46H31.5L19 55.5V46H8C4.13401 46 1 42.866 1 39V9Z" stroke="#00a7b5" strokeWidth="2.5" />
                <text x="77" y="20" fill="#0f172a" textAnchor="middle" style={{ font: '600 11px Inter, sans-serif', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.6 }}>I HAVE</text>
                <text x="77" y="38" fill="#0f172a" textAnchor="middle" style={{ font: '900 18px Inter, sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase' }}>LANDED</text>
                <circle cx="140" cy="14" r="3" fill="#00a7b5" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-xs">
              Optimized connectivity for the world's top 12 study abroad hubs. Reselling the eSIMAccess global price book with academic discounts.
            </p>
          </div>

          <div>
            <h4 className="font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-slate-500">Platform</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li onClick={() => scrollTo('destinations')} className="hover:text-airalo transition-colors cursor-pointer">Destinations</li>
              <li onClick={() => scrollTo('how-it-works')} className="hover:text-airalo transition-colors cursor-pointer">How it Works</li>
              <li onClick={() => scrollTo('blog')} className="hover:text-airalo transition-colors cursor-pointer">Insights</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-slate-500">Security</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li className="hover:text-airalo transition-colors cursor-pointer">No SSN Requirement</li>
              <li className="hover:text-airalo transition-colors cursor-pointer">Stripe Verified</li>
              <li className="hover:text-airalo transition-colors cursor-pointer">Data Privacy Policy</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-slate-500">Help</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li className="hover:text-airalo transition-colors cursor-pointer">Activation Guide</li>
              <li className="hover:text-airalo transition-colors cursor-pointer">Technical Support</li>
              <li className="flex flex-col pt-2">
                <span className="text-slate-600 text-[9px] uppercase font-black mb-1 tracking-widest">Enquiries</span>
                <a href="mailto:support@ihavelanded.com" className="text-white hover:text-airalo transition-colors">support@ihavelanded.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          <p>© 2024 I HAVE LANDED TECHNOLOGY LTD. POWERED BY ESIMACCESS.</p>
          <div className="flex items-center gap-8 opacity-40">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 invert" />
            <div className="flex gap-4">
              <span>Apple Pay</span>
              <span>Google Pay</span>
              <span>Visa</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
