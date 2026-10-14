import React, { useState, useMemo } from 'react';
import { FinancialTransaction, BranchCity } from '../../types';
import { formatRupiah } from '../../utils/erpStorage';
import { 
  Wallet, 
  Plus, 
  Search, 
  Calendar, 
  Building2, 
  Coins, 
  Truck, 
  X,
  FileSpreadsheet,
  Download
} from 'lucide-react';

interface GeneralFinanceManagerProps {
  transactions: FinancialTransaction[];
  onSaveTransactions: (updated: FinancialTransaction[]) => void;
  selectedBranch: BranchCity | 'Semua';
}

export const GeneralFinanceManager: React.FC<GeneralFinanceManagerProps> = ({
  transactions,
  onSaveTransactions,
  selectedBranch
}) => {
  const [activeView, setActiveView] = useState<'daily_detailed' | 'monthly_branch_summary' | 'all_transactions'>('daily_detailed');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-14');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<FinancialTransaction>>({
    branchCity: 'Malang',
    type: 'income',
    category: 'sewa',
    title: '',
    amount: 150000,
    paymentMethod: 'qris',
    customerOrPayee: '',
    recordedBy: 'Finance Staff',
    notes: ''
  });

  // Pillar 10: Rincian 3 Pos Uang Masuk Harian (Sewa, Antar-Jemput, Denda)
  const dailyBreakdown = useMemo(() => {
    const list = transactions.filter(t => {
      const matchDate = t.date === selectedDate;
      const matchBranch = selectedBranch === 'Semua' ? true : t.branchCity === selectedBranch;
      return matchDate && matchBranch && t.type === 'income';
    });

    const sewaList = list.filter(t => t.category === 'sewa');
    const antarJemputList = list.filter(t => t.category === 'antar_jemput');
    const dendaList = list.filter(t => t.category === 'denda');

    const totalSewa = sewaList.reduce((sum, t) => sum + t.amount, 0);
    const totalAntarJemput = antarJemputList.reduce((sum, t) => sum + t.amount, 0);
    const totalDenda = dendaList.reduce((sum, t) => sum + t.amount, 0);
    const totalMasukHariIni = totalSewa + totalAntarJemput + totalDenda;

    return {
      totalSewa,
      totalAntarJemput,
      totalDenda,
      totalMasukHariIni,
      sewaList,
      antarJemputList,
      dendaList
    };
  }, [transactions, selectedDate, selectedBranch]);

  // Pillar 10: Akumulasi Bulanan per Cabang (Malang, Sidoarjo, Bekasi)
  const monthlyBranchSummary = useMemo(() => {
    const getBranchStats = (city: BranchCity) => {
      const branchTxs = transactions.filter(t => t.branchCity === city && t.date.startsWith(selectedMonth));
      const sewa = branchTxs.filter(t => t.type === 'income' && t.category === 'sewa').reduce((s, t) => s + t.amount, 0);
      const antarJemput = branchTxs.filter(t => t.type === 'income' && t.category === 'antar_jemput').reduce((s, t) => s + t.amount, 0);
      const denda = branchTxs.filter(t => t.type === 'income' && t.category === 'denda').reduce((s, t) => s + t.amount, 0);
      const totalMasuk = sewa + antarJemput + denda;
      const pengeluaran = branchTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const netProfit = totalMasuk - pengeluaran;

      return {
        city,
        sewa,
        antarJemput,
        denda,
        totalMasuk,
        pengeluaran,
        netProfit,
        count: branchTxs.length
      };
    };

    const malang = getBranchStats('Malang');
    const sidoarjo = getBranchStats('Sidoarjo');
    const bekasi = getBranchStats('Bekasi');

    const totalAllMasuk = malang.totalMasuk + sidoarjo.totalMasuk + bekasi.totalMasuk;
    const totalAllKeluar = malang.pengeluaran + sidoarjo.pengeluaran + bekasi.pengeluaran;
    const totalAllNet = totalAllMasuk - totalAllKeluar;

    return {
      branches: [malang, sidoarjo, bekasi],
      totalAllMasuk,
      totalAllKeluar,
      totalAllNet
    };
  }, [transactions, selectedMonth]);

  // All Transactions Filtered
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (selectedBranch !== 'Semua' && t.branchCity !== selectedBranch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCust = (t.customerOrPayee || '').toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        if (!matchTitle && !matchCust && !matchCat) return false;
      }
      return true;
    });
  }, [transactions, selectedBranch, searchQuery]);

  // Handle Save New Transaction
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.amount) return;

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date: selectedDate,
      branchCity: (formData.branchCity || (selectedBranch === 'Semua' ? 'Malang' : selectedBranch)) as BranchCity,
      type: formData.type || 'income',
      category: formData.category || 'sewa',
      title: formData.title,
      amount: Number(formData.amount),
      paymentMethod: (formData.paymentMethod as any) || 'transfer_bank',
      customerOrPayee: formData.customerOrPayee || 'Pelanggan',
      recordedBy: formData.recordedBy || 'Finance',
      notes: formData.notes || ''
    };

    onSaveTransactions([newTx, ...transactions]);
    setIsModalOpen(false);
  };

  // Export CSV Helper
  const handleExportCsv = () => {
    const headers = ['ID', 'Tanggal', 'Cabang', 'Tipe', 'Kategori', 'Uraian', 'Nominal', 'Metode Bayar', 'Customer/Pihak', 'Staf'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.date,
      t.branchCity,
      t.type,
      t.category,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      t.paymentMethod,
      `"${(t.customerOrPayee || '').replace(/"/g, '""')}"`,
      t.recordedBy
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-keuangan-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e2d8]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-stone-800">
            Laporan Keuangan Toko
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Pilar 3 & 10: Rincian uang masuk per hari (Sewa, Antar-Jemput, Denda) & akumulasi bulanan per cabang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e5dfd5] hover:bg-[#faf7f2] bg-white text-stone-700 rounded-lg text-xs font-medium transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs in Pastel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e8e2d8] pb-2 text-xs gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveView('daily_detailed')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'daily_detailed' ? 'bg-[#4a586e] text-white font-medium' : 'text-stone-600 hover:bg-[#faf7f2]'
            }`}
          >
            1. Rincian Pemasukan Harian (3 Pos)
          </button>
          <button
            onClick={() => setActiveView('monthly_branch_summary')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'monthly_branch_summary' ? 'bg-[#4a586e] text-white font-medium' : 'text-stone-600 hover:bg-[#faf7f2]'
            }`}
          >
            2. Akumulasi Bulanan per Cabang
          </button>
          <button
            onClick={() => setActiveView('all_transactions')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'all_transactions' ? 'bg-[#4a586e] text-white font-medium' : 'text-stone-600 hover:bg-[#faf7f2]'
            }`}
          >
            3. Seluruh Buku Transaksi
          </button>
        </div>

        {/* Date Selector */}
        {activeView === 'daily_detailed' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-500 font-mono">Pilih Tanggal:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 bg-white border border-[#e5dfd5] rounded-lg text-xs font-mono text-stone-800 focus:outline-none"
            />
          </div>
        )}

        {activeView === 'monthly_branch_summary' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-500 font-mono">Pilih Bulan:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1 bg-white border border-[#e5dfd5] rounded-lg text-xs font-mono text-stone-800 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* VIEW 1: Rincian Pemasukan Harian (3 Pos Terpisah) in Pastel */}
      {activeView === 'daily_detailed' && (
        <div className="space-y-4">
          {/* Summary Strip for the selected day in Pastel Palette */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#f5f2ea] rounded-xl border border-[#e5dfd5] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-stone-500 font-semibold">Total Uang Masuk ({selectedDate})</div>
              <div className="text-xl font-bold font-mono text-stone-800 mt-1">
                {formatRupiah(dailyBreakdown.totalMasukHariIni)}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                {selectedBranch === 'Semua' ? 'Total 3 Cabang' : `Cabang ${selectedBranch}`}
              </div>
            </div>

            <div className="p-3.5 bg-[#eaf4ee] rounded-xl border border-[#cce5d4] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-[#1b633d] font-semibold">1. Pos Sewa Laptop</div>
              <div className="text-xl font-bold font-mono text-stone-800 mt-1">
                {formatRupiah(dailyBreakdown.totalSewa)}
              </div>
              <div className="text-[11px] text-[#1b633d]/80 mt-1">
                {dailyBreakdown.sewaList.length} Transaksi Sewa
              </div>
            </div>

            <div className="p-3.5 bg-[#eef4fc] rounded-xl border border-[#cee0f7] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-[#1e5488] font-semibold">2. Pos Antar-Jemput (5rb/km)</div>
              <div className="text-xl font-bold font-mono text-stone-800 mt-1">
                {formatRupiah(dailyBreakdown.totalAntarJemput)}
              </div>
              <div className="text-[11px] text-[#1e5488]/80 mt-1">
                {dailyBreakdown.antarJemputList.length} Trip Logistik
              </div>
            </div>

            <div className="p-3.5 bg-[#fdf1f3] rounded-xl border border-[#f9ccd5] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-[#8c273e] font-semibold">3. Pos Denda / Overtime</div>
              <div className="text-xl font-bold font-mono text-stone-800 mt-1">
                {formatRupiah(dailyBreakdown.totalDenda)}
              </div>
              <div className="text-[11px] text-[#8c273e]/80 mt-1">
                {dailyBreakdown.dendaList.length} Kasus Denda
              </div>
            </div>
          </div>

          {/* 3 Detailed Tables side by side in Pastel Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Table 1: Sewa */}
            <div className="bg-white rounded-xl border border-[#cce5d4] p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#eaf4ee]">
                <span className="font-semibold text-xs text-[#1b633d]">Uang Sewa Laptop</span>
                <span className="font-mono text-xs font-bold text-stone-900">{formatRupiah(dailyBreakdown.totalSewa)}</span>
              </div>
              <div className="divide-y divide-[#f5f2ea] text-xs">
                {dailyBreakdown.sewaList.length === 0 ? (
                  <div className="py-4 text-center text-stone-400 text-xs">Belum ada transaksi sewa tanggal ini</div>
                ) : (
                  dailyBreakdown.sewaList.map(t => (
                    <div key={t.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-stone-800">{t.title}</span>
                        <span className="font-mono font-bold text-stone-900">{formatRupiah(t.amount)}</span>
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                        {t.customerOrPayee} &bull; {t.paymentMethod} &bull; {t.branchCity}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Table 2: Antar-Jemput */}
            <div className="bg-white rounded-xl border border-[#cee0f7] p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#eef4fc]">
                <span className="font-semibold text-xs text-[#1e5488]">Uang Antar-Jemput (5rb/km)</span>
                <span className="font-mono text-xs font-bold text-stone-900">{formatRupiah(dailyBreakdown.totalAntarJemput)}</span>
              </div>
              <div className="divide-y divide-[#f5f2ea] text-xs">
                {dailyBreakdown.antarJemputList.length === 0 ? (
                  <div className="py-4 text-center text-stone-400 text-xs">Belum ada antar-jemput tanggal ini</div>
                ) : (
                  dailyBreakdown.antarJemputList.map(t => (
                    <div key={t.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-stone-800">{t.title}</span>
                        <span className="font-mono font-bold text-stone-900">{formatRupiah(t.amount)}</span>
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                        {t.customerOrPayee} &bull; {t.paymentMethod} &bull; {t.branchCity}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Table 3: Denda */}
            <div className="bg-white rounded-xl border border-[#f9ccd5] p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#fdf1f3]">
                <span className="font-semibold text-xs text-[#8c273e]">Uang Denda Keterlambatan</span>
                <span className="font-mono text-xs font-bold text-stone-900">{formatRupiah(dailyBreakdown.totalDenda)}</span>
              </div>
              <div className="divide-y divide-[#f5f2ea] text-xs">
                {dailyBreakdown.dendaList.length === 0 ? (
                  <div className="py-4 text-center text-stone-400 text-xs">Tidak ada denda pada tanggal ini</div>
                ) : (
                  dailyBreakdown.dendaList.map(t => (
                    <div key={t.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-stone-800">{t.title}</span>
                        <span className="font-mono font-bold text-stone-900">{formatRupiah(t.amount)}</span>
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                        {t.customerOrPayee} &bull; {t.paymentMethod} &bull; {t.branchCity}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Akumulasi Bulanan Tiap Cabang (Malang Pusat, Sidoarjo, Bekasi) in Pastel */}
      {activeView === 'monthly_branch_summary' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#e8e2d8] overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-[#e8e2d8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#fdfbf7]">
              <div>
                <h3 className="text-xs font-bold text-stone-900">Tabel Akumulasi Bulanan Tiap Cabang ({selectedMonth})</h3>
                <p className="text-[11px] text-stone-500 font-mono">Konsolidasi pendapatan per pos: Sewa, Antar-Jemput, Denda</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-[11px] text-stone-500">Total Akumulasi Seluruh Cabang:</div>
                <div className="font-mono text-sm font-bold text-stone-900">{formatRupiah(monthlyBranchSummary.totalAllMasuk)}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#e8e2d8] bg-[#f7f5ee] text-[10px] font-mono uppercase text-stone-600">
                    <th className="py-2.5 px-3">Cabang</th>
                    <th className="py-2.5 px-3">Peran</th>
                    <th className="py-2.5 px-3 text-right">Uang Sewa</th>
                    <th className="py-2.5 px-3 text-right">Antar-Jemput</th>
                    <th className="py-2.5 px-3 text-right">Denda</th>
                    <th className="py-2.5 px-3 text-right">Total Pemasukan</th>
                    <th className="py-2.5 px-3 text-right">Pengeluaran</th>
                    <th className="py-2.5 px-3 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f2ea] font-mono">
                  {monthlyBranchSummary.branches.map((b) => (
                    <tr key={b.city} className="hover:bg-[#faf7f2] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-stone-900 font-sans">
                        {b.city}
                      </td>
                      <td className="py-2.5 px-3 text-stone-500 font-sans">
                        {b.city === 'Malang' ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#eef4fc] text-[#1e5488] border border-[#cee0f7] text-[10px]">
                            Kantor Pusat
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#f5f2ea] text-stone-600 border border-[#e5dfd5] text-[10px]">
                            Cabang
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-700">
                        {formatRupiah(b.sewa)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-700">
                        {formatRupiah(b.antarJemput)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-700">
                        {formatRupiah(b.denda)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                        {formatRupiah(b.totalMasuk)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-500">
                        {formatRupiah(b.pengeluaran)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#1b633d]">
                        {formatRupiah(b.netProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#e8e2d8] bg-[#f7f5ee] font-mono font-bold text-xs text-stone-900">
                    <td colSpan={5} className="py-2.5 px-3 font-sans">Total Gabungan Konsolidasi 3 Cabang:</td>
                    <td className="py-2.5 px-3 text-right text-zinc-900">{formatRupiah(monthlyBranchSummary.totalAllMasuk)}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-500">{formatRupiah(monthlyBranchSummary.totalAllKeluar)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700">{formatRupiah(monthlyBranchSummary.totalAllNet)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Seluruh Buku Transaksi */}
      {activeView === 'all_transactions' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200 rounded text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-mono uppercase text-zinc-500">
                    <th className="py-2.5 px-3">Tanggal & ID</th>
                    <th className="py-2.5 px-3">Cabang</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Uraian Transaksi</th>
                    <th className="py-2.5 px-3">Pihak / Customer</th>
                    <th className="py-2.5 px-3">Metode</th>
                    <th className="py-2.5 px-3 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-zinc-700 whitespace-nowrap">
                          <div>{tx.date}</div>
                          <div className="text-[10px] text-zinc-400">{tx.id}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {tx.branchCity}
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-mono text-zinc-600">
                          {tx.category.replace('_', ' ')}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-zinc-900">
                          {tx.title}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600">
                          {tx.customerOrPayee || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-500">
                          {tx.paymentMethod}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                          isIncome ? 'text-zinc-900' : 'text-zinc-500'
                        }`}>
                          {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Catat Transaksi Keuangan Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 shadow-xl max-w-md w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="font-bold text-sm text-zinc-900">Catat Transaksi Keuangan Toko</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Tipe Transaksi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  >
                    <option value="income">Pemasukan (Uang Masuk)</option>
                    <option value="expense">Pengeluaran (Operasional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Kategori Pos</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  >
                    <option value="sewa">Sewa Laptop (Rental)</option>
                    <option value="antar_jemput">Antar-Jemput (5rb/km)</option>
                    <option value="denda">Denda / Overtime</option>
                    <option value="servis">Servis / Sparepart</option>
                    <option value="operasional">Operasional Kantor</option>
                    <option value="gaji">Gaji Staf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Uraian / Judul Transaksi *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  placeholder="Contoh: Pembayaran Sewa ThinkPad 3 Hari"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Cabang</label>
                  <select
                    value={formData.branchCity}
                    onChange={(e) => setFormData({ ...formData, branchCity: e.target.value as BranchCity })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  >
                    <option value="Malang">Malang (Pusat)</option>
                    <option value="Sidoarjo">Sidoarjo</option>
                    <option value="Bekasi">Bekasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Metode Pembayaran</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  >
                    <option value="qris">QRIS / Instant</option>
                    <option value="transfer_bank">Transfer Bank</option>
                    <option value="cash">Tunai / Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Customer / Pihak Terkait</label>
                  <input
                    type="text"
                    value={formData.customerOrPayee}
                    onChange={(e) => setFormData({ ...formData, customerOrPayee: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                    placeholder="Nama Customer / Vendor"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-200 rounded text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded font-medium hover:bg-zinc-800"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
