import React, { useState } from 'react';
import { 
  ShieldAlert, X, AlertTriangle, CheckCircle2, 
  RotateCcw, Ban, FileWarning, DollarSign 
} from 'lucide-react';
import { RentalOrder } from '../../types';
import { formatRupiah, rejectAndCancelOrder, getStoredAdminSession } from '../../utils/storage';

interface RejectOrderModalProps {
  order: RentalOrder;
  onClose: () => void;
  onSuccess: () => void;
}

export const RejectOrderModal: React.FC<RejectOrderModalProps> = ({
  order,
  onClose,
  onSuccess
}) => {
  const [rejectType, setRejectType] = useState<'forfeit_100' | 'refund_cancel'>('forfeit_100');
  const [reasonPreset, setReasonPreset] = useState<string>(
    'Dokumen 2 identitas fisik yang diserahkan/diunggah palsu, fiktif, atau rekayasa digital.'
  );
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminSession = getStoredAdminSession();
  const adminName = adminSession ? `${adminSession.name} (${adminSession.roleTitle})` : 'Hendra Wijaya (Super Admin)';

  const finalReason = customReason.trim() ? customReason.trim() : reasonPreset;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalReason) {
      alert('Silakan pilih atau masukkan alasan penolakan pesanan.');
      return;
    }

    const isForfeit = rejectType === 'forfeit_100';

    setIsSubmitting(true);
    const res = rejectAndCancelOrder(order.id, finalReason, isForfeit, adminName);
    setIsSubmitting(false);

    if (res.success) {
      alert(res.message);
      onSuccess();
      onClose();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-rose-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Tolak / Batalkan Pesanan Sewa
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white">
                  #{order.id}
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5">
                Pilih dasar penolakan pesanan sesuai SOP keamanan & kebijakan Pinjamlaptop.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-rose-950/50 text-rose-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Details Preview */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Customer</span>
              <span className="font-bold text-slate-900">{order.customer.fullName}</span>
              <span className="text-slate-500 block">{order.customer.phone}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Unit & Transaksi</span>
              <span className="font-bold text-slate-900 truncate block">{order.laptop.name}</span>
              <span className="text-rose-700 font-extrabold">{formatRupiah(order.pricing.totalPaid)}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Kategori Tindakan Penolakan
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectType('forfeit_100');
                  setReasonPreset('Dokumen 2 identitas fisik yang diserahkan/diunggah palsu, fiktif, atau rekayasa digital.');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  rejectType === 'forfeit_100'
                    ? 'border-rose-600 bg-rose-50 text-rose-950 ring-2 ring-rose-500/20 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-rose-700 mb-1">
                  <Ban className="w-4 h-4" />
                  <span>Tolak: Hangus 100%</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Untuk data identitas palsu/fiktif/menolak jaminan. Dana transaksi dinyatakan HANGUS 100%.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRejectType('refund_cancel');
                  setReasonPreset('Unit laptop mengalami kendala teknis saat QC inspeksi dan penyewa setuju pembatalan refund.');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  rejectType === 'refund_cancel'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-blue-700 mb-1">
                  <RotateCcw className="w-4 h-4" />
                  <span>Tolak & Refund Dana</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pembatalan administratif / kendala unit internal. Dana sewa dikembalikan (refund).
                </p>
              </button>
            </div>
          </div>

          {/* Alasan Penolakan Preset */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Pilih Alasan Penolakan Standar
            </label>

            {rejectType === 'forfeit_100' ? (
              <select
                value={reasonPreset}
                onChange={(e) => setReasonPreset(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-rose-500"
              >
                <option value="Dokumen 2 identitas fisik yang diserahkan/diunggah palsu, fiktif, atau rekayasa digital.">
                  Dokumen identitas palsu / fiktif / rekayasa digital (SOP Pelanggaran Berat)
                </option>
                <option value="Nama pada KTP/SIM/BPKB tidak cocok dengan pemesan dan tidak memiliki surat kuasa resmi.">
                  Identitas bukan milik pemesan dan tanpa surat kuasa sah
                </option>
                <option value="Penyewa menolak menitipkan 2 identitas asli atau uang jaminan deposit saat serah terima.">
                  Penyewa menolak menitipkan jaminan resmi saat unit diantarkan/diambil
                </option>
                <option value="Terindikasi penipuan / riwayat buruk penggelapan perangkat elektronik.">
                  Terindikasi risiko fraud / masuk daftar hitam sistem persewaan
                </option>
              </select>
            ) : (
              <select
                value={reasonPreset}
                onChange={(e) => setReasonPreset(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-blue-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Unit laptop mengalami kendala teknis saat QC inspeksi dan penyewa setuju pembatalan refund.">
                  Unit tidak lolos inspeksi QC internal sebelum pengiriman (Refund 100%)
                </option>
                <option value="Lokasi alamat pengiriman berada di luar jangkauan operasional armada kurir khusus.">
                  Alamat pengiriman di luar jangkauan operasional armada khusus
                </option>
                <option value="Permintaan pembatalan pesanan disepakati atas konfirmasi customer sebelum unit dikirim.">
                  Permintaan pembatalan sepihak oleh penyewa sebelum proses persiapan
                </option>
              </select>
            )}
          </div>

          {/* Keterangan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Catatan / Alasan Kustom Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Tambahkan catatan rinci kronologi penolakan oleh admin..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-400 focus:outline-none"
            />
          </div>

          {/* Notice Box */}
          <div className={`p-3 rounded-xl flex items-start gap-2.5 text-[11px] ${
            rejectType === 'forfeit_100'
              ? 'bg-rose-50 border border-rose-200 text-rose-900'
              : 'bg-blue-50 border border-blue-200 text-blue-900'
          }`}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {rejectType === 'forfeit_100' ? 'Konsekuensi Hukum Klausul Hangus 100%' : 'Catatan Refund'}
              </span>
              <p className="mt-0.5 leading-relaxed">
                {rejectType === 'forfeit_100'
                  ? `Seluruh dana transaksi sebesar ${formatRupiah(order.pricing.totalPaid)} tidak dikembalikan dan dicatat dalam Neraca Keuangan sebagai Penerimaan Dana Hangus Klausul Pelanggaran.`
                  : `Pesanan akan diubah menjadi status Dibatalkan dan dana transaksi sebesar ${formatRupiah(order.pricing.totalPaid)} akan diproses refund.`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                rejectType === 'forfeit_100'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <Ban className="w-4 h-4" />
              <span>
                {rejectType === 'forfeit_100' ? 'Konfirmasi Tolak & Hangus 100%' : 'Konfirmasi Batalkan Pesanan'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
