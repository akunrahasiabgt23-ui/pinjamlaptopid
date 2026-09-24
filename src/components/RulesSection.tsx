import React from 'react';
import { FileCheck, HelpCircle, CheckCircle2, PhoneCall, Scale, ShieldCheck, AlertCircle } from 'lucide-react';

export const RulesSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      {/* Hero Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          KETENTUAN RESMI PINJAMLAPTOP.ID
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Syarat Sewa, Jaminan & Keamanan
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Proses sewa transparan, praktis, dan terpercaya untuk perorangan maupun keperluan kantor.
        </p>
      </div>

      {/* Pilihan Jaminan yang Jelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Pilihan 1: 2 Identitas Asli
              </h3>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
                Tanpa Uang Deposit
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Anda tidak perlu menitipkan uang jaminan deposit. Cukup tunjukkan 2 kartu identitas resmi asli saat serah terima unit:
          </p>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Identitas Utama:</strong> KTP Asli milik pribadi penyewa.
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Identitas Pendukung:</strong> SIM A/C, BPKB, Ijazah, atau Kartu Keluarga asli.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Pilihan 2: Uang Deposit
              </h3>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
                100% Kembali Utuh
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Bagi Anda yang tidak ingin meninggalkan dokumen identitas kedua fisik, Anda dapat memilih opsi deposit uang jaminan:
          </p>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Besaran Deposit:</strong> Disesuaikan dengan seri laptop (mulai Rp 1.500.000).
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Pengembalian Cepat:</strong> Uang deposit ditransfer kembali 100% utuh saat unit selesai diperiksa.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Notice Box */}
      <div className="p-6 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Penting: Keaslian Identitas Dokumen
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Pastikan dokumen yang diserahkan adalah dokumen resmi milik pribadi Anda sendiri.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
          <p>
            Apabila identitas fisik tidak dapat ditunjukkan saat kurir tiba atau data terbukti fiktif/milik orang lain:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-medium text-slate-800">
            <li>Unit laptop tidak dapat diserah-terimakan demi keamanan aset.</li>
            <li>Biaya sewa yang telah dibayarkan akan hangus sebagai pengganti biaya operasional dan pengantaran.</li>
          </ul>
        </div>
      </div>

      {/* ATURAN DENDA KETERLAMBATAN & KEWAJIBAN PEMBAYARAN */}
      <div className="bg-white p-6 rounded-2xl border-2 border-rose-300 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-black text-rose-600 tracking-wider uppercase block">
              Regulasi Pengembalian & Pembayaran
            </span>
            <h3 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
              Aturan Denda Keterlambatan: Rp 20.000 / 1 Jam
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Denda dihitung secara otomatis dan <strong>WAJIB DIBAYARKAN BAGAIMANAPUN SITUASINYA</strong>.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm space-y-2.5 text-rose-950">
          <p className="font-bold text-rose-900">
            Ketentuan Mengikat Denda Keterlambatan:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
            <li>
              <strong>Tarif Denda:</strong> Ditetapkan flat sebesar <strong>Rp 20.000,- (Dua Puluh Ribu Rupiah) per 1 jam keterlambatan</strong> terhitung sejak masa sewa habis (pada jam yang sama saat menerima unit yang disewakan).
            </li>
            <li>
              <strong>Wajib Dibayarkan Bagaimanapun Situasinya:</strong> Denda keterlambatan bersifat mutlak dan mengikat secara hukum perdata. <strong>Tidak ada pengecualian</strong> untuk alasan kemacetan lalu lintas, cuaca hujan, lupa waktu, kesibukan mendadak, pekerjaan lembur, kendala transportasi, maupun urusan pribadi apapun.
            </li>
            <li>
              <strong>Pelunasan Denda:</strong> Denda wajib dilunasi seketika saat unit dikembalikan, atau akan langsung dipotong dari uang jaminan deposit. Bagi penyewa yang menggunakan jaminan KTP fisik, unit identitas hanya akan diserahkan kembali setelah denda lunas 100%.
            </li>
          </ul>
        </div>
      </div>

      {/* SURAT PERJANJIAN SEWA MENYEWA (SPK) & CETAK / SIMPAN PDF */}
      <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-black text-blue-600 tracking-wider uppercase block">
              Legalitas & Bukti Sah
            </span>
            <h3 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
              Surat Perjanjian Sewa Menyewa (SPK) Resmi
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Wajib dibaca, dipahami, dan dicentang secara sadar setelah pembayaran selesai.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs sm:text-sm space-y-2.5 text-slate-800">
          <p className="leading-relaxed">
            Setelah penyewa menyelesaikan pembayaran online (QRIS/VA), sistem akan langsung menampilkan <strong>Surat Perjanjian Sewa Menyewa (SPK)</strong> lengkap dengan nomor registrasi kontrak.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-slate-700">
            <li>
              <strong>Wajib Dicentang Secara Sadar:</strong> Penyewa wajib membaca isi klausul dan mencentang persetujuan: <em>"Saya telah membaca dan mengetahui isi Surat Perjanjian ini secara sadar, tanpa paksaan, dan bersedia mematuhi seluruh klausul termasuk kewajiban membayar denda keterlambatan Rp 20.000/jam dalam situasi apapun."</em>
            </li>
            <li>
              <strong>Akses Langsung Printer & Simpan PDF:</strong> Tersedia tombol cetak langsung yang membuka dialog printer browser untuk mencetak fisik atau memilih opsi <em>"Save as PDF / Simpan sebagai PDF"</em> sebagai bukti serah terima resmi.
            </li>
          </ul>
        </div>
      </div>

      {/* Waktu Pengembalian & Perpanjangan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2.5">
          <Scale className="w-5 h-5 text-blue-600" />
          <span>Batas Waktu Pengembalian & Perpanjangan</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm text-slate-700">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold text-slate-900 text-sm mb-1">Jam Pengembalian</p>
            <p>Paling lambat adalah saat masa sewa habis (terhitung sejak jam yang sama saat menerima unit yang disewakan). Kurir siap menjemput ke lokasi Anda.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold text-slate-900 text-sm mb-1">Perpanjangan Sewa</p>
            <p>Cukup hubungi WhatsApp 0877-2596-4455 sebelum masa sewa berakhir untuk perpanjangan hari.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold text-slate-900 text-sm mb-1">Bantuan Teknis</p>
            <p>Tim teknisi kami siap memandu langsung jika Anda membutuhkan instalasi software atau panduan.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
