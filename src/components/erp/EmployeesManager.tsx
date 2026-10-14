import React, { useState, useMemo } from 'react';
import { Employee, EmployeeRole, BranchCity } from '../../types';
import { formatRupiah } from '../../utils/erpStorage';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X
} from 'lucide-react';

interface EmployeesManagerProps {
  employees: Employee[];
  onSaveEmployees: (updated: Employee[]) => void;
  selectedBranch: BranchCity | 'Semua';
}

export const EmployeesManager: React.FC<EmployeesManagerProps> = ({
  employees,
  onSaveEmployees,
  selectedBranch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    nip: '',
    branchCity: 'Malang',
    role: 'technician',
    positionTitle: 'Teknisi Laptop Senior',
    phone: '',
    email: '',
    joinDate: new Date().toISOString().split('T')[0],
    baseSalary: 4500000,
    allowanceTransport: 500000,
    allowanceMeal: 500000,
    status: 'aktif',
    bankName: 'BCA',
    bankAccountNumber: ''
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      if (selectedBranch !== 'Semua' && e.branchCity !== selectedBranch) return false;
      if (roleFilter !== 'all' && e.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = e.name.toLowerCase().includes(q);
        const matchNip = e.nip.toLowerCase().includes(q);
        const matchPos = e.positionTitle.toLowerCase().includes(q);
        if (!matchName && !matchNip && !matchPos) return false;
      }
      return true;
    });
  }, [employees, selectedBranch, roleFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      total: employees.length,
      malang: employees.filter(e => e.branchCity === 'Malang').length,
      sidoarjo: employees.filter(e => e.branchCity === 'Sidoarjo').length,
      bekasi: employees.filter(e => e.branchCity === 'Bekasi').length
    };
  }, [employees]);

  const handleOpenAdd = () => {
    const defaultBranch = selectedBranch === 'Semua' ? 'Malang' : selectedBranch;
    const newNip = `NIP-${defaultBranch.slice(0, 3).toUpperCase()}-${String(employees.length + 1).padStart(3, '0')}`;
    setEditingEmployee(null);
    setFormData({
      name: '',
      nip: newNip,
      branchCity: defaultBranch,
      role: 'technician',
      positionTitle: 'Teknisi Hardware',
      phone: '',
      email: '',
      joinDate: new Date().toISOString().split('T')[0],
      baseSalary: 4500000,
      allowanceTransport: 500000,
      allowanceMeal: 500000,
      status: 'aktif',
      bankName: 'BCA',
      bankAccountNumber: `5270${Date.now().toString().slice(-6)}`
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({ ...employee });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingEmployee) {
      const updated = employees.map(emp => emp.id === editingEmployee.id ? { ...emp, ...formData } as Employee : emp);
      onSaveEmployees(updated);
    } else {
      const newEmp: Employee = {
        ...formData,
        id: `emp-${Date.now()}`,
        nip: formData.nip || `NIP-${Date.now().toString().slice(-4)}`,
        name: formData.name || 'Karyawan Baru',
        branchCity: (formData.branchCity || 'Malang') as BranchCity,
        role: (formData.role || 'technician') as EmployeeRole,
        positionTitle: formData.positionTitle || 'Staf Operasional',
        phone: formData.phone || '',
        email: formData.email || '',
        joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
        baseSalary: Number(formData.baseSalary) || 4000000,
        allowanceTransport: Number(formData.allowanceTransport) || 500000,
        allowanceMeal: Number(formData.allowanceMeal) || 500000,
        status: formData.status || 'aktif',
        bankName: formData.bankName || 'BCA',
        bankAccountNumber: formData.bankAccountNumber || '00000000'
      };
      onSaveEmployees([newEmp, ...employees]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus karyawan ini dari database?')) {
      onSaveEmployees(employees.filter(e => e.id !== id));
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-stone-900">
            Database Karyawan (3 Cabang)
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Pilar 7: Struktur staf & teknisi Malang (Pusat), Sidoarjo, dan Bekasi
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      {/* Metric Strip in Pastel Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#f5f2ea] rounded-xl border border-[#e5dfd5] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-stone-500 font-semibold">Total Seluruh Karyawan</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">{counts.total} Orang</div>
          <div className="text-[11px] text-stone-500 mt-1">Konsolidasi 3 cabang</div>
        </div>

        <div className="p-3.5 bg-[#eef4fc] rounded-xl border border-[#cee0f7] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1e5488] font-semibold">Cabang Malang (Pusat)</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">{counts.malang} Orang</div>
          <div className="text-[11px] text-[#1e5488]/80 mt-1">Pusat teknisi & admin</div>
        </div>

        <div className="p-3.5 bg-[#eaf4ee] rounded-xl border border-[#cce5d4] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1b633d] font-semibold">Cabang Sidoarjo</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">{counts.sidoarjo} Orang</div>
          <div className="text-[11px] text-[#1b633d]/80 mt-1">Kurir & operasional toko</div>
        </div>

        <div className="p-3.5 bg-[#f5f0fa] rounded-xl border border-[#e2d6f5] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#5c3682] font-semibold">Cabang Bekasi</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">{counts.bekasi} Orang</div>
          <div className="text-[11px] text-[#5c3682]/80 mt-1">Head branch & logistik</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari NIP, Nama, Jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#4a586e]"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-700 focus:outline-none"
          >
            <option value="all">Semua Peran</option>
            <option value="technician">Teknisi</option>
            <option value="courier">Kurir / Driver</option>
            <option value="finance">Finance / Kasir</option>
            <option value="branch_manager">Branch Manager</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div className="text-xs text-stone-500 font-mono">
          Menampilkan {filteredEmployees.length} staf aktif
        </div>
      </div>

      {/* Table of Employees */}
      <div className="bg-white rounded-xl border border-[#e8e2d8] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e8e2d8] bg-[#f7f5ee] text-[10px] font-mono uppercase text-stone-600">
                <th className="py-2.5 px-3">NIP & Nama Karyawan</th>
                <th className="py-2.5 px-3">Jabatan & Peran</th>
                <th className="py-2.5 px-3">Cabang Penempatan</th>
                <th className="py-2.5 px-3">Kontak</th>
                <th className="py-2.5 px-3 font-mono">Gaji Pokok</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2ea]">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#faf7f2] transition-colors">
                  {/* Name & NIP */}
                  <td className="py-2.5 px-3 font-mono">
                    <div className="font-semibold text-stone-900 font-sans">{emp.name}</div>
                    <div className="text-[10px] text-stone-400">{emp.nip}</div>
                  </td>

                  {/* Position */}
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-stone-800">{emp.positionTitle}</div>
                    <div className="text-[10px] text-stone-400 font-mono capitalize">{emp.role}</div>
                  </td>

                  {/* Branch */}
                  <td className="py-2.5 px-3 whitespace-nowrap text-stone-700">
                    <span>{emp.branchCity}</span>
                    {emp.branchCity === 'Malang' && (
                      <span className="text-[10px] text-[#1e5488] font-mono ml-1.5 px-1.5 py-0.5 rounded bg-[#eef4fc] border border-[#cee0f7]">(Pusat)</span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="py-2.5 px-3 font-mono text-stone-600 whitespace-nowrap">
                    <div>{emp.phone}</div>
                    <div className="text-[10px] text-stone-400">{emp.email || '-'}</div>
                  </td>

                  {/* Salary */}
                  <td className="py-2.5 px-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                    {formatRupiah(emp.baseSalary)}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                      <span className="capitalize">{emp.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#faf7f2] transition-colors"
                        title="Edit Data"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-[#8c273e] hover:bg-[#fdf1f3] transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#e5dfd5] shadow-xl max-w-lg w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d8]">
              <h3 className="font-bold text-sm text-stone-900">
                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                    placeholder="Nama Karyawan"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">NIP (Nomor Induk Staf)</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 font-mono bg-white focus:outline-none focus:border-[#4a586e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Jabatan Pekerjaan *</label>
                  <input
                    type="text"
                    required
                    value={formData.positionTitle}
                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                    placeholder="Contoh: Teknisi Servis / Kurir Logistik"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Peran Fungsional</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                  >
                    <option value="technician">Teknisi Servis</option>
                    <option value="courier">Kurir / Driver</option>
                    <option value="finance">Finance / Kasir</option>
                    <option value="branch_manager">Kepala Cabang</option>
                    <option value="admin">Administrator Sistem</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Cabang Penempatan</label>
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

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 font-mono bg-white focus:outline-none focus:border-[#4a586e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                    placeholder="0812xxxx"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Rekening Bank</label>
                  <input
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 font-mono bg-white focus:outline-none focus:border-[#4a586e]"
                    placeholder="BCA 5270xxxx"
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
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
