import { 
  Laptop, 
  Customer, 
  FinancialTransaction, 
  DeliveryLog, 
  PettyCashTransaction, 
  Employee, 
  ServiceRecord, 
  UnitMovementLog, 
  PayrollRecord, 
  UserAuthSession,
  BranchCity,
  RentalOrder
} from '../types';
import { 
  INITIAL_BRANCHES, 
  INITIAL_LAPTOPS, 
  INITIAL_CUSTOMERS, 
  INITIAL_EMPLOYEES, 
  INITIAL_SERVICES, 
  INITIAL_DELIVERIES, 
  INITIAL_PETTY_CASH, 
  INITIAL_FINANCIAL_TRANSACTIONS, 
  INITIAL_MOVEMENT_LOGS, 
  INITIAL_PAYROLL,
  INITIAL_RENTAL_ORDERS,
  DEMO_USERS
} from '../data/mockErpData';

const STORAGE_KEYS = {
  LAPTOPS: 'pinjamlaptop_erp_laptops_v1',
  CUSTOMERS: 'pinjamlaptop_erp_customers_v1',
  EMPLOYEES: 'pinjamlaptop_erp_employees_v1',
  SERVICES: 'pinjamlaptop_erp_services_v1',
  DELIVERIES: 'pinjamlaptop_erp_deliveries_v1',
  PETTY_CASH: 'pinjamlaptop_erp_petty_cash_v1',
  FINANCE: 'pinjamlaptop_erp_finance_v1',
  MOVEMENTS: 'pinjamlaptop_erp_movements_v1',
  PAYROLL: 'pinjamlaptop_erp_payroll_v1',
  RENTAL_ORDERS: 'pinjamlaptop_erp_rental_orders_v1',
  SESSION: 'pinjamlaptop_erp_session_v1',
  SELECTED_BRANCH: 'pinjamlaptop_erp_branch_v1'
};

function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

// 1. LAPTOPS
export const getStoredLaptops = (): Laptop[] => safeGetItem<Laptop[]>(STORAGE_KEYS.LAPTOPS, INITIAL_LAPTOPS);
export const saveStoredLaptops = (data: Laptop[]) => safeSetItem(STORAGE_KEYS.LAPTOPS, data);

// 2. CUSTOMERS
export const getStoredCustomers = (): Customer[] => safeGetItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
export const saveStoredCustomers = (data: Customer[]) => safeSetItem(STORAGE_KEYS.CUSTOMERS, data);

// 3. EMPLOYEES
export const getStoredEmployees = (): Employee[] => safeGetItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
export const saveStoredEmployees = (data: Employee[]) => safeSetItem(STORAGE_KEYS.EMPLOYEES, data);

// 4. SERVICES
export const getStoredServices = (): ServiceRecord[] => safeGetItem<ServiceRecord[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
export const saveStoredServices = (data: ServiceRecord[]) => safeSetItem(STORAGE_KEYS.SERVICES, data);

// 5. DELIVERIES (Antar-Jemput 5rb/km)
export const getStoredDeliveries = (): DeliveryLog[] => safeGetItem<DeliveryLog[]>(STORAGE_KEYS.DELIVERIES, INITIAL_DELIVERIES);
export const saveStoredDeliveries = (data: DeliveryLog[]) => safeSetItem(STORAGE_KEYS.DELIVERIES, data);

// 6. PETTY CASH (Kas Kecil)
export const getStoredPettyCash = (): PettyCashTransaction[] => safeGetItem<PettyCashTransaction[]>(STORAGE_KEYS.PETTY_CASH, INITIAL_PETTY_CASH);
export const saveStoredPettyCash = (data: PettyCashTransaction[]) => safeSetItem(STORAGE_KEYS.PETTY_CASH, data);

// 7. FINANCE (Keuangan Toko)
export const getStoredFinance = (): FinancialTransaction[] => safeGetItem<FinancialTransaction[]>(STORAGE_KEYS.FINANCE, INITIAL_FINANCIAL_TRANSACTIONS);
export const saveStoredFinance = (data: FinancialTransaction[]) => safeSetItem(STORAGE_KEYS.FINANCE, data);

// 8. UNIT MOVEMENTS (Keluar-Masuk)
export const getStoredMovements = (): UnitMovementLog[] => safeGetItem<UnitMovementLog[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENT_LOGS);
export const saveStoredMovements = (data: UnitMovementLog[]) => safeSetItem(STORAGE_KEYS.MOVEMENTS, data);

// 9. PAYROLL
export const getStoredPayroll = (): PayrollRecord[] => safeGetItem<PayrollRecord[]>(STORAGE_KEYS.PAYROLL, INITIAL_PAYROLL);
export const saveStoredPayroll = (data: PayrollRecord[]) => safeSetItem(STORAGE_KEYS.PAYROLL, data);

// 10. RENTAL ORDERS (Alur Sewa & SPK Perjanjian)
export const getStoredRentalOrders = (): RentalOrder[] => safeGetItem<RentalOrder[]>(STORAGE_KEYS.RENTAL_ORDERS, INITIAL_RENTAL_ORDERS);
export const saveStoredRentalOrders = (data: RentalOrder[]) => safeSetItem(STORAGE_KEYS.RENTAL_ORDERS, data);

// 11. SESSION & BRANCH SELECTION
export const getStoredSession = (): UserAuthSession => safeGetItem<UserAuthSession>(STORAGE_KEYS.SESSION, DEMO_USERS[0]);
export const saveStoredSession = (data: UserAuthSession) => safeSetItem(STORAGE_KEYS.SESSION, data);

export const getStoredSelectedBranch = (): BranchCity | 'Semua' => safeGetItem<BranchCity | 'Semua'>(STORAGE_KEYS.SELECTED_BRANCH, 'Semua');
export const saveStoredSelectedBranch = (branch: BranchCity | 'Semua') => safeSetItem(STORAGE_KEYS.SELECTED_BRANCH, branch);

// UTILITY FORMATTERS & GENERATORS
export const formatRupiah = (num?: number | null): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num || 0);
};

export const calculateDeliveryFee = (distanceKm: number, ratePerKm = 5000): number => {
  return Math.round(distanceKm * ratePerKm);
};

export const calculateDaysElapsed = (startDateStr: string): number => {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr).getTime();
  const now = new Date().getTime();
  const diffTime = Math.max(0, now - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Generates official Transaction Number required:
// PLIDMLG for Malang, PLIDBKS for Bekasi, PLIDSDA for Sidoarjo
export const getBranchPrefix = (city: BranchCity): string => {
  switch (city) {
    case 'Malang': return 'PLIDMLG';
    case 'Bekasi': return 'PLIDBKS';
    case 'Sidoarjo': return 'PLIDSDA';
    default: return 'PLIDMLG';
  }
};

export const generateRentalTransactionNumber = (city: BranchCity, seqOffset = 1): string => {
  const prefix = getBranchPrefix(city);
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${yy}${mm}${dd}-${randomSuffix}`;
};

// RESET EVERYTHING TO FRESH INITIAL DEMO STATE
export const resetAllErpData = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.LAPTOPS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
  localStorage.removeItem(STORAGE_KEYS.SERVICES);
  localStorage.removeItem(STORAGE_KEYS.DELIVERIES);
  localStorage.removeItem(STORAGE_KEYS.PETTY_CASH);
  localStorage.removeItem(STORAGE_KEYS.FINANCE);
  localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
  localStorage.removeItem(STORAGE_KEYS.PAYROLL);
  localStorage.removeItem(STORAGE_KEYS.RENTAL_ORDERS);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCH);
};
