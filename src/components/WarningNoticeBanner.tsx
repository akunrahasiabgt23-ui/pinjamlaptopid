import React from 'react';
import { ShieldCheck, FileText, Banknote, AlertCircle, ArrowRight } from 'lucide-react';

interface WarningNoticeBannerProps {
  onLearnMore?: () => void;
  compact?: boolean;
}

export const WarningNoticeBanner: React.FC<WarningNoticeBannerProps> = ({ onLearnMore, compact = false }) => {
  if (compact) {
    return (
      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-start gap-3.5 text-blue-950">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-bold text-blue-900">
            Jaminan Mudah: Siapkan 2 Identitas Asli atau Uang Deposit
          </p>
          <p className="text-blue-800 leading-relaxed">
            Penyewa cukup menunjukkan KTP asli + 1 identitas kedua (SIM/Ijazah/BPKB) saat penyerahan laptop. Pastikan identitas adalah dokumen asli milik pribadi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm overflow-hidden">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            KEBIJAKAN JAMINAN SEWA RESMI
          </span>
          <span className="text-xs text-slate-500">PINJAMLAPTOP.ID</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Ketentuan Verifikasi Identitas & Jaminan Sewa
        </h3>
        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          Kami memastikan proses sewa berjalan mudah dan aman. Anda bebas memilih antara jaminan dokumen fisik atau uang jaminan deposit.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Opsi 2 Identitas Asli</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              KTP Asli + 1 kartu identitas aktif (SIM A/C, BPKB, atau Ijazah) ditunjukkan saat unit diserahkan. Tanpa uang jaminan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Opsi Deposit Tunai</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Bagi yang tidak ingin meninggalkan kartu fisik kedua, deposit uang 100% dikembalikan utuh setelah unit selesai dicek.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Keaslian Dokumen</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Pastikan dokumen milik sendiri dan asli. Dokumen palsu atau fiktif berakibat pembatalan dan dana sewa hangus demi keamanan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
