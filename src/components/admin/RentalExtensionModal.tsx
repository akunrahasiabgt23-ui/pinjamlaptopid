import React, { useState } from 'react';
import { 
  CalendarPlus, X, Clock, Calendar, Laptop, 
  CheckCircle2, CreditCard, Sparkles, Tag, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { RentalOrder } from '../../types';
import { 
  formatRupiah, calculateExtensionPricing, extendOrderRental, 
  getStoredAdminSession 
} from '../../utils/storage';

interface RentalExtensionModalProps {
  order: RentalOrder;
  onClose: () => void;
  onSuccess: (updatedOrder: RentalOrder) => void;
}

export const RentalExtensionModal: React.FC<RentalExtensionModalProps> = ({
  order,
  onClose,
  onSuccess
}) => {
  const [selectedDays, setSelectedDays] = useState<number>(3);
  const [customDaysInput, setCustomDaysInput] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS (Terverifikasi)');
  const [adminNotes, setAdminNotes] = useState<string>('Customer meminta perpanjangan sewa via WhatsApp CS untuk kelanjutan proyek.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminSession = getStoredAdminSession();
  const adminName = adminSession ? `${adminSession.name} (${adminSession.roleTitle})` : 'Hendra Wijaya (Super Admin)';

  const currentEndDate = new Date(order.endDate);
  const daysToApply = isCustom ? (parseInt(customDaysInput, 10) || 1) : selectedDays;
  const pricing = calculateExtensionPricing(order.laptop, daysToApply);

  const newEndDate = new Date(currentEndDate.getTime() + daysToApply * 24 * 60 * 60 * 1000);

  const handleSelectPreset = (days: number) => {
    setIsCustom(false);
    setSelectedDays(days);
  };

  const handleCustomChange = (val: string) => {
    setCustomDaysInput(val);
    setIsCustom(true);
  };

  const handleConfirmExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (daysToApply <= 0) {
      alert('Tambahan hari perpanjangan minimal 1 hari.');
      return;
    }

    setIsSubmitting(true);
    const res = extendOrderRental(
      order.id,
      daysToApply,
      pricing.finalPrice,
      paymentMethod,
      adminNotes,
      adminName
    );

    setIsSubmitting(false);
    if (res.success && res.updatedOrder) {
      alert(`Berhasil! Masa sewa pesanan ${order.id} telah diperpanjang +${daysToApply} hari. Tanggal pengembalian baru: ${newEndDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`);
      onSuccess(res.updatedOrder);
      onClose();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Perpanjang Masa Sewa Customer
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">
                  #{order.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tambahkan durasi sewa pelanggan dengan perhitungan tarif yang berlaku otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Brief Info */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Penyewa / Customer</span>
              <p className="font-bold text-slate-900 text-sm">{order.customer.fullName}</p>
              <p className="text-slate-500">{order.customer.phone}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Laptop</span>
              <p className="font-bold text-slate-900 text-sm truncate">{order.laptop.name}</p>
              <p className="text-slate-500">
                Tarif Normal: <strong className="text-slate-700">{formatRupiah(order.laptop.dailyPrice)}/hari</strong>
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Durasi Berjalan Saat Ini: <strong>{order.durationDays} Hari</strong></span>
            </div>
            <div className="text-slate-700">
              Tenggat Saat Ini: <strong>{currentEndDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmExtension} className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Preset Buttons for "Harga yang Berlaku" */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                Pilih Durasi Tambahan (Harga yang Berlaku)
              </label>
              <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Tarif Resmi Pinjamlaptop
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset(1)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !isCustom && selectedDays === 1
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="font-bold text-sm block">+1 Hari</span>
                <span className="text-[11px] font-semibold text-blue-700 block mt-0.5">
                  {formatRupiah(order.laptop.dailyPrice)}
                </span>
                <span className="text-[10px] text-slate-400">Tarif harian normal</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(3)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !isCustom && selectedDays === 3
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="font-bold text-sm block">+3 Hari</span>
                <span className="text-[11px] font-semibold text-blue-700 block mt-0.5">
                  {formatRupiah(order.laptop.dailyPrice * 3)}
                </span>
                <span className="text-[10px] text-slate-400">Paket 3 hari kerja</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(7)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  !isCustom && selectedDays === 7
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="absolute top-1 right-1 text-[8px] font-extrabold bg-emerald-500 text-white px-1.5 py-0.2 rounded">
                  DISKON
                </span>
                <span className="font-bold text-sm block">+7 Hari (1 Mgg)</span>
                <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                  {formatRupiah(order.laptop.weeklyPrice)}
                </span>
                <span className="text-[10px] text-slate-400">Tarif mingguan hemat</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(30)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  !isCustom && selectedDays === 30
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="absolute top-1 right-1 text-[8px] font-extrabold bg-indigo-600 text-white px-1.5 py-0.2 rounded">
                  HEMAT 30%
                </span>
                <span className="font-bold text-sm block">+30 Hari (Bln)</span>
                <span className="text-[11px] font-semibold text-indigo-700 block mt-0.5">
                  {formatRupiah(order.laptop.monthlyPrice)}
                </span>
                <span className="text-[10px] text-slate-400">Tarif bulanan</span>
              </button>
            </div>

            {/* Custom Days Input */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Atau masukkan hari khusus:</span>
              <div className="relative w-32">
                <input
                  type="number"
                  min="1"
                  max="90"
                  placeholder="Contoh: 5"
                  value={customDaysInput}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isCustom ? 'border-blue-600 bg-blue-50 font-bold' : 'border-slate-300'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">hari</span>
              </div>
              {isCustom && (
                <span className="text-[10px] text-blue-700 font-semibold">
                  (Dihitung proporsional)
                </span>
              )}
            </div>
          </div>

          {/* Pricing & Extension Calculation Breakdown */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between font-bold text-blue-950 pb-2 border-b border-blue-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Rincian Biaya Perpanjangan (Harga Berlaku)
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-mono">
                +{daysToApply} Hari
              </span>
            </div>

            <div className="space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Tarif Rata-Rata / Hari:</span>
                <span className="font-semibold text-slate-900">{formatRupiah(pricing.ratePerDay)}/hari</span>
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Potongan Diskon Durasi:</span>
                  <span className="font-bold">- {formatRupiah(pricing.discount)}</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-blue-200 text-blue-950">
                <span>Total Biaya Perpanjangan:</span>
                <span className="text-base text-blue-700">{formatRupiah(pricing.finalPrice)}</span>
              </div>
            </div>

            {/* Date Extension Preview */}
            <div className="p-2.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Tenggat Sebelumnya</span>
                <span className="font-semibold text-slate-700">
                  {currentEndDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="text-right">
                <span className="text-emerald-700 font-bold block text-[10px]">Tenggat Pengembalian Baru</span>
                <span className="font-extrabold text-emerald-800 text-xs">
                  {newEndDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Metode Pembayaran Perpanjangan
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="QRIS (Terverifikasi)">QRIS Dinamis (Terbayar)</option>
                <option value="Transfer BCA Virtual Account">Transfer BCA VA</option>
                <option value="Transfer Mandiri Virtual Account">Transfer Mandiri VA</option>
                <option value="Tunai di Store Hub">Tunai / Debit di Store Hub</option>
                <option value="Billing Tagihan Perusahaan">Billing Invoice Korporat</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Dicatat Oleh Administrator
              </label>
              <input
                type="text"
                value={adminName}
                readOnly
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Catatan Admin / Keterangan Perpanjangan
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Contoh: Perpanjangan disetujui via WhatsApp CS untuk event"
              className="w-full p-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              disabled={isSubmitting || daysToApply <= 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi Perpanjang ({formatRupiah(pricing.finalPrice)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
