import React from 'react';
import { ShieldCheck, UserCheck, Banknote, AlertCircle, Clock, FileCheck } from 'lucide-react';

export const RulesSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Header Minimalis */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>KETENTUAN RESMI</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Syarat Sewa &amp; Ketentuan Jaminan
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Ringkasan aturan sewa yang jelas, transparan, dan mengikat untuk kenyamanan bersama.
        </p>
      </div>

      {/* Poin-Poin Ketentuan (Point by Point) */}
      <div className="space-y-3">
        {/* Poin 1: Opsi Jaminan */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 mt-0.5">
            1
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Pilihan Jaminan Fleksibel
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda bebas memilih salah satu dari 2 opsi jaminan:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-0.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Opsi 2 Dokumen Asli (Tanpa Deposit)
                </span>
                <span className="text-[11px] text-slate-600">
                  Cukup siapkan e-KTP Asli + 1 dokumen resmi kedua (SIM, KK, Ijazah, atau KTM).
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-0.5 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  Opsi Deposit Uang (100% Kembali)
                </span>
                <span className="text-[11px] text-slate-600">
                  Bagi yang tidak menitipkan dokumen fisik kedua. Uang deposit ditransfer kembali utuh setelah unit dicek normal.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Poin 2: Penegasan Dokumen Wajib Milik Pribadi */}
        <div className="bg-amber-50/80 p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-sm shrink-0 mt-0.5">
            2
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                Dokumen Jaminan Wajib Milik Pribadi Penyewa
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                Penting
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Seluruh dokumen jaminan fisik yang diserahkan <strong>wajib asli dan milik pribadi atas nama penyewa sendiri</strong>. Dilarang keras menggunakan identitas milik orang tua, teman, rekan, atau kerabat. Petugas akan memverifikasi fisik dokumen saat serah terima unit.
            </p>
          </div>
        </div>

        {/* Poin 3: Kehadiran Wajib Penyewa di Lokasi */}
        <div className="bg-rose-50/80 p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-sm shrink-0 mt-0.5">
            3
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-rose-950 text-sm sm:text-base">
                Penyewa Wajib Hadir di Lokasi (Tidak Bisa Diwakilkan)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900 uppercase">
                Wajib
              </span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              Saat serah terima unit laptop (baik di Store Hub maupun via Kurir Antar), <strong>Penyewa Asli WAJIB hadir langsung di lokasi</strong>. Penyerahan unit <strong>TIDAK BISA DIWAKILKAN</strong> kepada siapa pun. Jika penyewa tidak hadir di lokasi, unit tidak bisa diserahkan dan uang transaksi sewa hangus 100%.
            </p>
          </div>
        </div>

        {/* Poin 4: Batas Waktu & Jam Pengembalian */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 mt-0.5">
            4
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              Batas Waktu Pengembalian Tepat Waktu
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Masa sewa dihitung 24 jam per hari sejak serah terima unit. Pengembalian wajib tepat waktu pada tanggal dan jam yang sama saat menerima unit. Jika butuh perpanjangan, konfirmasi minimal 1 hari sebelumnya via WhatsApp.
            </p>
          </div>
        </div>

        {/* Poin 5: Denda Keterlambatan */}
        <div className="bg-rose-50/80 p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-sm shrink-0 mt-0.5">
            5
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-rose-950 text-sm sm:text-base">
                Denda Keterlambatan: Toleransi 1 Jam (Rp 20.000 / Jam)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                Toleransi 1 Jam
              </span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              Terdapat <strong>toleransi pengembalian maksimal 1 jam</strong> untuk mengantisipasi situasi yang tidak bisa diprediksi (cuaca buruk/hujan, musibah, atau kemacetan lalu lintas). Jika pengembalian melebihi batas toleransi 1 jam, dikenakan denda flat <strong>Rp 20.000 / jam berjalan</strong> dan wajib dilunasi saat pengembalian tanpa penundaan.
            </p>
          </div>
        </div>

        {/* Poin 6: Surat Perjanjian Sewa (SPK) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 mt-0.5">
            6
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              Surat Perjanjian Sewa (SPK) &amp; Cetak Dokumen
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Setelah pembayaran checkout selesai, sistem otomatis menerbitkan Surat Perjanjian Sewa Menyewa (SPK) resmi lengkap dengan rincian unit, jaminan, dan tombol cetak/simpan PDF sebagai pegangan sah kedua belah pihak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
