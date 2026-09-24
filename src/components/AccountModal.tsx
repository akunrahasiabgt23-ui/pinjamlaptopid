import React, { useState, useEffect } from 'react';
import { 
  User, Shield, ReceiptText, PhoneCall, MessageCircle, 
  Lock, X, ChevronRight, CheckCircle2, ArrowRight, LogIn, LogOut, UserCheck, MapPin, Navigation
} from 'lucide-react';
import { getStoredAdminSession, getStoredCustomerSession, logoutCustomer } from '../utils/storage';
import { STORE_HUBS } from '../data/laptops';
import { CustomerMember } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTracking: (orderId?: string) => void;
  onOpenAdminLogin: () => void;
  onNavigateToAdminPortal: () => void;
  onOpenCustomerLogin?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTracking,
  onOpenAdminLogin,
  onNavigateToAdminPortal,
  onOpenCustomerLogin
}) => {
  const [orderQuery, setOrderQuery] = useState('');
  const [customerSession, setCustomerSession] = useState<CustomerMember | null>(getStoredCustomerSession());
  const [adminSession, setAdminSession] = useState(getStoredAdminSession());
  const isAdminAuthenticated = Boolean(adminSession && adminSession.isAuthenticated);

  useEffect(() => {
    const handleCustomerUpdate = () => {
      setCustomerSession(getStoredCustomerSession());
    };
    const handleAdminUpdate = () => {
      setAdminSession(getStoredAdminSession());
    };
    handleCustomerUpdate();
    handleAdminUpdate();
    window.addEventListener('pinjamlaptop_customer_session_updated', handleCustomerUpdate);
    window.addEventListener('pinjamlaptop_admin_auth_updated', handleAdminUpdate);
    return () => {
      window.removeEventListener('pinjamlaptop_customer_session_updated', handleCustomerUpdate);
      window.removeEventListener('pinjamlaptop_admin_auth_updated', handleAdminUpdate);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogoutCustomer = () => {
    logoutCustomer();
    setCustomerSession(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-sky-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Akun & Layanan</h3>
              <p className="text-xs text-blue-100">PINJAMLAPTOP.ID</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {/* Section: Akun Penyewa (Customer Account) */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-2xl p-4 border border-blue-100">
            {customerSession ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {customerSession.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{customerSession.fullName}</div>
                      <div className="text-[11px] text-blue-700 font-mono font-semibold">ID: {customerSession.memberId}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Penyewa
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                  <p>WhatsApp: <span className="font-medium text-slate-800">{customerSession.phone}</span></p>
                  <p className="truncate">Email: <span className="font-medium text-slate-800">{customerSession.email}</span></p>
                </div>

                <div className="flex gap-2 pt-1">
                  {onOpenCustomerLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCustomerLogin();
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      Buka Profil Penyewa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleLogoutCustomer}
                    className="py-1.5 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs sm:text-sm">
                    <LogIn className="w-4 h-4 text-blue-600" />
                    <span>Akun Khusus Penyewa</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Masuk atau daftar untuk sewa lebih cepat tanpa input ulang identitas.
                  </p>
                </div>
                {onOpenCustomerLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCustomerLogin();
                    }}
                    className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    Login Penyewa
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section: Bantuan Kontak & Lokasi Hub Maps */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pusat Dukungan & Lokasi Google Maps
            </span>
            <a
              href="https://wa.me/6287725964455?text=Halo%20PINJAMLAPTOP.ID,%20saya%20butuh%20bantuan"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">WhatsApp Customer Service</div>
                  <div className="text-[11px] text-slate-500">0877-2596-4455 (Setiap Hari)</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>

            {/* Quick Map Buttons */}
            <div className="pt-1 grid grid-cols-3 gap-1.5">
              {STORE_HUBS.map((hub) => (
                <a
                  key={hub.id}
                  href={hub.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-center transition-colors group flex flex-col items-center justify-center"
                  title={`Buka Google Maps ${hub.name}`}
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600 mb-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-800 group-hover:text-blue-700 leading-tight">
                    {hub.name.replace('PINJAMLAPTOP.ID ', '')}
                  </span>
                  <span className="text-[9px] text-amber-600 font-semibold mt-0.5">★ 5.0 Maps</span>
                </a>
              ))}
            </div>
          </div>

          {/* Section Akses Administrator: Tampil jika Admin Sedang Terautentikasi */}
          {isAdminAuthenticated && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAdminPortal();
                }}
                className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs">Buka Portal Administrator</div>
                    <div className="text-[10px] text-emerald-700">Login sebagai: {adminSession?.name} ({adminSession?.role})</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Footer - Hak Cipta & Gerbang Login Petugas Khusus */}
          <div className="pt-4 border-t border-slate-100 text-center">
            {isAdminAuthenticated ? (
              <p className="text-[11px] text-slate-400 select-none">
                © 2026 PINJAMLAPTOP.ID • Mode Administrator Aktif
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminLogin();
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer select-none"
                title="Khusus Petugas / Administrator Resmi"
              >
                © 2026 PINJAMLAPTOP.ID • Portal Petugas
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
