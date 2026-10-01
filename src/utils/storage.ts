import { 
  RentalOrder, AdminNotification, OrderStatus, ReturnPickupRequest, 
  Laptop, CustomerMember, RentalExtension, AdminUserSession, 
  FinancialInflowItem, FinancialLedgerSummary, OrderLog 
} from '../types';
import { LAPTOP_CATALOG, generateLaptopSku, getBranchCityForLaptop, generateSerialNumber } from '../data/laptops';

// In-memory cache for client state
let cachedLaptops: Laptop[] = LAPTOP_CATALOG;
let cachedOrders: RentalOrder[] = [];
let cachedNotifications: AdminNotification[] = [];
let cachedMembers: CustomerMember[] = [];
let cachedCustomerSession: CustomerMember | null = null;
let cachedAdminSession: AdminUserSession | null = null;
let isInitialized = false;

// Initial sample orders fallback before server fetch completes
const getInitialOrders = (): RentalOrder[] => {
  const now = new Date();
  const order1Start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const order1End = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const order2Start = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const order2End = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const order3Start = new Date(now.getTime());
  const order3End = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'PL-8821-JKT',
      createdAt: order1Start.toISOString(),
      laptop: LAPTOP_CATALOG[0],
      customer: {
        fullName: 'Bagas Aditya Rahman',
        idCardNumber: '3174092408980004',
        phone: '0812-8877-9921',
        email: 'bagas.aditya@gmail.com',
        address: 'Apartemen Sudirman Tower Lt. 14 No. 14B, Setiabudi',
        city: 'Jakarta Selatan',
        district: 'Karet Semanggi'
      },
      durationDays: 3,
      startDate: order1Start.toISOString(),
      endDate: order1End.toISOString(),
      deliveryMethod: 'delivery',
      deliveryAddress: 'Apartemen Sudirman Tower Lt. 14 No. 14B, Setiabudi, Jakarta Selatan',
      guaranteeType: 'two_identities',
      identityDocs: {
        doc1Type: 'KTP',
        doc1Number: '3174092408980004',
        doc1HolderName: 'Bagas Aditya Rahman',
        doc1FileName: 'ktp_bagas_asli.jpg',
        doc2Type: 'SIM',
        doc2Number: '1129-8839-0021',
        doc2HolderName: 'Bagas Aditya Rahman',
        doc2FileName: 'sim_a_bagas.jpg'
      },
      emergencyContacts: [
        { name: 'Hendra Saputra', relationship: 'Saudara Kandung', phone: '0813-2244-8811' },
        { name: 'Rina Kusuma', relationship: 'Rekan Kerja / Manajer', phone: '0857-1122-3344' }
      ],
      warningAgreed100PercentForfeited: true,
      paymentMethod: 'qris',
      paymentStatus: 'paid',
      pricing: {
        dailyRate: 285000,
        durationDays: 3,
        subtotalRental: 855000,
        discount: 0,
        deliveryFee: 35000,
        depositFee: 0,
        totalPaid: 890000
      },
      status: 'active_rental',
      rentalStartedAt: order1Start.toISOString(),
      courierInfo: {
        name: 'Budi Santoso',
        phone: '0812-9900-1122',
        vehicle: 'Honda Vario 160 (Box Khusus Laptop)',
        vehiclePlate: 'B 4129 SHG',
        trackingCode: 'PL-EXP-9921',
        estimatedDeliveryTime: 'Telah Diterima'
      },
      logs: [
        {
          id: 'log-1',
          timestamp: order1Start.toISOString(),
          actor: 'system',
          title: 'Pembayaran Diterima via QRIS',
          message: 'Dana Rp 890.000 terverifikasi otomatis. Status pesanan diteruskan ke tim verifikasi.'
        },
        {
          id: 'log-2',
          timestamp: new Date(order1Start.getTime() + 15 * 60 * 1000).toISOString(),
          actor: 'admin',
          title: 'Verifikasi Berkas Sukses',
          message: 'Admin (Rizky) memvalidasi keaslian 2 Identitas (KTP & SIM A). Data cocok 100%.'
        },
        {
          id: 'log-3',
          timestamp: new Date(order1Start.getTime() + 45 * 60 * 1000).toISOString(),
          actor: 'admin',
          title: 'Unit Diserahkan ke Kurir',
          message: 'Kurir Budi Santoso (B 4129 SHG) membawa unit MacBook Pro 14 M3 menuju alamat penyewa.'
        },
        {
          id: 'log-4',
          timestamp: new Date(order1Start.getTime() + 90 * 60 * 1000).toISOString(),
          actor: 'system',
          title: 'Unit Diterima - Masa Sewa Berjalan',
          message: 'Penyewa telah menandatangani BAST digital. Masa sewa aktif hingga ' + order1End.toLocaleString('id-ID')
        }
      ]
    },
    {
      id: 'PL-8822-BDG',
      createdAt: now.toISOString(),
      laptop: LAPTOP_CATALOG[1],
      customer: {
        fullName: 'Dian Permata Sari',
        idCardNumber: '3273014502950002',
        phone: '0818-0911-2233',
        email: 'dian.permata@techstartup.id',
        address: 'Jl. Tubagus Ismail No. 24, Sekeloa',
        city: 'Bandung',
        district: 'Coblong'
      },
      durationDays: 7,
      startDate: order2Start.toISOString(),
      endDate: order2End.toISOString(),
      deliveryMethod: 'delivery',
      deliveryAddress: 'Jl. Tubagus Ismail No. 24, Sekeloa, Coblong, Kota Bandung',
      guaranteeType: 'two_identities',
      identityDocs: {
        doc1Type: 'KTP',
        doc1Number: '3273014502950002',
        doc1HolderName: 'Dian Permata Sari',
        doc1FileName: 'ktp_dian_permata.jpg',
        doc2Type: 'Ijazah',
        doc2Number: 'IJZ-ITB-2018-9901',
        doc2HolderName: 'Dian Permata Sari',
        doc2FileName: 'ijazah_asli_legalisir.pdf'
      },
      emergencyContacts: [
        { name: 'Iwan Setiawan', relationship: 'Orang Tua / Ayah', phone: '0812-7788-9900' },
        { name: 'Maya Andini', relationship: 'Saudara Kandung', phone: '0878-9988-1122' }
      ],
      warningAgreed100PercentForfeited: true,
      paymentMethod: 'bca_va',
      paymentStatus: 'paid',
      pricing: {
        dailyRate: 165000,
        durationDays: 7,
        subtotalRental: 1155000,
        discount: 165000,
        deliveryFee: 30000,
        depositFee: 0,
        totalPaid: 1020000
      },
      status: 'awaiting_verification',
      logs: [
        {
          id: 'log-201',
          timestamp: now.toISOString(),
          actor: 'system',
          title: 'Pesanan Dibuat & VA BCA Terbayar',
          message: 'Penyewa membayar Rp 1.020.000 via BCA VA. Menunggu verifikasi berkas KTP & Ijazah oleh Admin.'
        }
      ]
    },
    {
      id: 'PL-8823-SBY',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      laptop: LAPTOP_CATALOG[2],
      customer: {
        fullName: 'Fajar Nugroho Pratama',
        idCardNumber: '3578041908970001',
        phone: '0852-3344-7788',
        email: 'fajar.nugroho@gamedev.co.id',
        address: 'Jl. Kertajaya Indah Timur XI No. 8',
        city: 'Surabaya',
        district: 'Sukolilo'
      },
      durationDays: 3,
      startDate: order3Start.toISOString(),
      endDate: order3End.toISOString(),
      deliveryMethod: 'self_pickup',
      storeLocation: 'Pinjamlaptop Hub Surabaya (Gubeng)',
      guaranteeType: 'cash_deposit',
      depositAmount: 4500000,
      emergencyContacts: [
        { name: 'Agus Pratama', relationship: 'Orang Tua', phone: '0812-3322-1100' },
        { name: 'Bayu Wicaksono', relationship: 'Teman Satu Kantor', phone: '0813-8899-7766' }
      ],
      warningAgreed100PercentForfeited: true,
      paymentMethod: 'mandiri_va',
      paymentStatus: 'paid',
      pricing: {
        dailyRate: 340000,
        durationDays: 3,
        subtotalRental: 1020000,
        discount: 0,
        deliveryFee: 0,
        depositFee: 4500000,
        totalPaid: 5520000
      },
      status: 'ready_for_pickup',
      pickupPinCode: '894210',
      logs: [
        {
          id: 'log-301',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          actor: 'system',
          title: 'Pembayaran Sewa + Deposit Diterima',
          message: 'Total pembayaran Rp 5.520.000 (Termasuk deposit Rp 4.500.000) terkonfirmasi.'
        },
        {
          id: 'log-302',
          timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
          actor: 'admin',
          title: 'Unit Siap Diambil di Hub Gubeng Surabaya',
          message: 'Laptop telah di-QC (OS fresh clean, kelengkapan dicek). Kode PIN Pengambilan diterbitkan: 894210'
        }
      ]
    }
  ];
};

cachedOrders = getInitialOrders();

// Initial sync from server API
export async function initializeAppState() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    // 1. Fetch current Admin Session
    const adminRes = await fetch('/api/auth/admin/me', { credentials: 'include' });
    if (adminRes.ok) {
      const data = await adminRes.json();
      if (data.session) {
        cachedAdminSession = data.session;
        window.dispatchEvent(new Event('pinjamlaptop_admin_auth_updated'));
      }
    }

    // 2. Fetch current Customer Session
    const custRes = await fetch('/api/auth/customer/me', { credentials: 'include' });
    if (custRes.ok) {
      const data = await custRes.json();
      if (data.member) {
        cachedCustomerSession = data.member;
        window.dispatchEvent(new Event('pinjamlaptop_customer_session_updated'));
      }
    }

    // 3. Fetch Laptops Catalog
    const laptopRes = await fetch('/api/laptops', { credentials: 'include' });
    if (laptopRes.ok) {
      const data = await laptopRes.json();
      if (Array.isArray(data.laptops) && data.laptops.length > 0) {
        cachedLaptops = data.laptops;
        window.dispatchEvent(new Event('pinjamlaptop_catalog_updated'));
      }
    }

    // 4. Fetch Orders if authenticated
    await syncOrdersFromServer();

    // 5. Fetch Admin Notifications if admin
    if (cachedAdminSession) {
      await syncNotificationsFromServer();
      await syncMembersFromServer();
    }
  } catch (err) {
    console.warn('[Sync] Server API not reachable yet or offline, using client cache:', err);
  }
}

// Trigger initial sync on module load
if (typeof window !== 'undefined') {
  initializeAppState();
}

async function syncOrdersFromServer() {
  try {
    const res = await fetch('/api/orders', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.orders)) {
        cachedOrders = data.orders;
        window.dispatchEvent(new Event('pinjamlaptop_orders_updated'));
      }
    }
  } catch (e) {
    // silent fallback
  }
}

async function syncNotificationsFromServer() {
  try {
    const res = await fetch('/api/admin/notifications', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        cachedNotifications = data.notifications;
        window.dispatchEvent(new Event('pinjamlaptop_notifications_updated'));
      }
    }
  } catch (e) {
    // silent fallback
  }
}

async function syncMembersFromServer() {
  try {
    const res = await fetch('/api/admin/members', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.members)) {
        cachedMembers = data.members;
        window.dispatchEvent(new Event('pinjamlaptop_members_updated'));
      }
    }
  } catch (e) {
    // silent fallback
  }
}

/* =========================================================================
   CATALOG FUNCTIONS
   ========================================================================= */

export const getStoredLaptops = (): Laptop[] => {
  return cachedLaptops;
};

export const saveStoredLaptops = (laptops: Laptop[]): void => {
  cachedLaptops = laptops;
  window.dispatchEvent(new Event('pinjamlaptop_catalog_updated'));

  // Sync to server batch
  fetch('/api/laptops/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ laptops })
  }).catch(e => console.error('Error batch updating laptops:', e));
};

export const updateStoredLaptop = (updatedLaptop: Laptop): Laptop[] => {
  const index = cachedLaptops.findIndex(l => l.id === updatedLaptop.id);
  if (index !== -1) {
    cachedLaptops[index] = updatedLaptop;
  } else {
    cachedLaptops.unshift(updatedLaptop);
  }
  window.dispatchEvent(new Event('pinjamlaptop_catalog_updated'));

  fetch(`/api/laptops/${updatedLaptop.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updatedLaptop)
  }).catch(e => console.error('Error updating laptop on server:', e));

  return cachedLaptops;
};

export const addStoredLaptop = (newLaptop: Laptop): Laptop[] => {
  const total = cachedLaptops.length;
  const laptopWithSkuAndSn: Laptop = {
    ...newLaptop,
    sku: newLaptop.sku?.trim() || generateLaptopSku(newLaptop, total),
    serialNumber: newLaptop.serialNumber?.trim() || generateSerialNumber(newLaptop, total)
  };
  cachedLaptops.unshift(laptopWithSkuAndSn);
  window.dispatchEvent(new Event('pinjamlaptop_catalog_updated'));

  fetch('/api/laptops', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(laptopWithSkuAndSn)
  }).catch(e => console.error('Error adding laptop on server:', e));

  return cachedLaptops;
};

export const deleteStoredLaptop = (laptopId: string): Laptop[] => {
  cachedLaptops = cachedLaptops.filter(l => l.id !== laptopId);
  window.dispatchEvent(new Event('pinjamlaptop_catalog_updated'));

  fetch(`/api/laptops/${laptopId}`, {
    method: 'DELETE',
    credentials: 'include'
  }).catch(e => console.error('Error deleting laptop on server:', e));

  return cachedLaptops;
};

export const resetStoredLaptopsToDefault = (): Laptop[] => {
  cachedLaptops = LAPTOP_CATALOG;
  window.dispatchEvent(new Event('pinjamlaptop_catalog_updated'));

  fetch('/api/laptops/reset', {
    method: 'POST',
    credentials: 'include'
  }).catch(e => console.error('Error resetting catalog:', e));

  return LAPTOP_CATALOG;
};

/* =========================================================================
   ORDERS MANAGEMENT
   ========================================================================= */

export const getStoredOrders = (): RentalOrder[] => {
  return cachedOrders;
};

export const saveOrders = (orders: RentalOrder[]) => {
  cachedOrders = orders;
  window.dispatchEvent(new Event('pinjamlaptop_orders_updated'));
};

export const getOrderById = (orderId: string): RentalOrder | undefined => {
  return cachedOrders.find(o => o.id.toLowerCase() === orderId.toLowerCase().trim());
};

export const createNewOrder = (order: RentalOrder): void => {
  cachedOrders = [order, ...cachedOrders];
  window.dispatchEvent(new Event('pinjamlaptop_orders_updated'));

  // Otomatis buat notifikasi di cache lokal
  const newNotif: AdminNotification = {
    id: `notif-${Date.now()}`,
    orderId: order.id,
    type: order.deliveryMethod === 'self_pickup' ? 'new_order_pickup' : 'new_order_delivery',
    title: order.deliveryMethod === 'self_pickup' 
      ? `Pesanan Baru: Pengambilan di Hub (${order.id})`
      : `Pesanan Baru: Pengiriman Unit (${order.id})`,
    message: `${order.customer.fullName} menyewa ${order.laptop.name} selama ${order.durationDays} hari. Metode: ${order.deliveryMethod === 'self_pickup' ? 'Ambil di Store' : 'Antar ke Alamat'}.`,
    timestamp: new Date().toISOString(),
    read: false,
    orderRef: {
      customerName: order.customer.fullName,
      laptopName: order.laptop.name,
      deliveryMethod: order.deliveryMethod
    }
  };
  cachedNotifications = [newNotif, ...cachedNotifications];
  window.dispatchEvent(new Event('pinjamlaptop_notifications_updated'));

  // Sync to server API
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(order)
  }).catch(e => console.error('Error creating order on server:', e));
};

export const updateOrder = (updatedOrder: RentalOrder): void => {
  cachedOrders = cachedOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
  window.dispatchEvent(new Event('pinjamlaptop_orders_updated'));

  fetch(`/api/orders/${updatedOrder.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updatedOrder)
  }).catch(e => console.error('Error updating order on server:', e));
};

export const updateOrderStatus = (
  orderId: string, 
  newStatus: OrderStatus, 
  actor: 'admin' | 'system' | 'customer',
  title: string, 
  message: string,
  extraUpdates?: Partial<RentalOrder>
): void => {
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor,
    title,
    message
  };

  cachedOrders = cachedOrders.map(order => {
    if (order.id === orderId) {
      return {
        ...order,
        ...extraUpdates,
        status: newStatus,
        logs: [newLog, ...order.logs]
      };
    }
    return order;
  });
  window.dispatchEvent(new Event('pinjamlaptop_orders_updated'));

  fetch(`/api/orders/${orderId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newStatus, actor, title, message, extraUpdates })
  }).catch(e => console.error('Error updating order status on server:', e));
};

export const startOrderRental = (orderId: string): { success: boolean; message: string } => {
  const order = cachedOrders.find(o => o.id === orderId);
  if (!order) return { success: false, message: 'Pesanan tidak ditemukan' };

  const now = new Date();
  const newStartDate = now.toISOString();
  const newEndDate = new Date(now.getTime() + order.durationDays * 24 * 60 * 60 * 1000).toISOString();

  const formattedStartTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formattedStartDate = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedEndTime = new Date(newEndDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formattedEndDate = new Date(newEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: now.toISOString(),
    actor: 'admin' as const,
    title: 'Masa Sewa Resmi Dimulai (Serah Terima Unit)',
    message: `Admin telah menekan tombol "Mulai Sewa". Jam mulai sewa unit ${order.laptop.name} resmi berjalan mulai ${formattedStartDate} pukul ${formattedStartTime} WIB (saat menerima unit). Batas waktu pengembalian paling lambat adalah saat masa sewa habis: ${formattedEndDate} pukul ${formattedEndTime} WIB (${order.durationDays} hari, terhitung sejak jam yang sama saat menerima unit).`
  };

  cachedOrders = cachedOrders.map(o => {
    if (o.id === orderId) {
      return {
        ...o,
        status: 'active_rental' as OrderStatus,
        rentalStartedAt: newStartDate,
        startDate: newStartDate,
        endDate: newEndDate,
        customLateHoursSimulated: undefined,
        logs: [newLog, ...o.logs]
      };
    }
    return o;
  });
  window.dispatchEvent(new Event('pinjamlaptop_orders_updated'));

  // Trigger server endpoint
  fetch(`/api/orders/${orderId}/start-rental`, {
    method: 'POST',
    credentials: 'include'
  }).catch(e => console.error('Error starting order rental on server:', e));

  return { 
    success: true, 
    message: `Tombol "Mulai Sewa" berhasil diaktifkan!\n\nJam mulai sewa: ${formattedStartTime} WIB (saat menerima unit)\nBatas waktu pengembalian paling lambat: ${formattedEndDate} pukul ${formattedEndTime} WIB (terhitung sejak jam yang sama saat menerima unit yang disewakan).` 
  };
};

export const requestOrderReturnPickup = (
  orderId: string, 
  pickupReq: ReturnPickupRequest
): void => {
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'customer' as const,
    title: 'Permintaan Pick Up Pengembalian Diajukan',
    message: `Penyewa meminta unit dijemput di: ${pickupReq.pickupAddress} pada ${pickupReq.preferredDate} (${pickupReq.preferredTimeSlot}).`
  };

  cachedOrders = cachedOrders.map(order => {
    if (order.id === orderId) {
      return {
        ...order,
        status: 'return_pickup_requested' as OrderStatus,
        returnPickupRequest: pickupReq,
        logs: [newLog, ...order.logs]
      };
    }
    return order;
  });
  window.dispatchEvent(new Event('pinjamlaptop_orders_updated'));

  fetch(`/api/orders/${orderId}/return-pickup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(pickupReq)
  }).catch(e => console.error('Error requesting return pickup on server:', e));
};

export const setSimulatedLateHours = (orderId: string, hours: number): void => {
  cachedOrders = cachedOrders.map(order => {
    if (order.id === orderId) {
      return {
        ...order,
        customLateHoursSimulated: hours
      };
    }
    return order;
  });
  window.dispatchEvent(new Event('pinjamlaptop_orders_updated'));

  fetch(`/api/orders/${orderId}/simulate-late`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ hours })
  }).catch(e => console.error('Error setting simulated late hours on server:', e));
};

/* =========================================================================
   ADMIN NOTIFICATIONS
   ========================================================================= */

export const getStoredNotifications = (): AdminNotification[] => {
  return cachedNotifications;
};

export const saveNotifications = (notifications: AdminNotification[]) => {
  cachedNotifications = notifications;
  window.dispatchEvent(new Event('pinjamlaptop_notifications_updated'));
};

export const markNotificationAsRead = (notifId: string): void => {
  cachedNotifications = cachedNotifications.map(n => n.id === notifId ? { ...n, read: true } : n);
  window.dispatchEvent(new Event('pinjamlaptop_notifications_updated'));

  fetch(`/api/admin/notifications/${notifId}/read`, {
    method: 'POST',
    credentials: 'include'
  }).catch(e => console.error('Error marking notif read on server:', e));
};

export const markAllNotificationsAsRead = (): void => {
  cachedNotifications = cachedNotifications.map(n => ({ ...n, read: true }));
  window.dispatchEvent(new Event('pinjamlaptop_notifications_updated'));

  fetch('/api/admin/notifications/read-all', {
    method: 'POST',
    credentials: 'include'
  }).catch(e => console.error('Error marking all notifs read on server:', e));
};

/* =========================================================================
   CUSTOMER MEMBER AUTHENTICATION & MANAGEMENT
   ========================================================================= */

export const getStoredMembers = (): CustomerMember[] => {
  return cachedMembers;
};

export const saveStoredMembers = (members: CustomerMember[]): void => {
  cachedMembers = members;
  window.dispatchEvent(new Event('pinjamlaptop_members_updated'));
};

export const getStoredCustomerSession = (): CustomerMember | null => {
  return cachedCustomerSession;
};

export const setStoredCustomerSession = (member: CustomerMember | null): void => {
  cachedCustomerSession = member;
  window.dispatchEvent(new Event('pinjamlaptop_customer_session_updated'));
};

export const logoutCustomer = async (): Promise<void> => {
  cachedCustomerSession = null;
  window.dispatchEvent(new Event('pinjamlaptop_customer_session_updated'));
  try {
    await fetch('/api/auth/customer/logout', { method: 'POST', credentials: 'include' });
  } catch (e) {
    // silent
  }
};

export const getMemberById = (memberId: string): CustomerMember | undefined => {
  return cachedMembers.find(m => m.memberId.toLowerCase().trim() === memberId.toLowerCase().trim());
};

export const authenticateMember = async (
  identifier: string, 
  password: string
): Promise<{ success: boolean; member?: CustomerMember; message: string }> => {
  if (!identifier.trim()) {
    return { success: false, message: 'Silakan isi ID Member, Nomor HP, atau Email Anda.' };
  }
  if (!password.trim()) {
    return { success: false, message: 'Silakan masukkan Password Anda.' };
  }

  try {
    const res = await fetch('/api/auth/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (res.ok && data.success && data.member) {
      cachedCustomerSession = data.member;
      window.dispatchEvent(new Event('pinjamlaptop_customer_session_updated'));
      await syncOrdersFromServer();
      return { success: true, member: data.member, message: data.message };
    }
    return { success: false, message: data.message || 'Gagal masuk akun' };
  } catch (err) {
    return { success: false, message: 'Gagal terhubung ke server. Periksa koneksi internet Anda.' };
  }
};

export const registerOrUpdateMember = async (
  memberData: Omit<CustomerMember, 'registeredAt' | 'totalRentals'> & {
    registeredAt?: string;
    totalRentals?: number;
  }
): Promise<CustomerMember> => {
  try {
    const res = await fetch('/api/auth/customer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(memberData)
    });
    const data = await res.json();
    if (res.ok && data.success && data.member) {
      cachedCustomerSession = data.member;
      window.dispatchEvent(new Event('pinjamlaptop_customer_session_updated'));
      await syncOrdersFromServer();
      return data.member;
    }
  } catch (e) {
    console.error('Error registering customer on server:', e);
  }

  // Fallback local memory object
  const fallback: CustomerMember = {
    ...memberData,
    password: '',
    registeredAt: new Date().toISOString(),
    totalRentals: 1
  };
  cachedCustomerSession = fallback;
  window.dispatchEvent(new Event('pinjamlaptop_customer_session_updated'));
  return fallback;
};

/* =========================================================================
   RENTAL EXTENSION & CANCELLATION
   ========================================================================= */

export const extendOrderRental = async (
  orderId: string,
  additionalDays: number,
  extensionFee: number,
  paymentMethod: string,
  adminNotes?: string,
  adminName: string = 'Hendra Wijaya (Admin Operasional)'
): Promise<{ success: boolean; message: string; updatedOrder?: RentalOrder }> => {
  const index = cachedOrders.findIndex(o => o.id === orderId);
  if (index === -1) {
    return { success: false, message: `Pesanan ${orderId} tidak ditemukan.` };
  }

  const order = cachedOrders[index];
  const prevEndDate = order.endDate;
  const currentEnd = new Date(prevEndDate);
  const newEnd = new Date(currentEnd.getTime() + additionalDays * 24 * 60 * 60 * 1000);
  const newEndDateStr = newEnd.toISOString();

  const extensionRecord: RentalExtension = {
    id: `EXT-${Date.now().toString().slice(-6)}`,
    extendedAt: new Date().toISOString(),
    additionalDays,
    previousEndDate: prevEndDate,
    newEndDate: newEndDateStr,
    extensionFee,
    paymentMethod,
    adminNotes,
    processedByAdmin: adminName
  };

  const updatedExtensions = [...(order.extensions || []), extensionRecord];
  const newDurationDays = order.durationDays + additionalDays;
  const updatedPricing = {
    ...order.pricing,
    durationDays: newDurationDays,
    subtotalRental: order.pricing.subtotalRental + extensionFee,
    totalPaid: order.pricing.totalPaid + extensionFee
  };

  const newLog: OrderLog = {
    id: `log-ext-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'admin',
    title: `Perpanjangan Sewa +${additionalDays} Hari Dikonfirmasi`,
    message: `Admin (${adminName}) menyetujui perpanjangan sewa +${additionalDays} hari dengan tarif berlaku Rp ${formatRupiah(extensionFee)} (${paymentMethod}). Batas pengembalian diperpanjang hingga ${newEnd.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB.${adminNotes ? ` Catatan: ${adminNotes}` : ''}`
  };

  const updatedOrder: RentalOrder = {
    ...order,
    durationDays: newDurationDays,
    endDate: newEndDateStr,
    pricing: updatedPricing,
    extensions: updatedExtensions,
    logs: [...order.logs, newLog]
  };

  cachedOrders[index] = updatedOrder;
  window.dispatchEvent(new Event('pinjamlaptop_orders_updated'));

  // Sync to server API
  try {
    await fetch(`/api/orders/${orderId}/extend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ additionalDays, extensionFee, paymentMethod, adminNotes })
    });
  } catch (e) {
    console.error('Error extending order on server:', e);
  }

  return { 
    success: true, 
    message: `Perpanjangan sewa customer +${additionalDays} hari berhasil diproses sesuai harga yang berlaku!`, 
    updatedOrder 
  };
};

export const rejectAndCancelOrder = async (
  orderId: string,
  reason: string,
  forfeitFunds: boolean,
  adminName: string = 'Hendra Wijaya (Admin Operasional)'
): Promise<{ success: boolean; message: string }> => {
  const index = cachedOrders.findIndex(o => o.id === orderId);
  if (index === -1) {
    return { success: false, message: `Pesanan ${orderId} tidak ditemukan.` };
  }

  const order = cachedOrders[index];
  const targetStatus: OrderStatus = 'forfeited_cancelled';

  const logTitle = forfeitFunds 
    ? 'DIBATALKAN: Dana Hangus 100%' 
    : 'DIBATALKAN OLEH ADMIN: Pengembalian Dana';
  
  const logMessage = forfeitFunds
    ? `Admin menolak pesanan karena: ${reason}. Berdasarkan klausul mutlak, seluruh transaksi ${formatRupiah(order.pricing.totalPaid)} dinyatakan HANGUS 100% dan unit tidak diserahkan.`
    : `Admin menolak/membatalkan pesanan karena: ${reason}. Pembayaran akan diproses untuk pengembalian dana (refund).`;

  updateOrderStatus(
    order.id,
    targetStatus,
    'admin',
    logTitle,
    logMessage,
    {
      cancellationReason: reason,
      paymentStatus: forfeitFunds ? 'forfeited' : 'paid'
    }
  );

  try {
    await fetch(`/api/orders/${orderId}/cancel-reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason, forfeitFunds })
    });
  } catch (e) {
    console.error('Error canceling order on server:', e);
  }

  return { 
    success: true, 
    message: forfeitFunds 
      ? `Pesanan ${order.id} ditolak dan dana ${formatRupiah(order.pricing.totalPaid)} dinyatakan HANGUS 100% sesuai klausul!`
      : `Pesanan ${order.id} telah ditolak & dibatalkan.` 
  };
};

/* =========================================================================
   ADMIN SESSION & AUTHENTICATION
   ========================================================================= */

export const getStoredAdminSession = (): AdminUserSession | null => {
  return cachedAdminSession;
};

export const saveAdminSession = (session: AdminUserSession | null): void => {
  cachedAdminSession = session;
  window.dispatchEvent(new Event('pinjamlaptop_admin_auth_updated'));
};

export const loginAdmin = async (
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; message: string; session?: AdminUserSession }> => {
  const username = usernameInput.toLowerCase().trim();
  const password = passwordInput.trim();

  try {
    const res = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.success && data.session) {
      cachedAdminSession = data.session;
      window.dispatchEvent(new Event('pinjamlaptop_admin_auth_updated'));
      // Sync fresh admin data
      await syncOrdersFromServer();
      await syncNotificationsFromServer();
      await syncMembersFromServer();
      return { success: true, message: data.message, session: data.session };
    }

    return {
      success: false,
      message: data.message || 'ID Administrator atau Kata Sandi salah.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Gagal terhubung ke server Express. Pastikan server sedang berjalan.'
    };
  }
};

export const logoutAdmin = async (): Promise<void> => {
  cachedAdminSession = null;
  window.dispatchEvent(new Event('pinjamlaptop_admin_auth_updated'));
  try {
    await fetch('/api/auth/admin/logout', { method: 'POST', credentials: 'include' });
  } catch (e) {
    // silent
  }
};

/* =========================================================================
   CALCULATION HELPERS
   ========================================================================= */

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculateRentalPricing = (
  laptop: Laptop,
  durationDays: number,
  deliveryMethod: 'self_pickup' | 'delivery',
  guaranteeType: 'two_identities' | 'cash_deposit'
) => {
  let dailyRate = laptop.dailyPrice;
  let subtotal = 0;
  let discount = 0;

  if (durationDays >= 30) {
    const months = Math.floor(durationDays / 30);
    const extraDays = durationDays % 30;
    subtotal = (months * laptop.monthlyPrice) + (extraDays * laptop.dailyPrice * 0.7);
    discount = (durationDays * laptop.dailyPrice) - subtotal;
  } else if (durationDays >= 7) {
    const weeks = Math.floor(durationDays / 7);
    const extraDays = durationDays % 7;
    subtotal = (weeks * laptop.weeklyPrice) + (extraDays * laptop.dailyPrice * 0.85);
    discount = (durationDays * laptop.dailyPrice) - subtotal;
  } else {
    subtotal = durationDays * laptop.dailyPrice;
    discount = 0;
  }

  const deliveryFee = deliveryMethod === 'delivery' ? 35000 : 0;
  const depositFee = guaranteeType === 'cash_deposit' ? laptop.depositAmount : 0;
  const totalPaid = Math.round(subtotal + deliveryFee + depositFee);

  return {
    dailyRate,
    durationDays,
    subtotalRental: Math.round(subtotal),
    discount: Math.round(discount),
    deliveryFee,
    depositFee,
    totalPaid
  };
};

export const calculateOverdueAndLateFee = (order: RentalOrder) => {
  const isStarted = Boolean(order.rentalStartedAt);

  if (!isStarted && order.status !== 'completed' && order.status !== 'forfeited_cancelled') {
    const totalRemainingSeconds = order.durationDays * 24 * 3600;
    const days = order.durationDays;
    return {
      isStarted: false,
      isOverdue: false,
      lateHours: 0,
      lateFee: 0,
      hourlyRate: order.laptop.lateFeePerHour || 20000,
      remaining: { days, hours: 0, minutes: 0, seconds: 0, totalMs: totalRemainingSeconds * 1000 },
      overdueElapsed: { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 }
    };
  }

  const now = new Date();
  const end = new Date(order.endDate);

  let diffMs = now.getTime() - end.getTime();
  if (order.customLateHoursSimulated !== undefined && order.customLateHoursSimulated > 0) {
    diffMs = order.customLateHoursSimulated * 60 * 60 * 1000;
  } else if (order.customLateHoursSimulated === -2) {
    diffMs = -2 * 60 * 60 * 1000;
  }

  const isOverdue = diffMs > 0 && order.status !== 'completed' && order.status !== 'forfeited_cancelled';

  if (!isOverdue) {
    const remainingMs = Math.max(0, -diffMs);
    const totalRemainingSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalRemainingSeconds / (3600 * 24));
    const hours = Math.floor((totalRemainingSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalRemainingSeconds % 3600) / 60);
    const seconds = totalRemainingSeconds % 60;

    return {
      isStarted: isStarted,
      isOverdue: false,
      lateHours: 0,
      lateFee: 0,
      hourlyRate: order.laptop.lateFeePerHour || 20000,
      remaining: { days, hours, minutes, seconds, totalMs: remainingMs },
      overdueElapsed: { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 }
    };
  }

  const lateHoursExact = diffMs / (1000 * 60 * 60);
  const lateHoursRounded = Math.max(1, Math.ceil(lateHoursExact));
  const hourlyRate = order.laptop.lateFeePerHour || 20000;
  const lateFee = lateHoursRounded * hourlyRate;

  const totalElapsedSeconds = Math.floor(diffMs / 1000);
  const elapsedDays = Math.floor(totalElapsedSeconds / (3600 * 24));
  const elapsedHours = Math.floor((totalElapsedSeconds % (3600 * 24)) / 3600);
  const elapsedMinutes = Math.floor((totalElapsedSeconds % 3600) / 60);
  const elapsedSeconds = totalElapsedSeconds % 60;

  return {
    isStarted: true,
    isOverdue: true,
    lateHours: lateHoursRounded,
    lateFee,
    hourlyRate,
    remaining: { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 },
    overdueElapsed: {
      days: elapsedDays,
      hours: elapsedHours,
      minutes: elapsedMinutes,
      seconds: elapsedSeconds,
      totalMs: diffMs
    }
  };
};

export const calculateExtensionPricing = (
  laptop: Laptop,
  days: number
): { ratePerDay: number; subtotal: number; discount: number; finalPrice: number } => {
  if (days <= 0) {
    return { ratePerDay: laptop.dailyPrice, subtotal: 0, discount: 0, finalPrice: 0 };
  }

  let finalPrice = 0;
  let normalSubtotal = days * laptop.dailyPrice;

  if (days >= 30) {
    const months = Math.floor(days / 30);
    const extraDays = days % 30;
    finalPrice = (months * laptop.monthlyPrice) + Math.round(extraDays * laptop.dailyPrice * 0.7);
  } else if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const extraDays = days % 7;
    finalPrice = (weeks * laptop.weeklyPrice) + Math.round(extraDays * laptop.dailyPrice * 0.85);
  } else {
    finalPrice = days * laptop.dailyPrice;
  }

  finalPrice = Math.round(finalPrice);
  const discount = Math.max(0, normalSubtotal - finalPrice);
  const ratePerDay = Math.round(finalPrice / days);

  return {
    ratePerDay,
    subtotal: normalSubtotal,
    discount,
    finalPrice
  };
};

export const getFinancialLedgerData = (
  ordersList?: RentalOrder[]
): { items: FinancialInflowItem[]; summary: FinancialLedgerSummary } => {
  const orders = ordersList || cachedOrders;
  const items: FinancialInflowItem[] = [];

  let grossInflow = 0;
  let netRentalRevenue = 0;
  let extensionRevenue = 0;
  let activeDepositsHeld = 0;
  let refundedDeposits = 0;
  let forfeitedRevenue = 0;
  let deliveryFeesCollected = 0;
  let lateFeesCollected = 0;

  orders.forEach((order) => {
    if (order.status === 'forfeited_cancelled' && order.paymentStatus === 'forfeited') {
      grossInflow += order.pricing.totalPaid;
      forfeitedRevenue += order.pricing.totalPaid;

      items.push({
        id: `FIN-FORFEIT-${order.id}`,
        orderId: order.id,
        timestamp: order.createdAt,
        customerName: order.customer.fullName,
        laptopName: order.laptop.name,
        category: 'forfeited',
        categoryLabel: 'Dana Hangus 100% (Pelanggaran)',
        amount: order.pricing.totalPaid,
        paymentMethod: order.paymentMethod.toUpperCase(),
        status: 'forfeited',
        notes: order.cancellationReason || 'Identitas tidak valid/fiktif'
      });
    } else {
      const baseRental = order.pricing.subtotalRental - (order.extensions?.reduce((sum, ext) => sum + ext.extensionFee, 0) || 0);
      grossInflow += baseRental;
      netRentalRevenue += baseRental;

      items.push({
        id: `FIN-RENTAL-${order.id}`,
        orderId: order.id,
        timestamp: order.createdAt,
        customerName: order.customer.fullName,
        laptopName: order.laptop.name,
        category: 'rental_fee',
        categoryLabel: 'Pendapatan Sewa Laptop',
        amount: baseRental,
        paymentMethod: order.paymentMethod.toUpperCase(),
        status: 'received',
        notes: `Durasi awal ${order.durationDays - (order.extensions?.reduce((s, e) => s + e.additionalDays, 0) || 0)} hari`
      });

      if (order.pricing.deliveryFee > 0) {
        grossInflow += order.pricing.deliveryFee;
        deliveryFeesCollected += order.pricing.deliveryFee;

        items.push({
          id: `FIN-DELIVERY-${order.id}`,
          orderId: order.id,
          timestamp: order.createdAt,
          customerName: order.customer.fullName,
          laptopName: order.laptop.name,
          category: 'delivery_fee',
          categoryLabel: 'Biaya Pengiriman Kurir',
          amount: order.pricing.deliveryFee,
          paymentMethod: order.paymentMethod.toUpperCase(),
          status: 'received',
          notes: 'Layanan kurir khusus laptop box'
        });
      }

      if (order.pricing.depositFee > 0) {
        grossInflow += order.pricing.depositFee;

        if (order.status === 'completed') {
          refundedDeposits += order.pricing.depositFee;
          items.push({
            id: `FIN-DEP-REFUND-${order.id}`,
            orderId: order.id,
            timestamp: order.createdAt,
            customerName: order.customer.fullName,
            laptopName: order.laptop.name,
            category: 'deposit',
            categoryLabel: 'Titipan Uang Deposit (Dicairkan Kembali)',
            amount: order.pricing.depositFee,
            paymentMethod: order.paymentMethod.toUpperCase(),
            status: 'refunded_deposit',
            notes: 'Unit kembali mulus, uang jaminan telah dicairkan kembali 100%'
          });
        } else {
          activeDepositsHeld += order.pricing.depositFee;
          items.push({
            id: `FIN-DEP-HELD-${order.id}`,
            orderId: order.id,
            timestamp: order.createdAt,
            customerName: order.customer.fullName,
            laptopName: order.laptop.name,
            category: 'deposit',
            categoryLabel: 'Titipan Uang Jaminan Deposit',
            amount: order.pricing.depositFee,
            paymentMethod: order.paymentMethod.toUpperCase(),
            status: 'held_deposit',
            notes: 'Masih ditahan di rekening penampung selama unit disewa'
          });
        }
      }
    }

    if (order.extensions && order.extensions.length > 0) {
      order.extensions.forEach((ext) => {
        grossInflow += ext.extensionFee;
        netRentalRevenue += ext.extensionFee;
        extensionRevenue += ext.extensionFee;

        items.push({
          id: `FIN-EXT-${ext.id}`,
          orderId: order.id,
          timestamp: ext.extendedAt,
          customerName: order.customer.fullName,
          laptopName: order.laptop.name,
          category: 'extension_fee',
          categoryLabel: `Perpanjangan Sewa (+${ext.additionalDays} Hari)`,
          amount: ext.extensionFee,
          paymentMethod: ext.paymentMethod,
          status: 'received',
          notes: `Diproses oleh ${ext.processedByAdmin}.${ext.adminNotes ? ` Catatan: ${ext.adminNotes}` : ''}`
        });
      });
    }

    const overdue = calculateOverdueAndLateFee(order);
    if (overdue.isOverdue && overdue.lateFee > 0) {
      lateFeesCollected += overdue.lateFee;
      items.push({
        id: `FIN-LATE-${order.id}`,
        orderId: order.id,
        timestamp: new Date().toISOString(),
        customerName: order.customer.fullName,
        laptopName: order.laptop.name,
        category: 'late_fee',
        categoryLabel: `Denda Keterlambatan (${overdue.lateHours} Jam)`,
        amount: overdue.lateFee,
        paymentMethod: 'TAGIHAN_PENDING',
        status: 'received',
        notes: `Keterlambatan ${overdue.lateHours} jam x ${formatRupiah(order.laptop.lateFeePerHour)}/jam`
      });
    }
  });

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const summary: FinancialLedgerSummary = {
    grossInflow,
    netRentalRevenue,
    extensionRevenue,
    activeDepositsHeld,
    refundedDeposits,
    forfeitedRevenue,
    deliveryFeesCollected,
    lateFeesCollected,
    totalTransactionsCount: items.length
  };

  return { items, summary };
};
