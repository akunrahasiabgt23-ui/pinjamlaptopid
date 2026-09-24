import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, User, KeyRound, AlertCircle, 
  ArrowRight, ShieldAlert, Eye, EyeOff, Laptop 
} from 'lucide-react';
import { loginAdmin } from '../../utils/storage';
import { AdminUserSession } from '../../types';

interface AdminLoginFormProps {
  onLoginSuccess: (session: AdminUserSession) => void;
  onCancel?: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  onLoginSuccess,
  onCancel
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = loginAdmin(username, password);
      setIsLoading(false);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header Branding */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
              <Laptop className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>PORTAL ADMINISTRATOR RESMI</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Akses Masuk Administrator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
              Sistem manajemen sewa laptop: verifikasi berkas, tolak pesanan, proses serah terima, perpanjang sewa, dan pantau neraca keuangan.
            </p>
          </div>
        </div>

        {/* Form Area */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ID Administrator / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Masukkan ID Administrator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memverifikasi Hak Akses...</span>
              ) : (
                <>
                  <span>Masuk ke Pusat Administrator</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              Sesi terenkripsi & aktivitas dicatat dalam Audit Trail
            </span>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-blue-600 hover:underline font-semibold"
              >
                Kembali ke Katalog
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
