export type LaptopCategory = 
  | 'Semua' 
  | 'Office'
  | 'Student'
  | 'Creator'
  | 'Gaming'
  | 'Performance'
  | 'Bisnis & Kantor' 
  | 'Programming & Dev' 
  | 'Desain & Render' 
  | 'Gaming & AI';

export type BranchCity = 'Malang' | 'Sidoarjo' | 'Bekasi';

export interface BranchLocationInfo {
  id: string;
  name: string;
  city: BranchCity;
  isPusat?: boolean;
  allowedDomiciles: string[];
}

export interface Laptop {
  id: string;
  sku: string;
  name: string;
  serialNumber?: string;
  brand: string;
  category: string;
  branchCity?: BranchCity; // 'Malang' (Pusat), 'Sidoarjo', 'Bekasi'
  branchHubId?: string;
  themeCategories?: ('Office' | 'Student' | 'Creator' | 'Gaming' | 'Performance')[];
  processor: string;
  specCpu?: string;
  ram: string;
  specRam?: string;
  storage: string;
  specStorage?: string;
  gpu: string;
  display: string;
  weight: string;
  batteryLife: string;
  dailyPrice: number;
  weeklyPrice: number; // Diskon mingguan
  monthlyPrice: number; // Diskon bulanan
  depositAmount: number; // Nominal uang jaminan jika user memilih deposit
  lateFeePerHour: number; // Denda keterlambatan per jam
  image: string;
  availableUnits: number;
  badge?: string;
  hasOledBadge?: boolean;
  includedAccessories: string[];
  description: string;
}

export type GuaranteeType = 'two_identities' | 'cash_deposit';

export type IdentityDocType = 'KTP' | 'SIM' | 'BPKB' | 'Ijazah' | 'KTM';

export type DeliveryMethod = 'self_pickup' | 'delivery';

export type PaymentMethod = 'qris' | 'bca_va' | 'mandiri_va' | 'bri_va' | 'gopay' | 'shopeepay';

export type OrderStatus =
  | 'awaiting_verification'      // Baru bayar, verifikasi berkas oleh admin
  | 'verified_preparing'        // Berkas & pembayaran valid, unit sedang di-QC
  | 'ready_for_pickup'          // Unit siap diambil di Store Hub Pinjamlaptop
  | 'in_delivery'               // Unit sedang diantar oleh kurir Pinjamlaptop
  | 'active_rental'             // Unit telah diterima & masa sewa aktif berjalan
  | 'return_pickup_requested'   // Customer request jemput unit untuk pengembalian
  | 'return_in_transit'         // Kurir sedang menjemput unit
  | 'completed'                 // Unit sudah kembali, diinspeksi, selesai
  | 'forfeited_cancelled';      // Identitas/deposit tidak sesuai -> Dana Hangus 100%

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface CustomerInfo {
  fullName: string;
  idCardNumber?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district?: string;
  notes?: string;
}

export interface IdentityDocs {
  doc1Type: IdentityDocType;
  doc1Number: string;
  doc1HolderName: string;
  doc1FileName?: string;
  doc2Type: IdentityDocType;
  doc2Number: string;
  doc2HolderName: string;
  doc2FileName?: string;
}

export interface RentalPricing {
  dailyRate: number;
  durationDays: number;
  subtotalRental: number;
  discount: number;
  deliveryFee: number;
  depositFee: number; // 0 jika pakai 2 identitas
  totalPaid: number;
}

export interface CourierInfo {
  name: string;
  phone: string;
  vehicle: string;
  vehiclePlate: string;
  trackingCode: string;
  estimatedDeliveryTime?: string;
}

export interface ReturnPickupRequest {
  requestedAt: string;
  pickupAddress: string;
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string;
  assignedCourier?: string;
  status: 'pending_dispatch' | 'courier_assigned' | 'completed';
}

export interface OrderLog {
  id: string;
  timestamp: string;
  actor: 'system' | 'customer' | 'admin';
  title: string;
  message: string;
}

export interface CustomerMember {
  memberId: string; // ID Baru / ID Member
  password: string; // Password akun member
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes?: string;
  deliveryMethod?: DeliveryMethod;
  preferredHub?: string;
  guaranteeType: GuaranteeType;
  doc1Type?: IdentityDocType;
  doc1Number?: string;
  doc1HolderName?: string;
  doc2Type?: IdentityDocType;
  doc2Number?: string;
  doc2HolderName?: string;
  emergency1Name?: string;
  emergency1Relation?: string;
  emergency1Phone?: string;
  emergency2Name?: string;
  emergency2Relation?: string;
  emergency2Phone?: string;
  registeredAt: string;
  lastRentalDate?: string;
  totalRentals: number;
}

export interface RentalExtension {
  id: string;
  extendedAt: string;
  additionalDays: number;
  previousEndDate: string;
  newEndDate: string;
  extensionFee: number;
  paymentMethod: string;
  adminNotes?: string;
  processedByAdmin: string;
}

export interface AdminUserSession {
  isAuthenticated: boolean;
  adminId: string;
  name: string;
  role: 'super_admin' | 'finance_admin' | 'ops_admin';
  roleTitle: string;
  avatar?: string;
  loginTime: string;
}

export interface FinancialInflowItem {
  id: string;
  orderId: string;
  timestamp: string;
  customerName: string;
  laptopName: string;
  category: 'rental_fee' | 'extension_fee' | 'deposit' | 'delivery_fee' | 'late_fee' | 'forfeited';
  categoryLabel: string;
  amount: number;
  paymentMethod: string;
  status: 'received' | 'held_deposit' | 'refunded_deposit' | 'forfeited';
  notes?: string;
}

export interface FinancialLedgerSummary {
  grossInflow: number;
  netRentalRevenue: number;
  extensionRevenue: number;
  activeDepositsHeld: number;
  refundedDeposits: number;
  forfeitedRevenue: number;
  deliveryFeesCollected: number;
  lateFeesCollected: number;
  totalTransactionsCount: number;
}

export interface RentalOrder {
  id: string; // e.g. PL-8921-JKT
  createdAt: string;
  memberId?: string; // ID Member penyewa yang terdaftar di database
  laptop: Laptop;
  customer: CustomerInfo;
  durationDays: number;
  startDate: string; // ISO string
  endDate: string;   // ISO string (target waktu pengembalian)
  deliveryMethod: DeliveryMethod;
  storeLocation?: string; // Jika self-pickup
  deliveryAddress?: string; // Jika delivery
  guaranteeType: GuaranteeType;
  identityDocs?: IdentityDocs;
  depositAmount?: number;
  emergencyContacts: [EmergencyContact, EmergencyContact];
  warningAgreed100PercentForfeited: boolean; // Klausul hangus 100%
  agreementReadAndAcknowledged?: boolean; // Wajib dibaca dan dicentang diketahui secara sadar
  agreementAcknowledgedAt?: string; // Timestamp persetujuan sadar
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'forfeited';
  pricing: RentalPricing;
  status: OrderStatus;
  rentalStartedAt?: string; // Timestamp ISO saat admin menekan tombol "Mulai Sewa"
  pickupPinCode?: string; // Kode PIN 6 digit untuk ambil di store
  courierInfo?: CourierInfo;
  returnPickupRequest?: ReturnPickupRequest;
  customLateHoursSimulated?: number; // Untuk simulasi pengujian denda
  adminNotes?: string;
  cancellationReason?: string;
  extensions?: RentalExtension[]; // Riwayat perpanjangan sewa oleh admin
  logs: OrderLog[];
}

export interface AdminNotification {
  id: string;
  orderId: string;
  type: 'new_order_pickup' | 'new_order_delivery' | 'return_pickup_request' | 'late_warning' | 'forfeit_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderRef: {
    customerName: string;
    laptopName: string;
    deliveryMethod: DeliveryMethod;
  };
}
