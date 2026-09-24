import React, { useState } from 'react';
import { 
  Banknote, TrendingUp, ShieldCheck, ArrowDownRight, 
  CalendarPlus, Truck, AlertCircle, RefreshCw, Printer, 
  Search, Filter, CheckCircle2, Clock, FileSpreadsheet, 
  Sparkles, DollarSign, ArrowUpRight 
} from 'lucide-react';
import { RentalOrder, FinancialInflowItem, FinancialLedgerSummary } from '../../types';
import { getFinancialLedgerData, formatRupiah } from '../../utils/storage';

interface AdminFinancialLedgerProps {
  orders: RentalOrder[];
  onRefresh: () => void;
}

export const AdminFinancialLedger: React.FC<AdminFinancialLedgerProps> = ({
  orders,
  onRefresh
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const { items, summary } = getFinancialLedgerData(orders);

  const filteredItems = items.filter((item) => {
    const matchCategory = 
      categoryFilter === 'all' 
        ? true 
        : categoryFilter === 'rental_all'
        ? item.category === 'rental_fee' || item.category === 'extension_fee'
        : item.category === categoryFilter;

    const matchQuery = 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.laptopName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchQuery;
  });

  const handleCopySummary = () => {
    const text = `=== NERACA KEUANGAN MASUK - PINJAMLAPTOP ===
Dicetak: ${new Date().toLocaleString('id-ID')} WIB
--------------------------------------------------
Total Arus Kas Masuk Bruto : ${formatRupiah(summary.grossInflow)}
Pendapatan Sewa Bersih    : ${formatRupiah(summary.netRentalRevenue)}
  • Sewa Pokok            : ${formatRupiah(summary.netRentalRevenue - summary.extensionRevenue)}
  • Perpanjangan Customer : ${formatRupiah(summary.extensionRevenue)}
Titipan Jaminan Deposit    : ${formatRupiah(summary.activeDepositsHeld)} (Ditahan) / ${formatRupiah(summary.refundedDeposits)} (Dicairkan)
Dana Hangus 100%          : ${formatRupiah(summary.forfeitedRevenue)}
Biaya Kurir Pengiriman     : ${formatRupiah(summary.deliveryFeesCollected)}
Denda Keterlambatan       : ${formatRupiah(summary.lateFeesCollected)}
Total Transaksi Masuk     : ${summary.totalTransactionsCount} item
==================================================`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Neraca Keuangan */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
              LEDGER KEUANGAN REAL-TIME
            </span>
            <span className="text-xs text-slate-400">Pusat Akuntansi Kas Masuk</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Banknote className="w-7 h-7 text-emerald-400" />
            <span>Neraca Keuangan Masuk</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Pencatatan mutasi kas masuk secara transparan: pendapatan sewa, perpanjangan sewa customer sesuai harga berlaku, uang jaminan deposit yang ditahan, denda sewa, dan dana hangus.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Neraca"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Ringkasan Neraca</span>
          </button>
        </div>
      </div>

      {/* Main KPI Matrix (Neraca Saldo Kas Masuk) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Gross Cash Inflow */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Kas Masuk Bruto
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block tracking-tight">
            {formatRupiah(summary.grossInflow)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Akumulasi seluruh transaksi terbayar
          </span>
        </div>

        {/* KPI 2: Pendapatan Sewa Bersih */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pendapatan Sewa Laptop
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 block tracking-tight">
            {formatRupiah(summary.netRentalRevenue)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Termasuk sewa pokok & perpanjangan
          </span>
        </div>

        {/* KPI 3: Khusus Perpanjangan Customer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-900 uppercase tracking-wider">
              Pendapatan Perpanjangan
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <CalendarPlus className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-blue-700 block tracking-tight">
            {formatRupiah(summary.extensionRevenue)}
          </span>
          <span className="text-[10px] text-blue-800/80 mt-1 block font-medium">
            Dari perpanjangan durasi customer
          </span>
        </div>

        {/* KPI 4: Uang Jaminan Deposit Ditahan */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Deposit Ditahan (Escrow)
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-amber-600 block tracking-tight">
            {formatRupiah(summary.activeDepositsHeld)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Dicairkan kembali saat unit kembali mulus
          </span>
        </div>
      </div>

      {/* Sub-KPI Secondary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Deposit Telah Dikembalikan</span>
            <span className="text-sm font-bold text-slate-800">{formatRupiah(summary.refundedDeposits)}</span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Dana Hangus 100% (Pelanggaran)</span>
            <span className="text-sm font-bold text-rose-600">{formatRupiah(summary.forfeitedRevenue)}</span>
          </div>
          <AlertCircle className="w-4 h-4 text-rose-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Biaya Kurir Pengiriman</span>
            <span className="text-sm font-bold text-indigo-600">{formatRupiah(summary.deliveryFeesCollected)}</span>
          </div>
          <Truck className="w-4 h-4 text-indigo-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Denda Keterlambatan</span>
            <span className="text-sm font-bold text-amber-600">{formatRupiah(summary.lateFeesCollected)}</span>
          </div>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Semua Mutasi ({items.length})
            </button>

            <button
              onClick={() => setCategoryFilter('extension_fee')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                categoryFilter === 'extension_fee'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
              }`}
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Perpanjangan Customer</span>
            </button>

            <button
              onClick={() => setCategoryFilter('rental_all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                categoryFilter === 'rental_all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
              }`}
            >
              Pendapatan Sewa
            </button>

            <button
              onClick={() => setCategoryFilter('deposit')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                categoryFilter === 'deposit'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
              }`}
            >
              Titipan Deposit
            </button>

            <button
              onClick={() => setCategoryFilter('forfeited')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                categoryFilter === 'forfeited'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800'
              }`}
            >
              Dana Hangus 100%
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi / customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">ID Transaksi & Waktu</th>
                <th className="py-3 px-4">Penyewa / Order</th>
                <th className="py-3 px-4">Kategori Mutasi</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4">Status Kas</th>
                <th className="py-3 px-4 text-right">Nominal Masuk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{item.id}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })} WIB
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{item.customerName}</span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="font-mono text-blue-600 font-semibold">{item.orderId}</span>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">{item.laptopName}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.category === 'extension_fee'
                        ? 'bg-blue-100 text-blue-800'
                        : item.category === 'rental_fee'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.category === 'deposit'
                        ? 'bg-amber-100 text-amber-900'
                        : item.category === 'forfeited'
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {item.category === 'extension_fee' && <CalendarPlus className="w-3 h-3" />}
                      {item.categoryLabel}
                    </span>
                    {item.notes && (
                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[200px]">
                        {item.notes}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px]">
                      {item.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {item.status === 'received' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kas Masuk</span>
                      </span>
                    )}
                    {item.status === 'held_deposit' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Ditahan di Escrow</span>
                      </span>
                    )}
                    {item.status === 'refunded_deposit' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Telah Dicairkan</span>
                      </span>
                    )}
                    {item.status === 'forfeited' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Hangus 100%</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className={`font-mono text-sm font-black ${
                      item.category === 'extension_fee'
                        ? 'text-blue-700'
                        : item.category === 'forfeited'
                        ? 'text-rose-700'
                        : 'text-slate-900'
                    }`}>
                      + {formatRupiah(item.amount)}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada mutasi kas masuk yang sesuai dengan filter atau kata kunci pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print / Summary Modal Dialog */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Ringkasan Neraca Keuangan Masuk</h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 space-y-2 whitespace-pre-wrap">
{`=== NERACA KEUANGAN MASUK - PINJAMLAPTOP ===
Dicetak: ${new Date().toLocaleString('id-ID')} WIB
--------------------------------------------------
Total Arus Kas Masuk Bruto : ${formatRupiah(summary.grossInflow)}
Pendapatan Sewa Bersih    : ${formatRupiah(summary.netRentalRevenue)}
  • Sewa Pokok            : ${formatRupiah(summary.netRentalRevenue - summary.extensionRevenue)}
  • Perpanjangan Customer : ${formatRupiah(summary.extensionRevenue)}
Titipan Jaminan Deposit    : ${formatRupiah(summary.activeDepositsHeld)} (Ditahan) / ${formatRupiah(summary.refundedDeposits)} (Dicairkan)
Dana Hangus 100%          : ${formatRupiah(summary.forfeitedRevenue)}
Biaya Kurir Pengiriman     : ${formatRupiah(summary.deliveryFeesCollected)}
Denda Keterlambatan       : ${formatRupiah(summary.lateFeesCollected)}
Total Transaksi Masuk     : ${summary.totalTransactionsCount} item
==================================================`}
              </div>

              {copiedNotification && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-center font-bold text-xs border border-emerald-200">
                  ✓ Ringkasan neraca berhasil disalin ke clipboard!
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Salin Teks Ringkasan
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Cetak Dokumen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
