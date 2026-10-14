import React, { useState, useMemo } from 'react';
import { UnitMovementLog, BranchCity, Laptop, Customer, Employee } from '../../types';
import { formatRupiah } from '../../utils/erpStorage';
import { 
  ArrowLeftRight, 
  Plus, 
  Search, 
  X
} from 'lucide-react';

interface UnitMovementsManagerProps {
  movements: UnitMovementLog[];
  onSaveMovements: (updated: UnitMovementLog[]) => void;
  laptops: Laptop[];
  onSaveLaptops: (updated: Laptop[]) => void;
  customers: Customer[];
  employees: Employee[];
  selectedBranch: BranchCity | 'Semua';
}

export const UnitMovementsManager: React.FC<UnitMovementsManagerProps> = ({
  movements,
  onSaveMovements,
  laptops,
  onSaveLaptops,
  customers,
  employees,
  selectedBranch
}) => {
  const [filterType, setFilterType] = useState<'all' | 'out_rental' | 'in_return'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'out' | 'in'>('out');

  // Form State
  const [formData, setFormData] = useState<Partial<UnitMovementLog>>({
    laptopId: '',
    laptopName: '',
    laptopSku: '',
    branchCity: 'Malang',
    movementType: 'out_rental',
    orderId: '',
    customerName: '',
    customerPhone: '',
    staffName: '',
    receiverStaffName: '',
    chargerIncluded: true,
    bagIncluded: true,
    mouseIncluded: true,
    physicalConditionNotes: 'Unit prima, body mulus, keyboard dan layar normal.',
    lateDays: 0,
    lateFeeApplied: 0,
    notes: ''
  });

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      if (selectedBranch !== 'Semua' && m.branchCity !== selectedBranch) return false;
      if (filterType !== 'all' && m.movementType !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSku = m.laptopSku.toLowerCase().includes(q);
        const matchName = m.laptopName.toLowerCase().includes(q);
        const matchCust = m.customerName.toLowerCase().includes(q);
        const matchStaff = (m.staffName || '').toLowerCase().includes(q);
        const matchReceiver = (m.receiverStaffName || '').toLowerCase().includes(q);
        if (!matchSku && !matchName && !matchCust && !matchStaff && !matchReceiver) return false;
      }
      return true;
    });
  }, [movements, selectedBranch, filterType, searchQuery]);

  const handleOpenModal = (mode: 'out' | 'in') => {
    setModalMode(mode);
    const defaultBranch = selectedBranch === 'Semua' ? 'Malang' : selectedBranch;
    const defaultStaff = employees[0]?.name || 'Staf Operasional';

    // Filter candidate laptops based on mode
    const candidates = mode === 'out' 
      ? laptops.filter(l => l.status === 'ready') 
      : laptops.filter(l => l.status === 'rented');

    const firstChoice = candidates[0] || laptops[0];

    setFormData({
      laptopId: firstChoice ? firstChoice.id : '',
      laptopName: firstChoice ? firstChoice.name : '',
      laptopSku: firstChoice ? firstChoice.sku : '',
      branchCity: defaultBranch,
      movementType: mode === 'out' ? 'out_rental' : 'in_return',
      orderId: `ORD-${Date.now().toString().slice(-5)}`,
      customerName: firstChoice?.currentRenterName || customers[0]?.name || 'Customer Terdaftar',
      customerPhone: customers[0]?.phone || '',
      staffName: defaultStaff,
      receiverStaffName: mode === 'in' ? defaultStaff : undefined,
      chargerIncluded: true,
      bagIncluded: true,
      mouseIncluded: true,
      physicalConditionNotes: mode === 'out' ? 'Kondisi awal 100% prima dan bersih.' : 'Pengecekan fisik saat unit kembali: semua fungsi normal.',
      lateDays: 0,
      lateFeeApplied: 0,
      notes: ''
    });

    setIsModalOpen(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.laptopSku || !formData.customerName) return;

    const newLog: UnitMovementLog = {
      id: `mov-${Date.now()}`,
      laptopId: formData.laptopId || `lp-${Date.now()}`,
      laptopSku: formData.laptopSku || 'PL-UNT-000',
      laptopName: formData.laptopName || 'Unit Laptop',
      branchCity: (formData.branchCity || (selectedBranch === 'Semua' ? 'Malang' : selectedBranch)) as BranchCity,
      movementType: modalMode === 'out' ? 'out_rental' : 'in_return',
      orderId: formData.orderId || `ORD-${Date.now().toString().slice(-4)}`,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone || '',
      staffId: 'emp-1',
      staffName: formData.staffName || 'Staf Penyerah',
      receiverStaffName: modalMode === 'in' ? (formData.receiverStaffName || 'Staf Penerima') : undefined,
      timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      chargerIncluded: Boolean(formData.chargerIncluded),
      bagIncluded: Boolean(formData.bagIncluded),
      mouseIncluded: Boolean(formData.mouseIncluded),
      physicalConditionNotes: formData.physicalConditionNotes || 'Kondisi baik',
      lateDays: Number(formData.lateDays) || 0,
      lateFeeApplied: Number(formData.lateFeeApplied) || 0,
      notes: formData.notes || ''
    };

    onSaveMovements([newLog, ...movements]);

    // Update laptop status in inventory
    const updatedLaptops = laptops.map(l => {
      if (l.sku === newLog.laptopSku || l.id === newLog.laptopId) {
        if (modalMode === 'out') {
          return {
            ...l,
            status: 'rented' as const,
            currentRenterName: newLog.customerName,
            availableUnits: 0
          };
        } else {
          return {
            ...l,
            status: 'ready' as const,
            currentRenterName: undefined,
            availableUnits: 1
          };
        }
      }
      return l;
    });
    onSaveLaptops(updatedLaptops);

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e2d8]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-stone-900">
            Log Keluar-Masuk & Serah Terima Unit
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Pilar 9: Audit keluar unit disewa & pencatatan staf yang menerima saat pengembalian
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal('out')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eef4fc] hover:bg-[#e0ecfa] border border-[#cee0f7] text-[#1e5488] rounded-lg text-xs font-medium transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Unit Keluar (Disewa)</span>
          </button>

          <button
            onClick={() => handleOpenModal('in')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eaf4ee] hover:bg-[#dbede0] border border-[#cce5d4] text-[#1b633d] rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Unit Masuk (Pengembalian)</span>
          </button>
        </div>
      </div>

      {/* Pastel Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#eef4fc] rounded-xl border border-[#cee0f7] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1e5488] font-semibold">Total Mutasi Unit</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">{movements.length} Catatan</div>
          <div className="text-[11px] text-[#1e5488]/80 mt-1">Audit log serah terima</div>
        </div>

        <div className="p-3.5 bg-[#eaf4ee] rounded-xl border border-[#cce5d4] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1b633d] font-semibold">Unit Masuk (Kembali)</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {movements.filter(m => m.movementType === 'in_return').length} Unit
          </div>
          <div className="text-[11px] text-[#1b633d]/80 mt-1">Diterima & diinspeksi staf</div>
        </div>

        <div className="p-3.5 bg-[#fef7eb] rounded-xl border border-[#fbe5b4] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#8a5714] font-semibold">Unit Keluar (Disewa)</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {movements.filter(m => m.movementType === 'out_rental').length} Unit
          </div>
          <div className="text-[11px] text-[#8a5714]/80 mt-1">Telah diserahterimakan</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari SKU, Unit, Customer, Staf Penyerah / Penerima..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#4a586e]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'Semua Mutasi' },
            { id: 'out_rental', label: 'Unit Keluar (Disewa)' },
            { id: 'in_return', label: 'Unit Masuk (Kembali)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap text-xs ${
                filterType === tab.id ? 'bg-[#4a586e] text-white font-medium' : 'text-stone-600 hover:bg-[#faf7f2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-[#e8e2d8] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e8e2d8] bg-[#f7f5ee] text-[10px] font-mono uppercase text-stone-600">
                <th className="py-2.5 px-3">Waktu & Tipe Gerak</th>
                <th className="py-2.5 px-3">Unit Laptop (SKU)</th>
                <th className="py-2.5 px-3">Cabang</th>
                <th className="py-2.5 px-3">Penyewa / Customer</th>
                <th className="py-2.5 px-3">Staf Penyerah</th>
                <th className="py-2.5 px-3">Staf Penerima (Saat Kembali)</th>
                <th className="py-2.5 px-3">Kelengkapan</th>
                <th className="py-2.5 px-3">Kondisi Fisik / Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2ea]">
              {filteredMovements.map((m) => {
                const isOut = m.movementType === 'out_rental';

                return (
                  <tr key={m.id} className="hover:bg-[#faf7f2] transition-colors">
                    {/* Timestamp & Type */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-stone-900 font-medium">{m.timestamp}</div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono mt-1 ${
                        isOut ? 'bg-[#eef4fc] text-[#1e5488] border border-[#cee0f7]' : 'bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-[#3b82f6]' : 'bg-[#22c55e]'}`}></span>
                        <span>
                          {isOut ? 'Keluar (Disewa)' : 'Masuk (Kembali)'}
                        </span>
                      </span>
                    </td>

                    {/* Unit */}
                    <td className="py-2.5 px-3 font-mono">
                      <div className="font-semibold text-stone-900">{m.laptopSku}</div>
                      <div className="text-[11px] text-stone-500 font-sans">{m.laptopName}</div>
                    </td>

                    {/* Cabang */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-stone-700">
                      {m.branchCity}
                    </td>

                    {/* Customer */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-stone-900">{m.customerName}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{m.customerPhone || ''}</div>
                    </td>

                    {/* Staf Penyerah */}
                    <td className="py-2.5 px-3 text-stone-700 whitespace-nowrap">
                      {m.staffName || '-'}
                    </td>

                    {/* Staf Penerima */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {m.receiverStaffName ? (
                        <div className="font-medium text-stone-900 px-2 py-0.5 rounded-lg bg-[#eaf4ee] border border-[#cce5d4] inline-block text-[11px]">
                          {m.receiverStaffName}
                        </div>
                      ) : (
                        <span className="text-stone-400 font-mono text-[11px]">- (Sedang Tersewa)</span>
                      )}
                    </td>

                    {/* Kelengkapan */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                      {m.chargerIncluded && 'Charger '}&bull; {m.bagIncluded && 'Tas '}&bull; {m.mouseIncluded && 'Mouse'}
                    </td>

                    {/* Kondisi Fisik */}
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <div className="text-stone-700 truncate" title={m.physicalConditionNotes}>
                        {m.physicalConditionNotes || 'Normal'}
                      </div>
                      {m.lateDays ? (
                        <div className="text-[#8c273e] font-mono text-[10px]">
                          Telat {m.lateDays} hari (Denda {formatRupiah(m.lateFeeApplied || 0)})
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Unit Movement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#e5dfd5] shadow-xl max-w-lg w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d8]">
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  {modalMode === 'out' ? 'Pencatatan Unit Keluar (Disewa Customer)' : 'Pencatatan Penerimaan Laptop Kembali'}
                </h3>
                <div className="text-[11px] text-stone-500 font-mono">
                  {modalMode === 'out' ? 'Serah terima kepada customer' : 'Inspeksi & penyerahan kepada staf penerima'}
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-3 mt-3">
              <div>
                <label className="block text-[11px] font-mono text-stone-500 mb-1">Pilih Unit Laptop *</label>
                <select
                  required
                  value={formData.laptopSku}
                  onChange={(e) => {
                    const sel = laptops.find(l => l.sku === e.target.value);
                    setFormData({
                      ...formData,
                      laptopSku: e.target.value,
                      laptopName: sel ? sel.name : '',
                      laptopId: sel ? sel.id : '',
                      branchCity: sel ? sel.branchCity : 'Malang',
                      customerName: sel?.currentRenterName || formData.customerName
                    });
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                >
                  <option value="">-- Pilih Unit Laptop --</option>
                  {laptops.map(l => (
                    <option key={l.id} value={l.sku}>
                      [{l.sku}] {l.name} - Cabang {l.branchCity} ({l.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Nama Customer Penyewa *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                    placeholder="Nama Penyewa"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                    placeholder="0812xxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Staf Penyerah Unit</label>
                  <input
                    type="text"
                    value={formData.staffName}
                    onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                    placeholder="Nama staf yang mengeluarkan"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">
                    {modalMode === 'in' ? 'Staf Penerima Saat Kembali *' : 'Staf Penerima (Saat Kembali)'}
                  </label>
                  <input
                    type="text"
                    required={modalMode === 'in'}
                    value={formData.receiverStaffName || ''}
                    onChange={(e) => setFormData({ ...formData, receiverStaffName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                    placeholder={modalMode === 'in' ? 'Nama staf yang memeriksa & menerima' : 'Diisi saat unit dikembalikan'}
                  />
                </div>
              </div>

              {/* Checklist Kelengkapan */}
              <div>
                <label className="block text-[11px] font-mono text-stone-500 mb-1.5">Checklist Aksesori Kelengkapan:</label>
                <div className="flex items-center gap-4 text-xs text-stone-800">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.chargerIncluded}
                      onChange={(e) => setFormData({ ...formData, chargerIncluded: e.target.checked })}
                    />
                    <span>Charger Original</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.bagIncluded}
                      onChange={(e) => setFormData({ ...formData, bagIncluded: e.target.checked })}
                    />
                    <span>Tas Laptop</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.mouseIncluded}
                      onChange={(e) => setFormData({ ...formData, mouseIncluded: e.target.checked })}
                    />
                    <span>Mouse</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-stone-500 mb-1">Catatan Kondisi Fisik & Fungsi</label>
                <textarea
                  rows={2}
                  value={formData.physicalConditionNotes}
                  onChange={(e) => setFormData({ ...formData, physicalConditionNotes: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                  placeholder="Catat kondisi fisik: bodi, layar, keyboard, adaptor..."
                />
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
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
