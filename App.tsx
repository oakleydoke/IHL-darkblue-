
import React, { useState, useEffect, useMemo } from 'react';
import { Country, eSIMPlan, CartItem, Order } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import CountryGrid from './components/CountryGrid';
import HowItWorks from './components/HowItWorks';
import Blog from './components/Blog';
import EnterToWin from './components/EnterToWin';
import PlanModal from './components/PlanModal';
import Cart from './components/Cart';
import OrderConfirmation from './components/OrderConfirmation';
import Footer from './components/Footer';
import UserDashboard from './components/UserDashboard';
import LoginModal from './components/LoginModal';
import ScholarAI from './components/ScholarAI';
import StripePaymentSheet from './components/StripePaymentSheet';
import { ESimService } from './services/eSimService';
import { StripeService } from './services/stripeService';
import { AuthService } from './services/authService';
import { ENV } from './config';

type CheckoutState = 'idle' | 'preparing_stripe' | 'local_payment' | 'esim_provisioning';
type ViewState = 'store' | 'dashboard';

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ihavelanded_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAISupport, setShowAISupport] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [view, setView] = useState<ViewState>('store');
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('ihavelanded_active_email'));

  // Body Scroll Lock for High-End UX
  useEffect(() => {
    const shouldLock = isCartOpen || !!selectedCountry || showLoginModal || showAISupport || checkoutState !== 'idle';
    document.body.style.overflow = shouldLock ? 'hidden' : 'unset';
  }, [isCartOpen, selectedCountry, showLoginModal, showAISupport, checkoutState]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('ihavelanded_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const sessionId = params.get('session_id');

    if (status === 'success' && sessionId) {
      handlePostPaymentSuccess(sessionId);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'cancelled') {
      setIsCartOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePostPaymentSuccess = async (sessionId: string) => {
    setCheckoutState('esim_provisioning');
    try {
      // High-end delay for cinematic effect
      await new Promise(resolve => setTimeout(resolve, 3000));
      const order = await ESimService.getOrderByStripeSession(sessionId);
      
      const finalizedOrder = {
        ...order,
        items: [...cartItems]
      };

      // 1. Save to global ledger for persistence
      AuthService.saveOrderToLedger(finalizedOrder);
      
      // 2. Automatically set session so "Login" works immediately
      setUserEmail(finalizedOrder.email);
      localStorage.setItem('ihavelanded_active_email', finalizedOrder.email);

      setCurrentOrder(finalizedOrder);
      setCartItems([]);
      localStorage.removeItem('ihavelanded_cart');
    } catch (error) {
      console.warn("API Provisioning Error:", error);
      
      const fallbackOrder: Order = {
        id: sessionId.substring(0, 12).toUpperCase(),
        email: pendingEmail || 'Checking order...',
        items: [...cartItems],
        total: cartItems.reduce((s, i) => s + i.plan.price, 0),
        currency: 'USD' as any,
        status: 'completed',
        qrCode: undefined,
        activationCode: 'PROVISIONING_DELAYED'
      };
      
      AuthService.saveOrderToLedger(fallbackOrder);
      setCurrentOrder(fallbackOrder);
      setCartItems([]);
      localStorage.removeItem('ihavelanded_cart');
    } finally {
      setCheckoutState('idle');
    }
  };

  const handleMockSuccess = () => {
    setCheckoutState('esim_provisioning');
    setTimeout(() => {
      const mockOrder: Order = {
        id: `IHL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        email: pendingEmail || 'scholar@university.edu',
        items: [...cartItems],
        total: cartItems.reduce((s, i) => s + i.plan.price, 0),
        currency: 'USD' as any,
        status: 'completed',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=LPA:1$SMDP.GSMA.COM$IHL-PROD-TOKEN',
        activationCode: 'LPA:1$SMDP.GSMA.COM$IHL-PROD-TOKEN'
      };
      AuthService.saveOrderToLedger(mockOrder);
      setUserEmail(mockOrder.email);
      localStorage.setItem('ihavelanded_active_email', mockOrder.email);
      setCurrentOrder(mockOrder);
      setCartItems([]);
      localStorage.removeItem('ihavelanded_cart');
      setCheckoutState('idle');
    }, 2800);
  };

  const handleLoginSuccess = (email: string) => {
    const normalized = email.toLowerCase().trim();
    setUserEmail(normalized);
    localStorage.setItem('ihavelanded_active_email', normalized);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem('ihavelanded_active_email');
    setView('store');
  };

  const resetFlow = () => {
    // If we have an active session (just bought something), go to dashboard
    if (userEmail) {
      setView('dashboard');
    } else {
      setView('store');
    }
    setCurrentOrder(null);
    setSelectedCountry(null);
    setPendingEmail('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.plan.price, 0), [cartItems]);
  const discount = pendingEmail.endsWith('.edu') ? subtotal * 0.15 : 0;

  if (currentOrder) {
    return <OrderConfirmation order={currentOrder} onBackToHome={resetFlow} />;
  }

  return (
    <div className="flex flex-col min-h-screen selection:bg-airalo/20 bg-white antialiased">
      <Header
        cartCount={cartItems.length}
        onCartClick={() => { setIsCartOpen(true); setShowAISupport(false); }}
        onHomeClick={() => setView('store')}
        isLoggedIn={!!userEmail}
        onLogin={() => setShowLoginModal(true)}
        onDashboardClick={() => setView('dashboard')}
      />

      <main className={`flex-grow transition-all duration-700 ${checkoutState !== 'idle' ? 'blur-md scale-[0.98]' : 'blur-0 scale-100'}`}>
        {view === 'dashboard' && userEmail ? (
          <UserDashboard
            email={userEmail}
            onLogout={handleLogout}
            onClose={() => setView('store')}
          />
        ) : (
          <div className="animate-in fade-in duration-1000">
            <Hero onSelectCountry={(c) => setSelectedCountry(c)} />
            <CountryGrid onSelectCountry={(c) => setSelectedCountry(c)} />
            <HowItWorks />
            <Blog />
            <EnterToWin />
          </div>
        )}
      </main>

      <Footer />

      {/* Overlays */}
      {selectedCountry && (
        <PlanModal
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
          onAddToCart={(plan) => {
             setCartItems(prev => [...prev, { plan, country: selectedCountry, quantity: 1 }]);
             setSelectedCountry(null);
             setIsCartOpen(true);
          }}
        />
      )}

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={(idx) => setCartItems(prev => prev.filter((_, i) => i !== idx))}
        onCheckout={(email) => {
          setPendingEmail(email);
          setIsCartOpen(false);
          if (ENV.USE_MOCKS) {
            setCheckoutState('local_payment');
          } else {
            setCheckoutState('preparing_stripe');
            StripeService.redirectToCheckout(cartItems, email).catch(() => setCheckoutState('idle'));
          }
        }}
      />

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {checkoutState === 'local_payment' && (
        <StripePaymentSheet 
          amount={subtotal - discount}
          email={pendingEmail}
          onSuccess={handleMockSuccess}
          onCancel={() => setCheckoutState('idle')}
        />
      )}

      <button
        onClick={() => { setShowAISupport(true); setIsCartOpen(false); }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-airalo transition-all z-[180] group ring-4 ring-white active:scale-90"
        aria-label="Support Concierge"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 group-hover:scale-110 transition-transform">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.527 3.653 1.438 5.155l-1.353 4.057a1 1 0 001.265 1.265l4.057-1.353A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
        </svg>
      </button>

      <ScholarAI isOpen={showAISupport} onClose={() => setShowAISupport(false)} userEmail={userEmail} />

      {(checkoutState === 'preparing_stripe' || checkoutState === 'esim_provisioning') && (
        <div className="fixed inset-0 z-[1000] bg-slate-900 flex flex-col items-center justify-center text-white p-8 animate-in fade-in duration-700">
           {/* Loader UI remains as previously defined */}
           <div className="relative w-64 h-64 mb-16">
            <div className="absolute inset-0 border-[2px] border-white/5 rounded-full"></div>
            <div className="absolute inset-0 border-[2px] border-airalo border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <svg className="w-16 h-16 text-white mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
               <span className="text-[9px] font-black tracking-[0.4em] uppercase text-airalo">Syncing Node</span>
            </div>
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Provisioning Asset</h2>
        </div>
      )}
    </div>
  );
};

export default App;
