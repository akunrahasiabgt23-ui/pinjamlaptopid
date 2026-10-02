import React from 'react';
import { ShieldCheck, UserCheck, Banknote } from 'lucide-react';

interface WarningNoticeBannerProps {
  onLearnMore?: () => void;
  compact?: boolean;
}

export const WarningNoticeBanner: React.FC<WarningNoticeBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <p>
            <strong className="text-slate-900">Jaminan Mudah:</strong> 2 identitas asli milik sendiri atau uang deposit.
          </p>
        </div>
        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
          Wajib Milik Pribadi
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Ketentuan Jaminan Sewa
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 w-fit">
          ⚠️ Dokumen wajib asli &amp; milik pribadi penyewa
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2 mb-1 text-slate-900 font-bold">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Opsi 1: 2 Identitas Asli</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            KTP asli + 1 kartu identitas kedua (SIM, KK, Ijazah, atau KTM). Wajib milik pribadi atas nama penyewa sendiri.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2 mb-1 text-slate-900 font-bold">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>Opsi 2: Deposit Uang</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Bagi yang tidak menitipkan kartu kedua. Uang deposit dikembalikan 100% utuh setelah unit selesai disewa.
          </p>
        </div>
      </div>
    </div>
  );
};
