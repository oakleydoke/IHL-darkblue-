
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onCheckout: (email: string) => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onRemoveItem, onCheckout }) => {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    setIsStudent(email.toLowerCase().trim().endsWith('.edu'));
  }, [email]);

  const subtotal = items.reduce((sum, item) => sum + item.plan.price * item.quantity, 0);
  const discount = isStudent ? subtotal * 0.15 : 0;
  const total = subtotal - discount;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      onCheckout(email);
      setTimeout(() => setIsProcessing(false), 1000);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={isProcessing ? undefined : onClose}
      ></div>
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Your Cart</h2>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Your cart is empty</h3>
              <p className="text-slate-500 text-sm mb-6">Pick a data plan to get started.</p>
              <button 
                onClick={onClose}
                className="bg-airalo text-white px-8 py-3 rounded-xl font-bold"
              >
                Browse Plans
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={`${isStudent ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'} p-6 rounded-2xl border transition-colors duration-500`}>
                <label className={`block text-[10px] font-black uppercase tracking-widest ${isStudent ? 'text-emerald-600' : 'text-slate-400'} mb-2.5`}>
                  {isStudent ? 'Email Verified' : 'Email Address'}
                </label>
                <input 
                  type="email" 
                  required
                  disabled={isProcessing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-airalo outline-none transition-all disabled:opacity-50"
                />
                <p className="text-[10px] text-slate-400 mt-3 font-medium leading-relaxed">
                  Enter your email to receive your activation code. Students with a <span className="text-slate-600 font-bold">.edu</span> address automatically receive a <span className="text-airalo font-bold">15% Scholar Discount</span>.
                </p>
                
                {isStudent && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-600 animate-in slide-in-from-top-1 duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">15% Scholar Reward Applied</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Order Details</p>
                {items.map((item, idx) => (
                  <div key={`${item.plan.id}-${idx}`} className="flex gap-4 p-4 bg-slate-50 rounded-2xl relative group">
                    {!isProcessing && (
                      <button 
                        type="button"
                        onClick={() => onRemoveItem(idx)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm transition-all hover:scale-110"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                        </svg>
                      </button>
                    )}
                    <div className="text-3xl bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
                      {item.country.flag}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{item.plan.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.country.name} • {item.plan.data}</p>
                      <p className="font-bold text-airalo mt-1 text-sm">{item.plan.currency} {item.plan.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="space-y-2 mb-6 px-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Subtotal</span>
                <span className="text-slate-800 font-bold text-sm">USD {subtotal.toFixed(2)}</span>
              </div>
              {isStudent && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="font-bold text-[10px] uppercase tracking-widest">Scholar Discount (15%)</span>
                  <span className="font-bold text-sm">-{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-slate-900 font-black text-xs uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">USD {total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 disabled:bg-slate-400 shadow-xl"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Checkout Now
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
            <p className="text-center text-[9px] text-slate-300 mt-5 uppercase font-black tracking-[0.2em]">
              Secure Global Payments • Instantly Delivered
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
