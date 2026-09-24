import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { loginAdmin } from '../../utils/storage';
import { AdminUserSession } from '../../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AdminUserSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = loginAdmin(username, password);
      setIsLoading(false);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
        onClose();
      } else {
        setErrorMessage(res.message || 'ID Petugas atau Password salah');
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
              PORTAL PETUGAS RESMI
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span>Akses Masuk Petugas</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Masuk untuk verifikasi sewa, kelola unit, dan edit katalog laptop.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ID Petugas
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Masukkan ID Petugas"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
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
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memverifikasi Akses...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard Petugas</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              Sesi terenkripsi & aman
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-semibold"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
