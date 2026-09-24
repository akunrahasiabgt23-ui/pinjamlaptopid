import { 
  RentalOrder, AdminNotification, OrderStatus, ReturnPickupRequest, 
  Laptop, CustomerMember, RentalExtension, AdminUserSession, 
  FinancialInflowItem, FinancialLedgerSummary, OrderLog 
} from '../types';
import { LAPTOP_CATALOG, generateLaptopSku, getBranchCityForLaptop, generateSerialNumber } from '../data/laptops';

const ORDERS_KEY = 'pinjamlaptop_orders_v2';
const NOTIFICATIONS_KEY = 'pinjamlaptop_admin_notifications_v1';
const CATALOG_KEY = 'pinjamlaptop_catalog_v103';

// Catalog management storage functions
export const getStoredLaptops = (): Laptop[] => {
  try {
    const data = localStorage.getItem(CATALOG_KEY);
    if (!data) {
      localStorage.setItem(CATALOG_KEY, JSON.stringify(LAPTOP_CATALOG));
      return LAPTOP_CATALOG;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Pastikan denda keterlambatan selalu terstandar 20.000 / jam, SKU selalu terisi, serialNumber dan branchCity tersedia
      return parsed.map((l, index) => {
        const branchCity = l.branchCity || getBranchCityForLaptop(l, index);
        const serialNumber = l.serialNumber || generateSerialNumber(l, index);
        return {
          ...l,
          branchCity,
          branchHubId: l.branchHubId || (branchCity === 'Malang' ? 'hub-malang' : branchCity === 'Sidoarjo' ? 'hub-sidoarjo' : 'hub-bekasi'),
          sku: l.sku || generateLaptopSku(l, index),
          serialNumber,
          lateFeePerHour: l.lateFeePerHour || 20000
        };
      });
    }
    return LAPTOP_CATALOG;
  } catch (err) {
    console.error('Error reading catalog from storage:', err);
    return LAPTOP_CATALOG;
  }
};

export const saveStoredLaptops = (laptops: Laptop[]): void => {
  try {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(laptops));
    window.dispatchEvent(new Event('pinjamlaptop_catalog_updated'));
  } catch (err) {
    console.error('Error saving catalog to storage:', err);
  }
};

export const updateStoredLaptop = (updatedLaptop: Laptop): Laptop[] => {
  const current = getStoredLaptops();
  const index = current.findIndex(l => l.id === updatedLaptop.id);
  if (index !== -1) {
    current[index] = updatedLaptop;
  } else {
    current.unshift(updatedLaptop);
  }
  saveStoredLaptops(current);
  return current;
};

export const addStoredLaptop = (newLaptop: Laptop): Laptop[] => {
  const current = getStoredLaptops();
  const laptopWithSkuAndSn: Laptop = {
    ...newLaptop,
    sku: newLaptop.sku?.trim() || generateLaptopSku(newLaptop, current.length),
    serialNumber: newLaptop.serialNumber?.trim() || generateSerialNumber(newLaptop, current.length)
  };
  current.unshift(laptopWithSkuAndSn);
  saveStoredLaptops(current);
  return current;
};

export const deleteStoredLaptop = (laptopId: string): Laptop[] => {
  const current = getStoredLaptops().filter(l => l.id !== laptopId);
  saveStoredLaptops(current);
  return current;
};

export const resetStoredLaptopsToDefault = (): Laptop[] => {
  saveStoredLaptops(LAPTOP_CATALOG);
  return LAPTOP_CATALOG;
};

// Initial sample orders to make the app immediately testable and rich
const getInitialOrders = (): RentalOrder[] => {
  const now = new Date();
  
  // Order 1: Active rental (ends in 2 days)
  const order1Start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const order1End = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Order 2: Awaiting verification (Just submitted by customer via Delivery)
  const order2Start = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const order2End = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Order 3: Ready for pick up at store hub (Self Pick-up with PIN code)
  const order3Start = new Date(now.getTime());
  const order3End = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const initialOrders: RentalOrder[] = [
    {
      id: 'PL-8821-JKT',
      createdAt: order1Start.toISOString(),
      laptop: LAPTOP_CATALOG[0], // MacBook Pro 14 M3
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
        {
          name: 'Hendra Saputra',
          relationship: 'Saudara Kandung',
          phone: '0813-2244-8811'
        },
        {
          name: 'Rina Kusuma',
          relationship: 'Rekan Kerja / Manajer',
          phone: '0857-1122-3344'
        }
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
      laptop: LAPTOP_CATALOG[1], // ThinkPad T14 Gen 4
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
        {
          name: 'Iwan Setiawan',
          relationship: 'Orang Tua / Ayah',
          phone: '0812-7788-9900'
        },
        {
          name: 'Maya Andini',
          relationship: 'Saudara Kandung',
          phone: '0878-9988-1122'
        }
      ],
      warningAgreed100PercentForfeited: true,
      paymentMethod: 'bca_va',
      paymentStatus: 'paid',
      pricing: {
        dailyRate: 165000,
        durationDays: 7,
        subtotalRental: 1155000,
        discount: 165000, // Diskon paket mingguan
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
      laptop: LAPTOP_CATALOG[2], // ASUS ROG Zephyrus G16
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
        {
          name: 'Agus Pratama',
          relationship: 'Orang Tua',
          phone: '0812-3322-1100'
        },
        {
          name: 'Bayu Wicaksono',
          relationship: 'Teman Satu Kantor',
          phone: '0813-8899-7766'
        }
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

  return initialOrders;
};

const getInitialNotifications = (): AdminNotification[] => {
  const now = new Date();
  return [
    {
      id: 'notif-1',
      orderId: 'PL-8822-BDG',
      type: 'new_order_delivery',
      title: 'Pesanan Baru Perlu Pengiriman (Delivery)',
      message: 'Customer Dian Permata Sari menyewa ThinkPad T14 (7 Hari). Pengiriman ke Tubagus Ismail, Bandung. Harap verifikasi 2 identitas!',
      timestamp: now.toISOString(),
      read: false,
      orderRef: {
        customerName: 'Dian Permata Sari',
        laptopName: 'Lenovo ThinkPad T14 Gen 4',
        deliveryMethod: 'delivery'
      }
    },
    {
      id: 'notif-2',
      orderId: 'PL-8823-SBY',
      type: 'new_order_pickup',
      title: 'Pesanan Ambil di Hub (Self Pick-up)',
      message: 'Fajar Nugroho Pratama telah membayar sewa + deposit Rp 4.500.000. Siap diambil di Hub Gubeng Surabaya dengan PIN 894210.',
      timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      read: true,
      orderRef: {
        customerName: 'Fajar Nugroho Pratama',
        laptopName: 'ASUS ROG Zephyrus G16',
        deliveryMethod: 'self_pickup'
      }
    }
  ];
};

export const getStoredOrders = (): RentalOrder[] => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      const initial = getInitialOrders();
      localStorage.setItem(ORDERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading orders from storage:', err);
    return getInitialOrders();
  }
};

export const saveOrders = (orders: RentalOrder[]) => {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('pinjamlaptop_orders_updated'));
  } catch (err) {
    console.error('Error saving orders:', err);
  }
};

export const getOrderById = (orderId: string): RentalOrder | undefined => {
  const orders = getStoredOrders();
  return orders.find(o => o.id.toLowerCase() === orderId.toLowerCase().trim());
};

export const createNewOrder = (order: RentalOrder): void => {
  const orders = getStoredOrders();
  const updatedOrders = [order, ...orders];
  saveOrders(updatedOrders);

  // Otomatis buat notifikasi untuk Admin
  const notifs = getStoredNotifications();
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
  saveNotifications([newNotif, ...notifs]);
};

export const updateOrder = (updatedOrder: RentalOrder): void => {
  const orders = getStoredOrders();
  const nextOrders = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
  saveOrders(nextOrders);
};

export const updateOrderStatus = (
  orderId: string, 
  newStatus: OrderStatus, 
  actor: 'admin' | 'system' | 'customer',
  title: string, 
  message: string,
  extraUpdates?: Partial<RentalOrder>
): void => {
  const orders = getStoredOrders();
  const updated = orders.map(order => {
    if (order.id === orderId) {
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor,
        title,
        message
      };
      return {
        ...order,
        ...extraUpdates,
        status: newStatus,
        logs: [newLog, ...order.logs]
      };
    }
    return order;
  });
  saveOrders(updated);
};

export const startOrderRental = (orderId: string): { success: boolean; message: string } => {
  const orders = getStoredOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return { success: false, message: 'Pesanan tidak ditemukan' };

  const now = new Date();
  const newStartDate = now.toISOString();
  // Jam sewa resmi dihitung mundur mulai dari saat admin menekan tombol "Mulai Sewa"
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

  const updated = orders.map(o => {
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

  saveOrders(updated);

  // Trigger notifikasi admin
  const notifs = getStoredNotifications();
  const startNotif: AdminNotification = {
    id: `notif-${Date.now()}`,
    orderId: order.id,
    type: 'new_order_pickup',
    title: `Jam Sewa Berjalan (${order.id})`,
    message: `Admin telah mengaktifkan masa sewa laptop ${order.laptop.name} untuk ${order.customer.fullName}. Jam mulai: ${formattedStartTime} WIB, batas pengembalian: ${formattedEndDate} pukul ${formattedEndTime} WIB.`,
    timestamp: now.toISOString(),
    read: false,
    orderRef: {
      customerName: order.customer.fullName,
      laptopName: order.laptop.name,
      deliveryMethod: order.deliveryMethod
    }
  };
  saveNotifications([startNotif, ...notifs]);

  return { 
    success: true, 
    message: `Tombol "Mulai Sewa" berhasil diaktifkan!\n\nJam mulai sewa: ${formattedStartTime} WIB (saat menerima unit)\nBatas waktu pengembalian paling lambat: ${formattedEndDate} pukul ${formattedEndTime} WIB (terhitung sejak jam yang sama saat menerima unit yang disewakan).` 
  };
};

export const requestOrderReturnPickup = (
  orderId: string, 
  pickupReq: ReturnPickupRequest
): void => {
  const orders = getStoredOrders();
  const updated = orders.map(order => {
    if (order.id === orderId) {
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'customer' as const,
        title: 'Permintaan Pick Up Pengembalian Diajukan',
        message: `Penyewa meminta unit dijemput di: ${pickupReq.pickupAddress} pada ${pickupReq.preferredDate} (${pickupReq.preferredTimeSlot}).`
      };
      return {
        ...order,
        status: 'return_pickup_requested' as OrderStatus,
        returnPickupRequest: pickupReq,
        logs: [newLog, ...order.logs]
      };
    }
    return order;
  });
  saveOrders(updated);

  // Trigger notifikasi admin
  const order = orders.find(o => o.id === orderId);
  if (order) {
    const notifs = getStoredNotifications();
    const returnNotif: AdminNotification = {
      id: `notif-${Date.now()}`,
      orderId: order.id,
      type: 'return_pickup_request',
      title: `Request Pick-up Pengembalian (${order.id})`,
      message: `${order.customer.fullName} meminta penjemputan unit laptop ${order.laptop.name}. Harap jadwalkan kurir pick-up.`,
      timestamp: new Date().toISOString(),
      read: false,
      orderRef: {
        customerName: order.customer.fullName,
        laptopName: order.laptop.name,
        deliveryMethod: order.deliveryMethod
      }
    };
    saveNotifications([returnNotif, ...notifs]);
  }
};

export const setSimulatedLateHours = (orderId: string, hours: number): void => {
  const orders = getStoredOrders();
  const updated = orders.map(order => {
    if (order.id === orderId) {
      return {
        ...order,
        customLateHoursSimulated: hours
      };
    }
    return order;
  });
  saveOrders(updated);
};

// Admin Notifications
export const getStoredNotifications = (): AdminNotification[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      const initial = getInitialNotifications();
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading notifications:', err);
    return getInitialNotifications();
  }
};

export const saveNotifications = (notifications: AdminNotification[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event('pinjamlaptop_notifications_updated'));
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
};

export const markNotificationAsRead = (notifId: string): void => {
  const notifs = getStoredNotifications();
  const updated = notifs.map(n => n.id === notifId ? { ...n, read: true } : n);
  saveNotifications(updated);
};

export const markAllNotificationsAsRead = (): void => {
  const notifs = getStoredNotifications();
  const updated = notifs.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
};

// Helpers for calculations
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
    // Tarif bulanan proporsional
    const months = Math.floor(durationDays / 30);
    const extraDays = durationDays % 30;
    subtotal = (months * laptop.monthlyPrice) + (extraDays * laptop.dailyPrice * 0.7);
    discount = (durationDays * laptop.dailyPrice) - subtotal;
  } else if (durationDays >= 7) {
    // Tarif mingguan proporsional
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

  // Jika admin belum menekan tombol "Mulai Sewa", jam sewa belum berjalan dan denda belum aktif
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

  // Periksa apakah ada simulasi keterlambatan manual untuk keperluan demo/testing
  let diffMs = now.getTime() - end.getTime();
  if (order.customLateHoursSimulated !== undefined && order.customLateHoursSimulated > 0) {
    diffMs = order.customLateHoursSimulated * 60 * 60 * 1000;
  } else if (order.customLateHoursSimulated === -2) {
    // Simulasi sisa 2 jam (belum terlambat)
    diffMs = -2 * 60 * 60 * 1000;
  }

  // DENDA BERJALAN SAAT MASA SEWA BERAKHIR:
  // Keterlambatan aktif saat diffMs > 0 dan status belum selesai / hangus
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

  // Denda Berjalan Otomatis Saat Masa Sewa Berakhir (Rp 20.000 / jam berjalan)
  const lateHoursExact = diffMs / (1000 * 60 * 60);
  const lateHoursRounded = Math.max(1, Math.ceil(lateHoursExact));
  const hourlyRate = order.laptop.lateFeePerHour || 20000;
  const lateFee = lateHoursRounded * hourlyRate;

  // Waktu Keterlambatan Berjalan Real-time (Hari, Jam, Menit, Detik)
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

/* =========================================================================
   DATABASE MEMBER & AUTHENTICATION (CUSTOMER MEMBER ACCOUNT)
   ========================================================================= */

const MEMBERS_KEY = 'pinjamlaptop_members_v1';

const getInitialMembers = (): CustomerMember[] => {
  return [];
};

export const getStoredMembers = (): CustomerMember[] => {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (!raw) {
      const initial = getInitialMembers();
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Hapus akun contoh lama jika masih tersimpan di local storage
      const cleaned = parsed.filter((m: CustomerMember) => m.memberId !== 'budi_santoso' && m.memberId !== 'ratna_dewi');
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return [];
  } catch (e) {
    console.error('Error reading members:', e);
    return getInitialMembers();
  }
};

export const saveStoredMembers = (members: CustomerMember[]): void => {
  try {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    window.dispatchEvent(new Event('pinjamlaptop_members_updated'));
  } catch (e) {
    console.error('Error saving members:', e);
  }
};

const CUSTOMER_SESSION_KEY = 'pinjamlaptop_customer_session';

export const getStoredCustomerSession = (): CustomerMember | null => {
  try {
    const raw = localStorage.getItem(CUSTOMER_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading customer session:', e);
    return null;
  }
};

export const setStoredCustomerSession = (member: CustomerMember | null): void => {
  try {
    if (!member) {
      localStorage.removeItem(CUSTOMER_SESSION_KEY);
    } else {
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(member));
    }
    window.dispatchEvent(new Event('pinjamlaptop_customer_session_updated'));
  } catch (e) {
    console.error('Error saving customer session:', e);
  }
};

export const logoutCustomer = (): void => {
  setStoredCustomerSession(null);
};

export const getMemberById = (memberId: string): CustomerMember | undefined => {
  const members = getStoredMembers();
  return members.find(m => m.memberId.toLowerCase().trim() === memberId.toLowerCase().trim());
};

export const getMemberByIdOrContact = (identifier: string): CustomerMember | undefined => {
  const members = getStoredMembers();
  const clean = identifier.toLowerCase().trim();
  const cleanPhone = identifier.replace(/[^0-9]/g, '');
  return members.find(m => 
    m.memberId.toLowerCase().trim() === clean ||
    (m.email && m.email.toLowerCase().trim() === clean) ||
    (m.phone && cleanPhone.length >= 8 && m.phone.replace(/[^0-9]/g, '') === cleanPhone)
  );
};

export const authenticateMember = (
  identifier: string, 
  password: string
): { success: boolean; member?: CustomerMember; message: string } => {
  if (!identifier.trim()) {
    return { success: false, message: 'Silakan isi ID Member, Nomor HP, atau Email Anda.' };
  }
  if (!password.trim()) {
    return { success: false, message: 'Silakan masukkan Password Anda.' };
  }

  const member = getMemberByIdOrContact(identifier);
  if (!member) {
    return { 
      success: false, 
      message: `Akun "${identifier}" belum terdaftar. Silakan pilih tab "Daftar Penyewa Baru" untuk membuat akun.` 
    };
  }

  if (member.password !== password) {
    return { 
      success: false, 
      message: 'Password salah. Silakan periksa kembali kata sandi Anda.' 
    };
  }

  // Simpan sesi aktif penyewa
  setStoredCustomerSession(member);

  return { 
    success: true, 
    member, 
    message: `Selamat datang kembali, ${member.fullName}! Anda berhasil masuk.` 
  };
};

export const registerOrUpdateMember = (
  memberData: Omit<CustomerMember, 'registeredAt' | 'totalRentals'> & {
    registeredAt?: string;
    totalRentals?: number;
  }
): CustomerMember => {
  const members = getStoredMembers();
  const existingIndex = members.findIndex(
    m => m.memberId.toLowerCase().trim() === memberData.memberId.toLowerCase().trim()
  );

  if (existingIndex >= 0) {
    const existing = members[existingIndex];
    const updatedMember: CustomerMember = {
      ...existing,
      ...memberData,
      password: memberData.password || existing.password,
      totalRentals: (existing.totalRentals || 0) + 1,
      lastRentalDate: new Date().toISOString()
    };
    members[existingIndex] = updatedMember;
    saveStoredMembers(members);
    return updatedMember;
  } else {
    const newMember: CustomerMember = {
      ...memberData,
      password: memberData.password || '123456',
      registeredAt: new Date().toISOString(),
      lastRentalDate: new Date().toISOString(),
      totalRentals: 1
    };
    members.unshift(newMember);
    saveStoredMembers(members);
    return newMember;
  }
};

/* =========================================================================
   PERPANJANGAN SEWA CUSTOMER & HARGA YANG BERLAKU
   ========================================================================= */

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

export const extendOrderRental = (
  orderId: string,
  additionalDays: number,
  extensionFee: number,
  paymentMethod: string,
  adminNotes?: string,
  adminName: string = 'Hendra Wijaya (Admin Operasional)'
): { success: boolean; message: string; updatedOrder?: RentalOrder } => {
  const orders = getStoredOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) {
    return { success: false, message: `Pesanan ${orderId} tidak ditemukan.` };
  }

  const order = orders[index];
  const prevEndDate = order.endDate;
  const currentEnd = new Date(prevEndDate);
  // Tambahkan durasi perpanjangan
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

  orders[index] = updatedOrder;
  saveOrders(orders);

  // Kirim notifikasi log admin
  const notifs = getStoredNotifications();
  const notif: AdminNotification = {
    id: `notif-ext-${Date.now()}`,
    orderId: order.id,
    type: 'new_order_pickup',
    title: `Perpanjangan Sewa Unit ${order.laptop.name}`,
    message: `Pesanan ${order.id} an. ${order.customer.fullName} diperpanjang +${additionalDays} hari. Pembayaran perpanjangan ${formatRupiah(extensionFee)} masuk.`,
    timestamp: new Date().toISOString(),
    read: false,
    orderRef: {
      customerName: order.customer.fullName,
      laptopName: order.laptop.name,
      deliveryMethod: order.deliveryMethod
    }
  };
  saveNotifications([notif, ...notifs]);

  return { 
    success: true, 
    message: `Perpanjangan sewa customer +${additionalDays} hari berhasil diproses sesuai harga yang berlaku!`, 
    updatedOrder 
  };
};

export const rejectAndCancelOrder = (
  orderId: string,
  reason: string,
  forfeitFunds: boolean,
  adminName: string = 'Hendra Wijaya (Admin Operasional)'
): { success: boolean; message: string } => {
  const orders = getStoredOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) {
    return { success: false, message: `Pesanan ${orderId} tidak ditemukan.` };
  }

  const order = orders[index];
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

  return { 
    success: true, 
    message: forfeitFunds 
      ? `Pesanan ${order.id} ditolak dan dana ${formatRupiah(order.pricing.totalPaid)} dinyatakan HANGUS 100% sesuai klausul!`
      : `Pesanan ${order.id} telah ditolak & dibatalkan.` 
  };
};

/* =========================================================================
   NERACA KEUANGAN YANG MASUK (FINANCIAL BALANCE SHEET & CASH INFLOW LEDGER)
   ========================================================================= */

export const getFinancialLedgerData = (
  ordersList?: RentalOrder[]
): { items: FinancialInflowItem[]; summary: FinancialLedgerSummary } => {
  const orders = ordersList || getStoredOrders();
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
    // 1. Arus Kas Pembayaran Sewa Awal
    if (order.status === 'forfeited_cancelled' && order.paymentStatus === 'forfeited') {
      // Dana Hangus 100%
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
      // Pembayaran Sewa Normal
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

      // Ongkir Kurir jika ada
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

      // Uang Deposit jika ada
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

    // 2. Arus Kas Perpanjangan Sewa (Jika ada)
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

    // 3. Denda Keterlambatan (Jika dihitung)
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

  // Urutkan dari transaksi terbaru
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

/* =========================================================================
   AKSES MASUK ADMINISTRATOR (ADMIN AUTHENTICATION SESSION)
   ========================================================================= */

const ADMIN_SESSION_KEY = 'pinjamlaptop_admin_session_v2';

export const getStoredAdminSession = (): AdminUserSession | null => {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.isAuthenticated) {
      return session;
    }
    return null;
  } catch (err) {
    console.error('Error getting admin session:', err);
    return null;
  }
};

export const saveAdminSession = (session: AdminUserSession | null): void => {
  try {
    if (session) {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    window.dispatchEvent(new Event('pinjamlaptop_admin_auth_updated'));
  } catch (err) {
    console.error('Error saving admin session:', err);
  }
};

export const loginAdmin = (
  usernameInput: string,
  passwordInput: string
): { success: boolean; message: string; session?: AdminUserSession } => {
  const username = usernameInput.toLowerCase().trim();
  const password = passwordInput.trim();

  // Validasi akun utama Petugas & Admin PINJAMLAPTOP.ID
  if (username === 'pinjamlaptopid' && password === 'TBIB20') {
    const session: AdminUserSession = {
      isAuthenticated: true,
      adminId: 'ADM-PL-001',
      name: 'Petugas Administrator',
      role: 'super_admin',
      roleTitle: 'Petugas Operasional & Pengelola Katalog',
      loginTime: new Date().toISOString()
    };
    saveAdminSession(session);
    return { success: true, message: 'Akses masuk Petugas berhasil diverifikasi!', session };
  }

  // Validasi akun administrator resmi Pinjamlaptop
  if ((username === 'admin' || username === 'admin_pinjamlaptop') && (password === 'admin123' || password === 'admin')) {
    const session: AdminUserSession = {
      isAuthenticated: true,
      adminId: 'ADM-001',
      name: 'Hendra Wijaya, S.Kom',
      role: 'super_admin',
      roleTitle: 'Chief Operations & Systems Admin',
      loginTime: new Date().toISOString()
    };
    saveAdminSession(session);
    return { success: true, message: 'Akses masuk Administrator berhasil!', session };
  }

  if (username === 'finance' && (password === 'keuangan123' || password === 'finance123')) {
    const session: AdminUserSession = {
      isAuthenticated: true,
      adminId: 'ADM-FIN-002',
      name: 'Siti Rahmania, S.E.',
      role: 'finance_admin',
      roleTitle: 'Head of Billing & Financial Ledger',
      loginTime: new Date().toISOString()
    };
    saveAdminSession(session);
    return { success: true, message: 'Akses masuk Administrator Keuangan berhasil!', session };
  }

  if (username === 'ops' && password === 'ops123') {
    const session: AdminUserSession = {
      isAuthenticated: true,
      adminId: 'ADM-OPS-003',
      name: 'Bambang Pratama',
      role: 'ops_admin',
      roleTitle: 'Senior Fleet & Hub Coordinator',
      loginTime: new Date().toISOString()
    };
    saveAdminSession(session);
    return { success: true, message: 'Akses masuk Administrator Operasional berhasil!', session };
  }

  return {
    success: false,
    message: 'Username / ID Admin atau Password salah. Silakan periksa kembali atau gunakan akun demo yang tersedia.'
  };
};

export const logoutAdmin = (): void => {
  saveAdminSession(null);
};
