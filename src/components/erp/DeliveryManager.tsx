import React, { useState, useMemo } from 'react';
import { DeliveryLog, BranchCity, Employee } from '../../types';
import { formatRupiah, calculateDeliveryFee } from '../../utils/erpStorage';
import { 
  Truck, 
  Plus, 
  Search, 
  MapPin, 
  X,
  Calculator
} from 'lucide-react';

interface DeliveryManagerProps {
  deliveries: DeliveryLog[];
  onSaveDeliveries: (updated: DeliveryLog[]) => void;
  selectedBranch: BranchCity | 'Semua';
  couriers: Employee[];
}

export const DeliveryManager: React.FC<DeliveryManagerProps> = ({
  deliveries,
  onSaveDeliveries,
  selectedBranch,
  couriers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick Calculator State
  const [calcKm, setCalcKm] = useState<number>(10);
  const quickCalcTotal = useMemo(() => calculateDeliveryFee(calcKm, 5000), [calcKm]);

  // Form State for New Delivery
  const [formData, setFormData] = useState<Partial<DeliveryLog>>({
    customerName: '',
    customerPhone: '',
    destinationAddress: '',
    tripType: 'antar',
    distanceKm: 8,
    ratePerKm: 5000,
    branchCity: 'Malang',
    courierName: 'Bayu Saputra (Kurir Malang)',
    status: 'dalam_perjalanan',
    paymentStatus: 'lunas',
    notes: ''
  });

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      if (selectedBranch !== 'Semua' && d.branchCity !== selectedBranch) return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCust = d.customerName.toLowerCase().includes(q);
        const matchAddress = d.destinationAddress.toLowerCase().includes(q);
        const matchCourier = d.courierName.toLowerCase().includes(q);
        if (!matchCust && !matchAddress && !matchCourier) return false;
      }
      return true;
    });
  }, [deliveries, selectedBranch, statusFilter, searchQuery]);

  // Financial Metrics of Delivery
  const metrics = useMemo(() => {
    const list = selectedBranch === 'Semua' ? deliveries : deliveries.filter(d => d.branchCity === selectedBranch);
    const totalKm = list.reduce((sum, d) => sum + d.distanceKm, 0);
    const totalFee = list.reduce((sum, d) => sum + d.totalFee, 0);
    const completedTrips = list.filter(d => d.status === 'selesai').length;
    const activeTrips = list.filter(d => d.status === 'dalam_perjalanan' || d.status === 'menunggu_driver').length;

    return {
      totalTrips: list.length,
      totalKm,
      totalFee,
      completedTrips,
      activeTrips
    };
  }, [deliveries, selectedBranch]);

  const handleOpenAdd = () => {
    const defaultBranch = selectedBranch === 'Semua' ? 'Malang' : selectedBranch;
    setFormData({
      customerName: '',
      customerPhone: '',
      destinationAddress: '',
      tripType: 'antar',
      distanceKm: 8,
      ratePerKm: 5000,
      branchCity: defaultBranch,
      courierName: 'Bayu Saputra (Kurir / Driver)',
      status: 'dalam_perjalanan',
      paymentStatus: 'lunas',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.destinationAddress) return;

    const km = Number(formData.distanceKm) || 1;
    const rate = 5000;
    const total = km * rate;

    const newLog: DeliveryLog = {
      id: `dlv-${Date.now()}`,
      orderId: `ORD-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone || '',
      destinationAddress: formData.destinationAddress,
      distanceKm: km,
      ratePerKm: rate,
      totalFee: total,
      branchCity: (formData.branchCity || (selectedBranch === 'Semua' ? 'Malang' : selectedBranch)) as BranchCity,
      courierId: 'emp-cour-1',
      courierName: formData.courierName || 'Kurir Driver',
      tripType: formData.tripType || 'antar',
      status: formData.status || 'dalam_perjalanan',
      paymentStatus: formData.paymentStatus || 'lunas',
      departureTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: formData.notes || ''
    };

    onSaveDeliveries([newLog, ...deliveries]);
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: DeliveryLog['status']) => {
    const updated = deliveries.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: newStatus,
          arrivalTime: newStatus === 'selesai' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.arrivalTime
        };
      }
      return d;
    });
    onSaveDeliveries(updated);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-stone-900">
            Logistik & Keuangan Antar-Jemput
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Pilar 4: Keuangan terpisah &bull; Tarif flat resmi Rp 5.000 / km
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#475569] hover:bg-[#334155] text-white rounded-md text-xs font-medium transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Input Pengantaran / Pick-up</span>
        </button>
      </div>

      {/* KPI Cards & Quick Rate Calculator Strip in Pastel Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#eef4fc] rounded-xl border border-[#cee0f7] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1e5488] font-semibold">Total Biaya Antar-Jemput</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {formatRupiah(metrics.totalFee)}
          </div>
          <div className="text-[11px] text-[#1e5488]/80 mt-1">Keuangan logistik terpisah</div>
        </div>

        <div className="p-3.5 bg-[#f5f0fa] rounded-xl border border-[#e2d6f5] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#5c3682] font-semibold">Total Jarak Tempuh</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {metrics.totalKm} <span className="text-xs font-normal font-sans text-stone-500">km</span>
          </div>
          <div className="text-[11px] text-[#5c3682]/80 mt-1">Dari {metrics.totalTrips} kali trip</div>
        </div>

        <div className="p-3.5 bg-[#eaf4ee] rounded-xl border border-[#cce5d4] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#1b633d] font-semibold">Status Perjalanan</div>
          <div className="text-xl font-bold font-mono text-stone-800 mt-1">
            {metrics.activeTrips} <span className="text-xs font-normal font-sans text-stone-500">Aktif</span>
          </div>
          <div className="text-[11px] text-[#1b633d]/80 mt-1">{metrics.completedTrips} Trip Selesai</div>
        </div>

        {/* Quick Calculator Box - Pastel Butter */}
        <div className="p-3.5 bg-[#fef7eb] rounded-xl border border-[#fbe5b4] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-700">
            <span className="font-mono text-[10px] uppercase text-[#8a5714] font-semibold">Kalkulator Ongkir (5rb/km):</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <input
              type="number"
              min="1"
              value={calcKm}
              onChange={(e) => setCalcKm(Math.max(1, Number(e.target.value)))}
              className="w-16 px-2.5 py-1 bg-white border border-[#fbe5b4] rounded-lg text-xs font-mono font-bold text-stone-800 focus:outline-none"
            />
            <span className="text-xs text-stone-500 font-mono">km =</span>
            <span className="text-sm font-bold font-mono text-stone-900">{formatRupiah(quickCalcTotal)}</span>
          </div>
          <div className="text-[10px] text-[#8a5714]/80 font-mono mt-1">Perhitungan resmi 5rb/km</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari Customer, Alamat, atau Driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#4a586e]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'menunggu_driver', label: 'Menunggu Driver' },
            { id: 'dalam_perjalanan', label: 'Dalam Perjalanan' },
            { id: 'selesai', label: 'Selesai' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap text-xs ${
                statusFilter === tab.id ? 'bg-[#4a586e] text-white font-medium' : 'text-stone-600 hover:bg-[#faf7f2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl border border-[#e8e2d8] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e8e2d8] bg-[#f7f5ee] text-[10px] font-mono uppercase text-stone-600">
                <th className="py-2.5 px-3">Trip ID & Tipe</th>
                <th className="py-2.5 px-3">Customer & Kontak</th>
                <th className="py-2.5 px-3">Alamat Tujuan</th>
                <th className="py-2.5 px-3">Jarak & Tarif</th>
                <th className="py-2.5 px-3 font-mono">Total Biaya</th>
                <th className="py-2.5 px-3">Kurir / Driver</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2ea]">
              {filteredDeliveries.map((d) => {
                const isSelesai = d.status === 'selesai';
                const isOngoing = d.status === 'dalam_perjalanan';

                return (
                  <tr key={d.id} className="hover:bg-[#faf7f2] transition-colors">
                    {/* Trip ID */}
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                      <div className="font-semibold text-stone-900">{d.id}</div>
                      <div className="text-[10px] text-zinc-500 uppercase">
                        {d.tripType === 'antar' ? 'Antar ke Lokasi' : 'Jemput / Pick-up'}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-zinc-900">{d.customerName}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{d.customerPhone || '-'}</div>
                    </td>

                    {/* Address */}
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <div className="text-zinc-800 truncate" title={d.destinationAddress}>
                        {d.destinationAddress}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">Cabang {d.branchCity}</div>
                    </td>

                    {/* Jarak */}
                    <td className="py-2.5 px-3 font-mono text-zinc-700 whitespace-nowrap">
                      <div>{d.distanceKm} km</div>
                      <div className="text-[10px] text-zinc-400">@ Rp 5.000 / km</div>
                    </td>

                    {/* Total Biaya */}
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 whitespace-nowrap">
                      {formatRupiah(d.totalFee)}
                    </td>

                    {/* Driver */}
                    <td className="py-2.5 px-3 text-zinc-700 whitespace-nowrap">
                      <div>{d.courierName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">Jam: {d.departureTime || '10:00'}</div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        isSelesai 
                          ? 'bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4]' 
                          : isOngoing 
                            ? 'bg-[#fef7eb] text-[#8a5714] border border-[#fbe5b4]' 
                            : 'bg-[#fdf1f3] text-[#8c273e] border border-[#f9ccd5]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isSelesai ? 'bg-[#22c55e]' :
                          isOngoing ? 'bg-[#eab308]' : 'bg-[#ef4444]'
                        }`}></span>
                        <span className="capitalize">
                          {d.status === 'selesai' ? 'Selesai' :
                           d.status === 'dalam_perjalanan' ? 'Dalam Jalan' : 'Menunggu'}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {!isSelesai ? (
                        <button
                          onClick={() => handleUpdateStatus(d.id, 'selesai')}
                          className="px-2.5 py-1 bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4] hover:bg-[#d8eedf] rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Tandai Selesai
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400 font-mono">Trip Tuntas</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Pengantaran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 shadow-xl max-w-md w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">Input Order Antar-Jemput Unit</h3>
                <div className="text-[11px] text-zinc-500 font-mono">Tarif terpisah: Rp 5.000 / km</div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDelivery} className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Tipe Trip</label>
                  <select
                    value={formData.tripType}
                    onChange={(e) => setFormData({ ...formData, tripType: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  >
                    <option value="antar">Pengantaran Unit (Awal)</option>
                    <option value="jemput">Penjemputan Unit (Kembali)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Cabang</label>
                  <select
                    value={formData.branchCity}
                    onChange={(e) => setFormData({ ...formData, branchCity: e.target.value as BranchCity })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  >
                    <option value="Malang">Malang (Pusat)</option>
                    <option value="Sidoarjo">Sidoarjo</option>
                    <option value="Bekasi">Bekasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Nama Customer *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                    placeholder="Nama Penerima"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                    placeholder="0812xxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Alamat Tujuan Pengantaran *</label>
                <input
                  type="text"
                  required
                  value={formData.destinationAddress}
                  onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                  placeholder="Nama Jalan, Gedung, No Rumah..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Jarak Tempuh (km) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Total Biaya (Rp 5rb/km)</label>
                  <div className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded text-zinc-900 font-mono font-bold">
                    {formatRupiah((Number(formData.distanceKm) || 0) * 5000)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Kurir / Driver Bertugas</label>
                <input
                  type="text"
                  value={formData.courierName}
                  onChange={(e) => setFormData({ ...formData, courierName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-zinc-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-200 rounded text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded font-medium hover:bg-zinc-800"
                >
                  Simpan Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
