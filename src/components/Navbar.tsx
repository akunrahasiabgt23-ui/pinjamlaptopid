import React, { useState, useEffect } from 'react';
import { 
  User, Menu, X, Search, ShieldCheck, Building2, 
  ReceiptText, PhoneCall, MessageCircle, ExternalLink,
  ChevronRight, Laptop, LogIn, Lock, CheckCircle2
} from 'lucide-react';
import { PinjamLaptopLogo } from './PinjamLaptopLogo';
import { getStoredCustomerSession, getStoredAdminSession } from '../utils/storage';
import { CustomerMember } from '../types';

interface NavbarProps {
  currentView: 'catalog' | 'tracking' | 'admin' | 'rules' | 'hubs';
  onNavigate: (view: 'catalog' | 'tracking' | 'admin' | 'rules' | 'hubs') => void;
  onOpenTrackingId?: (id: string) => void;
  activeTrackingId?: string;
  onOpenAdminLogin?: () => void;
  onOpenAccount?: () => void;
  onOpenCustomerLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenTrackingId,
  activeTrackingId,
  onOpenAdminLogin,
  onOpenAccount,
  onOpenCustomerLogin
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [customerSession, setCustomerSession] = useState<CustomerMember | null>(getStoredCustomerSession());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const session = getStoredAdminSession();
    return Boolean(session && session.isAuthenticated);
  });

  useEffect(() => {
    const handleCustomerUpdate = () => {
      setCustomerSession(getStoredCustomerSession());
    };
    const handleAdminUpdate = () => {
      const session = getStoredAdminSession();
      setIsAdminLoggedIn(Boolean(session && session.isAuthenticated));
    };
    window.addEventListener('pinjamlaptop_customer_session_updated', handleCustomerUpdate);
    window.addEventListener('pinjamlaptop_admin_auth_updated', handleAdminUpdate);
    return () => {
      window.removeEventListener('pinjamlaptop_customer_session_updated', handleCustomerUpdate);
      window.removeEventListener('pinjamlaptop_admin_auth_updated', handleAdminUpdate);
    };
  }, []);

  const handleNavClick = (view: 'catalog' | 'tracking' | 'admin' | 'rules' | 'hubs') => {
    onNavigate(view);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: Official PinjamLaptop.ID Logo */}
            <div 
              onClick={() => handleNavClick('catalog')}
              className="cursor-pointer group py-1 select-none flex items-center"
            >
              <PinjamLaptopLogo 
                variant="compact" 
                size="md" 
                showSubtitle={false}
              />
            </div>

            {/* Right: Login Penyewa, User Avatar & Menu */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Tombol Login Penyewa / Akun Aktif Penyewa */}
              {customerSession ? (
                <button
                  type="button"
                  onClick={onOpenCustomerLogin || onOpenAccount}
                  className="flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Akun Penyewa Saya"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                    {customerSession.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-semibold max-w-[110px] truncate">
                    {customerSession.fullName.split(' ')[0]}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenCustomerLogin || onOpenAccount}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Masuk sebagai Penyewa"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Login Penyewa</span>
                </button>
              )}

              {/* User Avatar Circle Icon Button */}
              <button
                type="button"
                onClick={onOpenAccount || onOpenAdminLogin}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-300 hover:border-blue-600 hover:bg-blue-50/50 flex items-center justify-center text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-2xs"
                title="Pusat Layanan & Bantuan"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Hamburger Menu Button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-800 hover:text-blue-600 transition-all cursor-pointer"
                title="Menu Navigasi"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <PinjamLaptopLogo variant="compact" size="sm" showSubtitle={false} />
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Login Penyewa Banner Card */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-blue-50/80 to-sky-50/40">
              {customerSession ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {customerSession.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs line-clamp-1">{customerSession.fullName}</div>
                      <div className="text-[10px] text-blue-600 font-mono">{customerSession.memberId}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      if (onOpenCustomerLogin) onOpenCustomerLogin();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 text-[11px] font-bold cursor-pointer"
                  >
                    Profil
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-slate-600 leading-tight">
                    Masuk ke akun penyewa Anda untuk mempermudah sewa dan melacak pesanan laptop.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      if (onOpenCustomerLogin) onOpenCustomerLogin();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login / Daftar Penyewa</span>
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 text-sm font-semibold">
              <button
                onClick={() => handleNavClick('catalog')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors ${
                  currentView === 'catalog' ? 'bg-blue-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5" />
                  <span>Katalog Laptop</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick('rules')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors ${
                  currentView === 'rules' ? 'bg-blue-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Syarat & Aturan Sewa</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick('hubs')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors ${
                  currentView === 'hubs' ? 'bg-blue-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5" />
                  <span>Lokasi Hub Store</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              {isAdminLoggedIn && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors ${
                    currentView === 'admin' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5" />
                    <span>Portal Administrator</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                    Admin
                  </span>
                </button>
              )}

              <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
                <a
                  href="https://wa.me/6287725964455?text=Halo%20PINJAMLAPTOP.ID,%20saya%20butuh%20bantuan%20sewa%20laptop"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span>Bantuan WhatsApp</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-70" />
                </a>
              </div>
            </div>

            {/* Drawer Footer - Akses Tersembunyi Portal Petugas */}
            <div className="p-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  if (onOpenAdminLogin) onOpenAdminLogin();
                }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer select-none"
              >
                © 2026 PINJAMLAPTOP.ID • Semua Hak Dilindungi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
