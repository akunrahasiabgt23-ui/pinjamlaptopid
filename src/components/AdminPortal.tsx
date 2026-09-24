import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle2, Clock, Truck, Building2, ShieldAlert, 
  ShieldCheck, AlertTriangle, Search, Filter, Eye, User, Phone, 
  MapPin, Check, X, RefreshCw, Send, ArrowUpRight, Banknote, 
  Sparkles, Play, CalendarPlus, LogOut, FileSpreadsheet, Users, 
  Layers, ChevronRight, Laptop, CreditCard, Tag, FileText, Home, Printer
} from 'lucide-react';
import { 
  RentalOrder, AdminNotification, OrderStatus, CourierInfo, 
  AdminUserSession, CustomerMember 
} from '../types';
import { 
  getStoredOrders, getStoredNotifications, markNotificationAsRead, 
  markAllNotificationsAsRead, updateOrderStatus, startOrderRental, 
  formatRupiah, calculateOverdueAndLateFee, getStoredAdminSession, 
  logoutAdmin, getStoredMembers 
} from '../utils/storage';
import { AdminLoginForm } from './admin/AdminLoginForm';
import { RentalExtensionModal } from './admin/RentalExtensionModal';
import { RejectOrderModal } from './admin/RejectOrderModal';
import { AdminFinancialLedger } from './admin/AdminFinancialLedger';
import { RentalAgreementModal } from './RentalAgreementModal';
import { AdminCatalogManager } from './admin/AdminCatalogManager';

interface AdminPortalProps {
  onSelectOrderToTrack: (orderId: string) => void;
  onExitAdmin?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onSelectOrderToTrack,
  onExitAdmin
}) => {
  const [adminSession, setAdminSession] = useState<AdminUserSession | null>(getStoredAdminSession());
  const [activeTab, setActiveTab] = useState<'operations' | 'financial' | 'members' | 'catalog'>('operations');
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [members, setMembers] = useState<CustomerMember[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifDrawer, setShowNotifDrawer] = useState<boolean>(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState<boolean>(false);

  // Modals state
  const [extensionModalOrder, setExtensionModalOrder] = useState<RentalOrder | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<RentalOrder | null>(null);
  const [agreementModalOrder, setAgreementModalOrder] = useState<RentalOrder | null>(null);

  // Dispatch Courier Modal state
  const [dispatchModalOrder, setDispatchModalOrder] = useState<RentalOrder | null>(null);
  const [courierName, setCourierName] = useState<string>('Budi Santoso');
  const [courierPhone, setCourierPhone] = useState<string>('0812-9900-1122');
  const [courierVehicle, setCourierVehicle] = useState<string>('Honda Vario 160 (Box Khusus Laptop)');
  const [courierPlate, setCourierPlate] = useState<string>('B 4129 SHG');

  // Assign Return Pickup Courier modal
  const [pickupAssignOrder, setPickupAssignOrder] = useState<RentalOrder | null>(null);
  const [pickupCourierName, setPickupCourierName] = useState<string>('Ahmad Fauzi (Kurir Penjemputan)');

  const loadData = () => {
    setOrders(getStoredOrders());
    setNotifications(getStoredNotifications());
    setMembers(getStoredMembers());
    setAdminSession(getStoredAdminSession());
  };

  useEffect(() => {
    loadData();
    const handleOrdersUpdate = () => loadData();
    const handleNotifsUpdate = () => loadData();
    const handleAuthUpdate = () => setAdminSession(getStoredAdminSession());

    window.addEventListener('pinjamlaptop_orders_updated', handleOrdersUpdate);
    window.addEventListener('pinjamlaptop_notifications_updated', handleNotifsUpdate);
    window.addEventListener('pinjamlaptop_admin_auth_updated', handleAuthUpdate);

    return () => {
      window.removeEventListener('pinjamlaptop_orders_updated', handleOrdersUpdate);
      window.removeEventListener('pinjamlaptop_notifications_updated', handleNotifsUpdate);
      window.removeEventListener('pinjamlaptop_admin_auth_updated', handleAuthUpdate);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirmModal(true);
  };

  const handleConfirmLogout = () => {
    logoutAdmin();
    setAdminSession(null);
    setShowLogoutConfirmModal(false);
    if (onExitAdmin) {
      onExitAdmin();
    }
  };

  // If not authenticated, render Login Screen
  if (!adminSession) {
    return (
      <AdminLoginForm
        onLoginSuccess={(sess) => {
          setAdminSession(sess);
          loadData();
        }}
        onCancel={onExitAdmin}
      />
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleVerifyOrder = (order: RentalOrder) => {
    if (order.deliveryMethod === 'self_pickup') {
      const pin = order.pickupPinCode || String(Math.floor(100000 + Math.random() * 900000));
      updateOrderStatus(
        order.id,
        'ready_for_pickup',
        'admin',
        'Berkas Diverifikasi - Siap Diambil di Store',
        `Admin memverifikasi 2 identitas & pembayaran. Unit disiapkan di ${order.storeLocation || 'Store Hub'}. PIN Pengambilan: ${pin}`,
        { pickupPinCode: pin }
      );
      alert(`Pesanan ${order.id} diverifikasi! Unit siap diambil di Store Hub dengan Kode PIN: ${pin}`);
    } else {
      setDispatchModalOrder(order);
    }
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalOrder) return;

    const courierInfo: CourierInfo = {
      name: courierName,
      phone: courierPhone,
      vehicle: courierVehicle,
      vehiclePlate: courierPlate,
      trackingCode: `PL-EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      estimatedDeliveryTime: 'Dalam Pengantaran (1-2 Jam)'
    };

    updateOrderStatus(
      dispatchModalOrder.id,
      'in_delivery',
      'admin',
      'Unit Sedang Dikirim oleh Kurir',
      `Kurir ${courierName} (${courierPlate}) mengantar laptop ke alamat penyewa. Resi: ${courierInfo.trackingCode}`,
      { courierInfo }
    );

    setDispatchModalOrder(null);
    alert(`Unit pesanan ${dispatchModalOrder.id} berhasil ditugaskan ke kurir ${courierName}!`);
  };

  const handleStartRental = (order: RentalOrder) => {
    const res = startOrderRental(order.id);
    if (res.success) {
      loadData();
      alert(res.message);
    }
  };

  const handleAssignPickupCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAssignOrder) return;

    updateOrderStatus(
      pickupAssignOrder.id,
      'return_in_transit',
      'admin',
      'Kurir Penjemputan Ditugaskan',
      `Kurir ${pickupCourierName} ditugaskan menjemput unit laptop di alamat penyewa: ${pickupAssignOrder.returnPickupRequest?.pickupAddress}`
    );

    setPickupAssignOrder(null);
    alert(`Kurir ${pickupCourierName} berhasil dijadwalkan untuk penjemputan unit!`);
  };

  const handleCompleteRentalInspection = (order: RentalOrder) => {
    const depositNote = order.guaranteeType === 'cash_deposit'
      ? ` Unit diperiksa mulus. Uang deposit ${formatRupiah(order.pricing.depositFee)} dicairkan 100% ke rekening penyewa.`
      : ' 2 Dokumen identitas asli telah dikembalikan kepada penyewa dalam keadaan utuh.';

    updateOrderStatus(
      order.id,
      'completed',
      'admin',
      'Sewa Selesai & Inspeksi Unit Berhasil',
      `Unit ${order.laptop.name} telah diterima kembali oleh Pinjamlaptop.${depositNote}`
    );
    alert(`Pesanan ${order.id} resmi diselesaikan dan ditutup!`);
  };

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchQuery = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.laptop.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  // KPI calculations
  const countAwaiting = orders.filter(o => o.status === 'awaiting_verification').length;
  const countReadyOrDelivery = orders.filter(o => o.status === 'ready_for_pickup' || o.status === 'in_delivery').length;
  const countActive = orders.filter(o => o.status === 'active_rental').length;
  const countPickupReq = orders.filter(o => o.status === 'return_pickup_requested').length;
  const countExtended = orders.filter(o => o.extensions && o.extensions.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Top Admin User Profile Bar */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30 flex-shrink-0">
            {adminSession.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                {adminSession.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {adminSession.roleTitle}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sesi Otoritas Aktif ({adminSession.adminId})
              </span>
              <span>•</span>
              <span className="hidden sm:inline">256-bit SSL Protected</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Notifications button */}
          <button
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            className="relative px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Notifikasi</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Refresh data */}
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Back to store / catalog button */}
          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Kembali ke halaman utama katalog laptop"
            >
              <Home className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Katalog</span>
            </button>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Keluar dari sesi Administrator"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('operations')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'operations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Manajemen Sewa & Operasional</span>
          <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 text-xs">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'financial'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Banknote className="w-4 h-4 text-emerald-500" />
          <span>Neraca Keuangan Masuk</span>
          <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono">
            Ledger
          </span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'members'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-purple-500" />
          <span>Database Member Penyewa</span>
          <span className="px-2 py-0.2 rounded-full bg-purple-100 text-purple-800 text-xs">
            {members.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4 text-blue-500" />
          <span>Edit Katalog & Stok Unit</span>
        </button>
      </div>

      {/* TAB 1: MANAJEMEN SEWA & OPERASIONAL */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Perlu Verifikasi
              </span>
              <span className="text-2xl font-black text-amber-600">{countAwaiting}</span>
              <span className="text-[10px] text-slate-500 block">Identitas & Deposit</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Siap Ambil / Kirim
              </span>
              <span className="text-2xl font-black text-blue-600">{countReadyOrDelivery}</span>
              <span className="text-[10px] text-slate-500 block">Armada & Store Hub</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sewa Berjalan
              </span>
              <span className="text-2xl font-black text-emerald-600">{countActive}</span>
              <span className="text-[10px] text-slate-500 block">Unit di Pelanggan</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Request Pick-Up
              </span>
              <span className="text-2xl font-black text-purple-600">{countPickupReq}</span>
              <span className="text-[10px] text-slate-500 block">Jadwal Penjemputan</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1 bg-gradient-to-br from-blue-50/70 to-indigo-50/50">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block flex items-center gap-1">
                <CalendarPlus className="w-3 h-3 text-blue-600" />
                Diperpanjang
              </span>
              <span className="text-2xl font-black text-blue-700">{countExtended}</span>
              <span className="text-[10px] text-blue-600 block">Perpanjangan Customer</span>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'Semua Status' },
                  { id: 'awaiting_verification', label: 'Perlu Verifikasi' },
                  { id: 'ready_for_pickup', label: 'Siap di Hub' },
                  { id: 'in_delivery', label: 'Pengiriman Kurir' },
                  { id: 'active_rental', label: 'Sewa Aktif' },
                  { id: 'return_pickup_requested', label: 'Minta Pick-Up' },
                  { id: 'completed', label: 'Selesai' },
                  { id: 'forfeited_cancelled', label: 'Ditolak / Hangus' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      statusFilter === st.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari ID / Nama Customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Orders List Cards */}
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const overdue = calculateOverdueAndLateFee(order);
              const isExtended = order.extensions && order.extensions.length > 0;
              const totalExtDays = isExtended ? order.extensions!.reduce((sum, e) => sum + e.additionalDays, 0) : 0;
              const totalExtFee = isExtended ? order.extensions!.reduce((sum, e) => sum + e.extensionFee, 0) : 0;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-3xl border shadow-sm p-5 sm:p-6 transition-all ${
                    order.status === 'awaiting_verification'
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : order.status === 'forfeited_cancelled'
                      ? 'border-rose-300 bg-rose-50/20'
                      : isExtended
                      ? 'border-blue-300 shadow-md'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-extrabold text-blue-700">
                          #{order.id}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          order.status === 'awaiting_verification'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'ready_for_pickup'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'in_delivery'
                            ? 'bg-indigo-100 text-indigo-800'
                            : order.status === 'active_rental'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'return_pickup_requested'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'completed'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {order.status === 'awaiting_verification' && 'Menunggu Verifikasi'}
                          {order.status === 'ready_for_pickup' && 'Siap Diambil di Store Hub'}
                          {order.status === 'in_delivery' && 'Sedang Dikirim Kurir'}
                          {order.status === 'active_rental' && 'Sewa Sedang Aktif'}
                          {order.status === 'return_pickup_requested' && 'Request Penjemputan Diajukan'}
                          {order.status === 'return_in_transit' && 'Kurir Sedang Menjemput'}
                          {order.status === 'completed' && 'Sewa Selesai'}
                          {order.status === 'forfeited_cancelled' && 'Dibatalkan / Hangus 100%'}
                        </span>

                        {/* Extension Badge if extended */}
                        {isExtended && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-600 text-white flex items-center gap-1 shadow-sm">
                            <CalendarPlus className="w-3 h-3" />
                            <span>+{totalExtDays} Hari Diperpanjang</span>
                          </span>
                        )}

                        <span className="text-xs text-slate-400">
                          Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })} WIB
                        </span>
                      </div>

                      {/* Customer & Unit Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>{order.customer.fullName}</span>
                          <span className="font-normal text-slate-400 font-mono">({order.customer.phone})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Laptop className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-800">{order.laptop.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>Durasi Total: <strong>{order.durationDays} Hari</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Pill */}
                    <div className="text-left lg:text-right flex-shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Total Dana Diterima
                      </span>
                      <span className="font-mono text-base sm:text-lg font-black text-slate-900">
                        {formatRupiah(order.pricing.totalPaid)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        {order.paymentMethod.toUpperCase()} (Lunas)
                      </span>
                    </div>
                  </div>

                  {/* Extension Alert Banner if order was extended */}
                  {isExtended && (
                    <div className="mt-3 p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-bold flex items-center gap-1.5 text-blue-900">
                          <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                          Riwayat Perpanjangan Sewa Aktif (+{totalExtDays} Hari Total):
                        </span>
                        <p className="text-[11px] text-slate-600">
                          Total tambahan sewa: <strong>{formatRupiah(totalExtFee)}</strong>. Tanggal pengembalian baru: <strong>{new Date(order.endDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="px-2 py-0.5 rounded bg-blue-200/80 text-blue-900 font-mono text-[10px] font-bold">
                          {order.extensions!.length}x Perpanjangan
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Guarantee & Overdue Info Grid */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Jaminan Sewa</span>
                      {order.guaranteeType === 'two_identities' && order.identityDocs ? (
                        <div className="space-y-0.5 mt-0.5">
                          <span className="font-bold text-slate-800">2 Identitas Fisik Asli</span>
                          <p className="text-[11px] text-slate-500">
                            1. {order.identityDocs.doc1Type}: {order.identityDocs.doc1Number}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            2. {order.identityDocs.doc2Type}: {order.identityDocs.doc2Number}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0.5 mt-0.5">
                          <span className="font-bold text-emerald-700">Uang Jaminan Deposit</span>
                          <p className="font-bold text-slate-900">{formatRupiah(order.pricing.depositFee)}</p>
                          <span className="text-[10px] text-slate-400">Dicairkan setelah inspeksi</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Metode Penyerahan</span>
                      {order.deliveryMethod === 'self_pickup' ? (
                        <div className="mt-0.5">
                          <span className="font-bold text-blue-800">Ambil di Store Hub</span>
                          <p className="text-slate-600">{order.storeLocation}</p>
                          <p className="text-[11px] font-mono text-blue-600 font-bold">
                            PIN: {order.pickupPinCode || 'Belum dibuat'}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-0.5">
                          <span className="font-bold text-indigo-800">Pengiriman Kurir</span>
                          <p className="text-slate-600 truncate">{order.deliveryAddress}</p>
                          {order.courierInfo && (
                            <p className="text-[10px] text-slate-500">
                              Kurir: {order.courierInfo.name} ({order.courierInfo.vehiclePlate})
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Batas Pengembalian</span>
                      <div className="mt-0.5">
                        <span className="font-bold text-slate-900">
                          {new Date(order.endDate).toLocaleDateString('id-ID', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Pukul {new Date(order.endDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </p>
                        {overdue.isOverdue && (
                          <div className="mt-1 space-y-0.5">
                            <span className="text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              Denda Berjalan: +{overdue.lateHours} Jam ({formatRupiah(overdue.lateFee)})
                            </span>
                            <span className="text-[9px] text-rose-600 block font-medium">
                              Tarif Rp 20.000/jam (Terhitung sejak jam yang sama saat menerima unit sewa)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Operational Action Buttons Bar */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onSelectOrderToTrack(order.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Tracker</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAgreementModalOrder(order)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        title="Akses langsung dialog printer atau simpan sebagai PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                        <span>Cetak / Simpan PDF SPK</span>
                      </button>
                    </div>

                    {/* Action Buttons Group */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* ACTION: Verifikasi & Siapkan Unit */}
                      {order.status === 'awaiting_verification' && (
                        <>
                          <button
                            onClick={() => handleVerifyOrder(order)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Verifikasi & Siapkan Unit</span>
                          </button>

                          <button
                            onClick={() => setRejectModalOrder(order)}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1"
                          >
                            <ShieldAlert className="w-4 h-4 text-rose-600" />
                            <span>Tolak Pesanan</span>
                          </button>
                        </>
                      )}

                      {/* ACTION: Mulai Sewa (Jam Sewa Berjalan) */}
                      {(order.status === 'ready_for_pickup' || order.status === 'in_delivery') && (
                        <button
                          onClick={() => handleStartRental(order)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 animate-pulse"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Mulai Sewa (Serah Terima)</span>
                        </button>
                      )}

                      {/* ACTION CRITICAL: PERPANJANG CUSTOMER (HARGA YANG BERLAKU) */}
                      {order.status !== 'completed' && order.status !== 'forfeited_cancelled' && (
                        <button
                          onClick={() => setExtensionModalOrder(order)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 hover:scale-105"
                          title="Perpanjang sewa customer dengan harga yang berlaku otomatis"
                        >
                          <CalendarPlus className="w-4 h-4" />
                          <span>Perpanjang Customer</span>
                        </button>
                      )}

                      {/* ACTION: Tugaskan Kurir Penjemputan */}
                      {order.status === 'return_pickup_requested' && (
                        <button
                          onClick={() => setPickupAssignOrder(order)}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Tugaskan Kurir Pick-up</span>
                        </button>
                      )}

                      {/* ACTION: Selesaikan Inspeksi & Kembalikan Deposit */}
                      {(order.status === 'active_rental' || order.status === 'return_in_transit' || order.status === 'return_pickup_requested') && (
                        <button
                          onClick={() => handleCompleteRentalInspection(order)}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Unit Kembali & Selesaikan</span>
                        </button>
                      )}

                      {/* ACTION: Tolak / Hangus untuk pesanan selain yang sudah selesai */}
                      {order.status !== 'completed' && order.status !== 'forfeited_cancelled' && order.status !== 'awaiting_verification' && (
                        <button
                          onClick={() => setRejectModalOrder(order)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                        >
                          Tolak / Sita Pelanggaran
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm">
                Tidak ada pesanan yang sesuai dengan filter atau kata kunci pencarian.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NERACA KEUANGAN MASUK */}
      {activeTab === 'financial' && (
        <AdminFinancialLedger orders={orders} onRefresh={loadData} />
      )}

      {/* TAB 3: DATABASE MEMBER PENYEWA */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Database Member Penyewa Terdaftar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Seluruh data customer tersimpan di sistem. Saat customer menyewa kembali dan login dengan ID & Password, data sewa terisi otomatis.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase block">Total Member Aktif</span>
                <span className="text-2xl font-black text-purple-700">{members.length} Akun</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">ID Member & Terdaftar</th>
                    <th className="py-3 px-4">Nama Lengkap & Kontak</th>
                    <th className="py-3 px-4">Nomor KTP / Identitas</th>
                    <th className="py-3 px-4">Alamat Domisili</th>
                    <th className="py-3 px-4">Dokumen Tersimpan</th>
                    <th className="py-3 px-4 text-center">Total Sewa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.memberId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-purple-700 block text-xs">
                          {m.memberId}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.registeredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block text-xs">{m.fullName}</span>
                        <span className="text-[11px] text-slate-500 block">{m.phone}</span>
                        <span className="text-[10px] text-slate-400 block">{m.email}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {m.doc1Number || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-[180px]">
                        <p className="truncate">{m.address}</p>
                        <span className="text-[10px] text-slate-400">{m.city}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {m.doc1Type && m.doc1Number ? (
                          <div className="space-y-0.5 text-[11px]">
                            <span className="font-bold text-slate-800">
                              {m.doc1Type}: {m.doc1Number}
                            </span>
                            {m.doc2Type && m.doc2Number && (
                              <span className="text-slate-500 block">
                                {m.doc2Type}: {m.doc2Number}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Opsi Jaminan Deposit</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
                          {m.totalRentals || 1}x Sewa
                        </span>
                      </td>
                    </tr>
                  ))}

                  {members.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        Belum ada data member yang tersimpan. Member akan otomatis terdaftar saat customer menyewa dengan memilih opsi "Member Baru".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EDIT KATALOG & UNIT LAPTOP */}
      {activeTab === 'catalog' && (
        <AdminCatalogManager />
      )}

      {/* NOTIFICATIONS DRAWER */}
      {showNotifDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Notifikasi Sistem ({notifications.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowNotifDrawer(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {unreadCount} belum dibaca
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      markAllNotificationsAsRead();
                      loadData();
                    }}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              <div className="space-y-3 mt-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      loadData();
                      if (notif.orderId) {
                        onSelectOrderToTrack(notif.orderId);
                        setShowNotifDrawer(false);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                      notif.read
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-blue-50/80 border-blue-200 text-blue-950 font-medium ring-1 ring-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{notif.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
                    {notif.orderId && (
                      <span className="mt-2 text-[10px] text-blue-600 font-mono font-bold flex items-center gap-1">
                        <span>Buka Pesanan #{notif.orderId}</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Belum ada notifikasi operasional baru.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowNotifDrawer(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl mt-4"
            >
              Tutup Panel
            </button>
          </div>
        </div>
      )}

      {/* RENTAL EXTENSION MODAL */}
      {extensionModalOrder && (
        <RentalExtensionModal
          order={extensionModalOrder}
          onClose={() => setExtensionModalOrder(null)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* REJECT ORDER MODAL */}
      {rejectModalOrder && (
        <RejectOrderModal
          order={rejectModalOrder}
          onClose={() => setRejectModalOrder(null)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* DISPATCH COURIER MODAL */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-sm">Tugaskan Kurir Pengantaran Laptop</h3>
              </div>
              <button
                onClick={() => setDispatchModalOrder(null)}
                className="w-7 h-7 rounded-full bg-indigo-950 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-950">
                <p className="font-bold">Pesanan #{dispatchModalOrder.id} • {dispatchModalOrder.laptop.name}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Alamat: {dispatchModalOrder.deliveryAddress}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Kurir Khusus</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No. WhatsApp Kurir</label>
                <input
                  type="text"
                  value={courierPhone}
                  onChange={(e) => setCourierPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Armada / Kendaraan</label>
                  <input
                    type="text"
                    value={courierVehicle}
                    onChange={(e) => setCourierVehicle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plat Nomor</label>
                  <input
                    type="text"
                    value={courierPlate}
                    onChange={(e) => setCourierPlate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  Kirim Unit Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN PICKUP COURIER MODAL */}
      {pickupAssignOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-sm">Tugaskan Kurir Penjemputan Laptop</h3>
              </div>
              <button
                onClick={() => setPickupAssignOrder(null)}
                className="w-7 h-7 rounded-full bg-purple-950 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignPickupCourier} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-950">
                <p className="font-bold">Penjemputan Unit: {pickupAssignOrder.laptop.name}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Alamat: {pickupAssignOrder.returnPickupRequest?.pickupAddress}
                </p>
                <p className="text-[11px] text-slate-600">
                  Jadwal: {pickupAssignOrder.returnPickupRequest?.preferredDate} ({pickupAssignOrder.returnPickupRequest?.preferredTimeSlot})
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Driver/Kurir Pick-up</label>
                <input
                  type="text"
                  value={pickupCourierName}
                  onChange={(e) => setPickupCourierName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPickupAssignOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20"
                >
                  Jadwalkan Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Surat Perjanjian Sewa Menyewa (SPK) Modal */}
      <RentalAgreementModal
        order={agreementModalOrder}
        isOpen={!!agreementModalOrder}
        onClose={() => setAgreementModalOrder(null)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <LogOut className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center">Keluar dari Sesi Admin?</h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Sesi login administrator untuk <strong className="text-slate-800">{adminSession?.name}</strong> ({adminSession?.adminId}) akan ditutup dan Anda akan dialihkan kembali ke tampilan toko.
            </p>
            
            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowLogoutConfirmModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
