import React, { useState, useEffect } from 'react';
import { 
  Search, Clock, AlertTriangle, CheckCircle2, Truck, Building2, 
  MapPin, Phone, ShieldCheck, ShieldAlert, Calendar, RefreshCw, 
  ArrowRight, FileText, Banknote, User, Package, ChevronRight, X, Play, Printer
} from 'lucide-react';
import { RentalOrder, OrderStatus, ReturnPickupRequest, CustomerMember } from '../types';
import { 
  getStoredOrders, getOrderById, formatRupiah, calculateOverdueAndLateFee, 
  requestOrderReturnPickup, setSimulatedLateHours, startOrderRental, updateOrder,
  getStoredAdminSession, getStoredCustomerSession
} from '../utils/storage';
import { RentalAgreementModal } from './RentalAgreementModal';

interface OrderTrackingViewProps {
  initialOrderId?: string;
  onNavigateToCatalog: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderId,
  onNavigateToCatalog
}) => {
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId || '');
  const [searchInput, setSearchInput] = useState<string>(initialOrderId || '');
  const [currentOrder, setCurrentOrder] = useState<RentalOrder | null>(null);
  const [showAgreementModal, setShowAgreementModal] = useState<boolean>(false);

  // Return pick up modal
  const [showPickupModal, setShowPickupModal] = useState<boolean>(false);
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>('Siang (13:00 - 16:00 WIB)');
  const [pickupNotes, setPickupNotes] = useState<string>('Unit lengkap berserta charger & tas, siap dijemput');

  // Real-time ticking timer
  const [, setTicker] = useState<number>(0);

  // Status autentikasi admin: hanya tombol admin yang tampil jika admin sedang login
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const session = getStoredAdminSession();
    return Boolean(session && session.isAuthenticated);
  });
  const [customerSession, setCustomerSession] = useState<CustomerMember | null>(() => getStoredCustomerSession());

  useEffect(() => {
    const checkAdminAuth = () => {
      const session = getStoredAdminSession();
      setIsAdminLoggedIn(Boolean(session && session.isAuthenticated));
    };
    const checkCustomerAuth = () => {
      setCustomerSession(getStoredCustomerSession());
    };
    checkAdminAuth();
    checkCustomerAuth();
    window.addEventListener('pinjamlaptop_admin_auth_updated', checkAdminAuth);
    window.addEventListener('pinjamlaptop_customer_session_updated', checkCustomerAuth);
    return () => {
      window.removeEventListener('pinjamlaptop_admin_auth_updated', checkAdminAuth);
      window.removeEventListener('pinjamlaptop_customer_session_updated', checkCustomerAuth);
    };
  }, []);

  const loadData = () => {
    const allOrders = getStoredOrders();
    setOrders(allOrders);

    let found: RentalOrder | undefined;
    if (selectedOrderId) {
      found = allOrders.find(o => o.id.toLowerCase() === selectedOrderId.toLowerCase().trim());
    }
    if (!found && allOrders.length > 0) {
      found = allOrders[0];
      setSelectedOrderId(found.id);
    }
    setCurrentOrder(found || null);
    if (found) {
      setPickupAddress(found.deliveryAddress || found.customer.address);
      const tomorrow = new Date();
      setPickupDate(tomorrow.toISOString().split('T')[0]);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('pinjamlaptop_orders_updated', handleUpdate);
    return () => window.removeEventListener('pinjamlaptop_orders_updated', handleUpdate);
  }, [selectedOrderId]);

  // Timer interval for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const target = orders.find(o => o.id.toLowerCase() === searchInput.toLowerCase().trim());
    if (target) {
      setSelectedOrderId(target.id);
      setCurrentOrder(target);
    } else {
      alert(`Pesanan dengan ID "${searchInput}" tidak ditemukan. Silakan periksa kembali nomor pesanan Anda.`);
    }
  };

  const handleSelectOrder = (order: RentalOrder) => {
    setSelectedOrderId(order.id);
    setSearchInput(order.id);
    setCurrentOrder(order);
  };

  const handleSubmitReturnPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    if (!pickupAddress.trim() || !pickupDate) {
      alert('Mohon isi alamat dan tanggal penjemputan unit!');
      return;
    }

    const request: ReturnPickupRequest = {
      requestedAt: new Date().toISOString(),
      pickupAddress,
      preferredDate: pickupDate,
      preferredTimeSlot: pickupTimeSlot,
      notes: pickupNotes,
      status: 'pending_dispatch'
    };

    requestOrderReturnPickup(currentOrder.id, request);
    setShowPickupModal(false);
    alert('Permintaan Pick-Up Pengembalian berhasil diajukan! Notifikasi penjemputan otomatis telah diteruskan ke Admin Pinjamlaptop.');
  };

  const handleSimulateHours = (hours: number) => {
    if (!currentOrder) return;
    setSimulatedLateHours(currentOrder.id, hours);
  };

  const statusStepMap: Record<OrderStatus, number> = {
    'awaiting_verification': 1,
    'verified_preparing': 2,
    'ready_for_pickup': 3,
    'in_delivery': 3,
    'active_rental': 4,
    'return_pickup_requested': 5,
    'return_in_transit': 5,
    'completed': 6,
    'forfeited_cancelled': 0
  };

  const currentStepNumber = currentOrder ? statusStepMap[currentOrder.status] : 1;
  const overdueInfo = currentOrder ? calculateOverdueAndLateFee(currentOrder) : null;

  return (
    <div className="space-y-6">
      {/* Top Search and Active Orders Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Pelacakan Status Sewa Real-Time</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pantau masa sewa, tanggal pengembalian, status kurir, denda keterlambatan, dan ajukan request pick-up pengembalian.
            </p>
          </div>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-80">
            <input
              type="text"
              placeholder="Masukkan ID Pesanan (PL-XXXX)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1 flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Cari</span>
            </button>
          </form>
        </div>

        {/* Quick order chips selector - disesuaikan dengan role penyewa atau admin */}
        {(() => {
          const visibleOrders = isAdminLoggedIn 
            ? orders 
            : customerSession 
              ? orders.filter(o => 
                  o.customer.phone.replace(/[^0-9]/g, '') === customerSession.phone.replace(/[^0-9]/g, '') ||
                  o.customer.email.toLowerCase() === customerSession.email.toLowerCase() ||
                  o.id.toLowerCase() === selectedOrderId.toLowerCase()
                )
              : orders.filter(o => o.id.toLowerCase() === selectedOrderId.toLowerCase());

          if (visibleOrders.length === 0) return null;

          return (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-medium whitespace-nowrap">
                {isAdminLoggedIn ? 'Semua Pesanan (Admin):' : 'Pesanan Anda:'}
              </span>
              {visibleOrders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => handleSelectOrder(o)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                    selectedOrderId === o.id
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {o.id} • {o.laptop.name.split(' ')[0]} {o.laptop.name.split(' ')[1]}
                </button>
              ))}
            </div>
          );
        })()}
      </div>

      {currentOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Status & Tracking Details (2 Columns on Large) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Real-time Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
              {/* Order Header Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <img
                    src={currentOrder.laptop.image}
                    alt={currentOrder.laptop.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {currentOrder.id}
                      </span>
                      {currentOrder.memberId && (
                        <span className="font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Member ID: {currentOrder.memberId}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(currentOrder.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {currentOrder.laptop.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Penyewa: <strong>{currentOrder.customer.fullName}</strong> • Durasi: <strong>{currentOrder.durationDays} Hari</strong>
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="sm:text-right">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold mb-1">
                    Status Pesanan
                  </span>
                  {currentOrder.status === 'awaiting_verification' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      Menunggu Verifikasi Berkas
                    </span>
                  )}
                  {currentOrder.status === 'verified_preparing' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Persiapan Unit & Quality Check
                    </span>
                  )}
                  {currentOrder.status === 'ready_for_pickup' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <Building2 className="w-3.5 h-3.5" />
                      Siap Diambil di Store Hub
                    </span>
                  )}
                  {currentOrder.status === 'in_delivery' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                      <Truck className="w-3.5 h-3.5" />
                      Sedang Dikirim oleh Kurir
                    </span>
                  )}
                  {currentOrder.status === 'active_rental' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Masa Sewa Sedang Aktif
                    </span>
                  )}
                  {currentOrder.status === 'return_pickup_requested' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                      <Truck className="w-3.5 h-3.5" />
                      Menunggu Penjemputan Kurir
                    </span>
                  )}
                  {currentOrder.status === 'return_in_transit' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      <Truck className="w-3.5 h-3.5 animate-bounce" />
                      Unit Dalam Perjalanan Kembali
                    </span>
                  )}
                  {currentOrder.status === 'completed' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Selesai & Deposit Dikembalikan
                    </span>
                  )}
                  {currentOrder.status === 'forfeited_cancelled' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Uang Hangus 100% (Identitas Palsu)
                    </span>
                  )}

                  {/* Tombol Cetak & Status Surat Perjanjian */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAgreementModal(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
                      title="Akses langsung dialog printer atau simpan sebagai PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-400" />
                      <span>Cetak / Simpan PDF Surat Perjanjian</span>
                    </button>
                    {currentOrder.agreementReadAndAcknowledged ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Disetujui Secara Sadar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Wajib Dibaca & Dicentang Sadar
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Real-time Stepper (6 Stages) */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Tahapan Alur Pesanan Real-Time
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                  {[
                    { step: 1, title: 'Verifikasi Berkas', desc: 'Cek 2 Identitas / Deposit' },
                    { step: 2, title: 'Persiapan Unit', desc: 'QC OS & Aksesoris' },
                    { 
                      step: 3, 
                      title: currentOrder.deliveryMethod === 'self_pickup' ? 'Ambil di Store' : 'Pengiriman Kurir', 
                      desc: currentOrder.deliveryMethod === 'self_pickup' ? 'Tunjukkan PIN Store' : 'Antar ke Alamat' 
                    },
                    { 
                      step: 4, 
                      title: currentOrder.rentalStartedAt ? 'Sewa Aktif' : 'Mulai Sewa', 
                      desc: currentOrder.rentalStartedAt ? 'Jam Sewa Berjalan' : 'Menunggu Admin Aktifkan' 
                    },
                    { step: 5, title: 'Pengembalian', desc: 'Jemput / Kembali ke Hub' },
                    { step: 6, title: 'Selesai', desc: 'QC & Refund Deposit' }
                  ].map((s) => {
                    const isDone = currentStepNumber > s.step;
                    const isCurrent = currentStepNumber === s.step;
                    return (
                      <div
                        key={s.step}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'border-blue-600 bg-blue-50/80 shadow-sm ring-2 ring-blue-500/20'
                            : isDone
                            ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800'
                            : 'border-slate-100 bg-slate-50 text-slate-400'
                        }`}
                      >
                        <div className="flex justify-center mb-1.5">
                          <span
                            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                              isCurrent
                                ? 'bg-blue-600 text-white'
                                : isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isDone ? '✓' : s.step}
                          </span>
                        </div>
                        <p className={`font-bold text-[11px] leading-tight ${isCurrent ? 'text-blue-900' : isDone ? 'text-emerald-900' : 'text-slate-500'}`}>
                          {s.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-1">
                          {s.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Handover Specific Info (Self Pickup PIN vs Courier Dispatch Info) */}
              {currentOrder.deliveryMethod === 'self_pickup' ? (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Lokasi Store Hub Pengambilan:
                    </span>
                    <p className="text-slate-700">{currentOrder.storeLocation || 'Pinjamlaptop Flagship Hub'}</p>
                    <p className="text-[11px] text-slate-500">Bawa 2 Identitas Fisik Asli Anda saat mengambil unit ke konter.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-300 text-center sm:text-right shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Kode PIN Ambil di Store
                    </span>
                    <span className="font-mono text-xl font-extrabold text-blue-700 tracking-widest">
                      {currentOrder.pickupPinCode || '894210'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-indigo-600" />
                      Pengiriman Kurir ke Alamat Anda:
                    </span>
                    <p className="text-slate-700">{currentOrder.deliveryAddress}</p>
                    <p className="text-[11px] text-slate-500">
                      {currentOrder.courierInfo
                        ? `Kurir: ${currentOrder.courierInfo.name} (${currentOrder.courierInfo.vehiclePlate}) • Telp: ${currentOrder.courierInfo.phone}`
                        : 'Kurir sedang disiapkan oleh Admin untuk pengiriman aman.'}
                    </p>
                  </div>
                  {currentOrder.courierInfo && (
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-200 text-center">
                      <span className="text-[10px] text-slate-400 block">No. Resi Armada</span>
                      <span className="font-mono text-xs font-bold text-indigo-800">
                        {currentOrder.courierInfo.trackingCode}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* REQUEST PICK-UP PENGEMBALIAN BUTTON & CARD */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-300" />
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      Layanan Pick-up Pengembalian Laptop
                    </h4>
                  </div>
                  <p className="text-xs text-blue-200 max-w-lg leading-relaxed">
                    Masa sewa hampir selesai? Anda tidak perlu repot keluar rumah. Minta kurir Pinjamlaptop menjemput unit laptop langsung ke alamat Anda.
                  </p>
                </div>

                {currentOrder.returnPickupRequest ? (
                  <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Pick-up Dijadwalkan: {currentOrder.returnPickupRequest.preferredDate}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPickupModal(true)}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2 flex-shrink-0"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Request Pick-up Sekarang</span>
                  </button>
                )}
              </div>
            </div>

            {/* Activity Logs & Audit Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Catatan & Riwayat Aktivitas Pesanan</span>
              </h4>

              <div className="space-y-3">
                {currentOrder.logs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{log.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Masa Sewa, Tanggal Pengembalian & Perhitungan Denda */}
          <div className="space-y-6">
            {/* Countdown Timer & Batas Waktu Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Masa Sewa & Tenggat
                </h4>
                {!currentOrder.rentalStartedAt && !overdueInfo?.isOverdue ? (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700" />
                    BELUM DIMULAI (MENUNGGU ADMIN)
                  </span>
                ) : overdueInfo?.isOverdue ? (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 animate-pulse shadow-sm">
                    <AlertTriangle className="w-3 h-3 text-white" />
                    DENDA BERJALAN (MASA SEWA BERAKHIR)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    AKTIF & AMAN
                  </span>
                )}
              </div>

              {/* Tanggal Mulai dan Pengembalian */}
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Tanggal & Jam Mulai Sewa</span>
                  <span className="font-semibold text-slate-800">
                    {currentOrder.rentalStartedAt ? (
                      `${new Date(currentOrder.rentalStartedAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, Pukul ${new Date(currentOrder.rentalStartedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                    ) : (
                      'Jam mulai sewa mengikuti waktu saat admin menekan Mulai Sewa'
                    )}
                  </span>
                  {currentOrder.rentalStartedAt && (
                    <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                      ✓ Jam Sewa Resmi Berjalan
                    </span>
                  )}
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  overdueInfo?.isOverdue 
                    ? 'bg-rose-50 border-rose-300 text-rose-950' 
                    : !currentOrder.rentalStartedAt 
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
                    : 'bg-blue-50/70 border-blue-200 text-blue-950'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-slate-500 font-bold block">Batas Tanggal Pengembalian (Tenggat)</span>
                    {overdueInfo?.isOverdue && (
                      <span className="text-[10px] font-extrabold text-rose-700 bg-rose-200/80 px-1.5 py-0.2 rounded">
                        Masa Sewa Telah Berakhir
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-sm block">
                    {currentOrder.rentalStartedAt ? (
                      new Date(currentOrder.endDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                    ) : (
                      `Dihitung ${currentOrder.durationDays} hari sejak tombol Mulai Sewa ditekan Admin`
                    )}
                  </span>
                  <span className="text-xs font-semibold">
                    {currentOrder.rentalStartedAt ? (
                      `Pukul ${new Date(currentOrder.endDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB (Batas Pengembalian)`
                    ) : (
                      'Jam batas pengembalian otomatis aktif saat serah terima'
                    )}
                  </span>
                </div>

                {currentOrder.extensions && currentOrder.extensions.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                      ✓ Masa Sewa Diperpanjang Admin (+{currentOrder.extensions.reduce((acc, e) => acc + e.additionalDays, 0)} Hari)
                    </span>
                    <p className="text-[11px] text-slate-700 leading-snug">
                      Perpanjangan telah dikonfirmasi dan tanggal pengembalian otomatis dimajukan.
                    </p>
                  </div>
                )}
              </div>

              {/* Live Countdown / Running Late Timer Display */}
              {!currentOrder.rentalStartedAt && !overdueInfo?.isOverdue ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-amber-950 text-xs sm:text-sm">
                      Jam Sewa Belum Berjalan
                    </h5>
                    <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                      Sesuai SOP Pinjamlaptop, hitung mundur masa sewa <strong>{currentOrder.durationDays} hari</strong> baru akan resmi dimulai saat Admin menekan tombol <strong>"Mulai Sewa"</strong> pada saat serah terima unit laptop.
                    </p>
                  </div>
                  
                  {/* Shortcut Button for quick admin action - HANYA MUNCUL JIKA ADMIN LOGIN */}
                  {isAdminLoggedIn && (
                    <button
                      onClick={() => {
                        const res = startOrderRental(currentOrder.id);
                        if (res.success) {
                          loadData();
                          alert(res.message);
                        }
                      }}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>[Admin]: Tekan "Mulai Sewa" Sekarang</span>
                    </button>
                  )}
                </div>
              ) : !overdueInfo?.isOverdue ? (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2 text-center">
                    Sisa Waktu Sewa Real-Time (Aktif)
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="p-2 rounded-xl bg-slate-900 text-white">
                      <span className="text-lg font-mono font-bold block">{overdueInfo?.remaining.days}</span>
                      <span className="text-[9px] text-slate-400">Hari</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 text-white">
                      <span className="text-lg font-mono font-bold block">{overdueInfo?.remaining.hours}</span>
                      <span className="text-[9px] text-slate-400">Jam</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 text-white">
                      <span className="text-lg font-mono font-bold block">{overdueInfo?.remaining.minutes}</span>
                      <span className="text-[9px] text-slate-400">Menit</span>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-600 text-white">
                      <span className="text-lg font-mono font-bold block">{overdueInfo?.remaining.seconds}</span>
                      <span className="text-[9px] text-blue-200">Detik</span>
                    </div>
                  </div>
                  <p className="text-center text-[10px] text-slate-500 mt-2">
                    Denda Rp 20.000/jam baru akan mulai berjalan saat masa sewa di atas mencapai 00:00:00.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-600 to-rose-700 text-white text-center space-y-3 shadow-lg ring-2 ring-rose-400/30">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping" />
                    <span>Masa Sewa Berakhir — Denda Sedang Berjalan</span>
                  </div>

                  {/* Real-time ticking counter of running late time */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-slate-950">
                    <div className="p-2 rounded-xl bg-white shadow-xs">
                      <span className="text-lg font-mono font-black block text-rose-700">+{overdueInfo?.overdueElapsed.days}</span>
                      <span className="text-[9px] font-bold text-slate-500">Hari</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white shadow-xs">
                      <span className="text-lg font-mono font-black block text-rose-700">+{overdueInfo?.overdueElapsed.hours}</span>
                      <span className="text-[9px] font-bold text-slate-500">Jam</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white shadow-xs">
                      <span className="text-lg font-mono font-black block text-rose-700">+{overdueInfo?.overdueElapsed.minutes}</span>
                      <span className="text-[9px] font-bold text-slate-500">Menit</span>
                    </div>
                    <div className="p-2 rounded-xl bg-yellow-300 shadow-xs">
                      <span className="text-lg font-mono font-black block text-slate-950">+{overdueInfo?.overdueElapsed.seconds}</span>
                      <span className="text-[9px] font-bold text-slate-800">Detik</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-900/50 border border-rose-400/30 text-[11px] text-rose-100 space-y-1 text-left">
                    <div className="flex items-center justify-between text-xs font-extrabold text-white">
                      <span>Tarif Denda Berjalan:</span>
                      <span className="text-yellow-300">Rp 20.000 / Jam</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-rose-200">
                      Denda otomatis berjalan sejak masa sewa berakhir (terhitung sejak jam yang sama saat menerima unit yang disewakan) dan terakumulasi setiap jam keterlambatan.
                    </p>
                  </div>
                </div>
              )}

              {/* PERHITUNGAN DENDA KETERLAMBATAN */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Perhitungan Denda Sewa</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Tarif: {formatRupiah(currentOrder.laptop.lateFeePerHour || 20000)} / jam
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  overdueInfo?.isOverdue 
                    ? 'bg-rose-50 border-rose-300 text-rose-950' 
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <div className="flex justify-between">
                    <span>Status Denda:</span>
                    <span className="font-bold">
                      {overdueInfo?.isOverdue 
                        ? `BERJALAN (Terlambat ${overdueInfo.lateHours} Jam)` 
                        : !currentOrder.rentalStartedAt 
                        ? 'Menunggu Admin Mulai Sewa' 
                        : 'Masa Sewa Belum Berakhir (Denda Rp 0)'}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-200">
                    <span>Akumulasi Denda Berjalan:</span>
                    <span className={overdueInfo?.isOverdue ? 'text-rose-600 text-base font-black' : 'text-slate-800'}>
                      {formatRupiah(overdueInfo?.lateFee || 0)}
                    </span>
                  </div>
                  {overdueInfo?.isOverdue && (
                    <p className="text-[10px] text-rose-800 font-medium pt-1 border-t border-rose-200 leading-snug">
                      * Sesuai Surat Perjanjian, denda keterlambatan <strong>wajib dibayarkan bagaimanapun situasinya</strong> tanpa pengecualian (macet, cuaca, urusan mendadak).
                    </p>
                  )}
                </div>

                {/* SIMULATION BAR FOR TESTING / DEMONSTRATION - HANYA BISA DIAKSES JIKA ADMIN LOGIN */}
                {isAdminLoggedIn && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-2">
                    <div className="flex items-center justify-between font-bold text-amber-950">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Simulator Denda Berjalan (Khusus Admin)
                      </span>
                      <span className="text-[10px] text-amber-700 font-normal">Mode Pengujian Admin</span>
                    </div>
                    <p className="text-[10px] text-amber-800 leading-snug">
                      Uji coba reaksi denda berjalan saat masa sewa berakhir:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        onClick={() => handleSimulateHours(-2)}
                        className="px-2 py-1.5 bg-white hover:bg-amber-100 rounded-lg border border-amber-300 text-amber-950 font-semibold text-[10px] transition-colors cursor-pointer"
                        title="Simulasikan masa sewa masih aktif sisa 2 jam"
                      >
                        Sisa 2 Jam
                      </button>
                      <button
                        onClick={() => handleSimulateHours(1)}
                        className="px-2 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                        title="Masa sewa berakhir 1 jam lalu (Denda Rp 20.000)"
                      >
                        Telat 1 Jam
                      </button>
                      <button
                        onClick={() => handleSimulateHours(4)}
                        className="px-2 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                        title="Masa sewa berakhir 4 jam lalu (Denda Rp 80.000)"
                      >
                        Telat 4 Jam
                      </button>
                      <button
                        onClick={() => handleSimulateHours(0)}
                        className="px-2 py-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 text-slate-700 font-semibold text-[10px] transition-colors cursor-pointer"
                        title="Kembalikan ke hitungan waktu aktual"
                      >
                        Reset Normal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Jaminan & Berkas Identitas Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Data Jaminan Sewa
              </h4>

              {currentOrder.guaranteeType === 'two_identities' && currentOrder.identityDocs ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Identitas 1</span>
                    <span className="font-bold text-slate-800">{currentOrder.identityDocs.doc1Type}: {currentOrder.identityDocs.doc1Number}</span>
                    <span className="text-[10px] text-slate-500 block">a/n {currentOrder.identityDocs.doc1HolderName}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Identitas 2</span>
                    <span className="font-bold text-slate-800">{currentOrder.identityDocs.doc2Type}: {currentOrder.identityDocs.doc2Number}</span>
                    <span className="text-[10px] text-slate-500 block">a/n {currentOrder.identityDocs.doc2HolderName}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="text-[10px] text-emerald-700 block">Uang Jaminan Deposit</span>
                  <span className="font-bold text-sm block">{formatRupiah(currentOrder.pricing.depositFee)}</span>
                  <span className="text-[10px] text-emerald-700">Tersimpan aman, dicairkan usai unit diinspeksi.</span>
                </div>
              )}

              {/* 2 Kontak Darurat Terdaftar */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Kontak Darurat Terverifikasi</span>
                <p className="text-slate-700">
                  1. {currentOrder.emergencyContacts[0]?.name} ({currentOrder.emergencyContacts[0]?.relationship}) - {currentOrder.emergencyContacts[0]?.phone}
                </p>
                <p className="text-slate-700 mt-1">
                  2. {currentOrder.emergencyContacts[1]?.name} ({currentOrder.emergencyContacts[1]?.relationship}) - {currentOrder.emergencyContacts[1]?.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
          <p className="text-slate-500 text-sm">
            Belum ada pesanan yang dipilih. Silakan pilih dari katalog atau masukkan ID pesanan Anda.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
          >
            Buka Katalog Laptop
          </button>
        </div>
      )}

      {/* REQUEST PICK-UP MODAL */}
      {showPickupModal && currentOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Request Pick-up Pengembalian</h3>
              </div>
              <button
                onClick={() => setShowPickupModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturnPickup} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-950">
                <p className="font-bold">Unit: {currentOrder.laptop.name}</p>
                <p className="text-[11px] text-slate-600">ID Pesanan: {currentOrder.id}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Alamat Lengkap Penjemputan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Alamat penjemputan unit..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tanggal Pick-up <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Slot Waktu Siap
                  </label>
                  <select
                    value={pickupTimeSlot}
                    onChange={(e) => setPickupTimeSlot(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Pagi (09:00 - 12:00 WIB)">Pagi (09:00 - 12:00 WIB)</option>
                    <option value="Siang (13:00 - 16:00 WIB)">Siang (13:00 - 16:00 WIB)</option>
                    <option value="Sore (16:00 - 19:00 WIB)">Sore (16:00 - 19:00 WIB)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Catatan Kondisi Unit / Patokan Lokasi
                </label>
                <input
                  type="text"
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                Pastikan charger original, tas laptop, dan mouse wireless telah dimasukkan ke dalam tas sebelum diserahkan ke kurir Pinjamlaptop.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPickupModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Konfirmasi Request Pick-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Surat Perjanjian Sewa Menyewa (SPK) Modal */}
      <RentalAgreementModal
        order={currentOrder}
        isOpen={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
        requireAcknowledgment={!currentOrder?.agreementReadAndAcknowledged}
        onAcknowledgeAndProceed={() => {
          if (currentOrder) {
            const updated = {
              ...currentOrder,
              agreementReadAndAcknowledged: true,
              agreementAcknowledgedAt: new Date().toISOString()
            };
            updateOrder(updated);
            setCurrentOrder(updated);
            setShowAgreementModal(false);
          }
        }}
      />
    </div>
  );
};
