import React, { useState, useEffect } from 'react';
import { 
  Laptop as LaptopIcon, Plus, Search, Edit3, Trash2, RotateCcw, 
  Check, AlertCircle, Sparkles, Filter, CheckCircle2, ChevronRight,
  TrendingUp, Layers, Box, Cpu, DollarSign,
  FileSpreadsheet, Download, Upload
} from 'lucide-react';
import { Laptop, LaptopCategory } from '../../types';
import { 
  getStoredLaptops, updateStoredLaptop, addStoredLaptop, 
  deleteStoredLaptop, resetStoredLaptopsToDefault, formatRupiah 
} from '../../utils/storage';
import { AdminLaptopModal } from './AdminLaptopModal';
import { downloadLaptopExcelTemplate, exportCurrentCatalogToExcel } from '../../utils/excelImportExport';
import { ExcelProductUploadModal } from './ExcelProductUploadModal';

export const AdminCatalogManager: React.FC = () => {
  const [laptops, setLaptops] = useState<Laptop[]>(() => getStoredLaptops());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<LaptopCategory>('Semua');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [excelModalOpen, setExcelModalOpen] = useState<boolean>(false);
  const [laptopToEdit, setLaptopToEdit] = useState<Laptop | null>(null);
  const [laptopToDelete, setLaptopToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>('');

  const reloadLaptops = () => {
    setLaptops(getStoredLaptops());
  };

  useEffect(() => {
    const handleUpdate = () => reloadLaptops();
    window.addEventListener('pinjamlaptop_catalog_updated', handleUpdate);
    return () => window.removeEventListener('pinjamlaptop_catalog_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleOpenAdd = () => {
    setLaptopToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (laptop: Laptop) => {
    setLaptopToEdit(laptop);
    setModalOpen(true);
  };

  const handleSaveLaptop = (laptop: Laptop) => {
    if (laptopToEdit) {
      updateStoredLaptop(laptop);
      showToast(`Laptop "${laptop.name}" berhasil diperbarui!`);
    } else {
      addStoredLaptop(laptop);
      showToast(`Laptop "${laptop.name}" berhasil ditambahkan ke katalog!`);
    }
    reloadLaptops();
  };

  const handleDeleteLaptop = (id: string, name: string) => {
    setLaptopToDelete({ id, name });
  };

  const confirmDeleteLaptop = () => {
    if (!laptopToDelete) return;
    deleteStoredLaptop(laptopToDelete.id);
    showToast(`Unit "${laptopToDelete.name}" telah dihapus dari katalog.`);
    setLaptopToDelete(null);
    reloadLaptops();
  };

  const handleQuickStockChange = (laptop: Laptop, delta: number) => {
    const newStock = Math.max(0, laptop.availableUnits + delta);
    const updated = { ...laptop, availableUnits: newStock };
    updateStoredLaptop(updated);
    reloadLaptops();
  };

  const handleResetDefault = () => {
    setShowResetModal(true);
  };

  const confirmResetDefault = () => {
    resetStoredLaptopsToDefault();
    showToast('Katalog berhasil direset ke pengaturan bawaan.');
    setShowResetModal(false);
    reloadLaptops();
  };

  const filteredLaptops = laptops.filter(l => {
    const matchCat = selectedCategory === 'Semua' || l.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchQuery = 
      l.name.toLowerCase().includes(q) ||
      l.brand.toLowerCase().includes(q) ||
      (l.sku && l.sku.toLowerCase().includes(q)) ||
      l.processor.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const totalUnits = laptops.reduce((acc, curr) => acc + (curr.availableUnits || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner & KPI */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>MANAJEMEN KATALOG & STOK UNIT</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengelolaan Unit Sewa Pinjamlaptop
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tambah unit baru, perbarui tarif sewa harian/bulanan, spesifikasi teknis, dan kelola jumlah stok fisik.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-admin-download-excel-template"
            onClick={downloadLaptopExcelTemplate}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Unduh contoh template Excel resmi (.xlsx) sebagai acuan"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Template Excel</span>
          </button>

          <button
            type="button"
            id="btn-admin-upload-excel"
            onClick={() => setExcelModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Upload file Excel untuk menambah banyak produk baru secara otomatis"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel Produk</span>
          </button>

          <button
            type="button"
            id="btn-admin-export-excel"
            onClick={() => exportCurrentCatalogToExcel(laptops)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Ekspor seluruh daftar laptop saat ini ke file Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Ekspor Excel</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Kembalikan ke data laptop default"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Laptop Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Tipe Model
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{laptops.length}</span>
            <span className="text-xs text-slate-500">model terdaftar</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Fisik Unit Siap Sewa
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-600">{totalUnits}</span>
            <span className="text-xs text-slate-500">unit laptop</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Tarif Harian Terendah
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-black text-emerald-600">
              {formatRupiah(Math.min(...laptops.map(l => l.dailyPrice || 100000)))}
            </span>
            <span className="text-xs text-slate-500">/hari</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Kategori Aktif
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-purple-600">4</span>
            <span className="text-xs text-slate-500">segmen pasar</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari laptop, merk, spesifikasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['Semua', 'Bisnis & Kantor', 'Programming & Dev', 'Desain & Render', 'Gaming & AI'] as LaptopCategory[]).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog List */}
      <div className="space-y-3">
        {filteredLaptops.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-base">Tidak ada laptop yang cocok</h4>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau kategori.</p>
          </div>
        ) : (
          filteredLaptops.map(laptop => (
            <div 
              key={laptop.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative">
                  <img 
                    src={laptop.image} 
                    alt={laptop.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {laptop.badge && (
                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      {laptop.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      SKU: {laptop.sku}
                    </span>
                    {laptop.serialNumber && (
                      <span className="font-mono text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        SN: {laptop.serialNumber}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      laptop.branchCity === 'Malang'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : laptop.branchCity === 'Sidoarjo'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}>
                      Cabang: {laptop.branchCity || 'Malang'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {laptop.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Merk: <strong>{laptop.brand}</strong>
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900">
                    {laptop.name}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>CPU: {laptop.processor}</span>
                    <span>•</span>
                    <span>RAM: {laptop.ram}</span>
                    <span>•</span>
                    <span>SSD: {laptop.storage}</span>
                  </div>

                  <div className="text-xs text-slate-400">
                    Display: {laptop.display} | GPU: {laptop.gpu}
                  </div>
                </div>
              </div>

              {/* Right: Pricing, Stock Adjuster, Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Pricing summary */}
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Tarif Sewa
                  </span>
                  <div className="text-base sm:text-lg font-black text-blue-600">
                    {formatRupiah(laptop.dailyPrice)} <span className="text-xs font-medium text-slate-400">/hari</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {formatRupiah(laptop.weeklyPrice)} /minggu
                  </div>
                </div>

                {/* Stock Controls */}
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Stok Fisik
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickStockChange(laptop, -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center justify-center"
                      title="Kurangi 1 unit"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-black text-slate-900 text-sm font-mono">
                      {laptop.availableUnits}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickStockChange(laptop, 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center justify-center"
                      title="Tambah 1 unit"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(laptop)}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Unit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteLaptop(laptop.id, laptop.name)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors"
                    title="Hapus dari katalog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Modal */}
      <AdminLaptopModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        laptopToEdit={laptopToEdit}
        onSave={handleSaveLaptop}
      />

      {/* Delete Confirmation Modal */}
      {laptopToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center">Hapus Unit Laptop?</h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Yakin ingin menghapus unit <strong className="text-slate-800">"{laptopToDelete.name}"</strong> dari katalog persewaan?
            </p>
            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setLaptopToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteLaptop}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Default Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-100">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center">Reset ke Katalog Bawaan?</h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Semua data laptop kustom akan dikembalikan ke daftar katalog bawaan sistem. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmResetDefault}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer"
              >
                Reset Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Excel & Download Template */}
      <ExcelProductUploadModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        onSuccess={(count, mode) => {
          showToast(
            mode === 'replace'
              ? `Katalog berhasil diperbarui dengan ${count} produk dari file Excel!`
              : `${count} produk baru dari Excel berhasil ditambahkan ke katalog!`
          );
          reloadLaptops();
        }}
      />
    </div>
  );
};
