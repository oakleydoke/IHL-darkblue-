
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
import ScholarAI from './components/ScholarAI';
import UserDashboard from './components/UserDashboard';
import LoginModal from './components/LoginModal';
import { ESimService } from './services/eSimService';
import { StripeService } from './services/stripeService';
import { AuthService } from './services/authService';

type CheckoutState = 'idle' | 'preparing_stripe' | 'esim_provisioning' | 'dashboard';

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ihavelanded_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [showAISupport, setShowAISupport] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const sessionId = params.get('session_id');

    if (status === 'success' && sessionId) {
      handlePostPaymentSuccess(sessionId);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePostPaymentSuccess = async (sessionId: string) => {
    setCheckoutState('esim_provisioning');
    try {
      const order = await ESimService.getOrderByStripeSession(sessionId);
      
      // Automatic Account Sync
      if (order.email) {
        if (!AuthService.userExists(order.email)) {
          AuthService.register(order.email, 'scholar123', order.id);
        } else {
          AuthService.addOrderToUser(order.email, order.id);
        }
        setLoggedInUser(order.email);
      }

      setCurrentOrder(order);
      setCartItems([]);
      localStorage.removeItem('ihavelanded_cart');
    } catch (error) {
      console.error("Provisioning Error:", error);
      // Create a fallback error order state to show the error UI instead of just an alert
      setCurrentOrder({
        id: sessionId.substring(0,10),
        email: 'Unknown',
        items: [],
        total: 0,
        currency: 'USD',
        status: 'error',
        message: 'Handshake timeout. Please check your dashboard or email.'
      });
    } finally {
      setCheckoutState('idle');
    }
  };

  const handleCheckout = async (email: string) => {
    setIsCartOpen(false);
    setCheckoutState('preparing_stripe');
    try {
      await StripeService.redirectToCheckout(cartItems, email);
    } catch (error: any) {
      setCheckoutState('idle');
      alert(`Stripe Gateway Error: ${error.message}`);
    }
  };

  const resetFlow = () => {
    setCurrentOrder(null);
    setSelectedCountry(null);
    setCheckoutState('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (checkoutState === 'dashboard' && loggedInUser) {
    return <UserDashboard email={loggedInUser} onLogout={() => { setLoggedInUser(null); setCheckoutState('idle'); }} onClose={() => setCheckoutState('idle')} />;
  }

  if (currentOrder) {
    return <OrderConfirmation order={currentOrder} onBackToHome={resetFlow} />;
  }

  return (
    <div className="flex flex-col min-h-screen selection:bg-airalo/20 bg-white antialiased">
      <Header
        cartCount={cartItems.length}
        onCartClick={() => setIsCartOpen(true)}
        onHomeClick={() => resetFlow()}
        isLoggedIn={!!loggedInUser}
        onLogin={() => setShowLogin(true)}
        onDashboardClick={() => setCheckoutState('dashboard')}
      />

      <main className={`flex-grow transition-all duration-700 ${checkoutState !== 'idle' ? 'blur-md' : ''}`}>
        <Hero onSelectCountry={(c) => setSelectedCountry(c)} />
        <CountryGrid onSelectCountry={(c) => setSelectedCountry(c)} />
        <HowItWorks />
        <Blog />
        <EnterToWin />
      </main>

      <Footer />

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
        onCheckout={handleCheckout}
      />

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLoginSuccess={(email) => { setLoggedInUser(email); setCheckoutState('dashboard'); }} />}
      <ScholarAI isOpen={showAISupport} onClose={() => setShowAISupport(false)} userEmail={loggedInUser} />

      {(checkoutState === 'preparing_stripe' || checkoutState === 'esim_provisioning') && (
        <div className="fixed inset-0 z-[1000] bg-slate-900 flex flex-col items-center justify-center text-white p-8 animate-in fade-in duration-700">
           <div className="w-24 h-24 border-4 border-airalo border-t-transparent rounded-full animate-spin mb-8"></div>
           <h2 className="text-2xl font-black uppercase tracking-widest italic text-center px-10">
             {checkoutState === 'preparing_stripe' ? 'Securing Gateway' : 'Synchronizing Carrier Node'}
           </h2>
           <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-4">Authorized Secure Handshake...</p>
        </div>
      )}

      <button
        onClick={() => setShowAISupport(true)}
        className="fixed bottom-8 left-8 w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-airalo transition-all z-[180]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.527 3.653 1.438 5.155l-1.353 4.057a1 1 0 001.265 1.265l4.057-1.353A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
        </svg>
      </button>
    </div>
  );
};

export default App;
