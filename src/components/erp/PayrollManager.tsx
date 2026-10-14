import React, { useState, useMemo } from 'react';
import { PayrollRecord, Employee, BranchCity } from '../../types';
import { formatRupiah } from '../../utils/erpStorage';
import { 
  Receipt, 
  Plus, 
  Search, 
  Printer, 
  X
} from 'lucide-react';

interface PayrollManagerProps {
  payrollRecords: PayrollRecord[];
  onSavePayroll: (updated: PayrollRecord[]) => void;
  employees: Employee[];
  selectedBranch: BranchCity | 'Semua';
}

export const PayrollManager: React.FC<PayrollManagerProps> = ({
  payrollRecords,
  onSavePayroll,
  employees,
  selectedBranch
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Oktober 2026');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Form State: Generate New Payroll Slip
  const [formData, setFormData] = useState<Partial<PayrollRecord>>({
    employeeId: '',
    periodMonthYear: 'Oktober 2026',
    baseSalary: 4500000,
    allowanceTransport: 500000,
    allowanceMeal: 500000,
    deliveryIncentive: 0,
    serviceIncentive: 0,
    deductions: 0,
    notes: 'Gaji bulanan operasional toko'
  });

  const filteredRecords = useMemo(() => {
    return payrollRecords.filter(p => {
      if (selectedBranch !== 'Semua' && p.branchCity !== selectedBranch) return false;
      if (statusFilter !== 'all' && p.paymentStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.employeeName.toLowerCase().includes(q);
        const matchNip = p.nip.toLowerCase().includes(q);
        if (!matchName && !matchNip) return false;
      }
      return true;
    });
  }, [payrollRecords, selectedBranch, statusFilter, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const list = selectedBranch === 'Semua' ? payrollRecords : payrollRecords.filter(p => p.branchCity === selectedBranch);
    const totalPengeluaranGaji = list.reduce((s, p) => s + p.totalNetSalary, 0);
    const paidCount = list.filter(p => p.paymentStatus === 'paid').length;
    const draftCount = list.filter(p => p.paymentStatus === 'draft').length;
    return {
      totalPengeluaranGaji,
      paidCount,
      draftCount,
      totalCount: list.length
    };
  }, [payrollRecords, selectedBranch]);

  const handleOpenGenerate = () => {
    const defaultEmp = employees[0];
    setFormData({
      employeeId: defaultEmp?.id || '',
      periodMonthYear: selectedPeriod,
      baseSalary: defaultEmp?.baseSalary || 4500000,
      allowanceTransport: defaultEmp?.allowanceTransport || 500000,
      allowanceMeal: defaultEmp?.allowanceMeal || 500000,
      deliveryIncentive: defaultEmp?.role === 'courier' ? 400000 : 0,
      serviceIncentive: defaultEmp?.role === 'technician' ? 350000 : 0,
      deductions: 0,
      notes: `Gaji bulan ${selectedPeriod}`
    });
    setIsGenerateModalOpen(true);
  };

  const handleSaveSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === formData.employeeId) || employees[0];
    if (!emp) return;

    const base = Number(formData.baseSalary) || 0;
    const trans = Number(formData.allowanceTransport) || 0;
    const meal = Number(formData.allowanceMeal) || 0;
    const delivInc = Number(formData.deliveryIncentive) || 0;
    const servInc = Number(formData.serviceIncentive) || 0;
    const ded = Number(formData.deductions) || 0;

    const totalNet = (base + trans + meal + delivInc + servInc) - ded;

    const newRecord: PayrollRecord = {
      id: `pyr-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeNip: emp.nip,
      nip: emp.nip,
      employeeRole: emp.role,
      branchCity: emp.branchCity,
      positionTitle: emp.positionTitle,
      periodMonthYear: formData.periodMonthYear || selectedPeriod,
      baseSalary: base,
      allowanceTransport: trans,
      allowanceMeal: meal,
      deliveryIncentive: delivInc,
      serviceIncentive: servInc,
      deductions: ded,
      totalNetSalary: totalNet,
      netSalary: totalNet,
      paymentStatus: 'draft',
      notes: formData.notes || ''
    };

    onSavePayroll([newRecord, ...payrollRecords]);
    setIsGenerateModalOpen(false);
  };

  const handleTogglePaymentStatus = (record: PayrollRecord) => {
    const updated = payrollRecords.map(p => {
      if (p.id === record.id) {
        const isPaid = p.paymentStatus === 'paid';
        return {
          ...p,
          paymentStatus: isPaid ? 'draft' as const : 'paid' as const,
          paymentDate: isPaid ? undefined : new Date().toISOString().split('T')[0]
        };
      }
      return p;
    });
    onSavePayroll(updated);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">
            Payroll & Penggajian Karyawan
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Pilar 11: Perhitungan gaji pokok, tunjangan, insentif kurir & teknisi per cabang
          </p>
        </div>

        <button
          onClick={handleOpenGenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Buat Slip Gaji</span>
        </button>
      </div>

      {/* Metric Strip in Pastel Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#f5f0fa] rounded-xl border border-[#e2d6f5] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#5c3682] font-semibold">Total Beban Payroll Bulanan</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {formatRupiah(metrics.totalPengeluaranGaji)}
          </div>
          <div className="text-[11px] text-[#5c3682]/80 mt-1">
            {selectedBranch === 'Semua' ? 'Konsolidasi 3 Cabang' : `Cabang ${selectedBranch}`}
          </div>
        </div>

        <div className="p-3.5 bg-[#eaf4ee] rounded-xl border border-[#cce5d4] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1b633d] font-semibold">Status Pembayaran Gaji</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {metrics.paidCount} <span className="text-xs font-normal font-sans text-[#1b633d]">Lunas Ditransfer</span>
          </div>
          <div className="text-[11px] text-[#1b633d]/80 mt-1">Dari {metrics.totalCount} slip tercatat</div>
        </div>

        <div className="p-3.5 bg-[#fef7eb] rounded-xl border border-[#fbe5b4] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#8a5714] font-semibold">Menunggu Transfer (Draft)</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {metrics.draftCount} <span className="text-xs font-normal font-sans text-stone-500">Staf</span>
          </div>
          <div className="text-[11px] text-[#8a5714]/80 mt-1">Siap diproses bagian kasir</div>
        </div>

        <div className="p-3.5 bg-[#eef4fc] rounded-xl border border-[#cee0f7] shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-[#1e5488] font-semibold">Periode Aktif:</div>
          <div className="font-mono text-base font-bold text-stone-800 mt-1">{selectedPeriod}</div>
          <div className="text-[10px] text-[#1e5488]/80 font-mono">Batas cut-off akhir bulan</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari NIP atau Nama Staf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#4a586e]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'draft', label: 'Draft / Belum Bayar' },
            { id: 'paid', label: 'Lunas Ditransfer' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap text-xs ${
                statusFilter === tab.id ? 'bg-[#4a586e] text-white font-medium' : 'text-stone-600 hover:bg-[#faf7f2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Payroll Records */}
      <div className="bg-white rounded-xl border border-[#e8e2d8] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e8e2d8] bg-[#f7f5ee] text-[10px] font-mono uppercase text-stone-600">
                <th className="py-2.5 px-3">Slip ID & NIP</th>
                <th className="py-2.5 px-3">Nama Karyawan & Posisi</th>
                <th className="py-2.5 px-3">Cabang</th>
                <th className="py-2.5 px-3 font-mono">Gaji Pokok</th>
                <th className="py-2.5 px-3 font-mono">Tunjangan & Insentif</th>
                <th className="py-2.5 px-3 font-mono font-bold">Total Gaji Bersih</th>
                <th className="py-2.5 px-3">Status Bayar</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2ea]">
              {filteredRecords.map((p) => {
                const isPaid = p.paymentStatus === 'paid';
                const totalTunjanganDanInsentif = p.allowanceTransport + p.allowanceMeal + p.deliveryIncentive + p.serviceIncentive;

                return (
                  <tr key={p.id} className="hover:bg-[#faf7f2] transition-colors">
                    {/* Slip ID & NIP */}
                    <td className="py-2.5 px-3 font-mono text-stone-700 whitespace-nowrap">
                      <div className="font-semibold text-stone-900">{p.id}</div>
                      <div className="text-[10px] text-stone-400">{p.nip}</div>
                    </td>

                    {/* Employee & Pos */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-stone-900">{p.employeeName}</div>
                      <div className="text-[10px] text-stone-400">{p.positionTitle}</div>
                    </td>

                    {/* Cabang */}
                    <td className="py-2.5 px-3 text-stone-700 whitespace-nowrap">
                      {p.branchCity}
                    </td>

                    {/* Gaji Pokok */}
                    <td className="py-2.5 px-3 font-mono text-stone-800 whitespace-nowrap">
                      {formatRupiah(p.baseSalary)}
                    </td>

                    {/* Tunjangan + Insentif */}
                    <td className="py-2.5 px-3 font-mono text-stone-700 whitespace-nowrap">
                      <div>+{formatRupiah(totalTunjanganDanInsentif)}</div>
                      <div className="text-[10px] text-stone-400">
                        {p.deliveryIncentive > 0 && `Kurir: ${formatRupiah(p.deliveryIncentive)} `}
                        {p.serviceIncentive > 0 && `Servis: ${formatRupiah(p.serviceIncentive)}`}
                      </div>
                    </td>

                    {/* Gaji Bersih */}
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                      {formatRupiah(p.totalNetSalary)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        isPaid ? 'bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4]' : 'bg-[#fef7eb] text-[#8a5714] border border-[#fbe5b4]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-[#22c55e]' : 'bg-[#eab308]'}`}></span>
                        <span>
                          {isPaid ? 'Lunas Transfer' : 'Draft'}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSlip(p)}
                          className="px-2.5 py-1 text-[11px] border border-[#e5dfd5] hover:bg-[#faf7f2] bg-white rounded-lg text-stone-700 transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Printer className="w-3 h-3 text-stone-500" />
                          <span>Slip Gaji</span>
                        </button>

                        <button
                          onClick={() => handleTogglePaymentStatus(p)}
                          className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                            isPaid 
                              ? 'border border-[#e5dfd5] text-stone-500 hover:bg-[#faf7f2] bg-white' 
                              : 'bg-[#4a586e] hover:bg-[#3d495c] text-white shadow-2xs'
                          }`}
                        >
                          {isPaid ? 'Batalkan Lunas' : 'Tandai Lunas'}
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

      {/* Printable Minimalist Slip Modal in Pastel */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#e5dfd5] shadow-xl max-w-lg w-full p-6 text-xs print:p-0">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d8]">
              <div>
                <h3 className="font-bold text-sm text-stone-900">Slip Gaji Karyawan</h3>
                <div className="text-[11px] text-stone-500 font-mono">SEWA LAPTOP ERP &bull; {selectedSlip.periodMonthYear}</div>
              </div>
              <button onClick={() => setSelectedSlip(null)} className="text-stone-400 hover:text-stone-600 print:hidden">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-2 text-stone-700 pb-2 border-b border-[#e8e2d8]">
                <div>
                  <div className="text-[10px] uppercase text-stone-400">Nama Penerima</div>
                  <div className="font-bold text-stone-900 text-sm font-sans">{selectedSlip.employeeName}</div>
                  <div className="text-stone-500">{selectedSlip.nip}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-stone-400">Posisi & Cabang</div>
                  <div className="text-stone-900 font-sans">{selectedSlip.positionTitle}</div>
                  <div className="text-stone-500">Cabang {selectedSlip.branchCity}</div>
                </div>
              </div>

              <div className="space-y-1.5 text-stone-800">
                <div className="flex justify-between">
                  <span>Gaji Pokok:</span>
                  <span>{formatRupiah(selectedSlip.baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tunjangan Transport:</span>
                  <span>+{formatRupiah(selectedSlip.allowanceTransport)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tunjangan Makan:</span>
                  <span>+{formatRupiah(selectedSlip.allowanceMeal)}</span>
                </div>
                {selectedSlip.deliveryIncentive > 0 && (
                  <div className="flex justify-between text-[#1e5488]">
                    <span>Insentif Antar-Jemput Logistik:</span>
                    <span>+{formatRupiah(selectedSlip.deliveryIncentive)}</span>
                  </div>
                )}
                {selectedSlip.serviceIncentive > 0 && (
                  <div className="flex justify-between text-[#1b633d]">
                    <span>Insentif Target Servis Teknisi:</span>
                    <span>+{formatRupiah(selectedSlip.serviceIncentive)}</span>
                  </div>
                )}
                {selectedSlip.deductions > 0 && (
                  <div className="flex justify-between text-[#8c273e]">
                    <span>Potongan / Keterlambatan:</span>
                    <span>-{formatRupiah(selectedSlip.deductions)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#faf7f2] rounded-xl border border-[#e5dfd5] flex justify-between font-bold text-sm text-stone-900 pt-2.5">
                <span>TOTAL GAJI DITERIMA:</span>
                <span>{formatRupiah(selectedSlip.totalNetSalary)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e8e2d8] print:hidden">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4]">
                Status: {selectedSlip.paymentStatus === 'paid' ? 'LUNAS DITRANSFER' : 'DRAFT BELUM TRANSFER'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-700 hover:bg-[#faf7f2] transition-colors"
                >
                  Cetak Slip (Print)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  className="px-3 py-1.5 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg font-medium transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Generate Payroll Slip */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#e5dfd5] shadow-xl max-w-md w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d8]">
              <h3 className="font-bold text-sm text-stone-900">Buat Slip Gaji Karyawan</h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlip} className="space-y-3 mt-3">
              <div>
                <label className="block text-[11px] font-mono text-stone-500 mb-1">Pilih Karyawan *</label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => {
                    const sel = employees.find(emp => emp.id === e.target.value);
                    setFormData({
                      ...formData,
                      employeeId: e.target.value,
                      baseSalary: sel?.baseSalary || 4500000,
                      allowanceTransport: sel?.allowanceTransport || 500000,
                      allowanceMeal: sel?.allowanceMeal || 500000,
                      deliveryIncentive: sel?.role === 'courier' ? 400000 : 0,
                      serviceIncentive: sel?.role === 'technician' ? 350000 : 0
                    });
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 bg-white focus:outline-none focus:border-[#4a586e]"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.positionTitle} (Cabang {emp.branchCity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 font-mono bg-white focus:outline-none focus:border-[#4a586e]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Tunjangan Transport</label>
                  <input
                    type="number"
                    value={formData.allowanceTransport}
                    onChange={(e) => setFormData({ ...formData, allowanceTransport: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 font-mono bg-white focus:outline-none focus:border-[#4a586e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Insentif Kurir (Trip)</label>
                  <input
                    type="number"
                    value={formData.deliveryIncentive}
                    onChange={(e) => setFormData({ ...formData, deliveryIncentive: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 font-mono bg-white focus:outline-none focus:border-[#4a586e]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">Insentif Teknisi (Target)</label>
                  <input
                    type="number"
                    value={formData.serviceIncentive}
                    onChange={(e) => setFormData({ ...formData, serviceIncentive: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-900 font-mono bg-white focus:outline-none focus:border-[#4a586e]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e2d8]">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-3 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-700 hover:bg-[#faf7f2] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg font-medium transition-colors"
                >
                  Generate Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
