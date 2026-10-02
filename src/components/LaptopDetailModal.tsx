import React, { useState } from 'react';
import { 
  X, CheckCircle2, ShieldCheck, ArrowRight, MapPin
} from 'lucide-react';
import { Laptop } from '../types';
import { formatRupiah } from '../utils/storage';

interface LaptopDetailModalProps {
  laptop: Laptop | null;
  onClose: () => void;
  onSelectForRental: (laptop: Laptop) => void;
}

export const LaptopDetailModal: React.FC<LaptopDetailModalProps> = ({
  laptop,
  onClose,
  onSelectForRental
}) => {
  if (!laptop) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full shadow-2xl border-t sm:border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header with image */}
        <div className="relative h-44 sm:h-56 bg-slate-100 overflow-hidden shrink-0">
          <img
            src={laptop.image}
            alt={laptop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
            aria-label="Tutup"
          >
            ✕
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {laptop.branchCity || 'Malang'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 backdrop-blur-xs text-white">
                {laptop.category}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold ml-auto bg-black/40 px-2 py-0.5 rounded-md">
                Stok ({laptop.availableUnits}) Unit
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold tracking-tight leading-tight line-clamp-1">
              {laptop.name}
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto text-slate-800 flex-1">
          {/* Spesifikasi Teknis (Grid 2 Kolom Ringkas) */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Spesifikasi Utama
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-medium">Prosesor</span>
                <span className="font-bold text-slate-900 line-clamp-1">{laptop.processor}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-medium">RAM / Memori</span>
                <span className="font-bold text-slate-900">{laptop.ram}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-medium">Penyimpanan SSD</span>
                <span className="font-bold text-slate-900">{laptop.storage}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-medium">Layar &amp; Grafis</span>
                <span className="font-bold text-slate-900 line-clamp-1">{laptop.display}</span>
              </div>
            </div>
          </div>

          {/* Kelengkapan Ringkas */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Kelengkapan Sudah Termasuk
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50/60 text-slate-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Unit Laptop Bersih</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50/60 text-slate-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Charger Adaptor Asli</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50/60 text-slate-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Tas Laptop Busa</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50/60 text-slate-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Windows &amp; Office Siap</span>
              </div>
            </div>
          </div>

          {/* Periode Sewa & Diskon */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Pilihan Paket Durasi
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-400 block">Harian</span>
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">{formatRupiah(laptop.dailyPrice)}</span>
              </div>
              <div className="p-2 rounded-xl border border-blue-200 bg-blue-50/70">
                <span className="text-[10px] text-blue-700 font-semibold block">7 Hari (-15%)</span>
                <span className="font-bold text-blue-700 block text-xs sm:text-sm">{formatRupiah(laptop.weeklyPrice)}</span>
              </div>
              <div className="p-2 rounded-xl border border-blue-200 bg-blue-50/70">
                <span className="text-[10px] text-blue-700 font-semibold block">30 Hari (-30%)</span>
                <span className="font-bold text-blue-700 block text-xs sm:text-sm">{formatRupiah(laptop.monthlyPrice)}</span>
              </div>
            </div>
          </div>

          {/* Syarat Jaminan Ringkas */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span><strong>Jaminan:</strong> 2 Dokumen Asli atau Deposit.</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
              Wajib Milik Pribadi
            </span>
          </div>
        </div>

        {/* Sticky Mobile-Friendly Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Mulai Dari</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black text-blue-600">
                {formatRupiah(laptop.dailyPrice)}
              </span>
              <span className="text-[10px] text-slate-400">/ hari</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectForRental(laptop);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Sewa Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
