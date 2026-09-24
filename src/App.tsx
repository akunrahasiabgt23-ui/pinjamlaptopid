import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AccountModal } from './components/AccountModal';
import { CatalogSection } from './components/CatalogSection';
import { LaptopDetailModal } from './components/LaptopDetailModal';
import { RentalBookingModal } from './components/RentalBookingModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { AdminPortal } from './components/AdminPortal';
import { RulesSection } from './components/RulesSection';
import { HubsSection } from './components/HubsSection';
import { PinjamLaptopLogo } from './components/PinjamLaptopLogo';
import { Laptop, RentalOrder } from './types';
import { getStoredAdminSession } from './utils/storage';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { CustomerLoginModal } from './components/CustomerLoginModal';
import { 
  ShieldCheck, Clock, Truck, Headset, 
  CheckCircle2, MessageCircle, Phone, Sparkles, ChevronRight,
  HelpCircle, MapPin
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'catalog' | 'tracking' | 'admin' | 'rules' | 'hubs'>('catalog');
  const [selectedLaptopForDetail, setSelectedLaptopForDetail] = useState<Laptop | null>(null);
  const [selectedLaptopForRental, setSelectedLaptopForRental] = useState<Laptop | null>(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string>('PL-8821-JKT');
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [showCustomerLoginModal, setShowCustomerLoginModal] = useState<boolean>(false);
  const [showBookingSuccessToast, setShowBookingSuccessToast] = useState<{ show: boolean; orderId: string }>({
    show: false,
    orderId: ''
  });

  const handleNavigate = (view: 'catalog' | 'tracking' | 'admin' | 'rules' | 'hubs') => {
    if (view === 'admin') {
      handleAdminAccess();
      return;
    }
    setCurrentView(view);
  };

  const handleAdminAccess = () => {
    const session = getStoredAdminSession();
    if (session && session.isAuthenticated) {
      setCurrentView('admin');
    } else {
      setShowAdminLoginModal(true);
    }
  };

  const handleOpenRental = (laptop: Laptop) => {
    setSelectedLaptopForRental(laptop);
  };

  const handleBookingSuccess = (order: RentalOrder) => {
    setSelectedLaptopForRental(null);
    setActiveTrackingOrderId(order.id);
    setShowBookingSuccessToast({ show: true, orderId: order.id });
    setCurrentView('tracking');

    setTimeout(() => {
      setShowBookingSuccessToast({ show: false, orderId: '' });
    }, 6000);
  };

  const handleSelectOrderFromAdmin = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setCurrentView('tracking');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenTrackingId={(id) => {
          setActiveTrackingOrderId(id);
          setCurrentView('tracking');
        }}
        activeTrackingId={activeTrackingOrderId}
        onOpenAdminLogin={handleAdminAccess}
        onOpenAccount={() => setShowAccountModal(true)}
        onOpenCustomerLogin={() => setShowCustomerLoginModal(true)}
      />

      {/* Booking Success Floating Toast */}
      {showBookingSuccessToast.show && (
        <div className="fixed bottom-24 right-6 z-50 max-w-md bg-white text-slate-900 rounded-2xl p-5 shadow-xl border border-blue-200 flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-blue-600 block uppercase tracking-wider">
              Pesanan Berhasil Dibuat
            </span>
            <p className="text-base font-bold text-slate-900 mt-0.5">
              Nomor Pesanan: #{showBookingSuccessToast.orderId}
            </p>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Petugas kami sedang menyiapkan laptop Anda. Status pesanan dapat Anda pantau secara langsung.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* View Switcher Content */}
        {currentView === 'catalog' && (
          <CatalogSection
            onSelectLaptop={handleOpenRental}
            onViewDetails={(laptop) => setSelectedLaptopForDetail(laptop)}
            onNavigateToHubs={() => setCurrentView('hubs')}
          />
        )}

        {currentView === 'tracking' && (
          <div className="pb-20">
            <OrderTrackingView
              initialOrderId={activeTrackingOrderId}
              onNavigateToCatalog={() => setCurrentView('catalog')}
            />
          </div>
        )}

        {currentView === 'admin' && (
          <div className="pb-20">
            <AdminPortal
              onSelectOrderToTrack={handleSelectOrderFromAdmin}
              onExitAdmin={() => setCurrentView('catalog')}
            />
          </div>
        )}

        {currentView === 'rules' && (
          <div className="pb-20">
            <RulesSection />
          </div>
        )}

        {currentView === 'hubs' && (
          <div className="pb-20">
            <HubsSection />
          </div>
        )}

        {/* Subtle Footer - Akses Tersembunyi Portal Petugas */}
        {currentView !== 'admin' && (
          <footer className="pt-6 pb-20 text-center">
            <button
              type="button"
              onClick={handleAdminAccess}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer select-none"
            >
              © 2026 PINJAMLAPTOP.ID • Semua Hak Dilindungi
            </button>
          </footer>
        )}
      </main>

      {/* Floating WhatsApp Bantuan Button */}
      <aside aria-label="Bantuan WhatsApp" className="fixed bottom-20 left-4 sm:left-6 z-30">
        <a
          href="https://wa.me/6287725964455?text=Halo%20PINJAMLAPTOP.ID,%20saya%20butuh%20bantuan%20sewa%20laptop"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-blue-600/30 transition-all border border-blue-400 group cursor-pointer"
          title="Bantuan WhatsApp Langsung: 0877-2596-4455"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs sm:text-sm font-bold pr-1">
            Chat WA
          </span>
        </a>
      </aside>

      {/* Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onSelectCategoryTab={() => {
          setCurrentView('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAccount={() => setShowAccountModal(true)}
      />

      {/* Detail Specs Modal */}
      <LaptopDetailModal
        laptop={selectedLaptopForDetail}
        onClose={() => setSelectedLaptopForDetail(null)}
        onSelectForRental={handleOpenRental}
      />

      {/* Booking Form Modal */}
      <RentalBookingModal
        laptop={selectedLaptopForRental}
        onClose={() => setSelectedLaptopForRental(null)}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Customer Account & Order Status Modal */}
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onNavigateToTracking={(orderId) => {
          if (orderId) {
            setActiveTrackingOrderId(orderId);
          }
          setCurrentView('tracking');
        }}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onNavigateToAdminPortal={handleAdminAccess}
        onOpenCustomerLogin={() => setShowCustomerLoginModal(true)}
      />

      {/* Customer / Renter Login & Register Modal */}
      <CustomerLoginModal
        isOpen={showCustomerLoginModal}
        onClose={() => setShowCustomerLoginModal(false)}
        onNavigateToTracking={(orderId) => {
          if (orderId) {
            setActiveTrackingOrderId(orderId);
          }
          setCurrentView('tracking');
        }}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={() => {
          setShowAdminLoginModal(false);
          setCurrentView('admin');
        }}
      />
    </div>
  );
}
