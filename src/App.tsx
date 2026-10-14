import React, { useState, useEffect } from 'react';
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
} from './types';
import {
  getStoredLaptops, saveStoredLaptops,
  getStoredCustomers, saveStoredCustomers,
  getStoredEmployees, saveStoredEmployees,
  getStoredServices, saveStoredServices,
  getStoredDeliveries, saveStoredDeliveries,
  getStoredPettyCash, saveStoredPettyCash,
  getStoredFinance, saveStoredFinance,
  getStoredMovements, saveStoredMovements,
  getStoredPayroll, saveStoredPayroll,
  getStoredRentalOrders, saveStoredRentalOrders,
  getStoredSession, saveStoredSession,
  getStoredSelectedBranch, saveStoredSelectedBranch,
  resetAllErpData,
  calculateDaysElapsed
} from './utils/erpStorage';

// Component Modules
import { ErpNavbar } from './components/erp/ErpNavbar';
import { DashboardOverview } from './components/erp/DashboardOverview';
import { RentalOrdersManager } from './components/erp/RentalOrdersManager';
import { RentalWorkflowModal } from './components/erp/RentalWorkflowModal';
import { LaptopsManager } from './components/erp/LaptopsManager';
import { CustomersManager } from './components/erp/CustomersManager';
import { DeliveryManager } from './components/erp/DeliveryManager';
import { PettyCashManager } from './components/erp/PettyCashManager';
import { TechnicianServiceManager } from './components/erp/TechnicianServiceManager';
import { UnitMovementsManager } from './components/erp/UnitMovementsManager';
import { GeneralFinanceManager } from './components/erp/GeneralFinanceManager';
import { EmployeesManager } from './components/erp/EmployeesManager';
import { PayrollManager } from './components/erp/PayrollManager';
import { AuthModal } from './components/erp/AuthModal';

export default function App() {
  // Navigation & Session State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedBranch, setSelectedBranch] = useState<BranchCity | 'Semua'>(() => getStoredSelectedBranch());
  const [session, setSession] = useState<UserAuthSession>(() => getStoredSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Core Data States
  const [laptops, setLaptops] = useState<Laptop[]>(() => getStoredLaptops());
  const [customers, setCustomers] = useState<Customer[]>(() => getStoredCustomers());
  const [employees, setEmployees] = useState<Employee[]>(() => getStoredEmployees());
  const [services, setServices] = useState<ServiceRecord[]>(() => getStoredServices());
  const [deliveries, setDeliveries] = useState<DeliveryLog[]>(() => getStoredDeliveries());
  const [pettyCash, setPettyCash] = useState<PettyCashTransaction[]>(() => getStoredPettyCash());
  const [finance, setFinance] = useState<FinancialTransaction[]>(() => getStoredFinance());
  const [movements, setMovements] = useState<UnitMovementLog[]>(() => getStoredMovements());
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => getStoredPayroll());
  const [rentalOrders, setRentalOrders] = useState<RentalOrder[]>(() => getStoredRentalOrders());

  // Modal State for New Rental Workflow
  const [isRentalModalOpen, setIsRentalModalOpen] = useState<boolean>(false);
  const [preSelectedLaptop, setPreSelectedLaptop] = useState<Laptop | null>(null);
  const [preSelectedCustomer, setPreSelectedCustomer] = useState<Customer | null>(null);

  // Save to persistent storage upon state changes
  const handleSaveLaptops = (updated: Laptop[]) => {
    setLaptops(updated);
    saveStoredLaptops(updated);
  };

  const handleSaveCustomers = (updated: Customer[]) => {
    setCustomers(updated);
    saveStoredCustomers(updated);
  };

  const handleSaveEmployees = (updated: Employee[]) => {
    setEmployees(updated);
    saveStoredEmployees(updated);
  };

  const handleSaveServices = (updated: ServiceRecord[]) => {
    setServices(updated);
    saveStoredServices(updated);
  };

  const handleSaveDeliveries = (updated: DeliveryLog[]) => {
    setDeliveries(updated);
    saveStoredDeliveries(updated);
  };

  const handleSavePettyCash = (updated: PettyCashTransaction[]) => {
    setPettyCash(updated);
    saveStoredPettyCash(updated);
  };

  const handleSaveFinance = (updated: FinancialTransaction[]) => {
    setFinance(updated);
    saveStoredFinance(updated);
  };

  const handleSaveMovements = (updated: UnitMovementLog[]) => {
    setMovements(updated);
    saveStoredMovements(updated);
  };

  const handleSavePayroll = (updated: PayrollRecord[]) => {
    setPayrollRecords(updated);
    saveStoredPayroll(updated);
  };

  const handleSaveRentalOrders = (updated: RentalOrder[]) => {
    setRentalOrders(updated);
    saveStoredRentalOrders(updated);
  };

  const handleOpenRentalModal = (preLaptop?: Laptop, preCustomer?: Customer) => {
    setPreSelectedLaptop(preLaptop || null);
    setPreSelectedCustomer(preCustomer || null);
    setIsRentalModalOpen(true);
  };

  const handleCompleteRental = (data: {
    order: RentalOrder;
    updatedLaptop: Laptop;
    savedCustomer: Customer;
    movementLog: UnitMovementLog;
    financeTransaction: FinancialTransaction;
    deliveryLog?: DeliveryLog;
  }) => {
    // 1. Add order to rental orders list
    const nextOrders = [data.order, ...rentalOrders];
    handleSaveRentalOrders(nextOrders);

    // 2. Mark laptop status as 'rented' and set current renter
    const nextLaptops = laptops.map(l => l.id === data.updatedLaptop.id ? data.updatedLaptop : l);
    handleSaveLaptops(nextLaptops);

    // 3. Update or save customer details
    const existingCustIdx = customers.findIndex(c => c.id === data.savedCustomer.id);
    let nextCustomers: Customer[];
    if (existingCustIdx >= 0) {
      nextCustomers = [...customers];
      nextCustomers[existingCustIdx] = data.savedCustomer;
    } else {
      nextCustomers = [data.savedCustomer, ...customers];
    }
    handleSaveCustomers(nextCustomers);

    // 4. Record unit movement out
    const nextMovements = [data.movementLog, ...movements];
    handleSaveMovements(nextMovements);

    // 5. Record income in financial ledger under 'sewa'
    const nextFinance = [data.financeTransaction, ...finance];
    handleSaveFinance(nextFinance);

    // 6. Record delivery order if delivery service chosen
    if (data.deliveryLog) {
      const nextDeliveries = [data.deliveryLog, ...deliveries];
      handleSaveDeliveries(nextDeliveries);
    }

    // Switch view to rentals to see the newly generated order & print SPK
    setCurrentTab('rentals');
  };

  const handleSelectBranch = (branch: BranchCity | 'Semua') => {
    setSelectedBranch(branch);
    saveStoredSelectedBranch(branch);
  };

  const handleSwitchUser = (newSession: UserAuthSession) => {
    setSession(newSession);
    saveStoredSession(newSession);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh database ERP ke kondisi demo awal?')) {
      resetAllErpData();
      window.location.reload();
    }
  };

  // Real-time Service SLA Overdue Calculations (Pillar 8)
  const overdueInternalCount = services.filter(s => {
    if (s.status !== 'internal_repair') return false;
    const days = s.internalStartedDate ? calculateDaysElapsed(s.internalStartedDate) : s.internalDaysElapsed;
    return days >= 7;
  }).length;

  const overdueExternalCount = services.filter(s => {
    if (s.status !== 'external_vendor') return false;
    const days = s.externalSentDate ? calculateDaysElapsed(s.externalSentDate) : (s.externalDaysElapsed || 0);
    return days >= 14;
  }).length;

  const troubleLaptopCount = laptops.filter(l => l.status === 'trouble').length;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 font-sans antialiased flex flex-col">
      {/* Top Main Navbar */}
      <ErpNavbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedBranch={selectedBranch}
        onSelectBranch={handleSelectBranch}
        session={session}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        overdueInternalCount={overdueInternalCount}
        overdueExternalCount={overdueExternalCount}
        troubleLaptopCount={troubleLaptopCount}
        onOpenRentalModal={() => handleOpenRentalModal()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-16">
        {currentTab === 'dashboard' && (
          <DashboardOverview
            laptops={laptops}
            services={services}
            deliveries={deliveries}
            pettyCash={pettyCash}
            finance={finance}
            customers={customers}
            rentalOrders={rentalOrders}
            selectedBranch={selectedBranch}
            onNavigateTab={setCurrentTab}
            overdueInternalCount={overdueInternalCount}
            overdueExternalCount={overdueExternalCount}
            onOpenRentalModal={() => handleOpenRentalModal()}
          />
        )}

        {currentTab === 'rentals' && (
          <RentalOrdersManager
            orders={rentalOrders}
            onSaveOrders={handleSaveRentalOrders}
            laptops={laptops}
            onSaveLaptops={handleSaveLaptops}
            movements={movements}
            onSaveMovements={handleSaveMovements}
            finance={finance}
            onSaveFinance={handleSaveFinance}
            selectedBranch={selectedBranch}
            session={session}
            onOpenNewRental={(laptop) => handleOpenRentalModal(laptop)}
          />
        )}

        {currentTab === 'laptops' && (
          <LaptopsManager
            laptops={laptops}
            onSaveLaptops={handleSaveLaptops}
            selectedBranch={selectedBranch}
            onNavigateToService={(laptop) => {
              setCurrentTab('services');
            }}
            onOpenRentalModal={(laptop) => handleOpenRentalModal(laptop)}
          />
        )}

        {currentTab === 'movements' && (
          <UnitMovementsManager
            movements={movements}
            onSaveMovements={handleSaveMovements}
            laptops={laptops}
            onSaveLaptops={handleSaveLaptops}
            customers={customers}
            employees={employees}
            selectedBranch={selectedBranch}
          />
        )}

        {currentTab === 'services' && (
          <TechnicianServiceManager
            services={services}
            onSaveServices={handleSaveServices}
            laptops={laptops}
            onSaveLaptops={handleSaveLaptops}
            technicians={employees}
            selectedBranch={selectedBranch}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersManager
            customers={customers}
            onSaveCustomers={handleSaveCustomers}
            selectedBranch={selectedBranch}
            onOpenRentalModal={(customer) => handleOpenRentalModal(undefined, customer)}
          />
        )}

        {currentTab === 'deliveries' && (
          <DeliveryManager
            deliveries={deliveries}
            onSaveDeliveries={handleSaveDeliveries}
            selectedBranch={selectedBranch}
            couriers={employees}
          />
        )}

        {currentTab === 'finance' && (
          <GeneralFinanceManager
            transactions={finance}
            onSaveTransactions={handleSaveFinance}
            selectedBranch={selectedBranch}
          />
        )}

        {currentTab === 'petty_cash' && (
          <PettyCashManager
            transactions={pettyCash}
            onSaveTransactions={handleSavePettyCash}
            selectedBranch={selectedBranch}
          />
        )}

        {currentTab === 'employees' && (
          <EmployeesManager
            employees={employees}
            onSaveEmployees={handleSaveEmployees}
            selectedBranch={selectedBranch}
          />
        )}

        {currentTab === 'payroll' && (
          <PayrollManager
            payrollRecords={payrollRecords}
            onSavePayroll={handleSavePayroll}
            employees={employees}
            selectedBranch={selectedBranch}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e2d8] bg-white/80 backdrop-blur-xs py-3 px-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-medium text-stone-700">
            PINJAMLAPTOP ERP &bull; Manajemen Bisnis Sewa Laptop
          </div>
          <div className="text-[11px] text-stone-400 font-mono">
            Malang (Pusat) &bull; Sidoarjo &bull; Bekasi &bull; Logistik Rp 5.000/km &bull; SLA Servis 7/14 Hari
          </div>
        </div>
      </footer>

      {/* Modal Alur Sewa Baru (Pilih Unit, Data Penyewa, Jaminan/Deposit, Verifikasi & Cetak SPK) */}
      <RentalWorkflowModal
        isOpen={isRentalModalOpen}
        onClose={() => {
          setIsRentalModalOpen(false);
          setPreSelectedLaptop(null);
          setPreSelectedCustomer(null);
        }}
        laptops={laptops}
        customers={customers}
        selectedBranch={selectedBranch}
        preSelectedLaptop={preSelectedLaptop}
        preSelectedCustomer={preSelectedCustomer}
        session={session}
        onCompleteRental={handleCompleteRental}
      />

      {/* Authentication & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleSwitchUser}
      />
    </div>
  );
}
