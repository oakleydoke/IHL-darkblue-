
import React, { useState } from 'react';
import { AuthService } from '../services/authService';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      const user = AuthService.login(email, password);
      if (user) {
        onLoginSuccess(email);
        onClose();
      } else {
        setError('Invalid credentials. Please verify your student email and password.');
        setIsSubmitting(false);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Student Login</h2>
            <p className="text-slate-500 font-medium">Access your secure connectivity portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">University Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-airalo outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Password</label>
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
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Don't have a password yet? 
              <br/>
              <span className="text-slate-900 mt-1 block">Purchase a plan to secure your account.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
