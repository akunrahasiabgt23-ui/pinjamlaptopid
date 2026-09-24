import React, { useState } from 'react';
import { 
  X, Laptop as LaptopIcon, Save, Image as ImageIcon, DollarSign, 
  Cpu, HardDrive, Monitor, Shield, Layers, Plus, Trash2, CheckCircle2 
} from 'lucide-react';
import { Laptop, LaptopCategory, BranchCity } from '../../types';
import { formatRupiah } from '../../utils/storage';
import { generateLaptopSku, generateSerialNumber } from '../../data/laptops';

interface AdminLaptopModalProps {
  isOpen: boolean;
  onClose: () => void;
  laptopToEdit?: Laptop | null;
  onSave: (laptop: Laptop) => void;
}

const SAMPLE_IMAGES = [
  { label: 'MacBook Space Grey', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80' },
  { label: 'ThinkPad Hitam Doff', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Dell XPS Slim Silver', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80' },
  { label: 'ASUS ROG Gaming RGB', url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Laptop Bisnis Modern', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80' }
];

export const AdminLaptopModal: React.FC<AdminLaptopModalProps> = ({
  isOpen,
  onClose,
  laptopToEdit,
  onSave
}) => {
  const isEditing = !!laptopToEdit;

  const [formData, setFormData] = useState<Partial<Laptop>>(() => {
    if (laptopToEdit) {
      return { ...laptopToEdit };
    }
    return {
      id: `laptop-${Date.now()}`,
      name: '',
      brand: '',
      category: 'Bisnis & Kantor',
      processor: '',
      ram: '16 GB',
      storage: '512 GB SSD NVMe',
      gpu: 'Intel Iris Xe Graphics',
      display: '14.0" Full HD IPS',
      weight: '1.4 kg',
      batteryLife: 'Hingga 8 jam',
      dailyPrice: 120000,
      weeklyPrice: 720000,
      monthlyPrice: 2400000,
      depositAmount: 1500000,
      lateFeePerHour: 15000,
      image: SAMPLE_IMAGES[0].url,
      availableUnits: 5,
      badge: '',
      includedAccessories: ['Charger Asli', 'Tas Laptop Premium', 'Mouse Wireless'],
      description: 'Laptop performa stabil, terpasang Windows asli dan Microsoft Office siap pakai untuk kerja kantor dan harian.'
    };
  });

  const [accessoryInput, setAccessoryInput] = useState<string>('');

  if (!isOpen) return null;

  const handleChange = (field: keyof Laptop, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAutoCalcPrices = () => {
    const daily = formData.dailyPrice || 100000;
    setFormData(prev => ({
      ...prev,
      weeklyPrice: Math.round(daily * 6),
      monthlyPrice: Math.round(daily * 20),
      depositAmount: Math.round(daily * 10),
      lateFeePerHour: Math.round(daily * 0.12)
    }));
  };

  const handleAddAccessory = () => {
    if (!accessoryInput.trim()) return;
    const current = formData.includedAccessories || [];
    setFormData(prev => ({
      ...prev,
      includedAccessories: [...current, accessoryInput.trim()]
    }));
    setAccessoryInput('');
  };

  const handleRemoveAccessory = (index: number) => {
    const current = [...(formData.includedAccessories || [])];
    current.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      includedAccessories: current
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.brand?.trim()) {
      alert('Nama dan Merk Laptop wajib diisi');
      return;
    }

    const finalBrand = formData.brand?.trim() || 'Laptop';
    const finalId = formData.id || `laptop-${Date.now()}`;
    const finalSku = formData.sku?.trim() || generateLaptopSku({ brand: finalBrand, id: finalId });
    const finalSn = formData.serialNumber?.trim() || generateSerialNumber({ brand: finalBrand, id: finalId });
    const branchCity: BranchCity = (formData.branchCity as BranchCity) || 'Malang';
    const branchHubId = branchCity === 'Malang' ? 'hub-malang' : branchCity === 'Sidoarjo' ? 'hub-sidoarjo' : 'hub-bekasi';

    const laptopData: Laptop = {
      id: finalId,
      sku: finalSku,
      serialNumber: finalSn,
      branchCity,
      branchHubId,
      name: formData.name.trim(),
      brand: finalBrand,
      category: (formData.category as any) || 'Bisnis & Kantor',
      processor: formData.processor?.trim() || 'Intel Core i5',
      ram: formData.ram?.trim() || '16 GB',
      storage: formData.storage?.trim() || '512 GB SSD',
      gpu: formData.gpu?.trim() || 'Integrated Graphics',
      display: formData.display?.trim() || '14.0" FHD',
      weight: formData.weight?.trim() || '1.5 kg',
      batteryLife: formData.batteryLife?.trim() || '6-8 jam',
      dailyPrice: Number(formData.dailyPrice) || 100000,
      weeklyPrice: Number(formData.weeklyPrice) || 600000,
      monthlyPrice: Number(formData.monthlyPrice) || 2000000,
      depositAmount: Number(formData.depositAmount) || 1500000,
      lateFeePerHour: Number(formData.lateFeePerHour) || 20000,
      image: formData.image?.trim() || SAMPLE_IMAGES[0].url,
      availableUnits: Number(formData.availableUnits) ?? 3,
      badge: formData.badge?.trim() || undefined,
      includedAccessories: formData.includedAccessories && formData.includedAccessories.length > 0 
        ? formData.includedAccessories 
        : ['Charger Asli', 'Tas Laptop'],
      description: formData.description?.trim() || 'Laptop siap pakai untuk kebutuhan kerja dan kuliah.'
    };

    onSave(laptopData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div 
        className="w-full max-w-3xl my-6 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <LaptopIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {isEditing ? 'Edit Data Laptop Katalog' : 'Tambah Unit Laptop Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? `ID: ${formData.id}` : 'Tambahkan unit baru ke katalog persewaan'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Section 1: Identitas Laptop */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>1. Identitas & Kategori Laptop</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Laptop <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lenovo ThinkPad T14 Gen 4"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Merk / Brand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lenovo, Apple, Dell, ASUS"
                  value={formData.brand || ''}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Penggunaan
                </label>
                <select
                  value={formData.category || 'Bisnis & Kantor'}
                  onChange={(e) => handleChange('category', e.target.value as LaptopCategory)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium bg-white"
                >
                  <option value="Bisnis & Kantor">Bisnis & Kantor (Word, Excel, Rapat)</option>
                  <option value="Programming & Dev">Programming & Dev (Kuliah, Coding)</option>
                  <option value="Desain & Render">Desain & Render (Adobe, 3D, Video)</option>
                  <option value="Gaming & AI">Gaming & AI (Performa Tertinggi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Badge Promosi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Paling Populer, Best Value, Favorit"
                  value={formData.badge || ''}
                  onChange={(e) => handleChange('badge', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SKU / Kode Unit (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PL-LNV-101 (Kosongkan untuk otomatis)"
                  value={formData.sku || ''}
                  onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold text-blue-700 uppercase"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Format standar: PL-[MERK]-[NOMOR]. Otomatis dibuat jika dikosongkan.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Serial Number (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SN-LNV-001-84291 (Kosongkan untuk otomatis)"
                  value={formData.serialNumber || ''}
                  onChange={(e) => handleChange('serialNumber', e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold text-slate-700 uppercase"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Nomor seri fisik unit. Otomatis dibuat jika dikosongkan.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi Unit Cabang <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.branchCity || 'Malang'}
                  onChange={(e) => handleChange('branchCity', e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium bg-white"
                >
                  <option value="Malang">Malang (Pusat - Malang Kota, Kab, Batu)</option>
                  <option value="Sidoarjo">Sidoarjo (Hub Sidoarjo &amp; Surabaya)</option>
                  <option value="Bekasi">Bekasi (Hub Bekasi &amp; Jabodetabek)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Menentukan batasan domisili customer saat pemesanan unit.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deskripsi Singkat
              </label>
              <textarea
                rows={2}
                placeholder="Rekomendasi penggunaan, keunggulan performa, atau aplikasi yang sudah terinstall..."
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Tarif Sewa & Stok Fisik */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>2. Tarif Sewa & Jumlah Stok Unit</span>
              </h4>
              <button
                type="button"
                onClick={handleAutoCalcPrices}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
              >
                Hitung Otomatis Paket Mingguan/Bulanan
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tarif Harian (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={10000}
                  step={5000}
                  value={formData.dailyPrice || ''}
                  onChange={(e) => handleChange('dailyPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tarif Mingguan (Rp)
                </label>
                <input
                  type="number"
                  min={50000}
                  step={10000}
                  value={formData.weeklyPrice || ''}
                  onChange={(e) => handleChange('weeklyPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tarif Bulanan (Rp)
                </label>
                <input
                  type="number"
                  min={200000}
                  step={50000}
                  value={formData.monthlyPrice || ''}
                  onChange={(e) => handleChange('monthlyPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stok Fisik Tersedia
                </label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={formData.availableUnits ?? 1}
                  onChange={(e) => handleChange('availableUnits', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold text-center"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Uang Jaminan (Jika Memilih Opsi Deposit)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={formData.depositAmount || ''}
                  onChange={(e) => handleChange('depositAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Dicairkan 100% saat unit kembali aman.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Denda Keterlambatan per Jam (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={formData.lateFeePerHour || 15000}
                  onChange={(e) => handleChange('lateFeePerHour', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Spesifikasi Teknis */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>3. Spesifikasi Hardware</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Processor</label>
                <input
                  type="text"
                  placeholder="Contoh: Intel Core i7-13700H"
                  value={formData.processor || ''}
                  onChange={(e) => handleChange('processor', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">RAM</label>
                <input
                  type="text"
                  placeholder="Contoh: 16 GB DDR5"
                  value={formData.ram || ''}
                  onChange={(e) => handleChange('ram', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Storage / SSD</label>
                <input
                  type="text"
                  placeholder="Contoh: 512 GB NVMe SSD"
                  value={formData.storage || ''}
                  onChange={(e) => handleChange('storage', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kartu Grafis (GPU)</label>
                <input
                  type="text"
                  placeholder="Contoh: NVIDIA RTX 4060 8GB"
                  value={formData.gpu || ''}
                  onChange={(e) => handleChange('gpu', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Layar / Display</label>
                <input
                  type="text"
                  placeholder="Contoh: 15.6 FHD 144Hz IPS"
                  value={formData.display || ''}
                  onChange={(e) => handleChange('display', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Berat & Baterai</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="1.4 kg"
                    value={formData.weight || ''}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Hingga 10 jam"
                    value={formData.batteryLife || ''}
                    onChange={(e) => handleChange('batteryLife', e.target.value)}
                    className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Foto & Kelengkapan */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>4. Foto Unit & Kelengkapan Sewa</span>
            </h4>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                URL Foto Laptop
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image || ''}
                  onChange={(e) => handleChange('image', e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  required
                />
                {formData.image && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Sample Quick Images */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 self-center mr-1">Pilih Gambar Cepat:</span>
                {SAMPLE_IMAGES.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChange('image', s.url)}
                    className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                      formData.image === s.url
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Included accessories */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700">
                Kelengkapan Paket Sewa (Included Accessories)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Charger Asli, Tas Laptop, Mouse Wireless"
                  value={accessoryInput}
                  onChange={(e) => setAccessoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAccessory();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddAccessory}
                  className="px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(formData.includedAccessories || []).map((acc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100 text-xs font-medium"
                  >
                    <span>{acc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAccessory(i)}
                      className="text-blue-400 hover:text-rose-600 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Tambah ke Katalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
