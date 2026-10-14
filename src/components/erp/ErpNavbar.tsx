import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  ChevronDown, 
  RotateCcw, 
  Laptop as LaptopIcon, 
  Wrench, 
  Truck, 
  Wallet, 
  Coins, 
  Users, 
  ArrowLeftRight, 
  Receipt, 
  LayoutDashboard,
  Sparkles,
  FileText
} from 'lucide-react';
import { BranchCity, UserAuthSession } from '../../types';
import { DEMO_USERS } from '../../data/mockErpData';

interface ErpNavbarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  selectedBranch: BranchCity | 'Semua';
  onSelectBranch: (branch: BranchCity | 'Semua') => void;
  session: UserAuthSession;
  onSwitchUser: (user: UserAuthSession) => void;
  onResetData: () => void;
  overdueInternalCount: number;
  overdueExternalCount: number;
  troubleLaptopCount: number;
  onOpenRentalModal?: () => void;
}

export const ErpNavbar: React.FC<ErpNavbarProps> = ({
  currentTab,
  onSelectTab,
  selectedBranch,
  onSelectBranch,
  session,
  onSwitchUser,
  onResetData,
  overdueInternalCount,
  overdueExternalCount,
  troubleLaptopCount,
  onOpenRentalModal
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const totalOverdue = overdueInternalCount + overdueExternalCount;

  const navItems = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'rentals', label: 'Alur Sewa (SPK)', icon: FileText, highlight: true },
    { id: 'laptops', label: 'Data Laptop', icon: LaptopIcon, count: troubleLaptopCount > 0 ? troubleLaptopCount : undefined },
    { id: 'movements', label: 'Keluar-Masuk', icon: ArrowLeftRight },
    { id: 'services', label: 'Servis Teknisi', icon: Wrench, count: totalOverdue > 0 ? totalOverdue : undefined, isAlert: totalOverdue > 0 },
    { id: 'customers', label: 'Penyewa & KTP', icon: Users },
    { id: 'deliveries', label: 'Antar-Jemput (5rb/km)', icon: Truck },
    { id: 'finance', label: 'Keuangan Toko', icon: Wallet },
    { id: 'petty_cash', label: 'Kas Kecil', icon: Coins },
    { id: 'employees', label: 'Karyawan', icon: User },
    { id: 'payroll', label: 'Payroll Gaji', icon: Receipt }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-xs border-b border-[#e8e2d8]">
      {/* SLA Alert Strip - Pastel Peach & Apricot Alert */}
      {totalOverdue > 0 && (
        <div className="bg-[#fff4ed] text-[#8c460d] px-4 py-2 text-xs font-mono flex items-center justify-between border-b border-[#fbd3b6]">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse"></span>
              <span className="font-sans text-xs">
                Perhatian SLA Servis:
                {overdueInternalCount > 0 && ` ${overdueInternalCount} unit internal ≥ 7 hari.`}
                {overdueExternalCount > 0 && ` ${overdueExternalCount} unit vendor luar ≥ 14 hari.`}
              </span>
            </div>
            <button 
              onClick={() => onSelectTab('services')}
              className="text-xs text-[#a34b07] hover:text-[#743403] underline font-sans cursor-pointer transition-colors font-medium"
            >
              Evaluasi Servis &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Brand & Multi-Branch Selector */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => onSelectTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#e0e7ff] border border-[#c7d2fe] text-[#3730a3] flex items-center justify-center font-mono font-bold text-sm tracking-tight shadow-2xs group-hover:bg-[#d5deff] transition-colors">
              PL
            </div>
            <div>
              <div className="font-bold text-sm text-stone-800 tracking-tight leading-none flex items-center gap-1.5">
                PINJAM<span className="text-stone-500">LAPTOP</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-[#d8d0e7] text-[#5b3b87] bg-[#f4effc] font-medium">
                  Pastel ERP
                </span>
              </div>
              <div className="text-[10px] text-stone-400 font-mono tracking-tight mt-0.5">Multi-Cabang Sistem</div>
            </div>
          </button>

          <div className="h-4 w-px bg-[#e8e2d8] hidden sm:block"></div>

          {/* Branch Filter Dropdown (Pillar 6) */}
          <div className="relative">
            <button
              onClick={() => setShowBranchDropdown(!showBranchDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#e5dfd5] bg-[#f5f2ea] hover:bg-white text-stone-700 text-xs font-medium transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-stone-500" />
              <span>
                {selectedBranch === 'Semua' ? 'Semua Cabang (Konsolidasi)' : 
                 selectedBranch === 'Malang' ? 'Malang (Pusat)' :
                 `Cabang ${selectedBranch}`}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showBranchDropdown && (
              <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-[#e5dfd5] py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-mono uppercase text-stone-400">Pilih Lingkup Cabang</div>
                {[
                  { key: 'Semua', label: 'Semua Cabang (Konsolidasi)', tag: '3 Kota' },
                  { key: 'Malang', label: 'Malang (Pusat Operasional)', tag: 'Pusat' },
                  { key: 'Sidoarjo', label: 'Cabang Sidoarjo', tag: 'Cabang' },
                  { key: 'Bekasi', label: 'Cabang Bekasi', tag: 'Cabang' }
                ].map((b) => (
                  <button
                    key={b.key}
                    onClick={() => { onSelectBranch(b.key as any); setShowBranchDropdown(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#faf7f2] transition-colors ${
                      selectedBranch === b.key ? 'font-semibold text-stone-900 bg-[#f5f0e8]' : 'text-stone-600'
                    }`}
                  >
                    <span>{b.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                      {b.tag}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Action: Pastel Badge, Quick Action Sewa, User Auth, Role Switcher & Reset */}
        <div className="flex items-center gap-2">
          {/* Quick Action: Buat Sewa Baru (SPK) */}
          {onOpenRentalModal && (
            <button
              onClick={onOpenRentalModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b633d] hover:bg-[#154e30] text-white text-xs font-bold transition-colors shadow-2xs"
              title="Buat Perjanjian Sewa Baru (SPK & Form Sewa)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Sewa Baru (SPK)</span>
              <span className="sm:hidden">+ Sewa</span>
            </button>
          )}

          {/* Pastel Theme indicator tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaf4ee] border border-[#cce5d4] text-[#1b633d] text-[11px] font-medium">
            <Sparkles className="w-3 h-3 text-[#1b633d]" />
            <span>Tema Pastel</span>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            title="Reset data ke demo awal"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e5dfd5] bg-[#f5f2ea] text-stone-600 hover:text-stone-900 hover:bg-white text-xs transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          {/* Active User Pill & Role Switcher (Pillar 12) */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#e5dfd5] hover:bg-white bg-[#f8f6f0] transition-colors text-left"
            >
              <div className="w-5 h-5 rounded-md bg-[#e2d6f5] text-[#5c3682] flex items-center justify-center font-mono font-bold text-[10px] uppercase">
                {session.name.slice(0, 1)}
              </div>
              <div className="hidden sm:block text-left leading-none">
                <span className="text-xs font-medium text-stone-800">{session.name}</span>
                <span className="text-[10px] text-stone-400 ml-1.5">({session.roleTitle})</span>
              </div>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-[#e5dfd5] py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[#f5f2ea] bg-[#faf8f5] rounded-t-xl">
                  <div className="font-semibold text-stone-900">{session.name}</div>
                  <div className="text-[11px] text-stone-500">{session.roleTitle}</div>
                  <div className="text-[10px] text-[#1b633d] font-mono mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span> Aktif login
                  </div>
                </div>

                <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-stone-400">
                  Ganti Hak Akses Akun:
                </div>

                {DEMO_USERS.map((usr) => (
                  <button
                    key={usr.userId}
                    onClick={() => {
                      onSwitchUser(usr);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#faf7f2] transition-colors ${
                      session.userId === usr.userId ? 'bg-[#f4efe4] font-semibold text-stone-900' : 'text-stone-600'
                    }`}
                  >
                    <div>
                      <div>{usr.name}</div>
                      <div className="text-[10px] text-stone-400">{usr.roleTitle}</div>
                    </div>
                    {session.userId === usr.userId && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5c6b84]"></span>
                    )}
                  </button>
                ))}

                <div className="border-t border-[#f5f2ea] mt-1 pt-1">
                  <button
                    onClick={() => {
                      onResetData();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#8c273e] hover:bg-[#fdf1f3] flex items-center gap-1.5 transition-colors rounded-b-xl"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Data Database</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navbar with Soft Pastel Tabs */}
      <div className="bg-[#f5f2ea] border-t border-[#e8e2d8] px-4 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-2xs border border-[#ded8cc] font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60 font-normal'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#4a586e]' : 'text-stone-400'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    item.isAlert 
                      ? 'bg-[#fdf1f3] text-[#8c273e] font-medium border border-[#f9ccd5]' 
                      : isActive 
                        ? 'bg-[#e0e7ff] text-[#3730a3] font-medium' 
                        : 'bg-[#ebe7dc] text-stone-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
