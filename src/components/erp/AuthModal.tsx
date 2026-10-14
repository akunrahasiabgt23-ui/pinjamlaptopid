import React, { useState } from 'react';
import { UserAuthSession } from '../../types';
import { DEMO_USERS } from '../../data/mockErpData';
import { Lock, User, Key, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserAuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check against demo accounts or standard admin
    const foundDemo = DEMO_USERS.find(u => u.username.toLowerCase() === cleanUser);

    if (foundDemo) {
      if (cleanPass === 'admin123' || cleanPass === 'admin123456' || cleanPass === cleanUser) {
        onLoginSuccess(foundDemo);
        onClose();
        return;
      }
    }

    if (cleanUser === 'admin' && (cleanPass === 'admin123' || cleanPass === 'admin123456')) {
      onLoginSuccess(DEMO_USERS[0]);
      onClose();
      return;
    }

    setErrorMessage('Username atau kata sandi tidak cocok. Gunakan admin / admin123 atau pilih peran instan di bawah.');
  };

  const handleSelectQuickDemo = (user: UserAuthSession) => {
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-[#e5dfd5] shadow-2xl w-full max-w-sm overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 border-b border-[#e8e2d8] flex items-center justify-between bg-[#faf8f5]">
          <div>
            <h3 className="font-bold text-sm text-stone-900">Akses Masuk Sistem ERP</h3>
            <p className="text-[11px] text-stone-500 font-mono">Pilar 12: Autentikasi & hak akses pengguna</p>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-[#ede8df] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-[#fdf1f3] border border-[#f9ccd5] text-[#8c273e] text-xs">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-stone-500 mb-1">Username / ID Pengguna</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-stone-500 mb-1">Kata Sandi</label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg font-medium transition-colors shadow-2xs"
            >
              Masuk ke Sistem
            </button>
          </form>

          {/* Quick Demo Switcher in Pastel */}
          <div className="pt-3 border-t border-[#e8e2d8]">
            <div className="text-[10px] font-mono uppercase text-stone-500 mb-2">
              Pilih Akses Peran Cepat (Simulasi Demo):
            </div>

            <div className="space-y-1.5">
              {DEMO_USERS.map((usr) => (
                <button
                  key={usr.userId}
                  type="button"
                  onClick={() => handleSelectQuickDemo(usr)}
                  className="w-full p-2.5 border border-[#e5dfd5] hover:bg-[#faf7f2] rounded-lg flex items-center justify-between text-left transition-colors"
                >
                  <div>
                    <div className="font-semibold text-stone-900">{usr.name}</div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      Peran: {usr.roleTitle} &bull; Cabang {usr.branchCity}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-stone-400">&rarr;</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
