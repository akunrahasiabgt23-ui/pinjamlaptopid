import React, { useState } from 'react';
import { RentalOrder } from '../../types';
import { formatRupiah } from '../../utils/erpStorage';
import { Printer, X, FileText, CheckCircle2, ShieldCheck, Download, Sparkles } from 'lucide-react';

interface RentalContractPrintViewProps {
  order: RentalOrder | null;
  isOpen: boolean;
  onClose: () => void;
  defaultDocType?: 'contract' | 'handover_form';
}

export const RentalContractPrintView: React.FC<RentalContractPrintViewProps> = ({
  order,
  isOpen,
  onClose,
  defaultDocType = 'contract'
}) => {
  const [docType, setDocType] = useState<'contract' | 'handover_form'>(defaultDocType);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const branchAddress = 
    order.branchCity === 'Malang' ? 'Jl. Taman Borobudur Indah B-20, Lowokwaru, Kota Malang (Pusat) • Telp: 0877-2556-4455' :
    order.branchCity === 'Sidoarjo' ? 'Jl. Ahmad Yani No. 88, Sidoarjo (Melayani Sidoarjo & Surabaya) • Telp: 0812-3344-9988' :
    'Jl. Boulevard Hijau No. 12, Harapan Indah, Kota Bekasi • Telp: 0819-7788-2233';

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-[#e5dfd5] shadow-2xl max-w-4xl w-full my-auto flex flex-col max-h-[95vh] text-stone-900">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-3.5 border-b border-[#e8e2d8] flex flex-wrap items-center justify-between gap-3 bg-[#faf8f5] print:hidden rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#eef4fc] text-[#1e5488] border border-[#cee0f7]">
              {order.transactionNumber}
            </span>
            <span className="text-xs text-stone-500 font-medium">Cabang {order.branchCity}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#f3efe8] p-0.5 rounded-lg border border-[#e5dfd5] text-xs font-medium">
              <button
                type="button"
                onClick={() => setDocType('contract')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  docType === 'contract' 
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Surat Perjanjian Sewa (Kuat Hukum)
              </button>
              <button
                type="button"
                onClick={() => setDocType('handover_form')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  docType === 'handover_form' 
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. Form Checklist Serah Terima
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#ede8df] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white font-sans text-xs print:p-0 print:overflow-visible">
          
          {/* ======================================================== */}
          {/* DOCUMENT 1: SURAT PERJANJIAN SEWA MENYEWA LAPTOP        */}
          {/* ======================================================== */}
          {docType === 'contract' && (
            <div className="space-y-4 max-w-3xl mx-auto leading-relaxed text-stone-900">
              {/* Header / Kop Surat */}
              <div className="text-center pb-3 border-b-2 border-stone-800">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h1 className="text-base font-extrabold tracking-tight uppercase text-stone-900">PINJAMLAPTOP.ID</h1>
                    <p className="text-[10px] text-stone-500 font-mono">Pusat Persewaan Laptop Korporat, Bisnis & Edukasi</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 border border-stone-300 font-bold">
                      NO: {order.transactionNumber}
                    </span>
                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">Tanggal: {order.createdAt}</p>
                  </div>
                </div>
                <p className="text-[10px] text-stone-600 mt-2 text-center border-t border-stone-200 pt-1">
                  {branchAddress}
                </p>
              </div>

              {/* Judul Perjanjian */}
              <div className="text-center py-2">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
                  SURAT PERJANJIAN SEWA MENYEWA UNIT LAPTOP
                </h2>
                <p className="text-[11px] font-mono text-stone-600">Nomor Registrasi Kontrak: {order.transactionNumber}</p>
              </div>

              <p className="text-[11.5px] text-stone-700 leading-normal text-justify">
                Pada hari ini, tanggal <span className="font-semibold">{order.createdAt}</span>, bertempat di Kantor Operasional <span className="font-semibold">PINJAMLAPTOP.ID Cabang {order.branchCity}</span>, telah dibuat dan disepakati perjanjian sewa-menyewa oleh dan antara para pihak di bawah ini:
              </p>

              {/* Komparisi Para Pihak */}
              <div className="space-y-2.5 bg-[#faf8f5] p-3 rounded-lg border border-[#e5dfd5]">
                <div className="text-[11px]">
                  <span className="font-bold text-stone-900">I. PIHAK PERTAMA (Yang Menyewakan):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 pl-3 text-stone-700 font-mono text-[11px]">
                    <div>Nama Instansi: <span className="font-semibold text-stone-900">PINJAMLAPTOP.ID</span></div>
                    <div>Cabang Layanan: <span className="font-semibold text-stone-900">{order.branchCity}</span></div>
                    <div>Staf Representatif: <span className="font-semibold text-stone-900">{order.staffName}</span></div>
                    <div>Alamat Cabang: <span className="font-semibold text-stone-900">{branchAddress.split('•')[0]}</span></div>
                  </div>
                  <p className="text-[10.5px] text-stone-500 italic mt-0.5 pl-3">
                    Bertindak sah untuk dan atas nama PINJAMLAPTOP.ID, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
                  </p>
                </div>

                <div className="border-t border-[#e8e2d8] pt-2 text-[11px]">
                  <span className="font-bold text-stone-900">II. PIHAK KEDUA (Penyewa):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 pl-3 text-stone-700 font-mono text-[11px]">
                    <div>Nama Lengkap: <span className="font-semibold text-stone-900">{order.customerName}</span></div>
                    <div>No. KTP / Paspor: <span className="font-semibold text-stone-900">{order.firstIdNumber}</span></div>
                    <div>Nomor Telepon/WA: <span className="font-semibold text-stone-900">{order.phone}</span></div>
                    <div>Sosial Media: <span className="font-semibold text-stone-900">{order.socialMedia || '-'}</span></div>
                    <div className="sm:col-span-2">Alamat KTP: <span className="font-semibold text-stone-900">{order.ktpAddress}</span></div>
                    <div className="sm:col-span-2">Alamat Domisili: <span className="font-semibold text-stone-900">{order.domicileAddress}</span></div>
                    <div>Kontak Darurat: <span className="font-semibold text-stone-900">{order.emergencyContactName} ({order.emergencyContactRelation})</span></div>
                    <div>Telp Darurat: <span className="font-semibold text-stone-900">{order.emergencyContactPhone}</span></div>
                  </div>
                  <p className="text-[10.5px] text-stone-500 italic mt-0.5 pl-3">
                    Bertindak atas nama pribadi, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
                  </p>
                </div>
              </div>

              {/* Unit dan Kesepakatan Harga & Durasi */}
              <div className="border border-stone-300 rounded-lg overflow-hidden text-[11px]">
                <div className="bg-stone-100 font-semibold px-3 py-1.5 border-b border-stone-300 flex justify-between">
                  <span>RINCIAN UNIT LAPTOP & KETENTUAN SEWA</span>
                  <span className="font-mono text-stone-600">SKU: {order.laptopSku}</span>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-stone-500 block text-[10px]">Tipe Laptop:</span>
                    <span className="font-bold text-stone-900">{order.laptopBrand} {order.laptopName}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Nomor Seri / SN:</span>
                    <span className="font-bold text-stone-900">{order.serialNumber || 'SN-VERIFIED-UNIT'}</span>
                  </div>
                  <div className="sm:col-span-2 text-[10.5px]">
                    <span className="text-stone-500 block text-[10px]">Spesifikasi Teknis:</span>
                    <span className="text-stone-800">
                      CPU: {order.processor} &bull; RAM: {order.ram} &bull; Storage: {order.storage} &bull; GPU: {order.gpu}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Jangka Waktu Sewa:</span>
                    <span className="font-bold text-stone-900">{order.durationDays} Hari ({order.startDate} s/d {order.endDate})</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Total Biaya Sewa:</span>
                    <span className="font-bold text-stone-900 text-xs">{formatRupiah(order.totalRentalPrice)} (LUNAS)</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Bentuk Jaminan / Deposit:</span>
                    <span className="font-bold text-stone-800">
                      {order.guaranteeType === 'two_identities' 
                        ? `2 Dokumen (${order.firstIdType} & ${order.secondIdType})`
                        : `Deposit Tunai ${formatRupiah(order.depositAmount)}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Estimasi Nilai Unit:</span>
                    <span className="font-bold text-stone-900">{formatRupiah(order.unitValueEstimate || 10000000)}</span>
                  </div>
                </div>
              </div>

              {/* PASAL-PASAL HUKUM KUAT */}
              <div className="space-y-2 text-[11px] text-justify text-stone-800">
                <p className="text-[11px] italic text-stone-600">
                  Kedua belah pihak sepakat mengikatkan diri dalam Perjanjian Sewa Menyewa ini dengan syarat dan ketentuan pasal-pasal berikut:
                </p>

                {/* PASAL 1 */}
                <div>
                  <h3 className="font-bold text-stone-900 text-xs">PASAL 1 : HAK KEPEMILIKAN MUTLAK</h3>
                  <p className="mt-0.5">
                    1. Unit laptop dan seluruh aksesoris bawaannya (adaptor charger, tas laptop, mouse, dan lisensi software) adalah <strong>MILIK MUTLAK DAN SAH PIHAK PERTAMA</strong>. Perjanjian ini semata-mata merupakan pemberian hak pakai pakai sementara (sewa), dan tidak sekali-kali mengalihkan hak kepemilikan kepada PIHAK KEDUA dalam bentuk apa pun.
                  </p>
                </div>

                {/* PASAL 2 */}
                <div>
                  <h3 className="font-bold text-stone-900 text-xs">PASAL 2 : SERAH TERIMA, KONDISI FISIK, & RISIKO</h3>
                  <p className="mt-0.5">
                    1. PIHAK KEDUA telah menguji coba dan memeriksa fungsi, kelayakan, serta fisik unit secara seksama sebelum menandatangani perjanjian ini dalam kondisi baik dan normal.
                  </p>
                  <p className="mt-0.5">
                    2. Terhitung sejak saat penyerahan unit hingga pengembalian resmi kepada PIHAK PERTAMA, <strong>seluruh risiko kerusakan (termasuk layar retak, terkena cairan, terbakar, jatuh), malfungsi, maupun kehilangan unit menjadi beban dan tanggung jawab penuh PIHAK KEDUA</strong>.
                  </p>
                  <p className="mt-0.5">
                    3. Apabila terjadi kehilangan unit atau kerusakan total (total lost), PIHAK KEDUA wajib mengganti dengan unit berspesifikasi identik atau membayar ganti rugi penuh sebesar Estimasi Nilai Unit yang disepakati ({formatRupiah(order.unitValueEstimate || 10000000)}).
                  </p>
                </div>

                {/* PASAL 3 */}
                <div>
                  <h3 className="font-bold text-stone-900 text-xs">PASAL 3 : BIAYA SEWA & PEMBAYARAN</h3>
                  <p className="mt-0.5">
                    1. Biaya sewa unit laptop wajib dibayar lunas di muka sebelum unit diserahterimakan kepada PIHAK KEDUA.
                  </p>
                  <p className="mt-0.5">
                    2. Pembayaran sewa yang sah hanya yang disertai tanda terima kasir atau bukti transfer ke rekening bank resmi PIHAK PERTAMA.
                  </p>
                </div>

                {/* PASAL 4 */}
                <div>
                  <h3 className="font-bold text-stone-900 text-xs">PASAL 4 : BATAS WAKTU PENGEMBALIAN & DENDA RP 20.000 / JAM</h3>
                  <p className="mt-0.5">
                    1. PIHAK KEDUA wajib mengembalikan unit laptop selambat-lambatnya pada tanggal <strong>{order.endDate} pukul 18.00 WIB</strong> di kantor cabang PIHAK PERTAMA.
                  </p>
                  <p className="mt-0.5">
                    2. Apabila terjadi keterlambatan pengembalian tanpa adanya persetujuan perpanjangan sewa resmi secara tertulis, maka PIHAK KEDUA dikenakan <strong>denda keterlambatan sebesar Rp 20.000,- (dua puluh ribu rupiah) per jam</strong> yang dihitung otomatis sejak jam jatuh tempo hingga unit diserahkan kembali.
                  </p>
                </div>

                {/* PASAL 5 */}
                <div>
                  <h3 className="font-bold text-stone-900 text-xs">PASAL 5 : LARANGAN PEMINDAHTANGANAN & TINDAK PIDANA PASAL 372 KUHP</h3>
                  <p className="mt-0.5">
                    1. PIHAK KEDUA <strong>DILARANG KERAS</strong> menyewakan kembali (sub-lease), meminjamkan, menggadaikan, menjual, memindahtangankan, membongkar sparepart internal, atau mengagunkan unit laptop kepada pihak ketiga mana pun tanpa seizin tertulis PIHAK PERTAMA.
                  </p>
                  <p className="mt-0.5">
                    2. Segala bentuk pengalihan hak, penggadaian, atau penolakan pengembalian unit laptop merupakan <strong>TINDAK PIDANA PENGGELAPAN sebagaimana dimaksud dalam Pasal 372 KUHP</strong> dan/atau Penipuan Pasal 378 KUHP, dan PIHAK PERTAMA berhak langsung melaporkan kepada Kepolisian Republik Indonesia tanpa kewajiban melayangkan somasi terlebih dahulu.
                  </p>
                </div>

                {/* PASAL 6 */}
                <div>
                  <h3 className="font-bold text-stone-900 text-xs">PASAL 6 : WANPRESTASI & PENYELESAIAN SENGKETA</h3>
                  <p className="mt-0.5">
                    1. Apabila PIHAK KEDUA melanggar salah satu butir dalam perjanjian ini, maka PIHAK KEDUA dinyatakan telah melakukan <strong>WANPRESTASI</strong>, dan PIHAK PERTAMA berhak menyita/menarik unit sewaktu-waktu dan menahan jaminan identitas/deposit untuk pelunasan kerugian.
                  </p>
                  <p className="mt-0.5">
                    2. Mengenai perjanjian ini dan segala akibat hukumnya, kedua belah pihak sepakat memilih tempat kedudukan hukum (domisili) yang umum dan tetap di Kantor Kepaniteraan Pengadilan Negeri wilayah cabang bersangkutan (Pengadilan Negeri Malang / Sidoarjo / Bekasi).
                  </p>
                </div>
              </div>

              {/* Tanda Tangan Para Pihak */}
              <div className="pt-4 border-t border-stone-300 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="font-semibold text-stone-900">PIHAK PERTAMA (Yang Menyewakan)</div>
                  <div className="text-[11px] text-stone-500 font-mono">PINJAMLAPTOP.ID Cabang {order.branchCity}</div>
                  <div className="h-20 flex items-center justify-center text-stone-400 font-mono text-[10px] italic">
                    ( Tanda Tangan & Cap Stempel )
                  </div>
                  <div className="font-bold underline text-stone-900">{order.staffName}</div>
                  <div className="text-[10px] text-stone-500">Staf Operasional / Kasir</div>
                </div>

                <div>
                  <div className="font-semibold text-stone-900">PIHAK KEDUA (Penyewa)</div>
                  <div className="text-[11px] text-stone-500 font-mono">Setuju & Tunduk pada Seluruh Pasal</div>
                  <div className="h-20 flex items-center justify-center text-stone-400 font-mono text-[10px] italic border border-dashed border-stone-300 w-32 mx-auto rounded">
                    Materai Rp 10.000<br/>& Tanda Tangan
                  </div>
                  <div className="font-bold underline text-stone-900">{order.customerName}</div>
                  <div className="text-[10px] text-stone-500 font-mono">NIK: {order.firstIdNumber}</div>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-stone-200 text-[10px] text-stone-400 font-mono">
                Lembar 1: Arsip Usaha &bull; Lembar 2: Pegangan Penyewa &bull; Digenerate resmi oleh PINJAMLAPTOP ERP
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* DOCUMENT 2: FORM SEWA & CHECKLIST SERAH TERIMA UNIT      */}
          {/* ======================================================== */}
          {docType === 'handover_form' && (
            <div className="space-y-4 max-w-3xl mx-auto leading-relaxed text-stone-900">
              {/* Header */}
              <div className="text-center pb-3 border-b-2 border-stone-800">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h1 className="text-base font-extrabold tracking-tight uppercase text-stone-900">PINJAMLAPTOP.ID</h1>
                    <p className="text-[10px] text-stone-500 font-mono">Formulir Resmi Serah Terima & Checklist Kelengkapan Unit</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-100 border border-stone-300">
                      {order.transactionNumber}
                    </span>
                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">Cabang {order.branchCity}</p>
                  </div>
                </div>
              </div>

              <div className="text-center py-1">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-stone-900">
                  LEMBAR FORM SEWA & CHECKLIST FISIK LAPTOP
                </h2>
                <p className="text-[11px] text-stone-500 font-mono">Digunakan saat Penyerahan (Keluar) dan Pengembalian (Masuk)</p>
              </div>

              {/* Data Order & Penyewa */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 font-mono text-[11px]">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Data Penyewa</span>
                  <div className="font-bold text-stone-900 font-sans text-xs">{order.customerName}</div>
                  <div className="text-stone-600">No. HP: {order.phone}</div>
                  <div className="text-stone-600">Alamat: {order.domicileAddress}</div>
                  <div className="text-stone-600">Sosial Media: {order.socialMedia || '-'}</div>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Data Transaksi & Periode</span>
                  <div>Mulai Sewa: <span className="font-bold text-stone-900">{order.startDate}</span></div>
                  <div>Wajib Kembali: <span className="font-bold text-stone-900">{order.endDate} (Maks 18:00 WIB)</span></div>
                  <div>Durasi: <span className="font-bold text-stone-900">{order.durationDays} Hari</span></div>
                  <div>Tarif Sewa: <span className="font-bold text-stone-900">{formatRupiah(order.totalRentalPrice)}</span></div>
                </div>
              </div>

              {/* Rincian Unit */}
              <div className="border border-stone-300 rounded-lg overflow-hidden text-[11px]">
                <div className="bg-stone-100 font-semibold px-3 py-1 border-b border-stone-300">
                  IDENTITAS PERANGKAT LAPTOP
                </div>
                <div className="p-3 grid grid-cols-3 gap-2 font-mono">
                  <div>
                    <span className="text-stone-500 block text-[10px]">SKU:</span>
                    <span className="font-bold text-stone-900">{order.laptopSku}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Tipe:</span>
                    <span className="font-bold text-stone-900">{order.laptopBrand} {order.laptopName}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Serial Number:</span>
                    <span className="font-bold text-stone-900">{order.serialNumber || 'SN-VERIFIED'}</span>
                  </div>
                </div>
              </div>

              {/* Tabel Checklist Kelengkapan & Kondisi Fisik */}
              <div className="border border-stone-300 rounded-lg overflow-hidden text-[11px]">
                <div className="bg-stone-100 font-semibold px-3 py-1 border-b border-stone-300">
                  CHECKLIST SERAH TERIMA & KONDISI
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-mono uppercase text-stone-600">
                      <th className="py-2 px-3">Item Pemeriksaan</th>
                      <th className="py-2 px-3">Saat Diserahkan (Keluar)</th>
                      <th className="py-2 px-3">Saat Dikembalikan (Masuk)</th>
                      <th className="py-2 px-3">Catatan Kondisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-mono text-[11px]">
                    <tr>
                      <td className="py-2 px-3 font-semibold">1. Unit Laptop (Fisik, LCD, Keyboard)</td>
                      <td className="py-2 px-3 text-emerald-700 font-semibold">[ V ] Normal Prima</td>
                      <td className="py-2 px-3 text-stone-400">[ &nbsp; ] Normal / Trouble</td>
                      <td className="py-2 px-3 font-sans text-[10px] text-stone-600">{order.physicalNotes || 'Kondisi mulus'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">2. Charger / Adaptor Original</td>
                      <td className="py-2 px-3">{order.chargerIncluded ? '[ V ] Lengkap Asli' : '[ - ] Tidak Disertakan'}</td>
                      <td className="py-2 px-3 text-stone-400">[ &nbsp; ] Lengkap Asli</td>
                      <td className="py-2 px-3 text-stone-500 text-[10px] font-sans">Kabel utuh tanpa sobekan</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">3. Tas Laptop Pelindung</td>
                      <td className="py-2 px-3">{order.bagIncluded ? '[ V ] Lengkap Bersih' : '[ - ] Tidak Disertakan'}</td>
                      <td className="py-2 px-3 text-stone-400">[ &nbsp; ] Lengkap Bersih</td>
                      <td className="py-2 px-3 text-stone-500 text-[10px] font-sans">Busa tebal anti benturan</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">4. Mouse</td>
                      <td className="py-2 px-3">{order.mouseIncluded ? '[ V ] Berfungsi Baik' : '[ - ] Tidak Disertakan'}</td>
                      <td className="py-2 px-3 text-stone-400">[ &nbsp; ] Berfungsi Baik</td>
                      <td className="py-2 px-3 text-stone-500 text-[10px] font-sans">Klik & scroll normal</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">5. Jaminan yang Ditahan</td>
                      <td className="py-2 px-3 font-sans text-stone-900">
                        {order.guaranteeType === 'two_identities' 
                          ? `2 ID: ${order.firstIdType} (${order.firstIdNumber}) & ${order.secondIdType} (${order.secondIdNumber})`
                          : `Deposit Uang Tunai: ${formatRupiah(order.depositAmount)}`}
                      </td>
                      <td className="py-2 px-3 text-stone-400">[ &nbsp; ] Dikembalikan Lengkap</td>
                      <td className="py-2 px-3 text-stone-500 text-[10px] font-sans">Disimpan aman di brankas toko</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan Serah Terima */}
              <div className="pt-3 border-t border-stone-300 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="border border-stone-200 p-2.5 rounded-lg">
                  <div className="font-bold text-stone-900">SAAT UNIT KELUAR (SEWA DIMULAI)</div>
                  <div className="text-[10px] text-stone-500 font-mono">Tgl: {order.startDate}</div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10.5px]">
                    <div>
                      <div className="h-12 border-b border-stone-300 flex items-end justify-center pb-1 font-bold">
                        {order.staffName}
                      </div>
                      <span className="text-[10px] text-stone-500">Staf Penyerah</span>
                    </div>
                    <div>
                      <div className="h-12 border-b border-stone-300 flex items-end justify-center pb-1 font-bold">
                        {order.customerName}
                      </div>
                      <span className="text-[10px] text-stone-500">Penyewa (Penerima Unit)</span>
                    </div>
                  </div>
                </div>

                <div className="border border-stone-200 p-2.5 rounded-lg bg-stone-50/50">
                  <div className="font-bold text-stone-900">SAAT UNIT KEMBALI (SEWA SELESAI)</div>
                  <div className="text-[10px] text-stone-500 font-mono">Diisi Saat Laptop Kembali ke Toko</div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10.5px]">
                    <div>
                      <div className="h-12 border-b border-stone-300 flex items-end justify-center pb-1 text-stone-400 italic">
                        ( .......................... )
                      </div>
                      <span className="text-[10px] text-stone-500">Penyewa yang Mengembalikan</span>
                    </div>
                    <div>
                      <div className="h-12 border-b border-stone-300 flex items-end justify-center pb-1 text-stone-400 italic">
                        ( .......................... )
                      </div>
                      <span className="text-[10px] text-stone-500">Staf Pemeriksa (Penerima)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-stone-400 font-mono">
                PINJAMLAPTOP.ID &bull; Dokumen sah operasional sewa laptop &bull; Denda Keterlambatan Rp 20.000 / Jam
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
