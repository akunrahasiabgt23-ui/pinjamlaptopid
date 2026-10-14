import React, { useState, useMemo } from 'react';
import { Customer, BranchCity, CustomerReputation } from '../../types';
import { IdCardViewerModal } from './IdCardViewerModal';
import { 
  Users, 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Eye, 
  Edit3, 
  Trash2, 
  X,
  Phone,
  FileText
} from 'lucide-react';

interface CustomersManagerProps {
  customers: Customer[];
  onSaveCustomers: (updated: Customer[]) => void;
  selectedBranch: BranchCity | 'Semua';
  onOpenRentalModal?: (customer: Customer) => void;
}

export const CustomersManager: React.FC<CustomersManagerProps> = ({
  customers,
  onSaveCustomers,
  selectedBranch,
  onOpenRentalModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReputation, setSelectedReputation] = useState<'all' | CustomerReputation>('all');
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Malang',
    companyOrCampus: '',
    idCardType: 'KTP',
    idCardNumber: '',
    idCardPhotoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
    secondIdType: 'SIM',
    secondIdNumber: '',
    secondIdPhotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    emergencyContactName: '',
    emergencyContactRelation: 'Keluarga',
    emergencyContactPhone: '',
    reputation: 'good',
    notes: ''
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (selectedBranch !== 'Semua' && c.city !== selectedBranch) return false;
      if (selectedReputation !== 'all' && c.reputation !== selectedReputation) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.phone.toLowerCase().includes(q);
        const matchNik = (c.idCardNumber || '').toLowerCase().includes(q);
        const matchComp = (c.companyOrCampus || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchNik && !matchComp) return false;
      }
      return true;
    });
  }, [customers, selectedBranch, selectedReputation, searchQuery]);

  const handleOpenAdd = () => {
    const defaultCity = selectedBranch === 'Semua' ? 'Malang' : selectedBranch;
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: defaultCity,
      companyOrCampus: '',
      idCardType: 'KTP',
      idCardNumber: `35730${Date.now().toString().slice(-11)}`,
      idCardPhotoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
      secondIdType: 'SIM',
      secondIdNumber: '',
      secondIdPhotoUrl: '',
      emergencyContactName: '',
      emergencyContactRelation: 'Keluarga',
      emergencyContactPhone: '',
      reputation: 'good',
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ ...customer });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingCustomer) {
      const updated = customers.map(c => c.id === editingCustomer.id ? { ...c, ...formData } as Customer : c);
      onSaveCustomers(updated);
    } else {
      const newCust: Customer = {
        ...formData,
        id: `cst-${Date.now()}`,
        name: formData.name || 'Penyewa Baru',
        phone: formData.phone || '',
        email: formData.email || '',
        address: formData.address || '',
        city: (formData.city || 'Malang') as BranchCity,
        idCardType: formData.idCardType || 'KTP',
        idCardNumber: formData.idCardNumber || '',
        idCardPhotoUrl: formData.idCardPhotoUrl || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
        secondIdType: (formData.secondIdType || 'SIM') as any,
        secondIdNumber: formData.secondIdNumber || '',
        secondIdPhotoUrl: formData.secondIdPhotoUrl || '',
        emergencyContactName: formData.emergencyContactName || '',
        emergencyContactRelation: formData.emergencyContactRelation || 'Keluarga',
        emergencyContactPhone: formData.emergencyContactPhone || '',
        reputation: (formData.reputation || 'good') as CustomerReputation,
        totalRentals: 0,
        activeRentalCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onSaveCustomers([newCust, ...customers]);
    }

    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus penyewa ini dari database?')) {
      onSaveCustomers(customers.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e2d8]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-stone-800">
            Database Penyewa & Foto Identitas (KTP)
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Pilar 2: Database penyewa tersimpan aman & foto identitas dapat diinspeksi kembali sewaktu-waktu
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Penyewa</span>
        </button>
      </div>

      {/* Pastel Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#eef4fc] rounded-xl border border-[#cee0f7] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1e5488] font-semibold">Total Penyewa Terdata</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">{customers.length} Orang</div>
          <div className="text-[11px] text-[#1e5488]/80 mt-1">Konsolidasi 3 cabang</div>
        </div>

        <div className="p-3.5 bg-[#eaf4ee] rounded-xl border border-[#cce5d4] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1b633d] font-semibold">KTP & Berkas Lengkap</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {customers.filter(c => c.idCardPhotoUrl).length} Terverifikasi
          </div>
          <div className="text-[11px] text-[#1b633d]/80 mt-1">Siap untuk penyerahan unit</div>
        </div>

        <div className="p-3.5 bg-[#f5f0fa] rounded-xl border border-[#e2d6f5] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#5c3682] font-semibold">Reputasi Terpercaya</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {customers.filter(c => c.reputation === 'good').length} Customer
          </div>
          <div className="text-[11px] text-[#5c3682]/80 mt-1">Tanpa catatan tunggakan</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari Nama, No HP, No. KTP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#4a586e]"
            />
          </div>

          <select
            value={selectedReputation}
            onChange={(e) => setSelectedReputation(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-700 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="good">Baik / Bersih</option>
            <option value="warning">Ada Catatan</option>
            <option value="blacklist">Blacklist</option>
          </select>
        </div>

        <div className="text-xs text-stone-500 font-mono">
          Menampilkan {filteredCustomers.length} penyewa terdata
        </div>
      </div>

      {/* Table of Customers */}
      <div className="bg-white rounded-xl border border-[#e8e2d8] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e8e2d8] bg-[#f7f5ee] text-[10px] font-mono uppercase text-stone-600">
                <th className="py-2.5 px-3">Nama Penyewa & Instansi</th>
                <th className="py-2.5 px-3">Kontak & Domisili</th>
                <th className="py-2.5 px-3">No. Identitas Resmi</th>
                <th className="py-2.5 px-3">Foto KTP (Arsip)</th>
                <th className="py-2.5 px-3">Kontak Darurat</th>
                <th className="py-2.5 px-3">Reputasi</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2ea]">
              {filteredCustomers.map((c) => {
                const isBlacklist = c.reputation === 'blacklist';
                const isWarning = c.reputation === 'warning';

                return (
                  <tr key={c.id} className="hover:bg-[#faf7f2] transition-colors">
                    {/* Name & Instansi */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-stone-900">{c.name}</div>
                      <div className="text-[11px] text-stone-500">{c.companyOrCampus || 'Perorangan'}</div>
                      <div className="text-[10px] text-stone-400 font-mono">Cabang {c.city}</div>
                    </td>

                    {/* Contact & Address */}
                    <td className="py-2.5 px-3 font-mono text-stone-700 whitespace-nowrap">
                      <div>{c.phone}</div>
                      <div className="text-[10px] text-stone-400 font-sans truncate max-w-[180px]" title={c.address}>
                        {c.address}
                      </div>
                    </td>

                    {/* NIK */}
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                      <div className="text-stone-900 font-medium">{c.idCardNumber || 'NIK-BELUM-ADA'}</div>
                      <div className="text-[10px] text-stone-400">{c.idCardType || 'KTP'}</div>
                    </td>

                    {/* Foto KTP Preview Button in Pastel */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <button
                        onClick={() => setViewingCustomer(c)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f5f0fa] border border-[#e2d6f5] hover:bg-[#ede5f7] rounded-lg text-[#5c3682] text-[11px] font-medium transition-colors"
                        title="Klik untuk membuka dan memperbesar foto identitas"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#5c3682]" />
                        <span>Lihat KTP</span>
                      </button>
                    </td>

                    {/* Emergency Contact */}
                    <td className="py-2.5 px-3 text-stone-700">
                      <div>{c.emergencyContactName || '-'}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{c.emergencyContactPhone || ''}</div>
                    </td>

                    {/* Reputasi in Pastel Pills */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        isBlacklist 
                          ? 'bg-[#fdf1f3] text-[#8c273e] border border-[#f9ccd5]' 
                          : isWarning 
                            ? 'bg-[#fef7eb] text-[#8a5714] border border-[#fbe5b4]' 
                            : 'bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isBlacklist ? 'bg-[#ef4444]' :
                          isWarning ? 'bg-[#eab308]' : 'bg-[#22c55e]'
                        }`}></span>
                        <span className="capitalize">
                          {c.reputation}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenRentalModal && (
                          <button
                            onClick={() => onOpenRentalModal(c)}
                            className="px-2 py-1 rounded-lg bg-[#eaf4ee] hover:bg-[#dbede0] border border-[#cce5d4] text-[#1b633d] font-semibold text-[11px] transition-colors shadow-2xs flex items-center gap-1"
                            title="Buat Perjanjian Sewa untuk Pelanggan Ini"
                          >
                            <FileText className="w-3 h-3" />
                            <span>+ Sewa</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#faf7f2] transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-[#8c273e] hover:bg-[#fdf1f3] transition-colors"
                          title="Hapus"
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

      {/* Modal Add / Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 shadow-xl max-w-lg w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="font-bold text-sm text-zinc-900">
                {editingCustomer ? 'Edit Data Penyewa' : 'Tambah Database Penyewa Baru'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                    placeholder="Nama sesuai KTP"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">No. WhatsApp / HP *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                    placeholder="08123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">No. KTP / NIK *</label>
                  <input
                    type="text"
                    required
                    value={formData.idCardNumber}
                    onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 font-mono focus:outline-none"
                    placeholder="16 digit NIK"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Cabang Domisili</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value as BranchCity })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  >
                    <option value="Malang">Malang (Pusat)</option>
                    <option value="Sidoarjo">Sidoarjo</option>
                    <option value="Bekasi">Bekasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">URL / Link Foto KTP *</label>
                <input
                  type="text"
                  required
                  value={formData.idCardPhotoUrl}
                  onChange={(e) => setFormData({ ...formData, idCardPhotoUrl: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none font-mono text-[11px]"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Instansi / Perusahaan</label>
                  <input
                    type="text"
                    value={formData.companyOrCampus}
                    onChange={(e) => setFormData({ ...formData, companyOrCampus: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                    placeholder="Nama Kantor / Kampus"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Kontak Darurat (Nama & No HP)</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                    placeholder="Bpk. Hendra (081xxxx)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Alamat Lengkap Domisili</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  placeholder="Jalan, RT/RW, Kelurahan, Kota"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 border border-zinc-200 rounded text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded font-medium hover:bg-zinc-800"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Foto Identitas */}
      <IdCardViewerModal
        isOpen={Boolean(viewingCustomer)}
        customer={viewingCustomer}
        onClose={() => setViewingCustomer(null)}
      />
    </div>
  );
};
