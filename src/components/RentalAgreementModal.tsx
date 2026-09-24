import React from 'react';
import { Printer, X, FileText } from 'lucide-react';
import { RentalOrder } from '../types';
import { formatRupiah } from '../utils/storage';
import { PinjamLaptopLogo } from './PinjamLaptopLogo';

interface RentalAgreementModalProps {
  order: RentalOrder | null;
  isOpen: boolean;
  onClose: () => void;
  requireAcknowledgment?: boolean;
  onAcknowledgeAndProceed?: () => void;
}

export const RentalAgreementModal: React.FC<RentalAgreementModalProps> = ({
  order,
  isOpen,
  onClose,
  requireAcknowledgment = false,
  onAcknowledgeAndProceed
}) => {
  const [acknowledged, setAcknowledged] = React.useState<boolean>(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const createdDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const contractNumber = `SPK/PL/${new Date(order.createdAt).getFullYear()}/${order.id.replace('ORD-', '')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 print:shadow-none print:border-none print:my-0 print:max-w-none print:w-full">
        
        {/* Screen Header (Hidden on Print) */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">Surat Perjanjian Sewa Menyewa (SPK)</h3>
              <p className="text-[11px] text-slate-300">Nomor: {contractNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Cetak Dokumen atau Simpan ke PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable Area) */}
        <div id="printable-contract" className="p-6 sm:p-10 text-slate-800 text-xs sm:text-sm leading-relaxed space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-6 print:text-black">
          
          {/* Letterhead (Kop Surat) */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 p-2 flex items-center justify-center shadow-md flex-shrink-0">
                  <PinjamLaptopLogo variant="icon-only" size="sm" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950 leading-tight">
                    PINJAMLAPTOP.ID
                  </h3>
                  <p className="text-xs font-semibold text-blue-600">
                    Layanan Rental Laptop Resmi & Transparan
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
                    Jl. Taman Borobudur Indah B-20 • WhatsApp: 0877-2596-4455 • Website: pinjamlaptop.id
                  </p>
                </div>
              </div>
              <div className="text-right text-[11px] sm:text-xs text-slate-600 flex-shrink-0">
                <p className="font-bold text-slate-900 uppercase">SURAT PERJANJIAN SEWA (SPK)</p>
                <p className="font-mono">NO: {contractNumber}</p>
                <p>Tanggal: {createdDate}</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-950 border-b border-slate-400 inline-block pb-0.5">
              SURAT PERJANJIAN SEWA MENYEWA LAPTOP
            </h2>
            <p className="text-[11px] text-slate-600 font-medium">
              Nomor: {contractNumber}
            </p>
          </div>

          {/* Pembukaan */}
          <p className="text-justify text-xs sm:text-sm">
            Pada hari ini, <strong>{createdDate}</strong>, telah dibuat dan disepakati perjanjian sewa-menyewa unit komputer jinjing (laptop) oleh dan antara pihak-pihak sebagai berikut:
          </p>

          {/* Para Pihak */}
          <div className="space-y-3 bg-slate-50 print:bg-white p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
              <span className="font-bold text-slate-900 sm:col-span-1">PIHAK PERTAMA:</span>
              <span className="sm:col-span-3"><strong>PINJAMLAPTOP.ID</strong>, penyedia resmi persewaan laptop berdomisili di Jl. Taman Borobudur Indah B-20 (selanjutnya disebut <em>"PEMBERI SEWA"</em>).</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-900 sm:col-span-1">PIHAK KEDUA:</span>
              <div className="sm:col-span-3 space-y-0.5">
                <p><strong>Nama Lengkap:</strong> {order.customer.fullName}</p>
                <p><strong>Nomor KTP / NIK:</strong> {order.customer.idCardNumber || order.identityDocs?.doc1Number || '-'}</p>
                <p><strong>Nomor WhatsApp:</strong> {order.customer.phone}</p>
                <p><strong>Alamat Pengiriman / Domisili:</strong> {order.deliveryAddress || order.customer.address}</p>
                <p className="text-[11px] text-slate-600">(selanjutnya disebut <em>"PENYEWA"</em>)</p>
              </div>
            </div>
          </div>

          {/* PASAL 1: OBJEK SEWA */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-950 uppercase text-xs border-l-2 border-blue-600 pl-2">
              PASAL 1 — OBJEK SEWA & SPESIFIKASI PRODUK
            </h4>
            <p className="text-justify">
              PIHAK PERTAMA menyewakan kepada PIHAK KEDUA dan PIHAK KEDUA setuju menyewa 1 (satu) unit laptop dengan spesifikasi yang disepakati sebagai berikut:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-blue-50/50 print:bg-white border border-blue-100 rounded-lg text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Tipe / Seri Laptop</span>
                <strong className="text-slate-900">{order.laptop.name}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Prosesor</span>
                <strong className="text-slate-900">{order.laptop.processor}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">RAM / Kapasitas</span>
                <strong className="text-slate-900">{order.laptop.ram} • SSD {order.laptop.storage}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Layar / Display</span>
                <strong className="text-slate-900">{order.laptop.display}</strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-600">
              <strong>Kelengkapan Unit:</strong> Unit Laptop, Adaptor Charger Asli, Tas Laptop Pelindung Busa, Terinstall Windows & Microsoft Office (Word, Excel) siap pakai.
            </p>
          </div>

          {/* PASAL 2: DURASI & HARGA KESEPAKATAN */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-950 uppercase text-xs border-l-2 border-blue-600 pl-2">
              PASAL 2 — DURASI SEWA & KESEPAKATAN BIAYA
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 print:bg-white border border-slate-200 rounded-lg text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Tanggal & Jam Mulai</span>
                <strong className="text-slate-900 block leading-tight">
                  {order.rentalStartedAt ? (
                    `${new Date(order.rentalStartedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, ${new Date(order.rentalStartedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                  ) : (
                    'Waktu saat Admin menekan Mulai Sewa'
                  )}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Batas Pengembalian</span>
                <strong className="text-slate-900 block leading-tight">
                  {order.rentalStartedAt ? (
                    `${new Date(order.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, ${new Date(order.endDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                  ) : (
                    `${order.durationDays} hari sejak Mulai Sewa diaktifkan`
                  )}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Total Durasi</span>
                <strong className="text-blue-700 block leading-tight">{order.durationDays} Hari</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Total Biaya Sewa</span>
                <strong className="text-emerald-700 block leading-tight">{formatRupiah(order.pricing.totalPaid)}</strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-600">
              {order.rentalStartedAt ? (
                <span>Jam Mulai Sewa terhitung sejak <strong>pukul {new Date(order.rentalStartedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</strong> saat menerima unit. Batas waktu pengembalian unit sewa adalah paling lambat saat masa sewa habis yaitu pada tanggal <strong>{new Date(order.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} pukul {new Date(order.endDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</strong> (terhitung sejak jam yang sama saat menerima unit yang disewakan).</span>
              ) : (
                <span>Jam Mulai Sewa terhitung sejak jam yang sama saat menerima unit yang disewakan (pada saat serah terima unit). Batas waktu pengembalian unit sewa adalah paling lambat adalah saat masa sewa {order.durationDays} hari habis (terhitung sejak jam yang sama saat menerima unit yang disewakan).</span>
              )}
            </p>
          </div>

          {/* PASAL 3: JAMINAN SEWA */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-950 uppercase text-xs border-l-2 border-blue-600 pl-2">
              PASAL 3 — JAMINAN IDENTITAS / DEPOSIT
            </h4>
            <div className="p-3 bg-slate-50 print:bg-white border border-slate-200 rounded-lg text-xs">
              <p>
                <strong>Bentuk Jaminan yang Disepakati: </strong> 
                {order.guaranteeType === 'two_identities' ? (
                  <span className="font-bold text-blue-700">Pilihan 2 Identitas Asli Fisik (KTP Asli + Dokumen Resmi Pendukung). Tanpa Deposit Uang.</span>
                ) : (
                  <span className="font-bold text-blue-700">Uang Deposit Jaminan sebesar {formatRupiah(order.laptop.depositAmount || 1500000)} (Dikembalikan 100% utuh saat unit kembali aman).</span>
                )}
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                Jaminan akan dikembalikan kepada PIHAK KEDUA seketika setelah unit laptop dan seluruh kelengkapannya diperiksa dalam kondisi baik dan lengkap.
              </p>
            </div>
          </div>

          {/* PASAL 4: ATURAN DENDA KETERLAMBATAN (WAJIB DIBAYARKAN BAGAIMANAPUN SITUASINYA) */}
          <div className="space-y-2 p-3 bg-rose-50/60 print:bg-white border border-rose-200 rounded-xl">
            <h4 className="font-bold text-rose-950 uppercase text-xs border-l-2 border-rose-600 pl-2">
              PASAL 4 — DENDA KETERLAMBATAN PENGEMBALIAN & PEMBAYARAN
            </h4>
            <div className="space-y-1.5 text-xs text-rose-950">
              <p className="text-justify font-medium">
                1. Jam Mulai Sewa terhitung sejak jam yang sama saat menerima unit yang disewakan. Batas waktu pengembalian unit sewa adalah paling lambat adalah saat masa sewa habis (terhitung sejak jam yang sama saat menerima unit yang disewakan).
              </p>
              <p className="text-justify font-medium">
                2. <strong>Denda berjalan saat masa sewa berakhir</strong> (terhitung sejak masa sewa habis pada jam yang sama saat menerima unit yang disewakan). Tarif denda ditetapkan sebesar <strong>Rp 20.000,- (DUA PULUH RIBU RUPIAH) PER 1 (SATU) JAM KETERLAMBATAN BERJALAN</strong> dan terus terakumulasi setiap jam berjalan hingga unit diserahkan kembali secara sah kepada PIHAK PERTAMA.
              </p>
              <p className="text-justify font-bold text-rose-900 bg-white/80 p-2 rounded border border-rose-200">
                3. DENDA WAJIB DIBAYARKAN BAGAIMANAPUN SITUASINYA TANPA PENGECUALIAN. PIHAK KEDUA mengerti dan menyepakati bahwa alasan kemacetan lalu lintas, cuaca buruk/hujan, lupa waktu, kesibukan kantor/kuliah mendadak, masalah koneksi, maupun kendala pribadi apapun TIDAK DAPAT dijadikan alasan untuk menghapus atau menunda pembayaran denda.
              </p>
              <p className="text-justify font-medium">
                4. Denda keterlambatan langsung dipotong dari uang deposit (bagi penyewa dengan jaminan deposit) atau wajib ditransfer lunas sebelum 2 kartu identitas fisik asli diserahkan kembali oleh PIHAK PERTAMA.
              </p>
            </div>
          </div>

          {/* PASAL 5: HUKUM & SANKSI PIDANA */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-950 uppercase text-xs border-l-2 border-blue-600 pl-2">
              PASAL 5 — SYARAT PENGGUNAAN & KETENTUAN HUKUM
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-justify text-xs">
              <li>
                <strong>Hak Milik Penuh:</strong> Unit laptop dan aksesoris sepenuhnya merupakan hak milik PIHAK PERTAMA. PIHAK KEDUA hanya memiliki hak guna pakai selama jangka waktu sewa yang disepakati.
              </li>
              <li>
                <strong>Larangan Keras Penggelapan (Pasal 372 KUHP):</strong> PIHAK KEDUA dilarang keras menjual, menggadaikan, meminjamkan kepada pihak ketiga, memindahtangankan, atau membongkar komponen unit laptop. Segala bentuk penggelapan barang akan langsung diproses secara hukum pidana sesuai <strong>Pasal 372 Kitab Undang-Undang Hukum Pidana (KUHP)</strong> dengan ancaman pidana penjara.
              </li>
              <li>
                <strong>Tanggung Jawab Kerusakan:</strong> Kerusakan fisik akibat kelalaian (terjatuh, terkena cairan, layar pecah, patah) menjadi beban pertanggungjawaban PIHAK KEDUA sebesar biaya perbaikan resmi.
              </li>
              <li>
                <strong>Keaslian Identitas:</strong> Apabila identitas yang diberikan terbukti palsu/fiktif, maka PIHAK PERTAMA berhak membatalkan penyerahan unit dan biaya sewa dinyatakan hangus sebagai ganti rugi operasional.
              </li>
            </ol>
          </div>

          {/* Tanda Tangan & Bukti Kesepakatan Sadar */}
          <div className="pt-6 border-t border-slate-300 space-y-4">
            <div className="p-2.5 rounded-lg bg-slate-100 print:bg-white text-center text-xs text-slate-700">
              <p className="font-semibold">
                Surat Perjanjian Sewa Menyewa ini dibuat dan disetujui secara sadar, tanpa paksaan, dan disepakati oleh kedua belah pihak.
              </p>
              {(order.agreementReadAndAcknowledged || acknowledged) && (
                <p className="text-emerald-700 font-bold mt-1">
                  ✓ Telah dibaca, dipahami, dan dicentang secara sadar oleh Penyewa ({order.customer.fullName}) pada {new Date(order.agreementAcknowledgedAt || Date.now()).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              {/* Pihak Pertama */}
              <div className="space-y-8">
                <p className="font-bold text-slate-900">PIHAK PERTAMA (Pemberi Sewa)</p>
                <div className="inline-block relative">
                  <span className="px-3 py-1 rounded border-2 border-emerald-600 text-emerald-700 font-extrabold text-[11px] tracking-wider uppercase inline-block rotate-[-3deg]">
                    ✓ RESMI DISETUJUI
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 underline">PINJAMLAPTOP.ID</p>
                  <p className="text-[11px] text-slate-500">Petugas Operasional Resmi</p>
                </div>
              </div>

              {/* Pihak Kedua */}
              <div className="space-y-8">
                <p className="font-bold text-slate-900">PIHAK KEDUA (Penyewa)</p>
                <div className="h-8 flex items-center justify-center">
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    ✓ DISETUJUI SECARA SADAR
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 underline">{order.customer.fullName}</p>
                  <p className="text-[11px] text-slate-500">NIK: {order.customer.idCardNumber || order.identityDocs?.doc1Number || '-'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Checkbox Persetujuan Sadar Wajib (Jika requireAcknowledgment = true) */}
        {requireAcknowledgment && (
          <div className="px-6 py-4 bg-amber-50 border-t-2 border-amber-300 print:hidden space-y-3">
            <div className="flex items-start gap-3">
              <input
                id="ack-checkbox-modal"
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded border-slate-400 focus:ring-blue-500 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="ack-checkbox-modal" className="text-xs sm:text-sm font-bold text-slate-900 leading-snug cursor-pointer select-none">
                SAYA TELAH MEMBACA DAN MENGETAHUI SELURUH ISI SURAT PERJANJIAN INI SECARA SADAR, tanpa paksaan dari pihak manapun, serta MENYETUJUI bahwa denda keterlambatan sebesar Rp 20.000 / 1 jam WAJIB DIBAYARKAN BAGAIMANAPUN SITUASINYA.
              </label>
            </div>
            {!acknowledged && (
              <p className="text-xs text-amber-800 font-medium pl-8">
                * Anda wajib membaca dan mencentang kotak di atas untuk menyelesaikan pesanan dan melanjutkan ke pelacakan.
              </p>
            )}
          </div>
        )}

        {/* Footer actions on screen (Hidden on print) */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              title="Akses langsung dialog printer atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Cetak Surat Perjanjian / Simpan PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!requireAcknowledgment ? (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Tutup Dokumen
              </button>
            ) : (
              <button
                disabled={!acknowledged}
                onClick={() => {
                  if (onAcknowledgeAndProceed) {
                    onAcknowledgeAndProceed();
                  } else {
                    onClose();
                  }
                }}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                  acknowledged
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <span>Saya Setuju & Lanjut ke Pelacakan</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
