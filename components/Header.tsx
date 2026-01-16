
import React from 'react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onHomeClick: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onDashboardClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  cartCount, 
  onCartClick, 
  onHomeClick, 
  isLoggedIn, 
  onLogin, 
  onDashboardClick 
}) => {
  const scrollTo = (id: string) => {
    onHomeClick(); // Ensure we are on the home view
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-white/5 shadow-2xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 h-20 md:h-24 flex items-center justify-between">
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={onHomeClick}
        >
          <div className="relative transform group-hover:-translate-y-1 transition-all duration-500 ease-out">
            <svg width="160" height="60" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path 
                d="M1 9C1 5.13401 4.13401 2 8 2H145C148.866 2 152 5.13401 152 9V39C152 42.866 148.866 46 145 46H31.5L19 55.5V46H8C4.13401 46 1 42.866 1 39V9Z" 
                stroke="#00a7b5" strokeWidth="3" strokeOpacity="0.3" filter="url(#glow)"
              />
              <path d="M0 8C0 3.58172 3.58172 0 8 0H146C150.418 0 154 3.58172 154 8V40C154 44.4183 150.418 48 146 48H32L18 58V48H8C3.58172 48 0 44.4183 0 40V8Z" fill="#1e293b"/>
              <path d="M1 9C1 5.13401 4.13401 2 8 2H145C148.866 2 152 5.13401 152 9V39C152 42.866 148.866 46 145 46H31.5L19 55.5V46H8C4.13401 46 1 42.866 1 39V9Z" stroke="#00a7b5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="77" y="20" fill="white" textAnchor="middle" style={{ font: '600 11px Inter, sans-serif', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.8 }}>I HAVE</text>
              <text x="77" y="38" fill="white" textAnchor="middle" style={{ font: '900 18px Inter, sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase' }}>LANDED</text>
              <circle cx="140" cy="14" r="3" fill="#00a7b5">
                <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
            <div className="absolute -bottom-2 left-4 right-8 h-1 bg-black/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">
          <button onClick={() => scrollTo('destinations')} className="hover:text-white transition-colors relative group text-left">
            Destinations
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-airalo transition-all group-hover:w-full"></span>
          </button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors relative group text-left">
            How it Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-airalo transition-all group-hover:w-full"></span>
          </button>
          <button onClick={() => scrollTo('blog')} className="hover:text-white transition-colors relative group text-left">
            Insights
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-airalo transition-all group-hover:w-full"></span>
          </button>
        </nav>

        <div className="flex items-center gap-6">
          <button 
            onClick={onCartClick}
            className="relative p-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.112 16.829a1.5 1.5 0 0 1-1.497 1.599H4.779a1.5 1.5 0 0 1-1.497-1.599l1.112-16.829a1.5 1.5 0 0 1 1.497-1.401h11.486a1.5 1.5 0 0 1 1.497 1.401Z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-airalo text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-slate-900">
                {cartCount}
              </span>
            )}
          </button>
          
          {isLoggedIn ? (
            <button 
              onClick={onDashboardClick}
              className="flex items-center gap-3 bg-slate-800 border border-white/10 px-5 py-2.5 rounded-full hover:bg-slate-700 transition-all group"
            >
              <div className="w-6 h-6 bg-airalo rounded-full flex items-center justify-center text-[10px] font-black text-white">
                {isLoggedIn ? 'JD' : '..'}
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest hidden md:block">Manage eSIMs</span>
            </button>
          ) : (
            <button 
              onClick={onLogin}
              className="bg-white text-slate-900 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 hover:text-white border border-slate-200 transition-all transform active:scale-95 shadow-sm"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
