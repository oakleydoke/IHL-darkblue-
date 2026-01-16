
import React, { useState } from 'react';

interface StripePaymentSheetProps {
  amount: number;
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const StripePaymentSheet: React.FC<StripePaymentSheetProps> = ({ amount, email, onSuccess, onCancel }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiry(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate payment validation and processing
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onCancel}></div>
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="px-8 pt-10 pb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Payment Method</h3>
            <p className="text-sm text-slate-500 font-medium">Securing connectivity for {email}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Amount Banner */}
        <div className="mx-8 mb-8 p-6 bg-slate-900 rounded-3xl flex items-center justify-between text-white">
          <span className="text-sm font-bold uppercase tracking-widest text-white/50">Total Due</span>
          <span className="text-3xl font-black">${amount.toFixed(2)} <span className="text-sm font-bold text-white/30 uppercase ml-1">USD</span></span>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Cardholder Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-airalo outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Card Number</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={cardNumber}
                  onChange={handleCardChange}
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-airalo outline-none transition-all placeholder:text-slate-300"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 opacity-60" alt="Visa" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 opacity-60" alt="Mastercard" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Expiry</label>
                <input 
                  type="text" 
                  required
                  value={expiry}
                  onChange={handleExpiryChange}
                  maxLength={5}
                  placeholder="MM/YY"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-airalo outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">CVC</label>
                <input 
                  type="text" 
                  required
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                  maxLength={4}
                  placeholder="123"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-airalo outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-airalo text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl shadow-airalo/20"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              `Pay $${amount.toFixed(2)} Securely`
            )}
          </button>

          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-300">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Stripe Secure</span>
            </div>
            <div className="h-3 w-px bg-slate-100"></div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">SSL Encrypted</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StripePaymentSheet;
