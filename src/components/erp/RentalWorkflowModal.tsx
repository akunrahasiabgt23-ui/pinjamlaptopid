import React, { useState, useEffect, useMemo } from 'react';
import { 
  Laptop, 
  Customer, 
  RentalOrder, 
  BranchCity, 
  RentalDurationType, 
  GuaranteeOptionType,
  UnitMovementLog,
  FinancialTransaction,
  DeliveryLog,
  UserAuthSession
} from '../../types';
import { 
  formatRupiah, 
  generateRentalTransactionNumber,
  calculateDeliveryFee 
} from '../../utils/erpStorage';
import { RentalContractPrintView } from './RentalContractPrintView';
import { 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Laptop as LaptopIcon, 
  Calendar, 
  CreditCard, 
  Truck, 
  AlertCircle, 
  X, 
  Printer, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Upload,
  Copy
} from 'lucide-react';

interface RentalWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  laptops: Laptop[];
  customers: Customer[];
  selectedBranch: BranchCity | 'Semua';
  preSelectedLaptop?: Laptop | null;
  preSelectedCustomer?: Customer | null;
  session: UserAuthSession;
  onCompleteRental: (data: {
    order: RentalOrder;
    updatedLaptop: Laptop;
    savedCustomer: Customer;
    movementLog: UnitMovementLog;
    financeTransaction: FinancialTransaction;
    deliveryLog?: DeliveryLog;
  }) => void;
}

export const RentalWorkflowModal: React.FC<RentalWorkflowModalProps> = ({
  isOpen,
  onClose,
  laptops,
  customers,
  selectedBranch,
  preSelectedLaptop,
  preSelectedCustomer,
  session,
  onCompleteRental
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Active branch for transaction
  const activeBranch: BranchCity = useMemo(() => {
    if (preSelectedLaptop?.branchCity) return preSelectedLaptop.branchCity;
    if (selectedBranch !== 'Semua') return selectedBranch;
    return 'Malang'; // Default Malang Pusat
  }, [preSelectedLaptop, selectedBranch]);

  // Form State - Step 1: Laptop & Duration
  const [selectedLaptopId, setSelectedLaptopId] = useState<string>('');
  const [durationType, setDurationType] = useState<RentalDurationType>('7_hari');
  const [customDays, setCustomDays] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [chargerIncluded, setChargerIncluded] = useState(true);
  const [bagIncluded, setBagIncluded] = useState(true);
  const [mouseIncluded, setMouseIncluded] = useState(true);
  const [physicalNotes, setPhysicalNotes] = useState('Kondisi fisik mulus, keyboard dan layar berfungsi normal');
  
  // Delivery option
  const [deliveryOption, setDeliveryOption] = useState<'pickup_store' | 'delivery_address'>('pickup_store');
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number>(5);

  // Form State - Step 2: Customer & Guarantee
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedExistingCustomerId, setSelectedExistingCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [ktpAddress, setKtpAddress] = useState('');
  const [domicileAddress, setDomicileAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('Keluarga');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [socialMedia, setSocialMedia] = useState('');

  // Jaminan (2 ID atau Deposit Uang Senilai Unit)
  const [guaranteeType, setGuaranteeType] = useState<GuaranteeOptionType>('two_identities');
  const [firstIdType, setFirstIdType] = useState<'KTP' | 'Paspor'>('KTP');
  const [firstIdNumber, setFirstIdNumber] = useState('');
  const [firstIdPhotoUrl, setFirstIdPhotoUrl] = useState('https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80');
  const [secondIdType, setSecondIdType] = useState<'SIM' | 'KK' | 'KTM' | 'BPKB' | 'Kartu Pegawai'>('SIM');
  const [secondIdNumber, setSecondIdNumber] = useState('');
  const [secondIdPhotoUrl, setSecondIdPhotoUrl] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80');
  const [depositAmount, setDepositAmount] = useState<number>(8500000);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer_bank' | 'qris'>('transfer_bank');
  const [paymentStatus, setPaymentStatus] = useState<'lunas' | 'belum_bayar'>('lunas');

  // Generated Official Transaction Number (PLIDMLG... / PLIDBKS... / PLIDSDA...)
  const [transactionNumber, setTransactionNumber] = useState('');

  // Print view state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDocType, setPrintDocType] = useState<'contract' | 'handover_form'>('contract');
  const [completedOrder, setCompletedOrder] = useState<RentalOrder | null>(null);

  // Initialize or prefill data
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const readyLaptops = laptops.filter(l => l.status === 'ready');
      if (preSelectedLaptop) {
        setSelectedLaptopId(preSelectedLaptop.id);
      } else if (readyLaptops.length > 0) {
        setSelectedLaptopId(readyLaptops[0].id);
      }

      if (preSelectedCustomer) {
        setCustomerName(preSelectedCustomer.name);
        setKtpAddress(preSelectedCustomer.address);
        setDomicileAddress(preSelectedCustomer.address);
        setPhone(preSelectedCustomer.phone);
        setEmergencyContactName(preSelectedCustomer.emergencyContactName);
        setEmergencyContactRelation(preSelectedCustomer.emergencyContactRelation);
        setEmergencyContactPhone(preSelectedCustomer.emergencyContactPhone);
        setFirstIdNumber(preSelectedCustomer.idCardNumber);
        setFirstIdType(preSelectedCustomer.idCardType === 'Paspor' ? 'Paspor' : 'KTP');
        setSecondIdNumber(preSelectedCustomer.secondIdNumber || 'SIM-88912');
        setSecondIdType(preSelectedCustomer.secondIdType || 'SIM');
      }

      // Generate initial transaction number for the branch
      const generated = generateRentalTransactionNumber(activeBranch);
      setTransactionNumber(generated);
    }
  }, [isOpen, preSelectedLaptop, preSelectedCustomer, activeBranch, laptops]);

  // Selected laptop object
  const currentLaptop = useMemo(() => {
    return laptops.find(l => l.id === selectedLaptopId) || laptops[0];
  }, [laptops, selectedLaptopId]);

  // Update deposit default when laptop changes
  useEffect(() => {
    if (currentLaptop) {
      const estimatedValue = currentLaptop.depositAmount ? currentLaptop.depositAmount * 7 : 9500000;
      setDepositAmount(estimatedValue);
    }
  }, [currentLaptop]);

  // Duration days calculation
  const totalDays = useMemo(() => {
    if (durationType === '1_hari') return 1;
    if (durationType === '7_hari') return 7;
    if (durationType === '30_hari') return 30;
    return Math.max(1, customDays);
  }, [durationType, customDays]);

  // End date calculation
  const calculatedEndDate = useMemo(() => {
    const s = new Date(startDate);
    s.setDate(s.getDate() + totalDays);
    return s.toISOString().split('T')[0];
  }, [startDate, totalDays]);

  // Total price calculation
  const totalRentalCost = useMemo(() => {
    if (!currentLaptop) return 0;
    if (durationType === '1_hari') return currentLaptop.dailyPrice;
    if (durationType === '7_hari') return currentLaptop.weeklyPrice || (currentLaptop.dailyPrice * 6);
    if (durationType === '30_hari') return currentLaptop.monthlyPrice || (currentLaptop.dailyPrice * 22);
    // Custom calculation with fair tiered pricing
    if (totalDays < 7) {
      return totalDays * currentLaptop.dailyPrice;
    } else if (totalDays < 30) {
      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      return (weeks * currentLaptop.weeklyPrice) + (remainingDays * currentLaptop.dailyPrice);
    } else {
      const months = Math.floor(totalDays / 30);
      const remainingDays = totalDays % 30;
      return (months * currentLaptop.monthlyPrice) + (remainingDays * currentLaptop.dailyPrice);
    }
  }, [currentLaptop, durationType, totalDays]);

  const deliveryFee = deliveryOption === 'delivery_address' ? calculateDeliveryFee(deliveryDistanceKm) : 0;
  const grandTotalCost = totalRentalCost + deliveryFee;

  // Autocomplete existing customer
  const handleSelectExistingCustomer = (c: Customer) => {
    setSelectedExistingCustomerId(c.id);
    setCustomerName(c.name);
    setKtpAddress(c.address);
    setDomicileAddress(c.address);
    setPhone(c.phone);
    setEmergencyContactName(c.emergencyContactName);
    setEmergencyContactRelation(c.emergencyContactRelation);
    setEmergencyContactPhone(c.emergencyContactPhone);
    setFirstIdNumber(c.idCardNumber);
    setFirstIdType(c.idCardType === 'Paspor' ? 'Paspor' : 'KTP');
    if (c.secondIdNumber) {
      setSecondIdNumber(c.secondIdNumber);
      setSecondIdType(c.secondIdType || 'SIM');
    }
    setCustomerSearch('');
  };

  const handleCopyKtpToDomicile = () => {
    setDomicileAddress(ktpAddress);
  };

  // Validation before going to verification step
  const validateStep2 = () => {
    if (!customerName.trim()) return 'Nama lengkap penyewa wajib diisi';
    if (!ktpAddress.trim()) return 'Alamat sesuai KTP wajib diisi';
    if (!domicileAddress.trim()) return 'Alamat domisili saat ini wajib diisi';
    if (!phone.trim()) return 'Nomor HP/WhatsApp penyewa wajib diisi';
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      return 'Kontak darurat (nama & telepon) wajib diisi';
    }
    if (guaranteeType === 'two_identities') {
      if (!firstIdNumber.trim() || !secondIdNumber.trim()) {
        return 'Kedua nomor identitas jaminan (ID 1 & ID 2) wajib diisi';
      }
    } else {
      if (!depositAmount || depositAmount <= 0) {
        return 'Nominal deposit uang tunai senilai harga unit wajib diisi';
      }
    }
    return null;
  };

  // Build the complete RentalOrder object
  const buildCurrentOrder = (): RentalOrder => {
    const unitEst = currentLaptop?.depositAmount ? currentLaptop.depositAmount * 7 : 9500000;
    return {
      id: `ord-${Date.now()}`,
      transactionNumber: transactionNumber || generateRentalTransactionNumber(activeBranch),
      branchCity: activeBranch,
      createdAt: new Date().toISOString().split('T')[0],
      startDate,
      endDate: calculatedEndDate,
      durationOption: durationType,
      durationDays: totalDays,
      laptopId: currentLaptop?.id || '',
      laptopSku: currentLaptop?.sku || '',
      laptopName: currentLaptop?.name || '',
      laptopBrand: currentLaptop?.brand || '',
      processor: currentLaptop?.processor || '',
      ram: currentLaptop?.ram || '',
      storage: currentLaptop?.storage || '',
      gpu: currentLaptop?.gpu || '',
      serialNumber: currentLaptop?.serialNumber || 'SN-VERIFIED-UNIT',
      unitValueEstimate: unitEst,
      rentalRatePerDay: currentLaptop?.dailyPrice || 150000,
      totalRentalPrice: grandTotalCost,
      paymentMethod,
      paymentStatus,
      guaranteeType,
      firstIdType,
      firstIdNumber: firstIdNumber || '3573010101990001',
      firstIdPhotoUrl,
      secondIdType,
      secondIdNumber: secondIdNumber || 'SIM-99120',
      secondIdPhotoUrl,
      depositAmount: guaranteeType === 'cash_deposit' ? depositAmount : 0,
      depositReturned: false,
      customerId: selectedExistingCustomerId || undefined,
      customerName,
      ktpAddress,
      domicileAddress,
      phone,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone,
      socialMedia: socialMedia || '-',
      chargerIncluded,
      bagIncluded,
      mouseIncluded,
      physicalNotes,
      deliveryOption,
      deliveryFee,
      deliveryDistanceKm: deliveryOption === 'delivery_address' ? deliveryDistanceKm : undefined,
      deliveryAddress: deliveryOption === 'delivery_address' ? domicileAddress : undefined,
      status: 'active',
      staffName: session?.name || 'Admin Pinjamlaptop'
    };
  };

  // Handle final completion and interconnection
  const handleFinalSubmit = () => {
    if (!currentLaptop) return;

    const newOrder = buildCurrentOrder();

    // 1. Updated Laptop (ready -> rented)
    const updatedLaptop: Laptop = {
      ...currentLaptop,
      status: 'rented',
      currentRenterName: newOrder.customerName,
      currentOrderId: newOrder.id,
      availableUnits: 0
    };

    // 2. Saved Customer (update or create)
    const existingCust = customers.find(c => c.name.toLowerCase() === newOrder.customerName.toLowerCase() || c.phone === newOrder.phone);
    const savedCustomer: Customer = {
      id: existingCust ? existingCust.id : `cst-${Date.now()}`,
      name: newOrder.customerName,
      phone: newOrder.phone,
      email: existingCust?.email || '',
      address: newOrder.ktpAddress,
      city: activeBranch,
      companyOrCampus: existingCust?.companyOrCampus || '',
      idCardType: newOrder.firstIdType,
      idCardNumber: newOrder.firstIdNumber,
      idCardPhotoUrl: newOrder.firstIdPhotoUrl || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
      secondIdType: newOrder.secondIdType,
      secondIdNumber: newOrder.secondIdNumber,
      secondIdPhotoUrl: newOrder.secondIdPhotoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      emergencyContactName: newOrder.emergencyContactName,
      emergencyContactRelation: newOrder.emergencyContactRelation,
      emergencyContactPhone: newOrder.emergencyContactPhone,
      reputation: existingCust?.reputation || 'good',
      totalRentals: (existingCust?.totalRentals || 0) + 1,
      activeRentalCount: (existingCust?.activeRentalCount || 0) + 1,
      notes: `Sosial Media: ${newOrder.socialMedia}. Alamat Domisili: ${newOrder.domicileAddress}`,
      createdAt: existingCust?.createdAt || new Date().toISOString().split('T')[0]
    };

    // 3. Movement Log (Unit Out - Keluar Disewa)
    const movementLog: UnitMovementLog = {
      id: `mov-${Date.now()}`,
      laptopId: currentLaptop.id,
      laptopName: currentLaptop.name,
      laptopSku: currentLaptop.sku,
      branchCity: activeBranch,
      movementType: 'out_rental',
      orderId: newOrder.transactionNumber,
      customerName: newOrder.customerName,
      customerPhone: newOrder.phone,
      timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      staffName: newOrder.staffName,
      chargerIncluded: newOrder.chargerIncluded,
      bagIncluded: newOrder.bagIncluded,
      mouseIncluded: newOrder.mouseIncluded,
      physicalConditionNotes: newOrder.physicalNotes
    };

    // 4. Financial Transaction (Pos Sewa Toko)
    const financeTransaction: FinancialTransaction = {
      id: newOrder.transactionNumber,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      branchCity: activeBranch,
      type: 'income',
      category: 'sewa',
      title: `Sewa ${currentLaptop.name} (${totalDays} Hari) - ${newOrder.customerName}`,
      amount: totalRentalCost,
      paymentMethod: newOrder.paymentMethod,
      customerOrPayee: newOrder.customerName,
      recordedBy: newOrder.staffName,
      referenceId: newOrder.id,
      notes: `SPK: ${newOrder.transactionNumber} • Jaminan: ${newOrder.guaranteeType === 'two_identities' ? '2 ID' : `Deposit ${formatRupiah(newOrder.depositAmount)}`}`
    };

    // 5. Optional Delivery Log (if delivery chosen)
    let deliveryLog: DeliveryLog | undefined;
    if (newOrder.deliveryOption === 'delivery_address') {
      deliveryLog = {
        id: `DLV-${Date.now().toString().slice(-6)}`,
        orderId: newOrder.transactionNumber,
        branchCity: activeBranch,
        date: new Date().toISOString().split('T')[0],
        customerName: newOrder.customerName,
        customerPhone: newOrder.phone,
        destinationAddress: newOrder.domicileAddress,
        tripType: 'antar',
        distanceKm: deliveryDistanceKm,
        ratePerKm: 5000,
        totalFee: deliveryFee,
        courierName: 'Kurir Operasional',
        status: 'menunggu_driver',
        paymentStatus: 'lunas',
        createdAt: new Date().toISOString().split('T')[0],
        notes: `Pengantaran unit SPK ${newOrder.transactionNumber}`
      };
    }

    // Trigger complete handler
    onCompleteRental({
      order: newOrder,
      updatedLaptop,
      savedCustomer,
      movementLog,
      financeTransaction,
      deliveryLog
    });

    setCompletedOrder(newOrder);
    setStep(4);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-[#e5dfd5] shadow-2xl max-w-3xl w-full my-auto flex flex-col max-h-[92vh] text-stone-900">
        
        {/* Header Modal */}
        <div className="p-4 border-b border-[#e8e2d8] flex items-center justify-between bg-[#faf8f5] rounded-t-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#eef4fc] text-[#1e5488] border border-[#cee0f7]">
                ALUR SEWA BARU &bull; CABANG {activeBranch.toUpperCase()}
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Format No: PLID{activeBranch === 'Malang' ? 'MLG' : activeBranch === 'Bekasi' ? 'BKS' : 'SDA'}</span>
            </div>
            <h2 className="text-base font-bold text-stone-900 mt-0.5">
              Formulir & Perjanjian Sewa Laptop Resmi
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#ede8df] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Indicator in Pastel */}
        <div className="grid grid-cols-4 border-b border-[#e8e2d8] bg-[#fbf9f5] text-xs font-medium text-center">
          {[
            { num: 1, label: '1. Unit & Durasi' },
            { num: 2, label: '2. Data & Jaminan' },
            { num: 3, label: '3. Verifikasi & SPK' },
            { num: 4, label: '4. Cetak & Selesai' }
          ].map((s) => (
            <div
              key={s.num}
              className={`py-2.5 px-1 border-r border-[#e8e2d8] last:border-r-0 transition-colors ${
                step === s.num
                  ? 'bg-white text-stone-900 font-bold border-b-2 border-b-[#4a586e]'
                  : step > s.num
                  ? 'bg-[#eaf4ee] text-[#1b633d]'
                  : 'text-stone-400'
              }`}
            >
              <span className="block sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs space-y-4">

          {/* ======================================================== */}
          {/* STEP 1: PILIH LAPTOP & DURASI SEWA                        */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-[#eef4fc] rounded-xl border border-[#cee0f7] text-[#1e5488]">
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  <LaptopIcon className="w-4 h-4" />
                  <span>Tahap 1: Pilih Laptop Siap Sewa & Durasi Penggunaan</span>
                </div>
                <div className="text-[11px] text-[#1e5488]/80 mt-0.5">
                  Pilih unit dari inventaris cabang {activeBranch}. Tarif dan ketentuan denda Rp 20.000/jam akan otomatis terintegrasi.
                </div>
              </div>

              {/* Laptop Selector */}
              <div>
                <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">
                  Pilih Unit Laptop (Ready) *
                </label>
                <select
                  value={selectedLaptopId}
                  onChange={(e) => setSelectedLaptopId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e5dfd5] rounded-lg text-stone-900 font-medium focus:outline-none focus:border-[#4a586e]"
                >
                  {laptops
                    .filter(l => l.status === 'ready' || l.id === selectedLaptopId)
                    .map(l => (
                      <option key={l.id} value={l.id}>
                        [{l.sku}] {l.brand} {l.name} - Cabang {l.branchCity} &bull; Rp {l.dailyPrice.toLocaleString('id-ID')}/hari (Status: {l.status})
                      </option>
                    ))}
                </select>
              </div>

              {/* Selected Laptop Spec Preview in Pastel Card */}
              {currentLaptop && (
                <div className="p-3.5 bg-[#faf8f5] rounded-xl border border-[#e8e2d8] space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e8e2d8]">
                    <div>
                      <span className="font-bold text-stone-900 text-sm font-sans">{currentLaptop.brand} {currentLaptop.name}</span>
                      <span className="ml-2 font-mono text-[10px] px-2 py-0.5 rounded bg-stone-200 text-stone-700">{currentLaptop.sku}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-stone-900">
                      Nilai Unit: {formatRupiah(currentLaptop.depositAmount ? currentLaptop.depositAmount * 7 : 9500000)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-stone-600">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Processor:</span>
                      <span className="font-medium text-stone-800">{currentLaptop.processor}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">RAM:</span>
                      <span className="font-medium text-stone-800">{currentLaptop.ram}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Storage (SSD):</span>
                      <span className="font-medium text-stone-800">{currentLaptop.storage}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Kartu Grafis:</span>
                      <span className="font-medium text-stone-800">{currentLaptop.gpu}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Durasi Pilihan (1 Hari, 7 Hari, 30 Hari, Custom) */}
              <div>
                <label className="block text-[11px] font-mono text-stone-600 mb-1.5 font-semibold">
                  Pilih Paket Durasi Sewa *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: '1_hari', label: '1 Hari (Harian)', sub: currentLaptop ? formatRupiah(currentLaptop.dailyPrice) : '' },
                    { id: '7_hari', label: '7 Hari (Mingguan)', sub: currentLaptop ? formatRupiah(currentLaptop.weeklyPrice) : '' },
                    { id: '30_hari', label: '30 Hari (Bulanan)', sub: currentLaptop ? formatRupiah(currentLaptop.monthlyPrice) : '' },
                    { id: 'custom', label: 'Custom Hari', sub: 'Input Durasi Khusus' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDurationType(tab.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        durationType === tab.id
                          ? 'bg-[#eef4fc] border-[#cee0f7] text-[#1e5488] shadow-2xs font-semibold'
                          : 'bg-white border-[#e5dfd5] text-stone-600 hover:bg-[#faf7f2]'
                      }`}
                    >
                      <div className="font-bold text-xs">{tab.label}</div>
                      <div className="font-mono text-[11px] text-stone-700 mt-1">{tab.sub}</div>
                    </button>
                  ))}
                </div>

                {durationType === 'custom' && (
                  <div className="mt-3 p-3 bg-[#faf8f5] rounded-xl border border-[#e5dfd5] flex items-center gap-3">
                    <span className="text-stone-700 font-medium">Berapa hari sewa unit:</span>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={customDays}
                      onChange={(e) => setCustomDays(Math.max(1, Number(e.target.value)))}
                      className="w-20 px-3 py-1 bg-white border border-[#e5dfd5] rounded-lg font-mono font-bold text-stone-900"
                    />
                    <span className="font-mono text-stone-500">Hari</span>
                  </div>
                )}
              </div>

              {/* Tanggal & Kalkulasi Sewa */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#fef7eb] rounded-xl border border-[#fbe5b4]">
                <div>
                  <label className="block text-[10px] font-mono text-[#8a5714] uppercase font-semibold mb-1">Tanggal Mulai Sewa</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#fbe5b4] rounded-lg font-mono text-stone-900 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#8a5714] uppercase font-semibold mb-1">Batas Wajib Kembali</label>
                  <div className="px-2.5 py-1.5 bg-white border border-[#fbe5b4] rounded-lg font-mono font-bold text-stone-900 text-xs">
                    {calculatedEndDate} (Maks 18:00 WIB)
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#8a5714] uppercase font-semibold mb-1">Total Biaya Sewa ({totalDays} Hari)</label>
                  <div className="px-2.5 py-1.5 bg-white border border-[#fbe5b4] rounded-lg font-mono font-extrabold text-stone-900 text-sm">
                    {formatRupiah(totalRentalCost)}
                  </div>
                </div>
              </div>

              {/* Checklist Aksesoris & Opsi Antar */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">Checklist Kelengkapan Serah Terima:</label>
                  <div className="flex flex-wrap gap-4 text-stone-800">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chargerIncluded}
                        onChange={(e) => setChargerIncluded(e.target.checked)}
                      />
                      <span>Charger Original</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bagIncluded}
                        onChange={(e) => setBagIncluded(e.target.checked)}
                      />
                      <span>Tas Laptop</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mouseIncluded}
                        onChange={(e) => setMouseIncluded(e.target.checked)}
                      />
                      <span>Mouse</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-600 mb-1">Catatan Kondisi Fisik Unit Saat Penyerahan</label>
                  <input
                    type="text"
                    value={physicalNotes}
                    onChange={(e) => setPhysicalNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900 focus:outline-none focus:border-[#4a586e]"
                    placeholder="Contoh: Bodi mulus 98%, layar jernih, keyboard normal"
                  />
                </div>

                {/* Opsi Penyerahan */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">Metode Penyerahan Unit:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryOption('pickup_store')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          deliveryOption === 'pickup_store' 
                            ? 'bg-[#4a586e] text-white' 
                            : 'bg-white border border-stone-200 text-stone-600'
                        }`}
                      >
                        Ambil di Toko (Gratis)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryOption('delivery_address')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          deliveryOption === 'delivery_address' 
                            ? 'bg-[#4a586e] text-white' 
                            : 'bg-white border border-stone-200 text-stone-600'
                        }`}
                      >
                        Diantar ke Alamat (5rb/km)
                      </button>
                    </div>
                  </div>

                  {deliveryOption === 'delivery_address' && (
                    <div className="flex items-center gap-3 pt-2 border-t border-stone-200">
                      <span className="text-stone-600">Estimasi Jarak Pengantaran:</span>
                      <input
                        type="number"
                        min="1"
                        value={deliveryDistanceKm}
                        onChange={(e) => setDeliveryDistanceKm(Math.max(1, Number(e.target.value)))}
                        className="w-16 px-2 py-1 bg-white border border-stone-300 rounded font-mono font-bold text-center"
                      />
                      <span className="font-mono text-stone-600">km &bull; Ongkir resmi: <strong className="text-stone-900">{formatRupiah(deliveryFee)}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: DATA PENYEWA & JAMINAN (2 ID ATAU DEPOSIT)       */}
          {/* ======================================================== */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-[#eaf4ee] rounded-xl border border-[#cce5d4] text-[#1b633d]">
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Tahap 2: Lengkapi Data Penyewa & 2 Jaminan Identitas / Deposit Uang</span>
                </div>
                <div className="text-[11px] text-[#1b633d]/80 mt-0.5">
                  Data ini wajib untuk memenuhi legalitas Surat Perjanjian Sewa dan mitigasi risiko kehilangan.
                </div>
              </div>

              {/* Quick Select Customer Lama */}
              <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e5dfd5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800 text-[11px]">Pilih Dari Database Penyewa Terdaftar (Opsional):</span>
                  {selectedExistingCustomerId && (
                    <span className="text-[10px] text-emerald-700 font-mono font-medium">[ Data Customer Terpilih ]</span>
                  )}
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ketik nama / no HP customer lama untuk auto-fill..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-xs"
                  />
                </div>
                {customerSearch.trim() && (
                  <div className="max-h-32 overflow-y-auto divide-y divide-stone-200 border border-[#e5dfd5] rounded-lg bg-white">
                    {customers
                      .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch))
                      .map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectExistingCustomer(c)}
                          className="w-full p-2 text-left hover:bg-[#faf7f2] flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-stone-900">{c.name}</div>
                            <div className="text-[10px] text-stone-500 font-mono">{c.phone} &bull; {c.city}</div>
                          </div>
                          <span className="text-[10px] text-[#1e5488] font-semibold">Gunakan Data &rarr;</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Data Utama Penyewa */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">Nama Lengkap Sesuai KTP *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900 focus:outline-none focus:border-[#4a586e]"
                      placeholder="Contoh: Budi Santoso"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">Nomor HP / WhatsApp Aktif *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900 font-mono focus:outline-none focus:border-[#4a586e]"
                      placeholder="0812-3456-7890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">Alamat Sesuai KTP *</label>
                    <input
                      type="text"
                      required
                      value={ktpAddress}
                      onChange={(e) => setKtpAddress(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900 focus:outline-none focus:border-[#4a586e]"
                      placeholder="Alamat lengkap sesuai identitas"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-mono text-stone-600 font-semibold">Alamat Domisili Sekarang *</label>
                      <button
                        type="button"
                        onClick={handleCopyKtpToDomicile}
                        className="text-[10px] text-[#1e5488] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Sama dengan KTP</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={domicileAddress}
                      onChange={(e) => setDomicileAddress(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900 focus:outline-none focus:border-[#4a586e]"
                      placeholder="Alamat tinggal / kos / kantor saat ini"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">Nama Kontak Darurat *</label>
                    <input
                      type="text"
                      required
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900"
                      placeholder="Nama kerabat / orang tua"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">Hubungan Kerabat</label>
                    <select
                      value={emergencyContactRelation}
                      onChange={(e) => setEmergencyContactRelation(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900"
                    >
                      <option value="Keluarga">Keluarga Kandung</option>
                      <option value="Orang Tua">Orang Tua / Ayah / Ibu</option>
                      <option value="Suami / Istri">Suami / Istri</option>
                      <option value="Rekan Kerja">Rekan Kerja / Kantor</option>
                      <option value="Teman Dekat">Teman Dekat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">No. HP Kontak Darurat *</label>
                    <input
                      type="text"
                      required
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900 font-mono"
                      placeholder="0812-9988-7766"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">Akun Sosial Media Aktif (Instagram / LinkedIn / Facebook) *</label>
                  <input
                    type="text"
                    value={socialMedia}
                    onChange={(e) => setSocialMedia(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900"
                    placeholder="@username_instagram atau link profil LinkedIn"
                  />
                </div>
              </div>

              {/* JAMINAN: 2 DOKUMEN IDENTITAS ATAU DEPOSIT UANG SENILAI HARGA UNIT */}
              <div className="p-3.5 bg-[#f5f0fa] rounded-xl border border-[#e2d6f5] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#e2d6f5]">
                  <div>
                    <h3 className="font-bold text-xs text-[#5c3682]">Pilihan Jaminan Sewa (Wajib Dipenuhi):</h3>
                    <p className="text-[10px] text-[#5c3682]/80">Syarat mutlak perlindungan unit dan validitas kontrak hukum</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGuaranteeType('two_identities')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        guaranteeType === 'two_identities' 
                          ? 'bg-[#5c3682] text-white shadow-2xs' 
                          : 'bg-white border border-[#e2d6f5] text-stone-600 hover:bg-[#faf7f2]'
                      }`}
                    >
                      Opsi 1: 2 Jaminan Identitas Resmi
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuaranteeType('cash_deposit')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        guaranteeType === 'cash_deposit' 
                          ? 'bg-[#5c3682] text-white shadow-2xs' 
                          : 'bg-white border border-[#e2d6f5] text-stone-600 hover:bg-[#faf7f2]'
                      }`}
                    >
                      Opsi 2: Deposit Uang Senilai Unit
                    </button>
                  </div>
                </div>

                {guaranteeType === 'two_identities' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Jaminan 1 */}
                    <div className="p-2.5 bg-white rounded-lg border border-[#e2d6f5] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-900">
                        <span>Jaminan Identitas 1 (KTP / Paspor)</span>
                        <span className="text-[10px] text-emerald-700 font-mono">Utama</span>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={firstIdType}
                          onChange={(e) => setFirstIdType(e.target.value as any)}
                          className="px-2 py-1 bg-stone-50 border border-stone-200 rounded text-xs"
                        >
                          <option value="KTP">KTP</option>
                          <option value="Paspor">Paspor</option>
                        </select>
                        <input
                          type="text"
                          required
                          value={firstIdNumber}
                          onChange={(e) => setFirstIdNumber(e.target.value)}
                          placeholder="Nomor NIK KTP..."
                          className="flex-1 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded font-mono text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Foto KTP tersimpan aman di database arsip</span>
                      </div>
                    </div>

                    {/* Jaminan 2 */}
                    <div className="p-2.5 bg-white rounded-lg border border-[#e2d6f5] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-900">
                        <span>Jaminan Identitas 2 (SIM / KK / KTM / BPKB)</span>
                        <span className="text-[10px] text-[#5c3682] font-mono">Identitas Pendukung</span>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={secondIdType}
                          onChange={(e) => setSecondIdType(e.target.value as any)}
                          className="px-2 py-1 bg-stone-50 border border-stone-200 rounded text-xs"
                        >
                          <option value="SIM">SIM</option>
                          <option value="KK">Kartu Keluarga (KK)</option>
                          <option value="KTM">KTM Mahasiswa</option>
                          <option value="BPKB">BPKB Motor</option>
                          <option value="Kartu Pegawai">ID Card Kantor</option>
                        </select>
                        <input
                          type="text"
                          required
                          value={secondIdNumber}
                          onChange={(e) => setSecondIdNumber(e.target.value)}
                          placeholder="Nomor SIM / KK / KTM..."
                          className="flex-1 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded font-mono text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Identitas asli diverifikasi fisik saat serah terima</span>
                      </div>
                    </div>
                  </div>
                )}

                {guaranteeType === 'cash_deposit' && (
                  <div className="p-3 bg-white rounded-lg border border-[#e2d6f5] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-xs">Deposit Uang Senilai Harga Unit Laptop:</span>
                      <span className="text-[11px] text-stone-500 font-mono">Dikembalikan utuh saat laptop kembali normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-stone-600">Rp</span>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                        className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-mono font-bold text-sm text-stone-900"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 italic">
                      * Deposit uang tunai ditahan sebagai jaminan pengganti unit laptop seharga {formatRupiah(currentLaptop?.depositAmount ? currentLaptop.depositAmount * 7 : 9500000)}.
                    </p>
                  </div>
                )}
              </div>

              {/* Metode Pembayaran Sewa */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">Metode Pembayaran Sewa</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900 font-medium"
                  >
                    <option value="transfer_bank">Transfer Bank (BCA / Mandiri)</option>
                    <option value="qris">QRIS Standar Toko</option>
                    <option value="cash">Tunai di Kasir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-stone-600 mb-1 font-semibold">Status Pembayaran</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-[#e5dfd5] rounded-lg text-stone-900 font-medium"
                  >
                    <option value="lunas">Lunas di Muka (Siap Diserahkan)</option>
                    <option value="belum_bayar">Menunggu Pembayaran</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: VERIFIKASI DATA & PENERBITAN NOMOR SPK           */}
          {/* ======================================================== */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Status Verifikasi Sukses Box */}
              <div className="p-4 bg-[#eaf4ee] rounded-xl border border-[#cce5d4] flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#1b633d] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-[#1b633d]">
                    VERIFIKASI DATA BERHASIL &bull; PERSYARATAN SEWA TERPENUHI
                  </div>
                  <p className="text-[11px] text-[#1b633d]/85 mt-0.5">
                    Data penyewa lengkap dan jaminan telah tervalidasi. Nomor transaksi resmi telah digenerate sesuai kode cabang <strong>PLID{activeBranch === 'Malang' ? 'MLG' : activeBranch === 'Bekasi' ? 'BKS' : 'SDA'}</strong>. Anda dapat mencetak Surat Perjanjian dan Form Sewa sekarang.
                  </p>
                </div>
              </div>

              {/* Rincian Nomor Transaksi Resmi */}
              <div className="p-4 bg-[#faf8f5] rounded-xl border border-[#e8e2d8] space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#e8e2d8]">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase">Nomor Transaksi Resmi Sewa:</span>
                    <div className="text-lg font-extrabold text-[#1e5488] tracking-tight">{transactionNumber}</div>
                  </div>
                  <div className="text-left sm:text-right mt-1 sm:mt-0">
                    <span className="text-[10px] text-stone-500 uppercase">Cabang Pelaksana:</span>
                    <div className="font-bold text-stone-900">{activeBranch} ({activeBranch === 'Malang' ? 'Pusat' : 'Cabang'})</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Penyewa:</span>
                    <span className="font-bold text-stone-900 font-sans">{customerName}</span>
                    <div className="text-[10px] text-stone-500">{phone}</div>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Unit Laptop:</span>
                    <span className="font-bold text-stone-900">{currentLaptop?.brand} {currentLaptop?.name}</span>
                    <div className="text-[10px] text-stone-500">{currentLaptop?.sku}</div>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Durasi & Batas:</span>
                    <span className="font-bold text-stone-900">{totalDays} Hari</span>
                    <div className="text-[10px] text-stone-500">{startDate} s/d {calculatedEndDate}</div>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Total Biaya:</span>
                    <span className="font-bold text-stone-900 text-sm">{formatRupiah(grandTotalCost)}</span>
                    <div className="text-[10px] text-emerald-700 font-bold uppercase">{paymentStatus} ({paymentMethod})</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e8e2d8] text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Jaminan yang Diterima:</span>
                    <span className="font-semibold text-stone-900">
                      {guaranteeType === 'two_identities'
                        ? `2 ID: ${firstIdType} (${firstIdNumber}) & ${secondIdType} (${secondIdNumber})`
                        : `Deposit Uang Tunai Senilai Unit: ${formatRupiah(depositAmount)}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Ketentuan Denda & Wanprestasi:</span>
                    <span className="font-semibold text-[#8c273e]">
                      Denda Rp 20.000 / Jam &bull; Larangan Gadai Pasal 372 KUHP
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons to View / Print Before Finalizing */}
              <div className="p-3 bg-[#eef4fc] rounded-xl border border-[#cee0f7] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-[#1e5488]">Pratinjau & Cetak Dokumen Resmi:</div>
                  <div className="text-[11px] text-[#1e5488]/80">Surat Perjanjian berkekuatan hukum dengan klausul pasal lengkap</div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPrintDocType('contract');
                      setShowPrintModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#cee0f7] text-[#1e5488] hover:bg-[#e0ecfa] rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Cetak Surat Perjanjian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPrintDocType('handover_form');
                      setShowPrintModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#cee0f7] text-[#1e5488] hover:bg-[#e0ecfa] rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Form Sewa</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: SELESAI & SISTEM TERKONEKSI                      */}
          {/* ======================================================== */}
          {step === 4 && completedOrder && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-[#eaf4ee] text-[#1b633d] border border-[#cce5d4] rounded-full flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  Transaksi Sewa Berhasil Disimpan & Terkoneksi!
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-1">
                  Nomor Kontrak: <strong className="text-stone-900">{completedOrder.transactionNumber}</strong> &bull; Cabang {completedOrder.branchCity}
                </p>
              </div>

              {/* Interconnection Audit Box */}
              <div className="max-w-xl mx-auto p-3.5 bg-[#faf8f5] rounded-xl border border-[#e8e2d8] text-left text-xs space-y-2">
                <div className="font-bold text-stone-800 text-[11px] pb-1 border-b border-[#e8e2d8]">
                  Pembaruan Otomatis ke Seluruh Sistem ERP:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 text-stone-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Status Laptop [{completedOrder.laptopSku}]: <strong className="text-stone-900">Rented (Tersewa)</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Database Penyewa: <strong className="text-stone-900">Data & Jaminan Tersimpan</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Keuangan Toko (Pos Sewa): <strong className="text-stone-900">+{formatRupiah(totalRentalCost)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Audit Keluar-Masuk: <strong className="text-stone-900">Log Unit Out Tercatat</strong></span>
                  </div>
                  {completedOrder.deliveryOption === 'delivery_address' && (
                    <div className="flex items-center gap-2 text-stone-700 sm:col-span-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>Order Antar-Jemput: <strong className="text-stone-900">Masuk Antrean Driver (5rb/km)</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Print buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrintDocType('contract');
                    setShowPrintModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Cetak Surat Perjanjian Legal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrintDocType('handover_form');
                    setShowPrintModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#e5dfd5] bg-white hover:bg-[#faf7f2] text-stone-800 rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Form Checklist Unit</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#e5dfd5] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium"
                >
                  Tutup & Kembali ke Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 4 && (
          <div className="p-4 border-t border-[#e8e2d8] flex items-center justify-between bg-[#faf8f5] rounded-b-xl">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-700 hover:bg-[#ede8df] text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-[#e5dfd5] rounded-lg text-stone-600 hover:bg-[#ede8df] text-xs font-medium transition-colors"
              >
                Batal
              </button>
            )}

            <div className="flex items-center gap-2">
              {step === 1 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  <span>Lanjut: Data Penyewa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    const err = validateStep2();
                    if (err) {
                      alert(err);
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#4a586e] hover:bg-[#3d495c] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verifikasi Data & Buat SPK</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#1b633d] hover:bg-[#154e30] text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesaikan & Terbitkan Kontrak Sewa</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Embedded Printable View */}
      {showPrintModal && (
        <RentalContractPrintView
          order={completedOrder || buildCurrentOrder()}
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          defaultDocType={printDocType}
        />
      )}
    </div>
  );
};
