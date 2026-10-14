import React, { useState, useMemo } from 'react';
import { 
  Laptop, 
  LaptopUnitStatus, 
  BranchCity 
} from '../../types';
import { formatRupiah } from '../../utils/erpStorage';
import { 
  Plus, 
  Search, 
  Laptop as LaptopIcon, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  Edit3, 
  Trash2, 
  Wrench, 
  Building2, 
  X,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

interface LaptopsManagerProps {
  laptops: Laptop[];
  onSaveLaptops: (updated: Laptop[]) => void;
  selectedBranch: BranchCity | 'Semua';
  onNavigateToService?: (laptop: Laptop) => void;
  onOpenRentalModal?: (laptop: Laptop) => void;
}

export const LaptopsManager: React.FC<LaptopsManagerProps> = ({
  laptops,
  onSaveLaptops,
  selectedBranch,
  onNavigateToService,
  onOpenRentalModal
}) => {
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | LaptopUnitStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState<Partial<Laptop>>({
    name: '',
    brand: 'Lenovo',
    category: 'Bisnis & Kantor',
    status: 'ready',
    branchCity: 'Malang',
    sku: '',
    serialNumber: '',
    processor: 'Intel Core i5-1335U',
    ram: '16GB DDR4',
    storage: '512GB SSD NVMe',
    gpu: 'Intel Iris Xe',
    display: '14" FHD IPS',
    weight: '1.4 kg',
    batteryLife: '8 Jam',
    dailyPrice: 150000,
    weeklyPrice: 850000,
    monthlyPrice: 2400000,
    depositAmount: 700000,
    lateFeePerHour: 20000,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    availableUnits: 1,
    description: 'Unit prima untuk kebutuhan kerja kantor dan meeting.',
    includedAccessories: ['Charger Original', 'Tas Laptop']
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const list = selectedBranch === 'Semua' ? laptops : laptops.filter(l => l.branchCity === selectedBranch);
    return {
      total: list.length,
      ready: list.filter(l => l.status === 'ready').length,
      rented: list.filter(l => l.status === 'rented').length,
      trouble: list.filter(l => l.status === 'trouble').length
    };
  }, [laptops, selectedBranch]);

  // Filtered List
  const filteredLaptops = useMemo(() => {
    return laptops.filter(l => {
      if (selectedBranch !== 'Semua' && l.branchCity !== selectedBranch) return false;
      if (activeStatusFilter !== 'all' && l.status !== activeStatusFilter) return false;
      if (selectedBrand !== 'all' && l.brand !== selectedBrand) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = l.name.toLowerCase().includes(q);
        const matchSku = l.sku.toLowerCase().includes(q);
        const matchSn = (l.serialNumber || '').toLowerCase().includes(q);
        const matchBrand = l.brand.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchSn && !matchBrand) return false;
      }
      return true;
    });
  }, [laptops, selectedBranch, activeStatusFilter, selectedBrand, searchQuery]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    laptops.forEach(l => set.add(l.brand));
    return Array.from(set);
  }, [laptops]);

  const handleOpenAddModal = () => {
    const branchDefault = selectedBranch === 'Semua' ? 'Malang' : selectedBranch;
    const newSku = `PL-UNT-${String(laptops.length + 1).padStart(3, '0')}`;
    setEditingLaptop(null);
    setFormData({
      name: '',
      brand: 'Lenovo',
      category: 'Bisnis & Kantor',
      status: 'ready',
      branchCity: branchDefault,
      sku: newSku,
      serialNumber: `SN-${Date.now().toString().slice(-6)}`,
      processor: 'Intel Core i5-1335U',
      ram: '16GB',
      storage: '512GB SSD',
      gpu: 'Intel Iris Xe',
      display: '14" FHD IPS',
      weight: '1.4 kg',
      batteryLife: '8 Jam',
      dailyPrice: 150000,
      weeklyPrice: 850000,
      monthlyPrice: 2400000,
      depositAmount: 700000,
      lateFeePerHour: 20000,
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      availableUnits: 1,
      description: 'Unit kerja siap pakai.',
      includedAccessories: ['Charger Original', 'Tas Laptop']
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (laptop: Laptop) => {
    setEditingLaptop(laptop);
    setFormData({ ...laptop });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingLaptop) {
      const updated = laptops.map(l => l.id === editingLaptop.id ? { ...l, ...formData } as Laptop : l);
      onSaveLaptops(updated);
    } else {
      const newLaptop: Laptop = {
        ...formData,
        id: `lp-${Date.now()}`,
        sku: formData.sku || `PL-UNT-${String(laptops.length + 1).padStart(3, '0')}`,
        name: formData.name || 'Laptop Baru',
        brand: formData.brand || 'Lenovo',
        category: formData.category || 'Bisnis & Kantor',
        status: (formData.status || 'ready') as LaptopUnitStatus,
        branchCity: (formData.branchCity || 'Malang') as BranchCity,
        processor: formData.processor || 'Intel Core i5',
        ram: formData.ram || '16GB',
        storage: formData.storage || '512GB SSD',
        gpu: formData.gpu || 'Intel Graphics',
        display: formData.display || '14 Inch',
        weight: formData.weight || '1.4 kg',
        batteryLife: formData.batteryLife || '8 Jam',
        dailyPrice: Number(formData.dailyPrice) || 150000,
        weeklyPrice: Number(formData.weeklyPrice) || 850000,
        monthlyPrice: Number(formData.monthlyPrice) || 2400000,
        depositAmount: Number(formData.depositAmount) || 700000,
        lateFeePerHour: Number(formData.lateFeePerHour) || 20000,
        image: formData.image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
        availableUnits: formData.status === 'ready' ? 1 : 0,
        description: formData.description || '',
        includedAccessories: formData.includedAccessories || ['Charger Original', 'Tas']
      };
      onSaveLaptops([newLaptop, ...laptops]);
    }

    setIsModalOpen(false);
  };

  const handleQuickStatusChange = (laptop: Laptop, newStatus: LaptopUnitStatus) => {
    const updated = laptops.map(l => {
      if (l.id === laptop.id) {
        return {
          ...l,
          status: newStatus,
          availableUnits: newStatus === 'ready' ? 1 : 0,
          currentRenterName: newStatus === 'ready' ? undefined : l.currentRenterName,
          troubleDescription: newStatus === 'trouble' ? (l.troubleDescription || 'Kendala operasional dilaporkan') : undefined
        };
      }
      return l;
    });
    onSaveLaptops(updated);
  };

  const handleDeleteLaptop = (id: string) => {
    if (confirm('Hapus unit laptop ini dari database inventaris?')) {
      onSaveLaptops(laptops.filter(l => l.id !== id));
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-stone-900">
            Inventaris Laptop
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Pilar 1: Data unit Ready, Sedang Tersewa, dan Trouble per cabang
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border border-[#e7e5e4] rounded-md p-0.5 bg-white shadow-2xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded text-xs transition-colors ${viewMode === 'table' ? 'bg-[#475569] text-white' : 'text-stone-500 hover:text-stone-900'}`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded text-xs transition-colors ${viewMode === 'grid' ? 'bg-[#475569] text-white' : 'text-stone-500 hover:text-stone-900'}`}
              title="Tampilan Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#475569] hover:bg-[#334155] text-white rounded-md text-xs font-medium transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Laptop</span>
          </button>
        </div>
      </div>

      {/* Metric Strip in Pastel Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveStatusFilter('all')}
          className={`p-3.5 rounded-xl border text-left transition-colors shadow-2xs ${
            activeStatusFilter === 'all' ? 'border-[#4a586e] bg-[#f5f2ea] ring-1 ring-[#4a586e]' : 'border-[#e5dfd5] bg-white hover:border-[#cfc7bc]'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-stone-400 font-semibold">Total Unit</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-0.5">{metrics.total}</div>
          <div className="text-[11px] text-stone-500 mt-1">Seluruh kondisi inventaris</div>
        </button>

        <button
          onClick={() => setActiveStatusFilter('ready')}
          className={`p-3.5 rounded-xl border text-left transition-colors shadow-2xs ${
            activeStatusFilter === 'ready' ? 'border-[#22c55e] bg-[#eaf4ee] ring-1 ring-[#22c55e]' : 'border-[#cce5d4] bg-[#eaf4ee]/70 hover:border-[#b4d8bf]'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-[#1b633d] flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
            <span>Ready (Siap Sewa)</span>
          </div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-0.5">{metrics.ready}</div>
          <div className="text-[11px] text-[#1b633d]/80 mt-1">Siap diserahkan ke pelanggan</div>
        </button>

        <button
          onClick={() => setActiveStatusFilter('rented')}
          className={`p-3.5 rounded-xl border text-left transition-colors shadow-2xs ${
            activeStatusFilter === 'rented' ? 'border-[#3b82f6] bg-[#eef4fc] ring-1 ring-[#3b82f6]' : 'border-[#cee0f7] bg-[#eef4fc]/70 hover:border-[#b3cff2]'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-[#1e5488] flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
            <span>Sedang Tersewa</span>
          </div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-0.5">{metrics.rented}</div>
          <div className="text-[11px] text-[#1e5488]/80 mt-1">Aktif di tangan customer</div>
        </button>

        <button
          onClick={() => setActiveStatusFilter('trouble')}
          className={`p-3.5 rounded-xl border text-left transition-colors shadow-2xs ${
            activeStatusFilter === 'trouble' ? 'border-[#ef4444] bg-[#fdf1f3] ring-1 ring-[#ef4444]' : 'border-[#f9ccd5] bg-[#fdf1f3]/70 hover:border-[#f5b3c0]'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-[#8c273e] flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
            <span>Trouble / Rusak</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#8c273e] mt-0.5">{metrics.trouble}</div>
          <div className="text-[11px] text-[#8c273e]/80 mt-1">Antrian teknisi & lab servis</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari SKU, Nama, SN, atau Brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#4a586e]"
            />
          </div>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-700 focus:outline-none"
          >
            <option value="all">Semua Brand</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-stone-500 font-mono">
          Menampilkan {filteredLaptops.length} dari {laptops.length} unit
        </div>
      </div>

      {/* View Mode: Table (Default Minimalist Pastel) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-[#e8e2d8] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#e8e2d8] bg-[#f7f5ee] text-[10px] font-mono uppercase text-stone-600">
                  <th className="py-2.5 px-3">SKU & SN</th>
                  <th className="py-2.5 px-3">Nama Unit & Spesifikasi</th>
                  <th className="py-2.5 px-3">Cabang</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Tarif / Hari</th>
                  <th className="py-2.5 px-3">Keterangan / Penyewa</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f2ea]">
                {filteredLaptops.map((laptop) => {
                  const isTrouble = laptop.status === 'trouble';
                  const isRented = laptop.status === 'rented';
                  const isReady = laptop.status === 'ready';

                  return (
                    <tr key={laptop.id} className="hover:bg-[#faf7f2] transition-colors">
                      {/* SKU & SN */}
                      <td className="py-2.5 px-3 font-mono text-stone-700 whitespace-nowrap">
                        <div className="font-semibold text-stone-900">{laptop.sku}</div>
                        <div className="text-[10px] text-stone-400">{laptop.serialNumber || 'SN-NA'}</div>
                      </td>

                      {/* Name & Specs */}
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-stone-800">{laptop.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                          {laptop.processor} &bull; {laptop.ram} / {laptop.storage}
                        </div>
                      </td>

                      {/* Cabang */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-stone-700">
                        <span>{laptop.branchCity}</span>
                        {laptop.branchCity === 'Malang' && (
                          <span className="text-[10px] text-stone-400 font-mono ml-1">(Pusat)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          isReady 
                            ? 'bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4]' 
                            : isRented 
                              ? 'bg-[#eef4fc] text-[#1e5488] border border-[#cee0f7]' 
                              : 'bg-[#fdf1f3] text-[#8c273e] border border-[#f9ccd5]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isReady ? 'bg-[#22c55e]' :
                            isRented ? 'bg-[#3b82f6]' : 'bg-[#ef4444]'
                          }`}></span>
                          <span className="capitalize">
                            {isReady ? 'Ready' : isRented ? 'Tersewa' : 'Trouble'}
                          </span>
                        </span>
                      </td>

                      {/* Tarif */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-stone-800 font-medium">
                        {formatRupiah(laptop.dailyPrice)}
                      </td>

                      {/* Info / Renter */}
                      <td className="py-2.5 px-3 max-w-[200px]">
                        {isRented && (
                          <div className="text-[#1e5488] font-mono text-[11px]">
                            Disewa: {laptop.currentRenterName || 'Customer Aktif'}
                          </div>
                        )}
                        {isTrouble && (
                          <div className="text-[#8c273e] text-[11px] truncate" title={laptop.troubleDescription}>
                            Kendala: {laptop.troubleDescription || 'Butuh Servis'}
                          </div>
                        )}
                        {isReady && (
                          <div className="text-stone-400 text-[11px]">Siap disewa</div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Sewakan Unit untuk laptop ready */}
                          {isReady && onOpenRentalModal && (
                            <button
                              onClick={() => onOpenRentalModal(laptop)}
                              title="Mulai Alur Sewa & Buat Kontrak SPK"
                              className="px-2.5 py-1 rounded-lg bg-[#eaf4ee] hover:bg-[#dbede0] border border-[#cce5d4] text-[#1b633d] font-bold text-[11px] transition-colors shadow-2xs flex items-center gap-1"
                            >
                              <span>+ Sewakan</span>
                            </button>
                          )}

                          {/* Quick Status Selector */}
                          <select
                            value={laptop.status}
                            onChange={(e) => handleQuickStatusChange(laptop, e.target.value as LaptopUnitStatus)}
                            className="text-[11px] bg-[#faf8f5] border border-[#e5dfd5] rounded-lg px-2 py-1 text-stone-700 focus:outline-none"
                          >
                            <option value="ready">Ready</option>
                            <option value="rented">Tersewa</option>
                            <option value="trouble">Trouble</option>
                          </select>

                          {isTrouble && onNavigateToService && (
                            <button
                              onClick={() => onNavigateToService(laptop)}
                              title="Kirim ke Servis Teknisi"
                              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#faf7f2] transition-colors border border-transparent hover:border-[#e5dfd5]"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(laptop)}
                            title="Edit Data"
                            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#faf7f2] transition-colors border border-transparent hover:border-[#e5dfd5]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteLaptop(laptop.id)}
                            title="Hapus Unit"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-[#8c273e] hover:bg-[#fdf1f3] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Mode: Grid (Pastel Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLaptops.map((laptop) => {
            const isTrouble = laptop.status === 'trouble';
            const isRented = laptop.status === 'rented';
            const isReady = laptop.status === 'ready';

            return (
              <div 
                key={laptop.id}
                className="bg-white rounded-xl border border-[#e8e2d8] p-4 flex flex-col justify-between hover:border-[#cfc7bc] transition-all shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-stone-500 font-medium">{laptop.sku}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      isReady 
                        ? 'bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4]' 
                        : isRented 
                          ? 'bg-[#eef4fc] text-[#1e5488] border border-[#cee0f7]' 
                          : 'bg-[#fdf1f3] text-[#8c273e] border border-[#f9ccd5]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isReady ? 'bg-[#22c55e]' :
                        isRented ? 'bg-[#3b82f6]' : 'bg-[#ef4444]'
                      }`}></span>
                      <span className="capitalize">
                        {laptop.status}
                      </span>
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-stone-800 mt-1.5">
                    {laptop.name}
                  </h3>
                  <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                    Cabang {laptop.branchCity} &bull; {laptop.brand}
                  </div>

                  <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e8e2d8] text-xs text-stone-600 space-y-1 mt-3 font-mono">
                    <div>{laptop.processor}</div>
                    <div>{laptop.ram} &bull; {laptop.storage}</div>
                    <div className="pt-1.5 border-t border-[#e8e2d8] text-stone-900 font-bold flex items-center justify-between">
                      <span>Tarif Sewa:</span>
                      <span>{formatRupiah(laptop.dailyPrice)}/hari</span>
                    </div>
                  </div>

                  {isTrouble && (
                    <div className="mt-2.5 text-xs text-[#8c273e] bg-[#fdf1f3] p-2.5 rounded-xl border border-[#f9ccd5]">
                      Kendala: {laptop.troubleDescription || 'Perlu perbaikan teknisi'}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#f0ebe3] text-xs">
                  <select
                    value={laptop.status}
                    onChange={(e) => handleQuickStatusChange(laptop, e.target.value as LaptopUnitStatus)}
                    className="text-[11px] bg-[#faf8f5] border border-[#e5dfd5] rounded-lg px-2 py-1 text-stone-700"
                  >
                    <option value="ready">Ready</option>
                    <option value="rented">Tersewa</option>
                    <option value="trouble">Trouble</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    {isReady && onOpenRentalModal && (
                      <button
                        onClick={() => onOpenRentalModal(laptop)}
                        className="px-2.5 py-1 text-[11px] font-bold border border-[#cce5d4] bg-[#eaf4ee] text-[#1b633d] rounded-lg hover:bg-[#dbede0] transition-colors shadow-2xs"
                      >
                        + Sewakan
                      </button>
                    )}
                    {isTrouble && onNavigateToService && (
                      <button
                        onClick={() => onNavigateToService(laptop)}
                        className="px-2.5 py-1 text-[11px] border border-[#fbe5b4] bg-[#fef7eb] text-[#8a5714] rounded-lg hover:bg-[#faeecf] transition-colors"
                      >
                        Servis
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(laptop)}
                      className="px-2.5 py-1 text-[11px] border border-[#e5dfd5] bg-white text-stone-700 rounded-lg hover:bg-[#faf7f2] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLaptop(laptop.id)}
                      className="px-2.5 py-1 text-[11px] border border-[#f9ccd5] bg-[#fdf1f3] text-[#8c273e] rounded-lg hover:bg-[#fce5ea] transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Minimalist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-md border border-zinc-200 shadow-xl max-w-xl w-full p-5 my-8 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="font-bold text-sm text-zinc-900">
                {editingLaptop ? 'Edit Unit Laptop' : 'Tambah Unit Laptop Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Nama Laptop / Model *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none focus:border-zinc-400"
                    placeholder="Contoh: ThinkPad T14 Gen 4"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Brand</label>
                  <select
                    value={formData.brand || 'Lenovo'}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  >
                    <option value="Lenovo">Lenovo</option>
                    <option value="Dell">Dell</option>
                    <option value="HP">HP</option>
                    <option value="Asus">Asus</option>
                    <option value="Apple">Apple</option>
                    <option value="Acer">Acer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">SKU / Kode Unit</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Cabang Penempatan</label>
                  <select
                    value={formData.branchCity || 'Malang'}
                    onChange={(e) => setFormData({ ...formData, branchCity: e.target.value as BranchCity })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  >
                    <option value="Malang">Malang (Pusat)</option>
                    <option value="Sidoarjo">Sidoarjo</option>
                    <option value="Bekasi">Bekasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Processor</label>
                  <input
                    type="text"
                    value={formData.processor || ''}
                    onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                    placeholder="Contoh: Intel Core i5-1335U"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">RAM & Storage</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.ram || ''}
                      onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                      className="w-full px-2 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                      placeholder="16GB"
                    />
                    <input
                      type="text"
                      value={formData.storage || ''}
                      onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                      className="w-full px-2 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                      placeholder="512GB SSD"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Tarif Harian (Rp)</label>
                  <input
                    type="number"
                    value={formData.dailyPrice || 150000}
                    onChange={(e) => setFormData({ ...formData, dailyPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Status Awal</label>
                  <select
                    value={formData.status || 'ready'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LaptopUnitStatus })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  >
                    <option value="ready">Ready (Siap Sewa)</option>
                    <option value="rented">Sedang Tersewa</option>
                    <option value="trouble">Trouble / Rusak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Deposit Jaminan (Rp)</label>
                  <input
                    type="number"
                    value={formData.depositAmount || 700000}
                    onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {formData.status === 'trouble' && (
                <div>
                  <label className="block text-[11px] font-mono text-rose-600 mb-1">Deskripsi Kendala / Trouble *</label>
                  <input
                    type="text"
                    value={formData.troubleDescription || ''}
                    onChange={(e) => setFormData({ ...formData, troubleDescription: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-rose-300 rounded text-zinc-900 focus:outline-none"
                    placeholder="Contoh: Keyboard tombol enter tidak merespon, baterai drop"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-200 rounded text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded font-medium transition-colors"
                >
                  {editingLaptop ? 'Simpan Perubahan' : 'Tambah Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
