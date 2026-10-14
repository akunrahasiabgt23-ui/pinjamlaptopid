import React, { useState, useMemo } from 'react';
import { PettyCashTransaction, BranchCity } from '../../types';
import { formatRupiah } from '../../utils/erpStorage';
import { 
  Coins, 
  Plus, 
  Search, 
  X
} from 'lucide-react';

interface PettyCashManagerProps {
  transactions: PettyCashTransaction[];
  onSaveTransactions: (updated: PettyCashTransaction[]) => void;
  selectedBranch: BranchCity | 'Semua';
}

export const PettyCashManager: React.FC<PettyCashManagerProps> = ({
  transactions,
  onSaveTransactions,
  selectedBranch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'masuk' | 'keluar'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTopUpMode, setIsTopUpMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<PettyCashTransaction>>({
    branchCity: 'Malang',
    type: 'keluar',
    category: 'atk',
    title: '',
    amount: 50000,
    recipientOrPayer: '',
    recordedBy: 'Staf Kasir',
    notes: ''
  });

  // Calculate Running Balances per branch
  const balances = useMemo(() => {
    const calc = (city?: BranchCity) => {
      const list = city ? transactions.filter(t => t.branchCity === city) : transactions;
      const masuk = list.filter(t => t.type === 'masuk').reduce((sum, t) => sum + t.amount, 0);
      const keluar = list.filter(t => t.type === 'keluar').reduce((sum, t) => sum + t.amount, 0);
      return {
        masuk,
        keluar,
        balance: masuk - keluar
      };
    };

    const currentScope = selectedBranch === 'Semua' ? calc() : calc(selectedBranch);
    const malang = calc('Malang');
    const sidoarjo = calc('Sidoarjo');
    const bekasi = calc('Bekasi');

    return {
      current: currentScope,
      malang,
      sidoarjo,
      bekasi
    };
  }, [transactions, selectedBranch]);

  // Filtered List
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (selectedBranch !== 'Semua' && t.branchCity !== selectedBranch) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchRecip = (t.recipientOrPayer || '').toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        if (!matchTitle && !matchRecip && !matchCat) return false;
      }
      return true;
    });
  }, [transactions, selectedBranch, typeFilter, searchQuery]);

  const handleOpenAdd = (isTopUp: boolean) => {
    setIsTopUpMode(isTopUp);
    const defaultBranch = selectedBranch === 'Semua' ? 'Malang' : selectedBranch;
    setFormData({
      branchCity: defaultBranch,
      type: isTopUp ? 'masuk' : 'keluar',
      category: isTopUp ? 'topup_kas_kecil' : 'atk',
      title: isTopUp ? 'Pengisian Kas Kecil dari Kas Pusat' : '',
      amount: isTopUp ? 500000 : 35000,
      recipientOrPayer: isTopUp ? 'Kas Utama Pusat' : 'Toko Alat Tulis / Minimarket',
      recordedBy: 'Kasir Cabang',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.amount) return;

    const newTx: PettyCashTransaction = {
      id: `pc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      branchCity: (formData.branchCity || (selectedBranch === 'Semua' ? 'Malang' : selectedBranch)) as BranchCity,
      type: formData.type || 'keluar',
      category: formData.category || 'atk',
      title: formData.title,
      amount: Number(formData.amount),
      recipientOrPayer: formData.recipientOrPayer || 'Kasir',
      recordedBy: formData.recordedBy || 'Staf',
      notes: formData.notes || ''
    };

    onSaveTransactions([newTx, ...transactions]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-stone-900">
            Buku Kas Kecil (Petty Cash)
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Pilar 5: Pencatatan operasional harian terpisah &bull; Saldo kas kasir cabang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e7e5e4] hover:bg-[#faf8f5] bg-white text-stone-700 rounded-md text-xs font-medium transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Top-Up Kas</span>
          </button>

          <button
            onClick={() => handleOpenAdd(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#475569] hover:bg-[#334155] text-white rounded-md text-xs font-medium transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Kas Keluar</span>
          </button>
        </div>
      </div>

      {/* Metric Strip in Pastel Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#f5f0fa] rounded-xl border border-[#e2d6f5] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#5c3682] font-semibold">Saldo Kas Tersedia</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {formatRupiah(balances.current.balance)}
          </div>
          <div className="text-[11px] text-[#5c3682]/80 mt-1">
            {selectedBranch === 'Semua' ? 'Total Saldo 3 Cabang' : `Saldo Kasir ${selectedBranch}`}
          </div>
        </div>

        <div className="p-3.5 bg-[#eaf4ee] rounded-xl border border-[#cce5d4] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1b633d] font-semibold">Kas Masuk (Top-Up)</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {formatRupiah(balances.current.masuk)}
          </div>
          <div className="text-[11px] text-[#1b633d]/80 mt-1">Dana operasional disetor</div>
        </div>

        <div className="p-3.5 bg-[#fdf1f3] rounded-xl border border-[#f9ccd5] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#8c273e] font-semibold">Kas Keluar Terpakai</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {formatRupiah(balances.current.keluar)}
          </div>
          <div className="text-[11px] text-[#8c273e]/80 mt-1">Biaya taktis & belanja toko</div>
        </div>

        <div className="p-3.5 bg-[#f5f2ea] rounded-xl border border-[#e5dfd5] text-xs font-mono space-y-1 shadow-2xs">
          <div className="text-[10px] uppercase text-stone-500 font-semibold">Saldo per Cabang:</div>
          <div className="flex justify-between text-stone-700">
            <span>Malang (Pusat):</span>
            <span className="font-bold text-stone-900">{formatRupiah(balances.malang.balance)}</span>
          </div>
          <div className="flex justify-between text-stone-700">
            <span>Sidoarjo:</span>
            <span className="font-bold text-stone-900">{formatRupiah(balances.sidoarjo.balance)}</span>
          </div>
          <div className="flex justify-between text-stone-700">
            <span>Bekasi:</span>
            <span className="font-bold text-stone-900">{formatRupiah(balances.bekasi.balance)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari keperluan, pihak, atau nota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#4a586e]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'Semua Arus' },
            { id: 'masuk', label: 'Kas Masuk (+)' },
            { id: 'keluar', label: 'Kas Keluar (-)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id as any)}
              className={`px-3 py-1 rounded-lg transition-colors text-xs ${
                typeFilter === tab.id ? 'bg-[#4a586e] text-white font-medium' : 'text-stone-600 hover:bg-[#faf7f2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Petty Cash Transactions */}
      <div className="bg-white rounded-xl border border-[#e8e2d8] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e8e2d8] bg-[#f7f5ee] text-[10px] font-mono uppercase text-stone-600">
                <th className="py-2.5 px-3">Tanggal & ID</th>
                <th className="py-2.5 px-3">Cabang</th>
                <th className="py-2.5 px-3">Keperluan / Uraian</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Penerima / Toko</th>
                <th className="py-2.5 px-3">Dicatat Oleh</th>
                <th className="py-2.5 px-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2ea]">
              {filteredTransactions.map((tx) => {
                const isMasuk = tx.type === 'masuk';

                return (
                  <tr key={tx.id} className="hover:bg-[#faf7f2] transition-colors">
                    {/* Date */}
                    <td className="py-2.5 px-3 font-mono text-stone-700 whitespace-nowrap">
                      <div>{tx.date}</div>
                      <div className="text-[10px] text-stone-400">{tx.id}</div>
                    </td>

                    {/* Cabang */}
                    <td className="py-2.5 px-3 text-stone-700 whitespace-nowrap">
                      {tx.branchCity}
                    </td>

                    {/* Title */}
                    <td className="py-2.5 px-3 font-medium text-stone-900">
                      {tx.title}
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 uppercase text-[10px] font-mono text-stone-500">
                      {tx.category}
                    </td>

                    {/* Penerima */}
                    <td className="py-2.5 px-3 text-stone-600">
                      {tx.recipientOrPayer || '-'}
                    </td>

                    {/* Staf */}
                    <td className="py-2.5 px-3 text-stone-500">
                      {tx.recordedBy}
                    </td>

                    {/* Amount */}
                    <td className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                      isMasuk ? 'text-[#1b633d]' : 'text-[#8c273e]'
                    }`}>
                      {isMasuk ? '+' : '-'}{formatRupiah(tx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Kas Kecil */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#e5dfd5] shadow-xl max-w-md w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d8]">
              <h3 className="font-bold text-sm text-stone-900">
                {isTopUpMode ? 'Pengisian Kas Kecil (Top-Up)' : 'Catat Pengeluaran Kas Kecil'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Tipe Arus</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                  >
                    <option value="keluar">Kas Keluar (Pengeluaran)</option>
                    <option value="masuk">Kas Masuk (Top Up Dana)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Cabang Kasir</label>
                  <select
                    value={formData.branchCity}
                    onChange={(e) => setFormData({ ...formData, branchCity: e.target.value as BranchCity })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                  >
                    <option value="Malang">Malang (Pusat)</option>
                    <option value="Sidoarjo">Sidoarjo</option>
                    <option value="Bekasi">Bekasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-stone-500 mb-1">Keperluan / Keterangan *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                  placeholder="Contoh: Pembelian Lakban, Bubble Wrap, Bensin Kurir"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 font-mono bg-white focus:outline-none focus:border-[#4a586e]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Kategori Pengeluaran</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                  >
                    <option value="atk">ATK & Packing Toko</option>
                    <option value="bensin_darurat">Bensin & Transportasi</option>
                    <option value="konsumsi">Konsumsi / Air Minum</option>
                    <option value="kebersihan">Kebersihan & Toko</option>
                    <option value="topup_kas_kecil">Setoran Top Up Pusat</option>
                    <option value="alat_teknisi">Alat Teknisi</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Penerima / Toko Rekanan</label>
                  <input
                    type="text"
                    value={formData.recipientOrPayer}
                    onChange={(e) => setFormData({ ...formData, recipientOrPayer: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                    placeholder="Minimarket / SPBU"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Staf Kasir Pencatat</label>
                  <input
                    type="text"
                    value={formData.recordedBy}
                    onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e2d8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-700 hover:bg-[#faf7f2] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg font-medium transition-colors"
                >
                  Simpan ke Buku Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
