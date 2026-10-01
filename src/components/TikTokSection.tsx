import React from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

// Official TikTok SVG Icon
export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.34 6.34 0 0 0 1.86-4.48V8.71a8.18 8.18 0 0 0 4.91 1.63V6.89c-.338-.04-.673-.107-1-.2z"/>
  </svg>
);

export const TikTokSection: React.FC = () => {
  return (
    <div id="tiktok-showcase-section" className="mt-6 mb-4">
      {/* Banner Minimalis & Bersih: Hanya menampilkan identitas TikTok resmi tanpa cuplikan video / review */}
      <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 text-white shadow-sm transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Identitas Akun TikTok */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#fe2c55] via-slate-800 to-[#25f4ee] p-[2px] shadow-sm">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <TikTokIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#fe2c55] text-white p-0.5 rounded-full shadow">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Sewa Laptop Termurah
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fe2c55]/15 text-[#fe2c55] border border-[#fe2c55]/25">
                  <TikTokIcon className="w-2.5 h-2.5" />
                  Official TikTok
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span>@sewalaptoptermurah</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 text-xs font-normal">Akun Resmi PinjamLaptop</span>
              </p>
            </div>
          </div>

          {/* Tombol Kunjungi TikTok */}
          <div className="flex items-center self-start sm:self-center">
            <a
              id="btn-visit-tiktok-profile"
              href="https://www.tiktok.com/@sewalaptoptermurah"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white hover:text-cyan-300 font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm group"
            >
              <TikTokIcon className="w-4 h-4 text-[#fe2c55] group-hover:scale-110 transition-transform" />
              <span>Buka Profil @sewalaptoptermurah</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
