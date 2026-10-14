import React, { useState, useMemo } from 'react';
import { ServiceRecord, ServiceStatus, BranchCity, Laptop, Employee } from '../../types';
import { formatRupiah, calculateDaysElapsed } from '../../utils/erpStorage';
import { 
  Wrench, 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Building2, 
  X, 
  ArrowRight
} from 'lucide-react';

interface TechnicianServiceManagerProps {
  services: ServiceRecord[];
  onSaveServices: (updated: ServiceRecord[]) => void;
  laptops: Laptop[];
  onSaveLaptops: (updated: Laptop[]) => void;
  technicians: Employee[];
  selectedBranch: BranchCity | 'Semua';
}

export const TechnicianServiceManager: React.FC<TechnicianServiceManagerProps> = ({
  services,
  onSaveServices,
  laptops,
  onSaveLaptops,
  technicians,
  selectedBranch
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'internal' | 'overdue_internal' | 'external' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [externalEscalateService, setExternalEscalateService] = useState<ServiceRecord | null>(null);
  const [completeServiceTarget, setCompleteServiceTarget] = useState<ServiceRecord | null>(null);

  // Form State: Add New Service Ticket
  const [formData, setFormData] = useState<Partial<ServiceRecord>>({
    laptopId: '',
    laptopName: '',
    laptopSku: '',
    branchCity: 'Malang',
    issueDescription: '',
    technicianName: '',
    receivedDate: new Date().toISOString().split('T')[0]
  });

  // Form State: Escalate to External Vendor
  const [externalForm, setExternalForm] = useState({
    externalVendorName: 'Pusat Service Elektronik & Motherboard Harco',
    externalVendorPhone: '081399882211',
    externalVendorAddress: 'Sentra Servis Elektronik Komputer',
    externalEstimatedCost: 650000,
    externalTrackingNumber: `TRK-${Date.now().toString().slice(-6)}`,
    notes: 'Perbaikan jalur power motherboard dan penggantian IC charging.'
  });

  // Form State: Complete Service & Return to Ready
  const [completeForm, setCompleteForm] = useState({
    actionsTaken: 'Penggantian sparepart dan pembersihan fan pendingin.',
    sparepartReplaced: 'Baterai Original & Pasta Thermal',
    sparepartCost: 450000,
    serviceFee: 150000,
    testedBy: 'QC Staff',
    notes: 'Unit telah melalui uji beban 24 jam dan dinyatakan siap sewa kembali.'
  });

  // Calculate live days and overdue flags for all records
  const enrichedServices = useMemo(() => {
    return services.map(s => {
      const internalDays = s.internalStartedDate ? calculateDaysElapsed(s.internalStartedDate) : s.internalDaysElapsed;
      const externalDays = s.externalSentDate ? calculateDaysElapsed(s.externalSentDate) : (s.externalDaysElapsed || 0);

      const isInternalOverdue = s.status === 'internal_repair' && internalDays >= 7;
      const isExternalOverdue = s.status === 'external_vendor' && externalDays >= 14;

      return {
        ...s,
        internalDaysElapsed: internalDays,
        externalDaysElapsed: externalDays,
        isInternalOverdue,
        isExternalOverdue
      };
    });
  }, [services]);

  // Filtered List
  const filteredServices = useMemo(() => {
    return enrichedServices.filter(s => {
      if (selectedBranch !== 'Semua' && s.branchCity !== selectedBranch) return false;
      if (activeTab === 'internal' && s.status !== 'internal_repair') return false;
      if (activeTab === 'overdue_internal' && !s.isInternalOverdue) return false;
      if (activeTab === 'external' && s.status !== 'external_vendor') return false;
      if (activeTab === 'completed' && s.status !== 'completed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSku = s.laptopSku.toLowerCase().includes(q);
        const matchName = s.laptopName.toLowerCase().includes(q);
        const matchTech = (s.technicianName || '').toLowerCase().includes(q);
        const matchVendor = (s.externalVendorName || '').toLowerCase().includes(q);
        if (!matchSku && !matchName && !matchTech && !matchVendor) return false;
      }

      return true;
    });
  }, [enrichedServices, selectedBranch, activeTab, searchQuery]);

  // Overall counts
  const counts = useMemo(() => {
    const list = selectedBranch === 'Semua' ? enrichedServices : enrichedServices.filter(s => s.branchCity === selectedBranch);
    return {
      total: list.length,
      internal: list.filter(s => s.status === 'internal_repair').length,
      overdueInternal: list.filter(s => s.isInternalOverdue).length,
      external: list.filter(s => s.status === 'external_vendor').length,
      overdueExternal: list.filter(s => s.isExternalOverdue).length,
      completed: list.filter(s => s.status === 'completed').length
    };
  }, [enrichedServices, selectedBranch]);

  // Handlers
  const handleOpenAdd = () => {
    const troubleLaptops = laptops.filter(l => l.status === 'trouble');
    const firstChoice = troubleLaptops[0] || laptops[0];
    const defaultBranch = selectedBranch === 'Semua' ? (firstChoice ? firstChoice.branchCity : 'Malang') : selectedBranch;

    setFormData({
      laptopId: firstChoice ? firstChoice.id : '',
      laptopName: firstChoice ? firstChoice.name : '',
      laptopSku: firstChoice ? firstChoice.sku : '',
      branchCity: defaultBranch,
      issueDescription: firstChoice ? (firstChoice.troubleDescription || 'Kendala unit operasional') : '',
      technicianName: 'Budi Santoso (Teknisi Malang)',
      receivedDate: new Date().toISOString().split('T')[0]
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.laptopSku) return;

    const newTicket: ServiceRecord = {
      id: `svc-${Date.now()}`,
      laptopId: formData.laptopId || `lp-${Date.now()}`,
      laptopSku: formData.laptopSku || 'PL-UNT-000',
      laptopName: formData.laptopName || 'Unit Laptop',
      branchCity: (formData.branchCity || 'Malang') as BranchCity,
      receivedDate: formData.receivedDate || new Date().toISOString().split('T')[0],
      issueDescription: formData.issueDescription || 'Pengecekan teknis',
      technicianId: 'emp-tech-1',
      technicianName: formData.technicianName || 'Teknisi Toko',
      status: 'internal_repair',
      slaInternalDays: 7,
      internalDaysElapsed: 0,
      internalStartedDate: formData.receivedDate || new Date().toISOString().split('T')[0],
      isInternalOverdue: false,
      isExternal: false,
      sparepartCost: 0,
      serviceFee: 0,
      totalCost: 0,
      actionsTaken: 'Pemeriksaan hardware dan running diagnosis',
      notes: 'Tiket servis internal terdaftar.'
    };

    onSaveServices([newTicket, ...services]);

    // Also update laptop status to 'trouble'
    const updatedLaptops = laptops.map(l => {
      if (l.sku === newTicket.laptopSku || l.id === newTicket.laptopId) {
        return { ...l, status: 'trouble' as const, troubleDescription: newTicket.issueDescription };
      }
      return l;
    });
    onSaveLaptops(updatedLaptops);

    setIsAddModalOpen(false);
  };

  const handleOpenEscalate = (svc: ServiceRecord) => {
    setExternalEscalateService(svc);
    setExternalForm({
      externalVendorName: 'CV Multi Service Center & Chipset Lab',
      externalVendorPhone: '081298765432',
      externalVendorAddress: 'Ruko Elektronik Komputer',
      externalEstimatedCost: 650000,
      externalTrackingNumber: `VND-${Date.now().toString().slice(-5)}`,
      notes: `Eskalasi ke pihak ke-3 karena butuh solder reballing / sparepart langka. SLA Maksimal 14 Hari.`
    });
  };

  const handleConfirmEscalate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalEscalateService) return;

    const updated = services.map(s => {
      if (s.id === externalEscalateService.id) {
        return {
          ...s,
          status: 'external_vendor' as ServiceStatus,
          externalVendorName: externalForm.externalVendorName,
          externalVendorPhone: externalForm.externalVendorPhone,
          externalVendorAddress: externalForm.externalVendorAddress,
          externalSentDate: new Date().toISOString().split('T')[0],
          slaExternalDays: 14,
          externalDaysElapsed: 0,
          externalEstimatedCost: Number(externalForm.externalEstimatedCost) || 0,
          externalTrackingNumber: externalForm.externalTrackingNumber,
          notes: `${s.notes || ''} [Eskalasi Vendor Luar: ${externalForm.notes}]`
        };
      }
      return s;
    });

    onSaveServices(updated);
    setExternalEscalateService(null);
  };

  const handleOpenComplete = (svc: ServiceRecord) => {
    setCompleteServiceTarget(svc);
    setCompleteForm({
      actionsTaken: 'Perbaikan komponen berhasil, ganti pasta & thermal pad.',
      sparepartReplaced: 'Keyboard baru & fan cooler',
      sparepartCost: 350000,
      serviceFee: 100000,
      testedBy: 'Kepala Teknisi Toko',
      notes: 'Lulus running benchmark 12 jam, performa normal, suhu stabil.'
    });
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeServiceTarget) return;

    const totalCost = Number(completeForm.sparepartCost || 0) + Number(completeForm.serviceFee || 0);

    const updatedServices = services.map(s => {
      if (s.id === completeServiceTarget.id) {
        return {
          ...s,
          status: 'completed' as ServiceStatus,
          completedDate: new Date().toISOString().split('T')[0],
          actionsTaken: completeForm.actionsTaken,
          sparepartReplaced: completeForm.sparepartReplaced,
          sparepartCost: Number(completeForm.sparepartCost) || 0,
          serviceFee: Number(completeForm.serviceFee) || 0,
          totalCost,
          testedBy: completeForm.testedBy,
          notes: `${s.notes || ''} [QC Lulus: ${completeForm.notes}]`
        };
      }
      return s;
    });

    onSaveServices(updatedServices);

    // Update corresponding laptop back to 'ready'
    const updatedLaptops = laptops.map(l => {
      if (l.sku === completeServiceTarget.laptopSku || l.id === completeServiceTarget.laptopId) {
        return {
          ...l,
          status: 'ready' as const,
          troubleDescription: undefined,
          availableUnits: 1
        };
      }
      return l;
    });
    onSaveLaptops(updatedLaptops);

    setCompleteServiceTarget(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-stone-900">
            Laporan & Monitoring Servis Teknisi
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Pilar 8: Pengawasan SLA Kinerja Servis &bull; Internal max 7 hari &bull; Eksternal Vendor max 14 hari
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#475569] hover:bg-[#334155] text-white rounded-md text-xs font-medium transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Buat Tiket Servis</span>
        </button>
      </div>

      {/* SLA Metric Cards in Pastel Palette */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('internal')}
          className={`p-3.5 rounded-xl border text-left transition-colors shadow-2xs ${
            activeTab === 'internal' ? 'border-[#8a5714] bg-[#fef7eb] ring-1 ring-[#8a5714]' : 'border-[#fbe5b4] bg-[#fef7eb]/70 hover:border-[#f7d692]'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-[#8a5714] font-semibold">Servis Internal (SLA 7 Hari)</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-0.5">{counts.internal} <span className="text-xs font-normal text-stone-500 font-sans">Unit</span></div>
          <div className="text-[11px] text-[#8a5714]/80 mt-1">Dikerjakan teknisi toko</div>
        </button>

        <button
          onClick={() => setActiveTab('overdue_internal')}
          className={`p-3.5 rounded-xl border text-left transition-colors shadow-2xs ${
            activeTab === 'overdue_internal' ? 'border-[#8c273e] bg-[#fdf1f3] ring-1 ring-[#8c273e]' : 'border-[#f9ccd5] bg-[#fdf1f3]/70 hover:border-[#f5b3c0]'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-[#8c273e] flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
            <span>Lewat 7 Hari (Peringatan)</span>
          </div>
          <div className={`text-xl font-bold font-mono mt-0.5 ${counts.overdueInternal > 0 ? 'text-[#8c273e]' : 'text-stone-800'}`}>
            {counts.overdueInternal} <span className="text-xs font-normal text-stone-500 font-sans">Unit</span>
          </div>
          <div className="text-[11px] text-[#8c273e]/80 mt-1">Wajib segera dieskalasi</div>
        </button>

        <button
          onClick={() => setActiveTab('external')}
          className={`p-3.5 rounded-xl border text-left transition-colors shadow-2xs ${
            activeTab === 'external' ? 'border-[#5c3682] bg-[#f5f0fa] ring-1 ring-[#5c3682]' : 'border-[#e2d6f5] bg-[#f5f0fa]/70 hover:border-[#cfbcf0]'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-[#5c3682] font-semibold">Vendor Eksternal (SLA 14 Hari)</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-0.5">{counts.external} <span className="text-xs font-normal text-stone-500 font-sans">Unit</span></div>
          <div className="text-[11px] text-[#5c3682]/80 mt-1">
            {counts.overdueExternal > 0 ? `${counts.overdueExternal} unit > 14 hari` : 'Dalam batas aman'}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`p-3.5 rounded-xl border text-left transition-colors shadow-2xs ${
            activeTab === 'completed' ? 'border-[#1b633d] bg-[#eaf4ee] ring-1 ring-[#1b633d]' : 'border-[#cce5d4] bg-[#eaf4ee]/70 hover:border-[#b4d8bf]'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-[#1b633d] font-semibold">Servis Selesai / Siap</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-0.5">{counts.completed} <span className="text-xs font-normal text-stone-500 font-sans">Unit</span></div>
          <div className="text-[11px] text-[#1b633d]/80 mt-1">Kembali ke inventaris ready</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari SKU, Nama Laptop, Teknisi, atau Vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#4a586e]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: `Semua (${counts.total})` },
            { id: 'internal', label: `Internal (${counts.internal})` },
            { id: 'overdue_internal', label: `Lewat 7 Hari (${counts.overdueInternal})` },
            { id: 'external', label: `Vendor Luar (${counts.external})` },
            { id: 'completed', label: `Selesai (${counts.completed})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap text-xs ${
                activeTab === tab.id ? 'bg-[#4a586e] text-white font-medium' : 'text-stone-600 hover:bg-[#faf7f2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table List */}
      <div className="bg-white rounded-xl border border-[#e8e2d8] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e8e2d8] bg-[#f7f5ee] text-[10px] font-mono uppercase text-stone-600">
                <th className="py-2.5 px-3">ID & Unit Laptop</th>
                <th className="py-2.5 px-3">Cabang</th>
                <th className="py-2.5 px-3">Kendala / Kerusakan</th>
                <th className="py-2.5 px-3">Status & Durasi SLA</th>
                <th className="py-2.5 px-3">Teknisi / Vendor</th>
                <th className="py-2.5 px-3">Estimasi / Biaya</th>
                <th className="py-2.5 px-3 text-right">Aksi Penanganan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2ea]">
              {filteredServices.map((svc) => {
                const isInternal = svc.status === 'internal_repair';
                const isExternal = svc.status === 'external_vendor';
                const isCompleted = svc.status === 'completed';

                return (
                  <tr key={svc.id} className="hover:bg-[#faf7f2] transition-colors">
                    {/* ID & Unit */}
                    <td className="py-2.5 px-3 font-mono">
                      <div className="font-semibold text-stone-900">{svc.laptopSku}</div>
                      <div className="text-[11px] text-stone-700 font-sans">{svc.laptopName}</div>
                      <div className="text-[10px] text-stone-400">Masuk: {svc.receivedDate}</div>
                    </td>

                    {/* Cabang */}
                    <td className="py-2.5 px-3 text-stone-700 whitespace-nowrap">
                      <span>{svc.branchCity}</span>
                      {svc.branchCity === 'Malang' && (
                        <span className="text-[10px] text-stone-400 font-mono ml-1">(Pusat)</span>
                      )}
                    </td>

                    {/* Kendala */}
                    <td className="py-2.5 px-3 max-w-[220px]">
                      <div className="text-stone-800 font-medium truncate" title={svc.issueDescription}>
                        {svc.issueDescription}
                      </div>
                      {svc.actionsTaken && (
                        <div className="text-[11px] text-stone-500 truncate" title={svc.actionsTaken}>
                          Tindakan: {svc.actionsTaken}
                        </div>
                      )}
                    </td>

                    {/* Status & SLA Progress */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {isInternal && (
                        <div>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            svc.isInternalOverdue 
                              ? 'bg-[#fdf1f3] text-[#8c273e] border border-[#f9ccd5]' 
                              : 'bg-[#fef7eb] text-[#8a5714] border border-[#fbe5b4]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${svc.isInternalOverdue ? 'bg-[#ef4444]' : 'bg-[#eab308]'}`}></span>
                            <span>Internal: {svc.internalDaysElapsed} Hari</span>
                          </div>
                          <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                            SLA: 7 Hari &bull; {svc.isInternalOverdue ? '⚠️ Melewati batas!' : 'Sesuai jadwal'}
                          </div>
                        </div>
                      )}

                      {isExternal && (
                        <div>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            svc.isExternalOverdue 
                              ? 'bg-[#fdf1f3] text-[#8c273e] border border-[#f9ccd5]' 
                              : 'bg-[#f5f0fa] text-[#5c3682] border border-[#e2d6f5]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${svc.isExternalOverdue ? 'bg-[#ef4444]' : 'bg-[#a855f7]'}`}></span>
                            <span>Vendor Luar: {svc.externalDaysElapsed} Hari</span>
                          </div>
                          <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                            SLA: 14 Hari &bull; {svc.isExternalOverdue ? '⚠️ Melewati batas!' : 'Dalam proses'}
                          </div>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                          <span>Selesai QC & Siap</span>
                        </div>
                      )}
                    </td>

                    {/* Teknisi / Vendor */}
                    <td className="py-2.5 px-3">
                      {isExternal ? (
                        <div>
                          <div className="font-medium text-zinc-900">{svc.externalVendorName || 'Vendor Rekanan'}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">No. Resi: {svc.externalTrackingNumber || 'TRK-NA'}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-zinc-900">{svc.technicianName || 'Teknisi Toko'}</div>
                          <div className="text-[10px] text-zinc-400">Teknisi Internal</div>
                        </div>
                      )}
                    </td>

                    {/* Biaya */}
                    <td className="py-2.5 px-3 font-mono text-zinc-800 whitespace-nowrap">
                      {svc.totalCost ? (
                        <div>
                          <span className="font-semibold">{formatRupiah(svc.totalCost)}</span>
                          <div className="text-[10px] text-zinc-400">Total Biaya</div>
                        </div>
                      ) : svc.externalEstimatedCost ? (
                        <div>
                          <span>{formatRupiah(svc.externalEstimatedCost)}</span>
                          <div className="text-[10px] text-zinc-400">Estimasi</div>
                        </div>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isInternal && (
                          <button
                            onClick={() => handleOpenEscalate(svc)}
                            title="Lempar ke Tempat Servis Eksternal (Max 14 Hari)"
                            className="px-2.5 py-1 text-[11px] border border-[#e2d6f5] bg-[#f5f0fa] text-[#5c3682] hover:bg-[#ede5f7] rounded-lg font-medium transition-colors"
                          >
                            Eskalasi Vendor
                          </button>
                        )}

                        {!isCompleted && (
                          <button
                            onClick={() => handleOpenComplete(svc)}
                            className="px-2.5 py-1 text-[11px] border border-[#cce5d4] bg-[#eaf4ee] text-[#1b633d] hover:bg-[#d8eedf] rounded-lg font-semibold transition-colors"
                          >
                            Selesai & Ready
                          </button>
                        )}

                        {isCompleted && (
                          <span className="text-[11px] text-stone-400 font-mono">Arsip Selesai</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Buat Tiket Servis Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 shadow-xl max-w-lg w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="font-bold text-sm text-zinc-900">Input Tiket Servis Teknisi Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3 mt-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Pilih Unit Laptop Bermasalah *</label>
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
                      branchCity: sel ? sel.branchCity : 'Malang'
                    });
                  }}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
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
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Teknisi Penanggungjawab *</label>
                  <input
                    type="text"
                    required
                    value={formData.technicianName}
                    onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                    placeholder="Nama Teknisi"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Tanggal Masuk</label>
                  <input
                    type="date"
                    value={formData.receivedDate}
                    onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Deskripsi Kerusakan / Kendala *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.issueDescription}
                  onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  placeholder="Jelaskan kendala secara spesifik (contoh: Mati total setelah kena cipratan air, layar bergaris)..."
                />
              </div>

              <div className="p-2.5 bg-zinc-50 rounded border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
                <div className="font-semibold text-zinc-800">Ketentuan SLA Otomatis:</div>
                <div>&bull; <strong>SLA Servis Internal:</strong> Maksimal 7 hari kalender. Jika belum selesai, sistem akan menampilkan peringatan keterlambatan.</div>
                <div>&bull; Unit bisa dialihkan ke vendor eksternal jika membutuhkan pengerjaan spesifik (batas 14 hari).</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-200 rounded text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded font-medium hover:bg-zinc-800"
                >
                  Simpan Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Eskalasi ke Tempat Servis Eksternal (SLA 14 Hari) */}
      {externalEscalateService && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 shadow-xl max-w-lg w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">Eskalasi ke Vendor Eksternal</h3>
                <div className="text-[11px] text-zinc-500 font-mono">Batas waktu maksimal pengerjaan: 14 Hari</div>
              </div>
              <button onClick={() => setExternalEscalateService(null)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmEscalate} className="space-y-3 mt-3">
              <div className="p-2.5 bg-zinc-50 rounded border border-zinc-200">
                <div className="font-semibold text-zinc-900">Unit: [{externalEscalateService.laptopSku}] {externalEscalateService.laptopName}</div>
                <div className="text-[11px] text-zinc-500">Kendala: {externalEscalateService.issueDescription}</div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Nama Tempat Servis Eksternal *</label>
                <input
                  type="text"
                  required
                  value={externalForm.externalVendorName}
                  onChange={(e) => setExternalForm({ ...externalForm, externalVendorName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  placeholder="Nama Lab / Tempat Servis Eksternal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">No. Telepon / PIC</label>
                  <input
                    type="text"
                    value={externalForm.externalVendorPhone}
                    onChange={(e) => setExternalForm({ ...externalForm, externalVendorPhone: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Estimasi Biaya (Rp)</label>
                  <input
                    type="number"
                    value={externalForm.externalEstimatedCost}
                    onChange={(e) => setExternalForm({ ...externalForm, externalEstimatedCost: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">No. Resi Pengiriman / Tanda Terima</label>
                <input
                  type="text"
                  value={externalForm.externalTrackingNumber}
                  onChange={(e) => setExternalForm({ ...externalForm, externalTrackingNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={externalForm.notes}
                  onChange={(e) => setExternalForm({ ...externalForm, notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setExternalEscalateService(null)}
                  className="px-3 py-1.5 border border-zinc-200 rounded text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded font-medium hover:bg-zinc-800"
                >
                  Kirim ke Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Selesaikan Servis & Kembalikan ke Status Ready */}
      {completeServiceTarget && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 shadow-xl max-w-lg w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">Selesaikan Servis & Kembalikan ke Siap Sewa</h3>
                <div className="text-[11px] text-zinc-500 font-mono">Unit akan otomatis berubah status menjadi 'Ready'</div>
              </div>
              <button onClick={() => setCompleteServiceTarget(null)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmComplete} className="space-y-3 mt-3">
              <div className="p-2.5 bg-zinc-50 rounded border border-zinc-200">
                <div className="font-semibold text-zinc-900">Unit: [{completeServiceTarget.laptopSku}] {completeServiceTarget.laptopName}</div>
                <div className="text-[11px] text-zinc-500">Cabang: {completeServiceTarget.branchCity}</div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Tindakan Perbaikan yang Dilakukan *</label>
                <input
                  type="text"
                  required
                  value={completeForm.actionsTaken}
                  onChange={(e) => setCompleteForm({ ...completeForm, actionsTaken: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Sparepart Diganti</label>
                  <input
                    type="text"
                    value={completeForm.sparepartReplaced}
                    onChange={(e) => setCompleteForm({ ...completeForm, sparepartReplaced: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Biaya Sparepart (Rp)</label>
                  <input
                    type="number"
                    value={completeForm.sparepartCost}
                    onChange={(e) => setCompleteForm({ ...completeForm, sparepartCost: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Biaya Jasa Servis (Rp)</label>
                  <input
                    type="number"
                    value={completeForm.serviceFee}
                    onChange={(e) => setCompleteForm({ ...completeForm, serviceFee: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Penguji Kelayakan (QC)</label>
                  <input
                    type="text"
                    value={completeForm.testedBy}
                    onChange={(e) => setCompleteForm({ ...completeForm, testedBy: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Catatan QC</label>
                <input
                  type="text"
                  value={completeForm.notes}
                  onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setCompleteServiceTarget(null)}
                  className="px-3 py-1.5 border border-zinc-200 rounded text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded font-medium hover:bg-zinc-800"
                >
                  Konfirmasi Selesai & Ready
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
