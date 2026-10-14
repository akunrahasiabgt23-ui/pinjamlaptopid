import React, { useMemo } from 'react';
import { 
  Laptop, 
  Customer, 
  ServiceRecord, 
  DeliveryLog, 
  PettyCashTransaction, 
  FinancialTransaction, 
  BranchCity,
  RentalOrder
} from '../../types';
import { formatRupiah } from '../../utils/erpStorage';
import { 
  Wrench, 
  AlertTriangle,
  Building2,
  TrendingUp,
  Truck,
  Coins,
  Laptop as LaptopIcon,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileText
} from 'lucide-react';

interface DashboardOverviewProps {
  laptops: Laptop[];
  services: ServiceRecord[];
  deliveries: DeliveryLog[];
  pettyCash: PettyCashTransaction[];
  finance: FinancialTransaction[];
  customers: Customer[];
  rentalOrders?: RentalOrder[];
  selectedBranch: BranchCity | 'Semua';
  onNavigateTab: (tabId: string) => void;
  overdueInternalCount: number;
  overdueExternalCount: number;
  onOpenRentalModal?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  laptops,
  services,
  deliveries,
  pettyCash,
  finance,
  customers,
  rentalOrders = [],
  selectedBranch,
  onNavigateTab,
  overdueInternalCount,
  overdueExternalCount,
  onOpenRentalModal
}) => {
  // Laptops Breakdown
  const laptopStats = useMemo(() => {
    const list = selectedBranch === 'Semua' ? laptops : laptops.filter(l => l.branchCity === selectedBranch);
    return {
      total: list.length,
      ready: list.filter(l => l.status === 'ready').length,
      rented: list.filter(l => l.status === 'rented').length,
      trouble: list.filter(l => l.status === 'trouble').length
    };
  }, [laptops, selectedBranch]);

  // Today Income Breakdown (Sewa, Antar-Jemput, Denda)
  const todayFinance = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const list = finance.filter(t => {
      const matchDate = t.date === today || t.date === '2026-10-14';
      const matchBranch = selectedBranch === 'Semua' ? true : t.branchCity === selectedBranch;
      return matchDate && matchBranch && t.type === 'income';
    });

    const sewa = list.filter(t => t.category === 'sewa').reduce((s, t) => s + t.amount, 0);
    const antarJemput = list.filter(t => t.category === 'antar_jemput').reduce((s, t) => s + t.amount, 0);
    const denda = list.filter(t => t.category === 'denda').reduce((s, t) => s + t.amount, 0);
    const total = sewa + antarJemput + denda;

    return { sewa, antarJemput, denda, total, count: list.length };
  }, [finance, selectedBranch]);

  // Petty cash balance
  const pettyCashTotal = useMemo(() => {
    const list = selectedBranch === 'Semua' ? pettyCash : pettyCash.filter(t => t.branchCity === selectedBranch);
    const masuk = list.filter(t => t.type === 'masuk').reduce((s, t) => s + t.amount, 0);
    const keluar = list.filter(t => t.type === 'keluar').reduce((s, t) => s + t.amount, 0);
    return masuk - keluar;
  }, [pettyCash, selectedBranch]);

  // Deliveries today
  const deliveryStats = useMemo(() => {
    const list = selectedBranch === 'Semua' ? deliveries : deliveries.filter(d => d.branchCity === selectedBranch);
    const totalKm = list.reduce((s, d) => s + d.distanceKm, 0);
    const totalFee = list.reduce((s, d) => s + d.totalFee, 0);
    return { count: list.length, totalKm, totalFee };
  }, [deliveries, selectedBranch]);

  const totalOverdue = overdueInternalCount + overdueExternalCount;

  return (
    <div className="space-y-6">
      {/* Top Header with Soft Pastel Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8e2d8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-stone-800">
              Dashboard Operasional
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#eaf4ee] border border-[#cce5d4] text-[#1b633d]">
              Pastel Live
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Lingkup Cabang: {selectedBranch === 'Semua' ? 'Konsolidasi 3 Cabang' : `Cabang ${selectedBranch}`} &bull; 14 Okt 2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('laptops')}
            className="px-3 py-1.5 rounded-lg border border-[#e5dfd5] bg-white hover:bg-[#faf7f2] text-xs font-medium text-stone-700 transition-colors shadow-2xs"
          >
            + Input Unit Laptop
          </button>
          <button
            onClick={() => onNavigateTab('finance')}
            className="px-3.5 py-1.5 rounded-lg bg-[#4a586e] hover:bg-[#3d495c] text-xs font-medium text-white transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span>Laporan Keuangan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SLA Alert Notification in Pastel Peach */}
      {totalOverdue > 0 && (
        <div className="p-3.5 bg-[#fef1f0] border border-[#fac6c3] rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#fce5e3] text-[#8a2422] shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-[#8a2422]">Peringatan Kinerja Servis Melewati Batas SLA: </span>
              <span className="text-stone-700">
                {overdueInternalCount > 0 && `${overdueInternalCount} unit teknisi internal ≥ 7 hari. `}
                {overdueExternalCount > 0 && `${overdueExternalCount} unit vendor eksternal ≥ 14 hari.`}
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('services')}
            className="px-3 py-1.5 bg-[#8a2422] text-white rounded-lg text-[11px] font-medium hover:bg-[#721c1b] transition-colors shrink-0 shadow-2xs"
          >
            Evaluasi Servis
          </button>
        </div>
      )}

      {/* KPI Cards Grid - Soft Pastel Themes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* KPI 1: Status Laptop - Pastel Mint */}
        <div 
          onClick={() => onNavigateTab('laptops')}
          className="bg-[#eaf4ee] p-4 rounded-xl border border-[#cce5d4] hover:border-[#b4d8bf] cursor-pointer transition-all shadow-2xs hover:shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#1b633d] font-semibold">Status Laptop</span>
            <LaptopIcon className="w-4 h-4 text-[#1b633d]/60" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-800 mt-1">
            {laptopStats.total} <span className="text-xs font-normal text-stone-500 font-sans">Unit</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#cce5d4] flex flex-wrap items-center gap-2 text-xs text-stone-700">
            <span className="inline-flex items-center gap-1 font-medium text-[#1b633d]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
              {laptopStats.ready} Ready
            </span>
            <span className="text-stone-300">&bull;</span>
            <span className="inline-flex items-center gap-1 text-[#1e5488]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
              {laptopStats.rented} Tersewa
            </span>
            <span className="text-stone-300">&bull;</span>
            <span className="inline-flex items-center gap-1 text-[#8c273e] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
              {laptopStats.trouble} Trouble
            </span>
          </div>
        </div>

        {/* KPI 2: Today Income - Pastel Warm Butter */}
        <div 
          onClick={() => onNavigateTab('finance')}
          className="bg-[#fef7eb] p-4 rounded-xl border border-[#fbe5b4] hover:border-[#f7d692] cursor-pointer transition-all shadow-2xs hover:shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a5714] font-semibold">Pemasukan Hari Ini</span>
            <TrendingUp className="w-4 h-4 text-[#8a5714]/60" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-800 mt-1">
            {formatRupiah(todayFinance.total)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#fbe5b4] text-xs text-stone-600">
            Sewa: <span className="font-mono text-stone-800 font-medium">{formatRupiah(todayFinance.sewa)}</span> &bull; 3 Pos
          </div>
        </div>

        {/* KPI 3: Kas Kecil Toko - Pastel Lavender */}
        <div 
          onClick={() => onNavigateTab('petty_cash')}
          className="bg-[#f5f0fa] p-4 rounded-xl border border-[#e2d6f5] hover:border-[#cfbcf0] cursor-pointer transition-all shadow-2xs hover:shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5c3682] font-semibold">Saldo Kas Kecil</span>
            <Coins className="w-4 h-4 text-[#5c3682]/60" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-800 mt-1">
            {formatRupiah(pettyCashTotal)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#e2d6f5] text-xs text-stone-600 truncate">
            {selectedBranch === 'Semua' ? 'Total Kas 3 Cabang' : `Kas Operasional ${selectedBranch}`}
          </div>
        </div>

        {/* KPI 4: Antar Jemput Logistik - Pastel Sky */}
        <div 
          onClick={() => onNavigateTab('deliveries')}
          className="bg-[#eef4fc] p-4 rounded-xl border border-[#cee0f7] hover:border-[#b3cff2] cursor-pointer transition-all shadow-2xs hover:shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#1e5488] font-semibold">Antar-Jemput (5rb/km)</span>
            <Truck className="w-4 h-4 text-[#1e5488]/60" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-800 mt-1">
            {deliveryStats.count} <span className="text-xs font-normal text-stone-500 font-sans">Trip</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#cee0f7] text-xs text-stone-600 font-mono">
            {deliveryStats.totalKm} km &bull; {formatRupiah(deliveryStats.totalFee)}
          </div>
        </div>
      </div>

      {/* Main Split: Left Financial & Laptop Breakdown, Right SLA & Cabang Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Financial 3-Breakdown & Laptops Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pillar 10: Rincian Uang Masuk Per Hari (Sewa, Antar-Jemput, Denda) in Pastel Cards */}
          <div className="bg-white rounded-xl border border-[#e8e2d8] p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe3]">
              <div>
                <h3 className="text-sm font-semibold text-stone-800">
                  Rincian Uang Masuk Hari Ini (3 Pos Terpisah)
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Berdasarkan kriteria pelaporan kas harian cabang
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('finance')}
                className="text-xs text-[#4a586e] hover:text-stone-900 underline font-medium"
              >
                Detail Keuangan &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-3.5 bg-[#eaf4ee] rounded-xl border border-[#cce5d4]">
                <div className="text-[10px] font-mono uppercase text-[#1b633d] font-semibold">1. Sewa Laptop</div>
                <div className="text-lg font-bold font-mono text-stone-800 mt-1">
                  {formatRupiah(todayFinance.sewa)}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">Pokok biaya rental unit</div>
              </div>

              <div className="p-3.5 bg-[#eef4fc] rounded-xl border border-[#cee0f7]">
                <div className="text-[10px] font-mono uppercase text-[#1e5488] font-semibold">2. Antar-Jemput (5rb/km)</div>
                <div className="text-lg font-bold font-mono text-stone-800 mt-1">
                  {formatRupiah(todayFinance.antarJemput)}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">Ongkos kirim & pick-up</div>
              </div>

              <div className="p-3.5 bg-[#fdf1f3] rounded-xl border border-[#f9ccd5]">
                <div className="text-[10px] font-mono uppercase text-[#8c273e] font-semibold">3. Denda & Overtime</div>
                <div className="text-lg font-bold font-mono text-stone-800 mt-1">
                  {formatRupiah(todayFinance.denda)}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">Denda telat / kerusakan</div>
              </div>
            </div>

            <div className="p-3 bg-[#f5f2ea] rounded-lg border border-[#e5dfd5] text-xs flex items-center justify-between font-mono">
              <span className="text-stone-700">Total Akumulasi Pemasukan Hari Ini:</span>
              <span className="text-sm font-bold text-stone-900">{formatRupiah(todayFinance.total)}</span>
            </div>
          </div>

          {/* Quick Laptop Inventory View */}
          <div className="bg-white rounded-xl border border-[#e8e2d8] p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe3]">
              <div>
                <h3 className="text-sm font-semibold text-stone-800">
                  Inventaris Unit Laptop
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Kesiapan unit per cabang operasional
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('laptops')}
                className="text-xs text-[#4a586e] hover:text-stone-900 underline font-medium"
              >
                Lihat Seluruh Unit ({laptops.length}) &rarr;
              </button>
            </div>

            <div className="divide-y divide-[#f5f2ea] text-xs mt-2">
              {laptops.slice(0, 5).map((l) => (
                <div key={l.id} className="py-2.5 flex items-center justify-between hover:bg-[#faf8f5] px-2 rounded-lg transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-stone-500 text-[11px]">{l.sku}</span>
                      <span className="font-medium text-stone-800">{l.name}</span>
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                      {l.processor} &bull; Cabang {l.branchCity} &bull; {formatRupiah(l.dailyPrice)}/hari
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      l.status === 'ready' 
                        ? 'bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4]' 
                        : l.status === 'rented' 
                          ? 'bg-[#eef4fc] text-[#1e5488] border border-[#cee0f7]' 
                          : 'bg-[#fdf1f3] text-[#8c273e] border border-[#f9ccd5]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        l.status === 'ready' ? 'bg-[#22c55e]' :
                        l.status === 'rented' ? 'bg-[#3b82f6]' : 'bg-[#ef4444]'
                      }`}></span>
                      <span className="capitalize">
                        {l.status === 'ready' ? 'Ready' : l.status === 'rented' ? 'Tersewa' : 'Trouble'}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Span 1): SLA Kinerja Servis & 3 Cabang Status */}
        <div className="space-y-6">
          {/* Pillar 8: SLA Servis Monitor Card in Pastel */}
          <div className="bg-white rounded-xl border border-[#e8e2d8] p-4 shadow-2xs">
            <div className="pb-3 border-b border-[#f0ebe3] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-stone-800">Kinerja Servis Teknisi</h3>
                <div className="text-[11px] text-stone-500 font-mono">SLA: Internal 7 hr | Eksternal 14 hr</div>
              </div>
              <Wrench className="w-4 h-4 text-stone-400" />
            </div>

            <div className="space-y-3 mt-3 text-xs">
              <div className="p-3 rounded-xl border border-[#fbe5b4] bg-[#fef7eb]">
                <div className="flex items-center justify-between text-stone-800">
                  <span className="font-medium">Antrian Servis Internal:</span>
                  <span className="font-mono font-bold text-[#8a5714]">
                    {services.filter(s => s.status === 'internal_repair').length} Unit
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-stone-600 text-[11px]">
                  <span>Lewat 7 Hari:</span>
                  <span className={`font-mono font-bold ${overdueInternalCount > 0 ? 'text-[#8a2422]' : 'text-stone-700'}`}>
                    {overdueInternalCount} Unit
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#e2d6f5] bg-[#f5f0fa]">
                <div className="flex items-center justify-between text-stone-800">
                  <span className="font-medium">Di Vendor Eksternal:</span>
                  <span className="font-mono font-bold text-[#5c3682]">
                    {services.filter(s => s.status === 'external_vendor').length} Unit
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-stone-600 text-[11px]">
                  <span>Lewat 14 Hari:</span>
                  <span className={`font-mono font-bold ${overdueExternalCount > 0 ? 'text-[#8a2422]' : 'text-stone-700'}`}>
                    {overdueExternalCount} Unit
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('services')}
                className="w-full py-2 px-3 bg-[#4a586e] text-white hover:bg-[#3d495c] rounded-lg text-xs font-medium transition-colors shadow-2xs"
              >
                Buka Log Servis Teknisi
              </button>
            </div>
          </div>

          {/* Pillar 6: Ringkasan 3 Cabang in Pastel Cards */}
          <div className="bg-white rounded-xl border border-[#e8e2d8] p-4 shadow-2xs">
            <div className="pb-3 border-b border-[#f0ebe3]">
              <h3 className="text-sm font-semibold text-stone-800">3 Cabang Operasional</h3>
              <div className="text-[11px] text-stone-500 font-mono">Malang Pusat &bull; Sidoarjo &bull; Bekasi</div>
            </div>

            <div className="space-y-2.5 mt-3 text-xs">
              {[
                { city: 'Malang', role: 'Pusat', desc: 'Hub Utama, Gudang Sentral & Lab Servis', bg: 'bg-[#eef4fc]', border: 'border-[#cee0f7]', text: 'text-[#1e5488]' },
                { city: 'Sidoarjo', role: 'Cabang', desc: 'Titik Distribusi Gerbangkertosusila', bg: 'bg-[#eaf4ee]', border: 'border-[#cce5d4]', text: 'text-[#1b633d]' },
                { city: 'Bekasi', role: 'Cabang', desc: 'Titik Distribusi Jabodetabek', bg: 'bg-[#f5f0fa]', border: 'border-[#e2d6f5]', text: 'text-[#5c3682]' }
              ].map((c) => {
                const countUnit = laptops.filter(l => l.branchCity === c.city).length;
                const countReady = laptops.filter(l => l.branchCity === c.city && l.status === 'ready').length;
                return (
                  <div key={c.city} className={`p-2.5 rounded-xl border ${c.border} ${c.bg}`}>
                    <div className="flex items-center justify-between font-medium">
                      <span className={`font-semibold ${c.text}`}>{c.city} ({c.role})</span>
                      <span className="font-mono text-stone-700">{countReady} / {countUnit} Ready</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{c.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts in Pastel Style */}
          <div className="bg-white rounded-xl border border-[#e8e2d8] p-4 text-xs space-y-2 shadow-2xs">
            <div className="text-[11px] font-mono uppercase text-stone-400">Akses Cepat Modul:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateTab('customers')}
                className="p-2.5 border border-[#e5dfd5] bg-[#faf8f5] hover:bg-white rounded-lg text-left transition-colors"
              >
                <div className="font-medium text-stone-800">Penyewa & KTP</div>
                <div className="text-[10px] text-stone-400 font-mono">{customers.length} Terdaftar</div>
              </button>
              <button
                onClick={() => onNavigateTab('movements')}
                className="p-2.5 border border-[#e5dfd5] bg-[#faf8f5] hover:bg-white rounded-lg text-left transition-colors"
              >
                <div className="font-medium text-stone-800">Keluar-Masuk</div>
                <div className="text-[10px] text-stone-400 font-mono">Serah Terima</div>
              </button>
              <button
                onClick={() => onNavigateTab('deliveries')}
                className="p-2.5 border border-[#e5dfd5] bg-[#faf8f5] hover:bg-white rounded-lg text-left transition-colors"
              >
                <div className="font-medium text-stone-800">Antar-Jemput</div>
                <div className="text-[10px] text-stone-400 font-mono">5rb/km</div>
              </button>
              <button
                onClick={() => onNavigateTab('payroll')}
                className="p-2.5 border border-[#e5dfd5] bg-[#faf8f5] hover:bg-white rounded-lg text-left transition-colors"
              >
                <div className="font-medium text-stone-800">Payroll Gaji</div>
                <div className="text-[10px] text-stone-400 font-mono">Slip Karyawan</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
