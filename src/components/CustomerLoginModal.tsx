import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Eye, EyeOff, X, Phone, Mail, MapPin, 
  CheckCircle2, AlertCircle, LogIn, UserPlus, LogOut,
  ReceiptText, Sparkles, ShieldCheck, HelpCircle, ArrowRight
} from 'lucide-react';
import { 
  authenticateMember, 
  registerOrUpdateMember, 
  getStoredCustomerSession, 
  setStoredCustomerSession,
  logoutCustomer,
  getStoredOrders
} from '../utils/storage';
import { CustomerMember, RentalOrder } from '../types';

interface CustomerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (member: CustomerMember) => void;
  onNavigateToTracking?: (orderId?: string) => void;
}

export const CustomerLoginModal: React.FC<CustomerLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onNavigateToTracking
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [currentCustomer, setCurrentCustomer] = useState<CustomerMember | null>(null);
  
  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Form States
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCity, setRegCity] = useState('Jakarta');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Load session on open or event
  useEffect(() => {
    const updateSession = () => {
      setCurrentCustomer(getStoredCustomerSession());
    };
    updateSession();
    window.addEventListener('pinjamlaptop_customer_session_updated', updateSession);
    return () => {
      window.removeEventListener('pinjamlaptop_customer_session_updated', updateSession);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccessMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const result = authenticateMember(loginIdentifier, loginPassword);
      setIsSubmitting(false);

      if (result.success && result.member) {
        setLoginSuccessMessage(result.message);
        setCurrentCustomer(result.member);
        if (onLoginSuccess) {
          onLoginSuccess(result.member);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setLoginError(result.message);
      }
    }, 400);
  };

  // Handle Register Submit
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFullName.trim()) {
      setRegError('Nama lengkap wajib diisi sesuai KTP.');
      return;
    }
    if (!regPhone.trim() || regPhone.length < 9) {
      setRegError('Nomor WhatsApp tidak valid (minimal 10 digit).');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Alamat email aktif wajib diisi.');
      return;
    }
    if (!regAddress.trim()) {
      setRegError('Alamat domisili lengkap wajib diisi.');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 5) {
      setRegError('Kata sandi minimal 5 karakter untuk keamanan akun Anda.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const cleanPhone = regPhone.replace(/[^0-9]/g, '');
      const memberId = `PLM-${cleanPhone.slice(-6) || Math.floor(100000 + Math.random() * 900000)}`;

      const newMember: CustomerMember = {
        memberId,
        password: regPassword,
        fullName: regFullName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim(),
        address: regAddress.trim(),
        city: regCity,
        guaranteeType: 'two_identities',
        registeredAt: new Date().toISOString(),
        totalRentals: 0
      };

      const saved = registerOrUpdateMember(newMember);
      setStoredCustomerSession(saved);
      setCurrentCustomer(saved);
      setIsSubmitting(false);

      if (onLoginSuccess) {
        onLoginSuccess(saved);
      }

      setLoginSuccessMessage(`Pendaftaran berhasil! Selamat datang, ${saved.fullName}.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 500);
  };

  // Handle Logout
  const handleLogout = () => {
    logoutCustomer();
    setCurrentCustomer(null);
    setLoginIdentifier('');
    setLoginPassword('');
  };

  // Get orders associated with customer
  const customerOrders: RentalOrder[] = currentCustomer
    ? getStoredOrders().filter(o => 
        o.customer.phone.replace(/[^0-9]/g, '') === currentCustomer.phone.replace(/[^0-9]/g, '') ||
        o.customer.email.toLowerCase() === currentCustomer.email.toLowerCase()
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {currentCustomer ? 'Akun Penyewa Saya' : 'Portal Masuk Penyewa'}
              </h3>
              <p className="text-xs text-blue-100">
                {currentCustomer ? `ID Member: ${currentCustomer.memberId}` : 'PINJAMLAPTOP.ID'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          
          {/* If already logged in: Profile & Active Orders State */}
          {currentCustomer ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center border-2 border-white shadow-2xs">
                      {currentCustomer.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{currentCustomer.fullName}</h4>
                      <p className="text-xs text-slate-500 font-mono">{currentCustomer.phone}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Penyewa Aktif
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{currentCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{currentCustomer.city} — {currentCustomer.address}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions / Orders */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Pesanan Sewa Saya</span>
                  <span>{customerOrders.length} Pesanan</span>
                </div>

                {customerOrders.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customerOrders.slice(0, 3).map(order => (
                      <div 
                        key={order.id}
                        className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white transition-all flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{order.laptop.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            #{order.id} • {order.durationDays} Hari
                          </div>
                        </div>
                        {onNavigateToTracking && (
                          <button
                            type="button"
                            onClick={() => {
                              onNavigateToTracking(order.id);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition-colors cursor-pointer shrink-0"
                          >
                            Lacak
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    Belum ada riwayat pesanan sewa pada akun ini.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun Penyewa</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login & Register Tabs */
            <div>
              {/* Tab Selector */}
              <div className="flex p-1 rounded-2xl bg-slate-100 mb-5 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'login' 
                      ? 'bg-white text-blue-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Akun</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegError(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'register' 
                      ? 'bg-white text-blue-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Penyewa Baru</span>
                </button>
              </div>

              {/* TAB 1: LOGIN */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Alert Error / Success */}
                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed">{loginError}</div>
                    </div>
                  )}

                  {loginSuccessMessage && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="flex-1 font-semibold">{loginSuccessMessage}</div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ID Member / No. WhatsApp / Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 08123456789 atau PLM-xxxx"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-medium bg-slate-50/50 focus:bg-white transition-all outline-none"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Kata Sandi
                      </label>
                      <a
                        href="https://wa.me/6287725964455?text=Halo%20Admin%20PINJAMLAPTOP.ID,%20saya%20lupa%20password%20akun%20penyewa%20saya"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Lupa Sandi?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="Masukkan kata sandi akun"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-medium bg-slate-50/50 focus:bg-white transition-all outline-none"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span>Memverifikasi Akun...</span>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Masuk Sebagai Penyewa</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                      Belum memiliki akun penyewa?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className="font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      >
                        Daftar Baru Di Sini
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* TAB 2: REGISTER */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Alert Error */}
                  {regError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed">{regError}</div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap penyewa"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-600 text-xs bg-slate-50/50 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        No. WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="08xxxxxxxxxx"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-600 text-xs bg-slate-50/50 focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kota Domisili <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-600 text-xs bg-white outline-none cursor-pointer"
                      >
                        <option value="Jakarta">Jakarta & Sekitarnya</option>
                        <option value="Bandung">Bandung</option>
                        <option value="Surabaya">Surabaya</option>
                        <option value="Lainnya">Kota Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Email Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-600 text-xs bg-slate-50/50 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Domisili Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Jalan, nomor rumah/apartemen, kelurahan, kecamatan"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-600 text-xs bg-slate-50/50 focus:bg-white outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Buat Kata Sandi Akun <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimal 5 karakter"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-slate-300 focus:border-blue-600 text-xs bg-slate-50/50 focus:bg-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span>Mendaftarkan Akun...</span>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Daftar & Masuk Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Data akun terlindungi dengan enkripsi privasi PINJAMLAPTOP.ID</span>
        </div>
      </div>
    </div>
  );
};
