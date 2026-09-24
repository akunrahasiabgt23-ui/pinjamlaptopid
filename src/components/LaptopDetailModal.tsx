import React, { useState } from 'react';
import { 
  X, Check, Cpu, HardDrive, Monitor, Shield, Sparkles, 
  Battery, Weight, PackageCheck, Zap, ShieldCheck, CheckCircle2,
  ArrowRight, PhoneCall, Tag, Copy, MapPin, Building2
} from 'lucide-react';
import { Laptop } from '../types';
import { formatRupiah } from '../utils/storage';
import { BRANCH_LOCATIONS } from '../data/laptops';

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
  const [copiedSku, setCopiedSku] = useState<boolean>(false);

  if (!laptop) return null;

  const branchInfo = BRANCH_LOCATIONS.find(b => b.city === laptop.branchCity) || BRANCH_LOCATIONS[0];

  const handleCopySku = () => {
    if (!laptop.sku) return;
    navigator.clipboard.writeText(laptop.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Header with image & clear title */}
        <div className="relative h-56 sm:h-64 bg-slate-100 overflow-hidden">
          <img
            src={laptop.image}
            alt={laptop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-9 h-9 rounded-xl bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-colors shadow-sm text-base font-bold"
            aria-label="Tutup Jendela"
          >
            ✕
          </button>

          <div className="absolute bottom-3.5 left-5 right-5 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-400 text-amber-950 shadow-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {laptop.branchCity === 'Malang' ? 'Pusat Malang' : `Cabang ${laptop.branchCity || 'Malang'}`}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white text-slate-800 shadow-sm">
                {laptop.category}
              </span>
              {laptop.badge && (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm">
                  {laptop.badge}
                </span>
              )}
              <span className="text-xs text-white/90 font-medium ml-auto flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-0.5 rounded-lg backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Tersedia {laptop.availableUnits} Unit
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
              {laptop.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto text-slate-800">
          {/* Branch Location & Domicile Coverage Notice */}
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Lokasi Unit: {branchInfo.badgeLabel} ({branchInfo.city})
              </p>
              <p className="text-slate-600 mt-0.5">
                {branchInfo.description}. Sesuai kebijakan distribusi, unit ini hanya dapat disewa oleh pengguna dengan domisili <strong>{branchInfo.allowedDomiciles.slice(0, 4).join(', ')}</strong>.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {laptop.description}
          </div>

          {/* Kelengkapan */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-blue-600" />
              Kelengkapan yang Didapat (Sudah Termasuk)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 font-medium text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Unit Laptop Bersih & Siap Pakai</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 font-medium text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Charger Adaptor Asli</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 font-medium text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Tas Laptop Pelindung</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 font-medium text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Windows 11 & Office (Word, Excel)</span>
              </div>
            </div>
          </div>

          {/* Spesifikasi Detail */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Rincian Spesifikasi & Identitas Unit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
              {/* SKU Card */}
              <div className="flex items-center justify-between gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 col-span-1 sm:col-span-2">
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">SKU / Kode Unit</span>
                    <span className="font-mono font-bold text-slate-900 text-sm tracking-wide">{laptop.sku}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopySku}
                  className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title="Salin kode SKU"
                >
                  {copiedSku ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                      <span>Salin SKU</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Cpu className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Prosesor</span>
                  <span className="font-bold text-slate-900">{laptop.processor}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">RAM</span>
                  <span className="font-bold text-slate-900">{laptop.ram}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <HardDrive className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Penyimpanan (SSD Cepat)</span>
                  <span className="font-bold text-slate-900">{laptop.storage}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Monitor className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Layar</span>
                  <span className="font-bold text-slate-900">{laptop.display}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Pilihan Periode Sewa
            </h3>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Sewa Harian</span>
                <span className="text-sm sm:text-base font-bold text-slate-900 block">
                  {formatRupiah(laptop.dailyPrice)}
                </span>
                <span className="text-[10px] text-slate-500">/ hari</span>
              </div>
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 relative">
                <span className="text-[11px] text-blue-800 font-medium block mb-0.5">Paket 7 Hari</span>
                <span className="text-sm sm:text-base font-bold text-blue-700 block">
                  {formatRupiah(laptop.weeklyPrice)}
                </span>
                <span className="text-[10px] text-blue-600 font-bold">Hemat 15%</span>
              </div>
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 relative">
                <span className="text-[11px] text-blue-800 font-medium block mb-0.5">Paket 30 Hari</span>
                <span className="text-sm sm:text-base font-bold text-blue-700 block">
                  {formatRupiah(laptop.monthlyPrice)}
                </span>
                <span className="text-[10px] text-blue-600 font-bold">Hemat 30%</span>
              </div>
            </div>
          </div>

          {/* Syarat Jaminan */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">Pilihan Jaminan Fleksibel:</span>
              <p className="leading-relaxed text-slate-600">
                Cukup siapkan <strong>2 Identitas Asli (KTP + SIM/dokumen resmi)</strong> tanpa perlu uang deposit. Atau pilih deposit jaminan {formatRupiah(laptop.depositAmount)} yang dikembalikan 100% utuh saat masa sewa selesai.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Tarif Mulai</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-blue-600">
                {formatRupiah(laptop.dailyPrice)}
              </span>
              <span className="text-xs text-slate-500">/ hari</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={() => {
                onClose();
                onSelectForRental(laptop);
              }}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
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
