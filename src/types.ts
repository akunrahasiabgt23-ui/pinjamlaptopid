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

export type LaptopUnitStatus = 'ready' | 'rented' | 'trouble';

export interface Laptop {
  id: string;
  sku: string;
  name: string;
  serialNumber?: string;
  brand: string;
  category: string;
  status?: LaptopUnitStatus; // 'ready' | 'rented' | 'trouble'
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
  weeklyPrice: number;
  monthlyPrice: number;
  depositAmount: number;
  lateFeePerHour: number;
  image: string;
  availableUnits: number;
  badge?: string;
  hasOledBadge?: boolean;
  includedAccessories: string[];
  description: string;
  currentRenterName?: string;
  currentOrderId?: string;
  troubleDescription?: string;
  serviceId?: string;
  [key: string]: any;
}

export type CustomerReputation = 'good' | 'warning' | 'blacklist';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: BranchCity | string;
  companyOrCampus?: string;
  idCardType: 'KTP' | 'SIM' | 'KTM' | 'Paspor';
  idCardNumber: string;
  idCardPhotoUrl: string;
  secondIdType: 'SIM' | 'KTM' | 'BPKB' | 'Kartu Pegawai' | 'KK';
  secondIdNumber: string;
  secondIdPhotoUrl: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  reputation: CustomerReputation;
  totalRentals: number;
  activeRentalCount: number;
  notes?: string;
  createdAt: string;
  [key: string]: any;
}

export type FinanceCategory = 
  | 'sewa' 
  | 'antar_jemput' 
  | 'denda' 
  | 'operasional_toko' 
  | 'petty_cash_topup' 
  | 'petty_cash_expense' 
  | 'payroll' 
  | 'servis_sparepart'
  | 'lainnya';

export interface FinancialTransaction {
  id: string;
  date: string;
  time?: string;
  branchCity: BranchCity;
  type: 'income' | 'expense';
  category: FinanceCategory;
  title: string;
  amount: number;
  paymentMethod: 'cash' | 'transfer_bank' | 'qris';
  referenceId?: string;
  customerOrPayee?: string;
  recordedBy: string;
  notes?: string;
  [key: string]: any;
}

export interface DeliveryLog {
  id: string;
  orderId?: string;
  branchCity: BranchCity;
  date: string;
  customerName: string;
  customerPhone: string;
  destinationAddress: string;
  tripType: 'antar' | 'jemput' | 'antar_jemput';
  distanceKm: number;
  ratePerKm: number; // 5000
  totalFee: number;
  courierName: string;
  courierId?: string;
  status: 'menunggu_driver' | 'dalam_perjalanan' | 'sampai_tujuan' | 'selesai' | 'dibatalkan';
  paymentStatus: 'lunas' | 'belum_bayar';
  notes?: string;
  createdAt: string;
  [key: string]: any;
}

export interface PettyCashTransaction {
  id: string;
  branchCity: BranchCity;
  date: string;
  type: 'masuk' | 'keluar';
  category: 'atk' | 'kebersihan' | 'konsumsi' | 'alat_teknisi' | 'bensin_darurat' | 'topup_kas_kecil' | 'lainnya';
  title: string;
  amount: number;
  recipientOrPayer: string;
  receiptPhotoUrl?: string;
  recordedBy: string;
  notes?: string;
  [key: string]: any;
}

export type EmployeeRole = 
  | 'super_admin' 
  | 'branch_manager' 
  | 'technician' 
  | 'courier' 
  | 'finance' 
  | 'staff';

export interface Employee {
  id: string;
  nip: string;
  name: string;
  branchCity: BranchCity;
  role: EmployeeRole;
  positionTitle: string;
  phone: string;
  email: string;
  joinDate: string;
  baseSalary: number;
  allowanceTransport: number;
  allowanceMeal: number;
  status: 'aktif' | 'cuti' | 'nonaktif';
  bankName?: string;
  bankAccountNumber?: string;
  completedRepairsCount?: number;
  completedDeliveriesCount?: number;
  [key: string]: any;
}

export type ServiceStatus = 
  | 'internal_queue'
  | 'internal_repair'
  | 'waiting_sparepart'
  | 'external_vendor'
  | 'testing_qc'
  | 'completed'
  | 'cancelled';

export interface ServiceRecord {
  id: string;
  laptopId: string;
  laptopName: string;
  laptopSku: string;
  laptopSerialNumber?: string;
  branchCity: BranchCity;
  issueDescription: string;
  status: ServiceStatus;
  receivedDate: string;
  technicianId?: string;
  technicianName?: string;
  internalStartedDate?: string;
  internalDaysElapsed: number;
  isInternalOverdue: boolean;
  isExternal: boolean;
  externalVendorName?: string;
  externalVendorPhone?: string;
  externalVendorAddress?: string;
  externalSentDate?: string;
  externalDaysElapsed?: number;
  isExternalOverdue?: boolean;
  externalEstimatedCost?: number;
  externalTrackingNumber?: string;
  actionsTaken?: string;
  sparepartReplaced?: string;
  sparepartCost: number;
  serviceFee: number;
  totalCost: number;
  completedDate?: string;
  testedBy?: string;
  notes?: string;
  [key: string]: any;
}

export interface UnitMovementLog {
  id: string;
  laptopId: string;
  laptopName: string;
  laptopSku: string;
  branchCity: BranchCity;
  movementType: 'out_rental' | 'in_return';
  orderId: string;
  customerName: string;
  customerPhone: string;
  timestamp: string;
  staffName: string;
  chargerIncluded: boolean;
  bagIncluded: boolean;
  mouseIncluded: boolean;
  physicalConditionNotes: string;
  lateFeeApplied?: number;
  damageFineApplied?: number;
  finePaymentStatus?: 'lunas' | 'belum_bayar' | 'tidak_ada';
  receiptSignName?: string;
  [key: string]: any;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNip: string;
  employeeRole: EmployeeRole;
  positionTitle: string;
  branchCity: BranchCity;
  periodMonthYear: string;
  baseSalary: number;
  allowanceTransport: number;
  allowanceMeal: number;
  deliveryIncentive: number;
  serviceIncentive: number;
  deductions: number;
  netSalary: number;
  paymentStatus: 'draft' | 'paid';
  paidDate?: string;
  paymentMethod?: 'transfer_bank' | 'cash';
  notes?: string;
  [key: string]: any;
}

export interface UserAuthSession {
  isAuthenticated: boolean;
  userId: string;
  username: string;
  name: string;
  role: EmployeeRole;
  roleTitle: string;
  branchCity: BranchCity | 'Semua';
  avatar?: string;
  [key: string]: any;
}

export type RentalDurationType = '1_hari' | '7_hari' | '30_hari' | 'custom';
export type GuaranteeOptionType = 'two_identities' | 'cash_deposit';

export type RentalOrder = any;

// ========================================================
// Compatibility Types for Legacy Components (Any-Enabled)
// ========================================================
export type AdminUserSession = any;
export type CustomerMember = any;
export type GuaranteeType = any;
export type IdentityDocType = any;
export type DeliveryMethod = any;
export type PaymentMethod = any;
export type OrderStatus = any;
export type ReturnPickupRequest = any;
export type RentalExtension = any;
export type OrderLog = any;
export type CourierInfo = any;
export type AdminNotification = any;
export type FinancialInflowItem = any;
export type FinancialLedgerSummary = any;
