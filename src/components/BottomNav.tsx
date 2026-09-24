import React from 'react';
import { Home, LayoutGrid, Building2, User } from 'lucide-react';

interface BottomNavProps {
  currentView: 'catalog' | 'tracking' | 'admin' | 'rules' | 'hubs';
  onNavigate: (view: 'catalog' | 'tracking' | 'admin' | 'rules' | 'hubs') => void;
  onSelectCategoryTab?: () => void;
  onOpenAccount?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onSelectCategoryTab,
  onOpenAccount
}) => {
  return (
    <nav 
      aria-label="Navigasi Utama" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] py-1.5 px-4"
    >
      <div className="max-w-md md:max-w-xl mx-auto grid grid-cols-4 items-center">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => onNavigate('catalog')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentView === 'catalog' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 mb-1 ${currentView === 'catalog' ? 'text-blue-600 stroke-[2.5]' : 'text-slate-600 stroke-[1.8]'}`} />
          <span className="text-[11px] leading-tight">Home</span>
        </button>

        {/* Tab 2: Kategori */}
        <button
          type="button"
          onClick={() => {
            if (currentView !== 'catalog') {
              onNavigate('catalog');
            }
            if (onSelectCategoryTab) {
              onSelectCategoryTab();
            }
          }}
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
        >
          <LayoutGrid className="w-5 h-5 mb-1 stroke-[1.8]" />
          <span className="text-[11px] leading-tight">Kategori</span>
        </button>

        {/* Tab 3: Hub Store */}
        <button
          type="button"
          onClick={() => onNavigate('hubs')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentView === 'hubs' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <Building2 className={`w-5 h-5 mb-1 ${currentView === 'hubs' ? 'text-blue-600 stroke-[2.5]' : 'text-slate-600 stroke-[1.8]'}`} />
          <span className="text-[11px] leading-tight">Hub Store</span>
        </button>

        {/* Tab 4: Akun */}
        <button
          type="button"
          onClick={onOpenAccount}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentView === 'admin' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <User className={`w-5 h-5 mb-1 ${currentView === 'admin' ? 'text-blue-600 stroke-[2.5]' : 'text-slate-600 stroke-[1.8]'}`} />
          <span className="text-[11px] leading-tight">Akun</span>
        </button>
      </div>
    </nav>
  );
};
