import React, { useState, useMemo } from 'react';
import { 
  RentalOrder, 
  Laptop, 
  Customer, 
  UnitMovementLog, 
  FinancialTransaction, 
  BranchCity,
  UserAuthSession
} from '../../types';
import { formatRupiah } from '../../utils/erpStorage';
import { RentalContractPrintView } from './RentalContractPrintView';
import { 
  FileText, 
  Printer, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw, 
  Laptop as LaptopIcon, 
  Eye, 
  X,
  Calendar,
  Building2
} from 'lucide-react';

interface RentalOrdersManagerProps {
  orders: RentalOrder[];
  onSaveOrders: (updated: RentalOrder[]) => void;
  laptops: Laptop[];
  onSaveLaptops: (updated: Laptop[]) => void;
  movements: UnitMovementLog[];
  onSaveMovements: (updated: UnitMovementLog[]) => void;
  finance: FinancialTransaction[];
  onSaveFinance: (updated: FinancialTransaction[]) => void;
  selectedBranch: BranchCity | 'Semua';
  session: UserAuthSession;
  onOpenNewRental: (preLaptop?: Laptop) => void;
}

export const RentalOrdersManager: React.FC<RentalOrdersManagerProps> = ({
  orders,
  onSaveOrders,
  laptops,
  onSaveLaptops,
  movements,
  onSaveMovements,
  finance,
  onSaveFinance,
  selectedBranch,
  session,
  onOpenNewRental
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // Printing state
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<RentalOrder | null>(null);
  const [printDocType, setPrintDocType] = useState<'contract' | 'handover_form'>('contract');

  // Return Check-in Modal State
  const [returningOrder, setReturningOrder] = useState<RentalOrder | null>(null);
  const [returnReceiverStaff, setReturnReceiverStaff] = useState(session?.name || 'Staf Penerima');
  const [returnPhysicalNotes, setReturnPhysicalNotes] = useState('Kondisi fisik normal & lengkap');
  const [returnLateHours, setReturnLateHours] = useState<number>(0);
  const [returnDamageFine, setReturnDamageFine] = useState<number>(0);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (selectedBranch !== 'Semua' && o.branchCity !== selectedBranch) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNo = o.transactionNumber.toLowerCase().includes(q);
        const matchCust = o.customerName.toLowerCase().includes(q);
        const matchSku = o.laptopSku.toLowerCase().includes(q);
        const matchModel = o.laptopName.toLowerCase().includes(q);
        if (!matchNo && !matchCust && !matchSku && !matchModel) return false;
      }
      return true;
    });
  }, [orders, selectedBranch, statusFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const branchFiltered = selectedBranch === 'Semua' ? orders : orders.filter(o => o.branchCity === selectedBranch);
    const active = branchFiltered.filter(o => o.status === 'active');
    const completed = branchFiltered.filter(o => o.status === 'completed');
    const totalRevenue = branchFiltered.reduce((sum, o) => sum + (o.totalRentalPrice || 0), 0);
    const activeDeposits = active
      .filter(o => o.guaranteeType === 'cash_deposit')
      .reduce((sum, o) => sum + (o.depositAmount || 0), 0);

    return {
      totalOrders: branchFiltered.length,
      activeCount: active.length,
      completedCount: completed.length,
      totalRevenue,
      activeDeposits
    };
  }, [orders, selectedBranch]);

  // Open return modal
  const handleOpenReturnModal = (order: RentalOrder) => {
    setReturningOrder(order);
    setReturnReceiverStaff(session?.name || 'Staf Penerima');
    setReturnPhysicalNotes('Kondisi fisik lengkap dan normal');
    
    // Calculate if overdue based on end date
    const end = new Date(order.endDate).getTime();
    const now = new Date().getTime();
    if (now > end) {
      const diffHours = Math.floor((now - end) / (1000 * 60 * 60));
      setReturnLateHours(Math.max(0, diffHours));
    } else {
      setReturnLateHours(0);
    }
    setReturnDamageFine(0);
  };

  // Submit return check-in (Interconnected)
  const handleSubmitReturn = () => {
    if (!returningOrder) return;

    const lateFine = returnLateHours * 20000; // Rp 20.000 / jam
    const totalFine = lateFine + returnDamageFine;
    const returnTimestamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // 1. Update Rental Order status to 'completed'
    const updatedOrders = orders.map(o => {
      if (o.id === returningOrder.id) {
        return {
          ...o,
          status: 'completed' as const,
          receiverStaffName: returnReceiverStaff,
          returnDate: new Date().toISOString().split('T')[0],
          lateHours: returnLateHours,
          lateFineApplied: lateFine,
          damageFineApplied: returnDamageFine,
          depositReturned: o.guaranteeType === 'cash_deposit',
          notes: `${o.notes || ''} • Selesai dikembalikan pada ${returnTimestamp}. Staf: ${returnReceiverStaff}`
        };
      }
      return o;
    });
    onSaveOrders(updatedOrders);

    // 2. Update Laptop in inventory (rented -> ready)
    const updatedLaptops = laptops.map(l => {
      if (l.sku === returningOrder.laptopSku || l.id === returningOrder.laptopId) {
        return {
          ...l,
          status: 'ready' as const,
          currentRenterName: undefined,
          currentOrderId: undefined,
          availableUnits: 1
        };
      }
      return l;
    });
    onSaveLaptops(updatedLaptops);

    // 3. Record Unit Movement (in_return)
    const newMovement: UnitMovementLog = {
      id: `mov-${Date.now()}`,
      laptopId: returningOrder.laptopId,
      laptopName: returningOrder.laptopName,
      laptopSku: returningOrder.laptopSku,
      branchCity: returningOrder.branchCity,
      movementType: 'in_return',
      orderId: returningOrder.transactionNumber,
      customerName: returningOrder.customerName,
      customerPhone: returningOrder.phone,
      timestamp: returnTimestamp,
      staffName: returningOrder.staffName,
      receiverStaffName: returnReceiverStaff,
      chargerIncluded: true,
      bagIncluded: true,
      mouseIncluded: true,
      physicalConditionNotes: returnPhysicalNotes,
      lateDays: Math.ceil(returnLateHours / 24),
      lateFeeApplied: totalFine
    };
    onSaveMovements([newMovement, ...movements]);

    // 4. Record Fine in General Finance (Pos Denda) if any fine applied
    if (totalFine > 0) {
      const fineTx: FinancialTransaction = {
        id: `DND-${returningOrder.transactionNumber}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        branchCity: returningOrder.branchCity,
        type: 'income',
        category: 'denda',
        title: `Denda Keterlambatan (${returnLateHours} jam @ 20rb/jam) - ${returningOrder.customerName}`,
        amount: totalFine,
        paymentMethod: 'cash',
        customerOrPayee: returningOrder.customerName,
        recordedBy: returnReceiverStaff,
        referenceId: returningOrder.id,
        notes: `Denda SPK ${returningOrder.transactionNumber}`
      };
      onSaveFinance([fineTx, ...finance]);
    }

    setReturningOrder(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e2d8]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-stone-900">
            Alur Sewa & Surat Perjanjian Kontrak (SPK)
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Format Resmi: PLIDMLG (Malang) • PLIDSDA (Sidoarjo) • PLIDBKS (Bekasi) • Denda Rp 20.000 / Jam
          </p>
        </div>

        <button
          onClick={() => onOpenNewRental()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1b633d] hover:bg-[#154e30] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Sewa Baru (Proses SPK)</span>
        </button>
      </div>

      {/* Pastel Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#eaf4ee] rounded-xl border border-[#cce5d4] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1b633d] font-semibold">Sewa Aktif Berjalan</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {metrics.activeCount} <span className="text-xs font-normal font-sans text-stone-500">Unit</span>
          </div>
          <div className="text-[11px] text-[#1b633d]/80 mt-1">
            {selectedBranch === 'Semua' ? '3 Cabang Terdata' : `Cabang ${selectedBranch}`}
          </div>
        </div>

        <div className="p-3.5 bg-[#eef4fc] rounded-xl border border-[#cee0f7] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1e5488] font-semibold">Total Nilai Kontrak Sewa</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {formatRupiah(metrics.totalRevenue)}
          </div>
          <div className="text-[11px] text-[#1e5488]/80 mt-1">
            Dari {metrics.totalOrders} total transaksi
          </div>
        </div>

        <div className="p-3.5 bg-[#f5f0fa] rounded-xl border border-[#e2d6f5] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#5c3682] font-semibold">Deposit Uang Ditahan</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {formatRupiah(metrics.activeDeposits)}
          </div>
          <div className="text-[11px] text-[#5c3682]/80 mt-1">Jaminan uang tunai aktif</div>
        </div>

        <div className="p-3.5 bg-[#f5f2ea] rounded-xl border border-[#e5dfd5] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-stone-600 font-semibold">Kontrak Selesai Kembali</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {metrics.completedCount} <span className="text-xs font-normal font-sans text-stone-500">Unit</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Tuntas dikembalikan</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari No SPK (PLID...), Nama Penyewa, SKU Laptop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#4a586e]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'Semua Transaksi' },
            { id: 'active', label: 'Sedang Tersewa' },
            { id: 'completed', label: 'Selesai Kembali' }
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

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#e8e2d8] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e8e2d8] bg-[#f7f5ee] text-[10px] font-mono uppercase text-stone-600">
                <th className="py-2.5 px-3">No. Transaksi Resmi</th>
                <th className="py-2.5 px-3">Penyewa & Kontak</th>
                <th className="py-2.5 px-3">Unit Laptop & SKU</th>
                <th className="py-2.5 px-3">Periode & Batas Kembali</th>
                <th className="py-2.5 px-3">Bentuk Jaminan</th>
                <th className="py-2.5 px-3 font-mono">Biaya Sewa</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi Dokumen & Pengembalian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2ea]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400 font-mono text-xs">
                    Belum ada transaksi sewa yang sesuai filter
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isActive = o.status === 'active';
                  const isOverdue = isActive && new Date() > new Date(o.endDate);

                  return (
                    <tr key={o.id} className="hover:bg-[#faf7f2] transition-colors">
                      {/* No Transaksi */}
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <div className="font-bold text-[#1e5488]">{o.transactionNumber}</div>
                        <div className="text-[10px] text-stone-400">Cabang {o.branchCity}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-stone-900">{o.customerName}</div>
                        <div className="text-[10px] text-stone-500 font-mono">{o.phone}</div>
                      </td>

                      {/* Unit */}
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-stone-900">{o.laptopBrand} {o.laptopName}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{o.laptopSku} &bull; {o.processor.split('(')[0]}</div>
                      </td>

                      {/* Periode */}
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <div className="text-stone-800">{o.durationDays} Hari ({o.startDate} s/d {o.endDate})</div>
                        {isOverdue ? (
                          <span className="text-[10px] text-[#8c273e] font-bold">
                            LEWAT JATUH TEMPO (Denda 20rb/jam)
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400">Jatuh tempo 18:00 WIB</span>
                        )}
                      </td>

                      {/* Jaminan */}
                      <td className="py-2.5 px-3 text-[11px] whitespace-nowrap">
                        {o.guaranteeType === 'two_identities' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f5f0fa] text-[#5c3682] border border-[#e2d6f5] font-mono text-[10px]">
                            2 ID: {o.firstIdType} + {o.secondIdType}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fef7eb] text-[#8a5714] border border-[#fbe5b4] font-mono text-[10px]">
                            Deposit: {formatRupiah(o.depositAmount)}
                          </span>
                        )}
                      </td>

                      {/* Biaya */}
                      <td className="py-2.5 px-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                        {formatRupiah(o.totalRentalPrice)}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium font-mono ${
                          isActive 
                            ? isOverdue
                              ? 'bg-[#fdf1f3] text-[#8c273e] border border-[#f9ccd5]'
                              : 'bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4]'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? (isOverdue ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-stone-400'}`}></span>
                          <span>{isActive ? (isOverdue ? 'Terlambat' : 'Sedang Tersewa') : 'Tuntas Kembali'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Cetak Surat Perjanjian */}
                          <button
                            onClick={() => {
                              setSelectedOrderForPrint(o);
                              setPrintDocType('contract');
                            }}
                            className="px-2 py-1 bg-white border border-[#e5dfd5] hover:bg-[#faf7f2] rounded-lg text-stone-700 text-[11px] font-medium transition-colors flex items-center gap-1 shadow-2xs"
                            title="Cetak Surat Perjanjian Sewa (Pasal-Pasal Hukum)"
                          >
                            <FileText className="w-3 h-3 text-[#1e5488]" />
                            <span>Perjanjian</span>
                          </button>

                          {/* Cetak Form Sewa */}
                          <button
                            onClick={() => {
                              setSelectedOrderForPrint(o);
                              setPrintDocType('handover_form');
                            }}
                            className="px-2 py-1 bg-white border border-[#e5dfd5] hover:bg-[#faf7f2] rounded-lg text-stone-700 text-[11px] font-medium transition-colors flex items-center gap-1 shadow-2xs"
                            title="Cetak Form Checklist Serah Terima Unit"
                          >
                            <Printer className="w-3 h-3 text-stone-500" />
                            <span>Form</span>
                          </button>

                          {/* Tombol Pengembalian Unit */}
                          {isActive && (
                            <button
                              onClick={() => handleOpenReturnModal(o)}
                              className="px-2.5 py-1 bg-[#1b633d] hover:bg-[#154e30] text-white rounded-lg text-[11px] font-semibold transition-colors shadow-2xs"
                              title="Proses Pengembalian Unit Laptop"
                            >
                              Check-In Kembali
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pengembalian Unit (Return Check-In) */}
      {returningOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#e5dfd5] shadow-2xl max-w-lg w-full p-5 text-xs text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d8]">
              <div>
                <h3 className="font-bold text-sm text-stone-900">Proses Pengembalian Laptop Sewa</h3>
                <p className="text-[11px] text-stone-500 font-mono">No. SPK: {returningOrder.transactionNumber}</p>
              </div>
              <button onClick={() => setReturningOrder(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 my-3">
              {/* Unit & Penyewa Info */}
              <div className="p-3 bg-[#faf8f5] rounded-lg border border-[#e8e2d8] grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div>
                  <span className="text-stone-400 block text-[10px]">Penyewa:</span>
                  <span className="font-bold text-stone-900 font-sans">{returningOrder.customerName}</span>
                  <div className="text-stone-500 text-[10px]">{returningOrder.phone}</div>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Unit Laptop:</span>
                  <span className="font-bold text-stone-900">{returningOrder.laptopName}</span>
                  <div className="text-stone-500 text-[10px]">{returningOrder.laptopSku}</div>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Jatuh Tempo:</span>
                  <span className="font-bold text-stone-900">{returningOrder.endDate} (18:00 WIB)</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Status Jaminan:</span>
                  <span className="font-bold text-[#1b633d]">
                    {returningOrder.guaranteeType === 'two_identities' 
                      ? 'Kembalikan 2 ID Asli' 
                      : `Kembalikan Deposit ${formatRupiah(returningOrder.depositAmount)}`}
                  </span>
                </div>
              </div>

              {/* Denda Keterlambatan Rp 20.000 / Jam */}
              <div className="p-3.5 bg-[#fef7eb] rounded-xl border border-[#fbe5b4] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#8a5714]">Pemeriksaan Keterlambatan (Denda Rp 20.000 / Jam):</span>
                  <span className="font-mono text-xs font-bold text-stone-900">
                    Total Denda: {formatRupiah((returnLateHours * 20000) + returnDamageFine)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-mono text-stone-600 mb-1">Jumlah Jam Keterlambatan:</label>
                    <input
                      type="number"
                      min="0"
                      value={returnLateHours}
                      onChange={(e) => setReturnLateHours(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1 bg-white border border-[#fbe5b4] rounded-lg font-mono font-bold text-stone-900"
                    />
                    <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                      = {formatRupiah(returnLateHours * 20000)} (@ 20rb/jam)
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-stone-600 mb-1">Denda Kerusakan / Ganti Part (Rp):</label>
                    <input
                      type="number"
                      min="0"
                      value={returnDamageFine}
                      onChange={(e) => setReturnDamageFine(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1 bg-white border border-[#fbe5b4] rounded-lg font-mono font-bold text-stone-900"
                    />
                    <div className="text-[10px] text-stone-500 font-mono mt-0.5">0 jika kondisi mulus</div>
                  </div>
                </div>
              </div>

              {/* Catatan Fisik & Staf Penerima */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">Hasil Inspeksi Fisik Saat Kembali:</label>
                  <input
                    type="text"
                    value={returnPhysicalNotes}
                    onChange={(e) => setReturnPhysicalNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900"
                    placeholder="Contoh: Unit mulus, charger lengkap, LCD normal tanpa goresan"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">Nama Staf Pemeriksa (Penerima):</label>
                  <input
                    type="text"
                    value={returnReceiverStaff}
                    onChange={(e) => setReturnReceiverStaff(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e2d8]">
              <button
                type="button"
                onClick={() => setReturningOrder(null)}
                className="px-3 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-600 hover:bg-[#faf7f2]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitReturn}
                className="px-4 py-1.5 bg-[#1b633d] hover:bg-[#154e30] text-white rounded-lg font-bold shadow-2xs"
              >
                Konfirmasi Unit Kembali & Status Ready
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Printable View */}
      {selectedOrderForPrint && (
        <RentalContractPrintView
          order={selectedOrderForPrint}
          isOpen={Boolean(selectedOrderForPrint)}
          onClose={() => setSelectedOrderForPrint(null)}
          defaultDocType={printDocType}
        />
      )}
    </div>
  );
};
