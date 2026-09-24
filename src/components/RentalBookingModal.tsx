import React, { useState, useEffect } from 'react';
import { 
  X, Check, ShieldAlert, AlertTriangle, Calendar, Clock, MapPin, 
  Truck, User, Phone, Mail, FileText, Banknote, CreditCard, QrCode, 
  ChevronRight, ArrowLeft, Sparkles, CheckCircle2, Building2, Info,
  LogIn, UserPlus, Key, Lock, Eye, EyeOff, UserCheck, ShieldCheck, Printer, ExternalLink
} from 'lucide-react';
import { 
  Laptop, GuaranteeType, IdentityDocType, DeliveryMethod, PaymentMethod, 
  RentalOrder, CustomerMember 
} from '../types';
import { 
  formatRupiah, calculateRentalPricing, createNewOrder, updateOrder,
  authenticateMember, registerOrUpdateMember, getMemberById, getStoredCustomerSession
} from '../utils/storage';
import { STORE_HUBS, DOMICILE_OPTIONS_BY_BRANCH, isDomicileAllowedForBranch, BRANCH_LOCATIONS } from '../data/laptops';
import { PinjamLaptopLogo } from './PinjamLaptopLogo';

interface RentalBookingModalProps {
  laptop: Laptop | null;
  onClose: () => void;
  onBookingSuccess: (order: RentalOrder) => void;
  isLargeText?: boolean;
}

export const RentalBookingModal: React.FC<RentalBookingModalProps> = ({
  laptop,
  onClose,
  onBookingSuccess,
  isLargeText = false
}) => {
  if (!laptop) return null;

  // Branch info for the selected laptop
  const laptopBranch = laptop.branchCity || 'Malang';
  const branchInfo = BRANCH_LOCATIONS.find(b => b.city === laptopBranch) || BRANCH_LOCATIONS[0];
  const allowedDomicileList = DOMICILE_OPTIONS_BY_BRANCH[laptopBranch] || DOMICILE_OPTIONS_BY_BRANCH.Malang;

  // Step state (1: Durasi & Pengambilan, 2: Data Diri & Kontak Darurat, 3: Jaminan, 4: Klausul Hangus & Pembayaran)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Member Account Authentication State
  const [showExistingMemberLogin, setShowExistingMemberLogin] = useState<boolean>(false);
  const [memberIdInput, setMemberIdInput] = useState<string>('');
  const [memberPasswordInput, setMemberPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loggedInMember, setLoggedInMember] = useState<CustomerMember | null>(null);
  const [loginError, setLoginError] = useState<string>('');
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<string>('');

  // Form State: Step 1
  const [durationDays, setDurationDays] = useState<number>(3);
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [selectedHub, setSelectedHub] = useState<string>(() => {
    const matched = STORE_HUBS.find(h => h.city === laptopBranch);
    return matched ? matched.name : STORE_HUBS[0].name;
  });

  // Form State: Step 2 (Data Diri & 2 Kontak Darurat)
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [customerCity, setCustomerCity] = useState<string>(() => {
    // Default kota domisili sesuai cabang laptop
    return allowedDomicileList[0].value;
  });
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // 2 Kontak Darurat (Wajib)
  const [emergency1Name, setEmergency1Name] = useState<string>('');
  const [emergency1Relation, setEmergency1Relation] = useState<string>('Orang Tua / Ayah');
  const [emergency1Phone, setEmergency1Phone] = useState<string>('');

  const [emergency2Name, setEmergency2Name] = useState<string>('');
  const [emergency2Relation, setEmergency2Relation] = useState<string>('Saudara Kandung');
  const [emergency2Phone, setEmergency2Phone] = useState<string>('');

  // Form State: Step 3 (Opsi Jaminan: 2 Identitas ATAU Uang Deposit)
  const [guaranteeType, setGuaranteeType] = useState<GuaranteeType>('two_identities');
  
  // 2 Identitas asli
  const [doc1Type, setDoc1Type] = useState<IdentityDocType>('KTP');
  const [doc1Number, setDoc1Number] = useState<string>('');
  const [doc1HolderName, setDoc1HolderName] = useState<string>('');
  const [doc1FileSimulated, setDoc1FileSimulated] = useState<string>('ktp_asli_terlampir.jpg');

  const [doc2Type, setDoc2Type] = useState<IdentityDocType>('SIM');
  const [doc2Number, setDoc2Number] = useState<string>('');
  const [doc2HolderName, setDoc2HolderName] = useState<string>('');
  const [doc2FileSimulated, setDoc2FileSimulated] = useState<string>('sim_a_asli_terlampir.jpg');

  // Form State: Step 4 (Klausul Hangus 100% & Pembayaran)
  const [agreedToForfeiture, setAgreedToForfeiture] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentStepSimulated, setPaymentStepSimulated] = useState<'form' | 'qr_modal'>('form');

  // Form State: Step 5 (Surat Perjanjian Sewa Menyewa SPK Pasca-Bayar)
  const [pendingCompletedOrder, setPendingCompletedOrder] = useState<RentalOrder | null>(null);
  const [agreementConsciouslyAcknowledged, setAgreementConsciouslyAcknowledged] = useState<boolean>(false);

  // Pricing calculation
  const pricing = calculateRentalPricing(laptop, durationDays, deliveryMethod, guaranteeType);

  // Target return date calculation (mengikuti jam saat menerima unit)
  const getReturnDate = () => {
    const start = new Date(startDateStr);
    const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
    return end;
  };

  // Helper untuk Memuat Data Member ke Form
  const populateMemberData = (m: CustomerMember) => {
    setLoggedInMember(m);
    setMemberIdInput(m.memberId);
    setMemberPasswordInput(m.password);
    setShowExistingMemberLogin(false);
    setLoginSuccessNotice(`Selamat datang, ${m.fullName}! Data sewa Anda berhasil diisi otomatis dari akun terdaftar.`);

    // Auto-fill all rental details
    setCustomerName(m.fullName || '');
    setCustomerPhone(m.phone || '');
    setCustomerEmail(m.email || '');
    setCustomerAddress(m.address || '');
    setCustomerCity(m.city || 'Jakarta Selatan');
    setCustomerNotes(m.notes || '');
    if (m.deliveryMethod) setDeliveryMethod(m.deliveryMethod);
    if (m.preferredHub) setSelectedHub(m.preferredHub);

    // Auto-fill emergency contacts
    if (m.emergency1Name) setEmergency1Name(m.emergency1Name);
    if (m.emergency1Relation) setEmergency1Relation(m.emergency1Relation);
    if (m.emergency1Phone) setEmergency1Phone(m.emergency1Phone);
    if (m.emergency2Name) setEmergency2Name(m.emergency2Name);
    if (m.emergency2Relation) setEmergency2Relation(m.emergency2Relation);
    if (m.emergency2Phone) setEmergency2Phone(m.emergency2Phone);

    // Auto-fill guarantee
    if (m.guaranteeType) setGuaranteeType(m.guaranteeType);
    if (m.doc1Type) setDoc1Type(m.doc1Type);
    if (m.doc1Number) setDoc1Number(m.doc1Number);
    if (m.doc1HolderName) setDoc1HolderName(m.doc1HolderName);
    if (m.doc2Type) setDoc2Type(m.doc2Type);
    if (m.doc2Number) setDoc2Number(m.doc2Number);
    if (m.doc2HolderName) setDoc2HolderName(m.doc2HolderName);
  };

  // Helper untuk Login Member
  const handleLoginMember = (idOverride?: string, passOverride?: string): boolean => {
    const id = (idOverride ?? memberIdInput).trim();
    const pass = passOverride ?? memberPasswordInput;
    setLoginError('');

    const res = authenticateMember(id, pass);
    if (!res.success || !res.member) {
      setLoginError(res.message);
      return false;
    }

    populateMemberData(res.member);
    return true;
  };

  // Otomatis isi data jika penyewa sudah login di aplikasi
  useEffect(() => {
    if (laptop) {
      const activeCustomer = getStoredCustomerSession();
      if (activeCustomer && !loggedInMember) {
        populateMemberData(activeCustomer);
      }
    }
  }, [laptop]);

  const handleLogoutMember = () => {
    setLoggedInMember(null);
    setShowExistingMemberLogin(true);
    setLoginSuccessNotice('');
    setLoginError('');
  };

  const [domicileError, setDomicileError] = useState<string>('');

  // Validation per step
  const validateStep1 = () => {
    if (durationDays < 1) return false;
    if (!startDateStr) return false;
    return true;
  };

  const validateStep2 = () => {
    setDomicileError('');

    // 1. Validasi Syarat Domisili vs Cabang Laptop
    // "Jika katalog ada di Bekasi, tidak bisa diorder oleh orang dengan domisili Malang"
    // Malang: Malang Kota dan Malang Kabupaten
    // Sidoarjo: Sidoarjo dan Surabaya
    // Bekasi: Bekasi kota dan Kabupaten, dan Semua Jakarta
    const checkDomicile = isDomicileAllowedForBranch(laptop.branchCity, customerCity);
    if (!checkDomicile.allowed) {
      setDomicileError(checkDomicile.reason || 'Domisili tidak sesuai dengan cabang laptop.');
      alert(checkDomicile.reason || 'Maaf, domisili Anda tidak dapat menyewa laptop dari cabang ini.');
      return false;
    }

    // 2. Validasi Data Diri & Kontak Darurat
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim() || !customerAddress.trim()) {
      alert('Mohon lengkapi data diri Anda (Nama, No HP/WA, Email, dan Alamat Domisili)!');
      return false;
    }
    if (!emergency1Name.trim() || !emergency1Phone.trim() || !emergency2Name.trim() || !emergency2Phone.trim()) {
      alert('Sesuai SOP Pinjamlaptop, Anda WAJIB mengisi 2 Kontak Darurat Aktif!');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    // 1. Validasi Jaminan (2 Identitas atau Deposit)
    if (guaranteeType === 'two_identities') {
      if (!doc1Number.trim() || !doc1HolderName.trim()) {
        alert('Mohon lengkapi data Identitas Pertama (misal KTP)!');
        return false;
      }
      if (!doc2Number.trim() || !doc2HolderName.trim()) {
        alert('Mohon lengkapi data Identitas Kedua (SIM/BPKB/Ijazah/KTM)!');
        return false;
      }
      if (doc1Type === doc2Type) {
        alert('Identitas 1 dan Identitas 2 harus merupakan dokumen berbeda (contoh: KTP + SIM, atau KTP + Ijazah)!');
        return false;
      }
    }

    // 2. Validasi Data Member Baru jika belum login sebagai member lama
    if (!loggedInMember) {
      if (!memberIdInput.trim()) {
        alert('Sesuai petunjuk, mohon lengkapi "ID Baru" untuk akun member Anda pada formulir nomor 3!');
        return false;
      }
      if (!memberPasswordInput.trim()) {
        alert('Mohon lengkapi "Password" untuk akun member baru Anda pada formulir nomor 3!');
        return false;
      }
      const existing = getMemberById(memberIdInput.trim());
      if (existing) {
        alert(`ID Member "${memberIdInput.trim()}" sudah terdaftar di database. Silakan pilih ID Baru yang lain atau gunakan tombol "Punya Akun" di tahap data diri.`);
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
  };

  // Submit and finalize booking
  const handleProcessOrder = () => {
    // Double safeguard check on domicile rules
    const checkDomicile = isDomicileAllowedForBranch(laptop.branchCity, customerCity);
    if (!checkDomicile.allowed) {
      alert(checkDomicile.reason || 'Maaf, domisili Anda tidak dapat menyewa laptop dari cabang ini.');
      return;
    }

    if (!agreedToForfeiture) {
      alert('Anda wajib menyetujui Klausul Hangus 100% terkait ketidaksesuaian identitas/deposit sebelum dapat melanjutkan pembayaran!');
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      const now = new Date();
      const startDateTime = new Date(startDateStr);
      startDateTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
      const endDateTime = new Date(startDateTime.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const cityCode = customerCity.toLowerCase().includes('bandung') ? 'BDG' : customerCity.toLowerCase().includes('surabaya') ? 'SBY' : 'JKT';
      const orderId = `PL-${randomSuffix}-${cityCode}`;
      const pickupPinCode = deliveryMethod === 'self_pickup' ? String(Math.floor(100000 + Math.random() * 900000)) : undefined;

      // Update / simpan semua detail sewa yang diisi customer ke Database Member
      const activeMemberId = loggedInMember
        ? loggedInMember.memberId
        : (memberIdInput.trim() || `member_${Date.now()}`);

      const activePassword = loggedInMember
        ? loggedInMember.password
        : (memberPasswordInput.trim() || 'pinjam123');

      registerOrUpdateMember({
        memberId: activeMemberId,
        password: activePassword,
        fullName: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress,
        city: customerCity,
        notes: customerNotes,
        deliveryMethod,
        preferredHub: selectedHub,
        guaranteeType,
        doc1Type,
        doc1Number,
        doc1HolderName,
        doc2Type,
        doc2Number,
        doc2HolderName,
        emergency1Name,
        emergency1Relation,
        emergency1Phone,
        emergency2Name,
        emergency2Relation,
        emergency2Phone
      });

      const newOrder: RentalOrder = {
        id: orderId,
        createdAt: now.toISOString(),
        memberId: activeMemberId,
        laptop,
        customer: {
          fullName: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: customerAddress,
          city: customerCity,
          notes: customerNotes
        },
        durationDays,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        deliveryMethod,
        storeLocation: deliveryMethod === 'self_pickup' ? selectedHub : undefined,
        deliveryAddress: deliveryMethod === 'delivery' ? `${customerAddress}, ${customerCity}` : undefined,
        guaranteeType,
        identityDocs: guaranteeType === 'two_identities' ? {
          doc1Type,
          doc1Number,
          doc1HolderName,
          doc1FileName: doc1FileSimulated,
          doc2Type,
          doc2Number,
          doc2HolderName,
          doc2FileName: doc2FileSimulated
        } : undefined,
        depositAmount: guaranteeType === 'cash_deposit' ? laptop.depositAmount : undefined,
        emergencyContacts: [
          { name: emergency1Name, relationship: emergency1Relation, phone: emergency1Phone },
          { name: emergency2Name, relationship: emergency2Relation, phone: emergency2Phone }
        ],
        warningAgreed100PercentForfeited: true,
        agreementReadAndAcknowledged: false,
        paymentMethod,
        paymentStatus: 'paid',
        pricing,
        status: 'awaiting_verification',
        pickupPinCode,
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: now.toISOString(),
            actor: 'customer',
            title: 'Pembayaran Diterima & Pesanan Dibuat',
            message: `Penyewa ${customerName} (Member ID: ${activeMemberId}) telah menyelesaikan pembayaran online ${formatRupiah(pricing.totalPaid)} via ${paymentMethod.toUpperCase()}. Lanjut membaca & menyetujui Surat Perjanjian Sewa Menyewa (SPK) secara sadar.`
          }
        ]
      };

      createNewOrder(newOrder);
      setPendingCompletedOrder(newOrder);
      setIsProcessingPayment(false);
      setCurrentStep(5); // Pindah ke Step 5: Surat Perjanjian Sewa Menyewa (Wajib Dibaca & Dicentang Sadar)
    }, 1500);
  };

  const handlePrintAgreement = () => {
    window.print();
  };

  const handleCompleteAgreement = () => {
    if (!pendingCompletedOrder || !agreementConsciouslyAcknowledged) return;

    const finalOrder: RentalOrder = {
      ...pendingCompletedOrder,
      agreementReadAndAcknowledged: true,
      agreementAcknowledgedAt: new Date().toISOString(),
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'customer',
          title: 'Surat Perjanjian Disetujui Secara Sadar',
          message: `Penyewa telah membaca, memahami, dan mencentang persetujuan Surat Perjanjian Sewa Menyewa (SPK) secara sadar, termasuk regulasi mutlak denda keterlambatan Rp 20.000/jam wajib dibayarkan bagaimanapun situasinya.`
        },
        ...pendingCompletedOrder.logs
      ]
    };

    updateOrder(finalOrder);
    onBookingSuccess(finalOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-slate-300 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img 
              src={laptop.image} 
              alt={laptop.name} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md" 
            />
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-xs font-black text-blue-400 uppercase tracking-wider block">
                  Formulir Peminjaman Laptop
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {laptop.branchCity === 'Malang' ? 'Pusat Malang' : `Cabang ${laptop.branchCity || 'Malang'}`}
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black leading-tight line-clamp-1">
                {laptop.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold">
                Tarif: {formatRupiah(laptop.dailyPrice)} / hari • Melayani domisili: {branchInfo.allowedDomiciles.slice(0, 3).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors text-lg font-bold border border-slate-700"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-slate-50 border-b-2 border-slate-200 px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-700 font-black' : 'text-slate-400 font-medium'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${currentStep >= 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'}`}>
                1
              </span>
              <span className="hidden sm:inline">1. Durasi</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />

            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-700 font-black' : 'text-slate-400 font-medium'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${currentStep >= 2 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'}`}>
                2
              </span>
              <span className="hidden sm:inline">2. Data Diri</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />

            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-700 font-black' : 'text-slate-400 font-medium'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${currentStep >= 3 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'}`}>
                3
              </span>
              <span className="hidden sm:inline">3. Jaminan & Akun</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />

            <div className={`flex items-center gap-2 ${currentStep >= 4 ? 'text-rose-700 font-black' : 'text-slate-400 font-medium'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${currentStep >= 4 ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'}`}>
                4
              </span>
              <span className="hidden sm:inline">4. Bayar</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />

            <div className={`flex items-center gap-2 ${currentStep === 5 ? 'text-emerald-700 font-black' : 'text-slate-400 font-medium'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${currentStep === 5 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'}`}>
                5
              </span>
              <span className="hidden sm:inline">5. Perjanjian (SPK)</span>
            </div>
          </div>
        </div>

        {/* Form Body Scrollable */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* STEP 1: Durasi Sewa & Metode Penyerahan */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  1. Pilih Durasi & Tanggal Mulai Sewa
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Pilih paket durasi untuk mendapatkan potongan harga spesial.
                </p>

                {/* Preset duration buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                  {[
                    { days: 1, label: '1 Hari', note: 'Tarif Reguler' },
                    { days: 3, label: '3 Hari', note: 'Paling Pas' },
                    { days: 7, label: '7 Hari', note: 'Diskon 15%' },
                    { days: 30, label: '30 Hari', note: 'Diskon 30%' }
                  ].map((tier) => (
                    <button
                      key={tier.days}
                      type="button"
                      onClick={() => setDurationDays(tier.days)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        durationDays === tier.days
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-sm font-bold text-slate-900 block">
                        {tier.label}
                      </span>
                      <span className="text-[11px] text-blue-700 font-medium">
                        {tier.note}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom days input & start date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Kustom Durasi (Hari)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Tanggal Mulai Sewa
                    </label>
                    <input
                      type="date"
                      value={startDateStr}
                      onChange={(e) => setStartDateStr(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Return estimation preview */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Batas Waktu Pengembalian:
                  </span>
                  <span className="font-bold text-slate-900">
                    {getReturnDate().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} (Saat masa sewa habis, pada jam yang sama saat menerima unit)
                  </span>
                </div>
              </div>

              {/* Delivery / Pickup method */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  2. Metode Penyerahan Laptop
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Pilih apakah Anda ingin mengambil unit di Store Hub atau diantar oleh kurir kami.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Delivery */}
                  <label
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      deliveryMethod === 'delivery'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'delivery'}
                      onChange={() => setDeliveryMethod('delivery')}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">
                          Diantar Kurir Khusus (+Rp 35.000)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Kurir resmi Pinjamlaptop mengantar unit langsung ke alamat Anda dengan box proteksi tahan benturan.
                      </p>
                    </div>
                  </label>

                  {/* Self Pickup */}
                  <label
                    onClick={() => setDeliveryMethod('self_pickup')}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      deliveryMethod === 'self_pickup'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'self_pickup'}
                      onChange={() => setDeliveryMethod('self_pickup')}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">
                          Ambil Sendiri di Hub (Gratis)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Ambil langsung di konter Store Hub kami dengan menunjukkan PIN unik pengambilan.
                      </p>
                    </div>
                  </label>
                </div>

                {deliveryMethod === 'self_pickup' && (
                  <div className="mt-3 space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Lokasi Hub Pengambilan ({laptopBranch === 'Malang' ? 'Pusat Malang' : `Cabang ${laptopBranch}`})
                    </label>
                    <select
                      value={selectedHub}
                      onChange={(e) => setSelectedHub(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {STORE_HUBS.filter(hub => hub.city === laptopBranch).map((hub) => (
                        <option key={hub.id} value={hub.name}>
                          {hub.name} ({hub.operatingHours})
                        </option>
                      ))}
                      {STORE_HUBS.filter(hub => hub.city !== laptopBranch).length > 0 && (
                        <optgroup label="Hub Cabang Lain (Harap sesuaikan dengan lokasi unit)">
                          {STORE_HUBS.filter(hub => hub.city !== laptopBranch).map((hub) => (
                            <option key={hub.id} value={hub.name}>
                              {hub.name} ({hub.city})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {(() => {
                      const activeHub = STORE_HUBS.find(h => h.name === selectedHub || h.id === selectedHub) || STORE_HUBS[0];
                      return (
                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="space-y-0.5 text-[11px] text-slate-600">
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{activeHub.fullName || activeHub.name}</span>
                            </div>
                            <p className="line-clamp-2 text-slate-600">{activeHub.address}</p>
                            <p className="text-slate-500">Jam Layanan: {activeHub.operatingHours}</p>
                          </div>
                          <a
                            href={activeHub.mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <span>Buka Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Data Diri & 2 Kontak Darurat */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in">
              {/* TOMBOL PUNYA AKUN: HANYA ADA SETELAH PILIH DURASI DAN PENGAMBILAN */}
              {!loggedInMember ? (
                <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Sudah Pernah Menyewa Sebelumnya?</h4>
                        <p className="text-[11px] text-slate-300">
                          Gunakan tombol Punya Akun jika sudah memiliki akun member agar data sewa terisi otomatis.
                        </p>
                      </div>
                    </div>
                    
                    {!showExistingMemberLogin ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowExistingMemberLogin(true);
                          setLoginError('');
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm flex-shrink-0"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Punya Akun
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowExistingMemberLogin(false)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 flex-shrink-0"
                      >
                        Tutup Login
                      </button>
                    )}
                  </div>

                  {/* Form Login Punya Akun */}
                  {showExistingMemberLogin && (
                    <div className="mt-4 pt-3.5 border-t border-slate-800 space-y-3">
                      <p className="text-[11px] text-slate-300">
                        Masukkan ID Member dan Password Anda. Jika berhasil login, data sewa akan otomatis terisi karena sudah pernah menyewa, dan tetap bisa dirubah jika ingin merubah beberapa deskripsi.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                            ID Member
                          </label>
                          <div className="relative">
                            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Masukkan ID Member Anda"
                              value={memberIdInput}
                              onChange={(e) => setMemberIdInput(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Masukkan password"
                              value={memberPasswordInput}
                              onChange={(e) => setMemberPasswordInput(e.target.value)}
                              className="w-full pl-8 pr-9 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {loginError && (
                        <div className="p-2.5 bg-rose-950/70 border border-rose-600/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleLoginMember()}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          Masuk & Isi Otomatis
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Member Terhubung */
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-900">
                            {loggedInMember.fullName}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-100 text-emerald-800 rounded border border-emerald-300 font-semibold">
                            ID Member: {loggedInMember.memberId}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                          Data sewa Anda otomatis terisi karena Anda sudah pernah menyewa. Anda tetap dapat merubah atau memperbarui deskripsi di formulir bawah ini jika ada perubahan.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogoutMember}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex-shrink-0"
                    >
                      Ganti Akun
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  1. Data Diri Penyewa
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Wajib sesuai nama pada identitas resmi Anda.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Bagas Aditya Rahman"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      No. WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 0812-8877-9921"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Alamat Email Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Contoh: nama.anda@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Kota Domisili <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={customerCity}
                      onChange={(e) => {
                        setCustomerCity(e.target.value);
                        setDomicileError('');
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <optgroup label={`Wilayah Yang Dilayani (${laptopBranch === 'Malang' ? 'Pusat Malang' : `Cabang ${laptopBranch}`})`}>
                        {allowedDomicileList.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label} (Sesuai Cabang)
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Wilayah Cabang Lainnya">
                        {laptopBranch !== 'Malang' && (
                          <>
                            <option value="Malang Kota">Malang Kota</option>
                            <option value="Malang Kabupaten">Malang Kabupaten</option>
                            <option value="Kota Batu">Kota Batu</option>
                          </>
                        )}
                        {laptopBranch !== 'Sidoarjo' && (
                          <>
                            <option value="Sidoarjo">Sidoarjo</option>
                            <option value="Surabaya">Surabaya</option>
                          </>
                        )}
                        {laptopBranch !== 'Bekasi' && (
                          <>
                            <option value="Bekasi Kota">Bekasi Kota</option>
                            <option value="Bekasi Kabupaten">Bekasi Kabupaten</option>
                            <option value="Jakarta Selatan">Jakarta Selatan</option>
                            <option value="Jakarta Pusat">Jakarta Pusat</option>
                            <option value="Jakarta Barat">Jakarta Barat</option>
                            <option value="Jakarta Timur">Jakarta Timur</option>
                            <option value="Jakarta Utara">Jakarta Utara</option>
                          </>
                        )}
                      </optgroup>
                    </select>

                    {/* Domicile matching status */}
                    {(() => {
                      const check = isDomicileAllowedForBranch(laptop.branchCity, customerCity);
                      if (!check.allowed) {
                        return (
                          <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-start gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Tidak Dapat Memesan:</strong> Unit ini berada di <strong>{branchInfo.badgeLabel}</strong>. Hanya melayani domisili {branchInfo.allowedDomiciles.slice(0, 3).join(', ')}. Pelanggan domisili "{customerCity}" tidak dapat memesan unit ini.
                            </span>
                          </div>
                        );
                      }
                      return (
                        <p className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Domisili sesuai dengan jangkauan layanan {branchInfo.badgeLabel}
                        </p>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Alamat Lengkap Domisili / Antar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {domicileError && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Pembatasan Wilayah Domisili</p>
                      <p>{domicileError}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2 KONTAK DARURAT (WAJIB SESUAI FLOW BISNIS) */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    2. Dua (2) Kontak Darurat Aktif (Wajib)
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Sesuai prosedur keamanan unit bernilai tinggi, cantumkan 2 nomor keluarga/rekan kerja aktif yang dapat dihubungi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  {/* Kontak 1 */}
                  <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-3">
                    <span className="text-xs font-bold text-blue-700 block">
                      Kontak Darurat 1
                    </span>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Hendra Saputra"
                        value={emergency1Name}
                        onChange={(e) => setEmergency1Name(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        Hubungan
                      </label>
                      <select
                        value={emergency1Relation}
                        onChange={(e) => setEmergency1Relation(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Orang Tua / Ayah">Orang Tua / Ayah</option>
                        <option value="Orang Tua / Ibu">Orang Tua / Ibu</option>
                        <option value="Suami / Istri">Suami / Istri</option>
                        <option value="Saudara Kandung">Saudara Kandung</option>
                        <option value="Teman Kantor / Atasan">Teman Kantor / Atasan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        Nomor HP Aktif
                      </label>
                      <input
                        type="tel"
                        placeholder="0813-XXXX-XXXX"
                        value={emergency1Phone}
                        onChange={(e) => setEmergency1Phone(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Kontak 2 */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-blue-700 block">
                      Kontak Darurat 2
                    </span>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Rina Kusuma"
                        value={emergency2Name}
                        onChange={(e) => setEmergency2Name(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        Hubungan
                      </label>
                      <select
                        value={emergency2Relation}
                        onChange={(e) => setEmergency2Relation(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Saudara Kandung">Saudara Kandung</option>
                        <option value="Teman Satu Kantor">Teman Satu Kantor</option>
                        <option value="Sahabat Dekat">Sahabat Dekat</option>
                        <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        Nomor HP Aktif
                      </label>
                      <input
                        type="tel"
                        placeholder="0857-XXXX-XXXX"
                        value={emergency2Phone}
                        onChange={(e) => setEmergency2Phone(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Opsi Jaminan (2 Identitas Asli ATAU Uang Deposit) */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Pilih Metode Jaminan Persewaan
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Sesuai kebijakan Pinjamlaptop, Anda dapat memilih antara menjaminkan 2 Identitas Asli Aktif ATAU Uang Deposit yang dapat dicairkan kembali.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {/* Opsi A: 2 Identitas Asli */}
                  <label
                    onClick={() => setGuaranteeType('two_identities')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      guaranteeType === 'two_identities'
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <input
                        type="radio"
                        name="guaranteeType"
                        checked={guaranteeType === 'two_identities'}
                        onChange={() => setGuaranteeType('two_identities')}
                        className="text-blue-600"
                      />
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">
                        2 Identitas Asli & Aktif
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal pl-6">
                      Bebas biaya deposit! Cukup serahkan/verifikasi fisik 2 dokumen asli (KTP + SIM/BPKB/Ijazah/KTM).
                    </p>
                  </label>

                  {/* Opsi B: Uang Deposit */}
                  <label
                    onClick={() => setGuaranteeType('cash_deposit')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      guaranteeType === 'cash_deposit'
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <input
                        type="radio"
                        name="guaranteeType"
                        checked={guaranteeType === 'cash_deposit'}
                        onChange={() => setGuaranteeType('cash_deposit')}
                        className="text-emerald-600"
                      />
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Uang Deposit Jaminan ({formatRupiah(laptop.depositAmount)})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal pl-6">
                      Hanya perlu KTP umum. Uang jaminan dikembalikan 100% saat laptop selesai disewa & lolos inspeksi.
                    </p>
                  </label>
                </div>

                {/* Sub-form: 2 Identitas Asli */}
                {guaranteeType === 'two_identities' ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                      <Info className="w-4 h-4" />
                      <span>Sebutkan 2 Identitas Asli (Pilihan: KTP, SIM, BPKB, Ijazah, KTM)</span>
                    </div>

                    {/* Dokumen 1 */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-800 block">
                        Dokumen Identitas 1 (Utama)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Jenis Dokumen</label>
                          <select
                            value={doc1Type}
                            onChange={(e) => setDoc1Type(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200"
                          >
                            <option value="KTP">KTP (e-KTP Asli)</option>
                            <option value="SIM">SIM (SIM A/C Aktif)</option>
                            <option value="BPKB">BPKB Asli Kendaraan</option>
                            <option value="Ijazah">Ijazah Asli Pendidikan</option>
                            <option value="KTM">KTM (Kartu Mahasiswa Aktif)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Nomor Dokumen/NIK</label>
                          <input
                            type="text"
                            placeholder="Nomor identitas dokumen 1"
                            value={doc1Number}
                            onChange={(e) => setDoc1Number(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Nama Sesuai Dokumen</label>
                          <input
                            type="text"
                            placeholder="Nama pemilik identitas"
                            value={doc1HolderName}
                            onChange={(e) => setDoc1HolderName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dokumen 2 */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-800 block">
                        Dokumen Identitas 2 (Sekunder)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Jenis Dokumen</label>
                          <select
                            value={doc2Type}
                            onChange={(e) => setDoc2Type(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200"
                          >
                            <option value="SIM">SIM (SIM A/C Aktif)</option>
                            <option value="KTP">KTP (e-KTP Asli)</option>
                            <option value="BPKB">BPKB Asli Kendaraan</option>
                            <option value="Ijazah">Ijazah Asli Pendidikan</option>
                            <option value="KTM">KTM (Kartu Mahasiswa Aktif)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Nomor Dokumen/Reg</label>
                          <input
                            type="text"
                            placeholder="Nomor identitas dokumen 2"
                            value={doc2Number}
                            onChange={(e) => setDoc2Number(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Nama Sesuai Dokumen</label>
                          <input
                            type="text"
                            placeholder="Nama pemilik identitas"
                            value={doc2HolderName}
                            onChange={(e) => setDoc2HolderName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Sub-form: Uang Deposit */
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-900">
                    <p className="font-bold flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      Uang Jaminan Deposit: {formatRupiah(laptop.depositAmount)}
                    </p>
                    <p className="text-emerald-700 leading-relaxed">
                      Deposit akan ditagihkan bersama biaya sewa laptop saat checkout online. Setelah masa sewa selesai dan unit laptop kami terima dalam kondisi baik (bebas kerusakan fisik/cairan), uang deposit akan ditransfer kembali 100% ke rekening Anda dalam kurun waktu 1x24 jam.
                    </p>
                  </div>
                )}

                {/* PENGISIAN NOMOR 3: DATA MEMBER BARU (HARUS DIISI PADA NOMOR 3) */}
                {!loggedInMember ? (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-md">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                              Data Member Baru (Wajib Diisi)
                            </h4>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded">
                              Tersimpan di Database
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                            Buat ID Baru dan Password untuk akun member Anda. Seluruh detail sewa yang Anda isi (data diri, 2 kontak darurat, serta jaminan identitas/deposit) akan otomatis disimpan di Database Pinjamlaptop untuk kemudahan sewa berikutnya.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                            ID Baru <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <UserPlus className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Masukkan ID Member baru"
                              value={memberIdInput}
                              onChange={(e) => setMemberIdInput(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              required
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            ID ini digunakan saat login sewa berikutnya
                          </span>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                            Password <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Minimal 6 karakter"
                              value={memberPasswordInput}
                              onChange={(e) => setMemberPasswordInput(e.target.value)}
                              className="w-full pl-8 pr-9 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Password untuk akun member Anda
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-blue-950/60 border border-blue-800/60 rounded-xl flex items-start gap-2 text-[11px] text-blue-200">
                        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>
                          Setelah transaksi sewa selesai, seluruh data sewa dan jaminan Anda disimpan ke Database Member Pinjamlaptop.
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-emerald-900 font-semibold">
                          Akun Terhubung: <strong>{loggedInMember.fullName}</strong> ({loggedInMember.memberId})
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-medium">
                        Data Jaminan Diperbarui ke Database
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Klausul Peringatan Hangus 100% & Pembayaran Online */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in">
              {/* REQUIREMENT #3: PESAN PERINGATAN UANG TRANSAKSI HANGUS 100% */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-950 space-y-3 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-rose-900 uppercase tracking-wide">
                      Peringatan Keras Klausul Hangus 100%
                    </h4>
                    <p className="text-xs text-rose-800 leading-relaxed mt-1">
                      Harap dibaca dengan saksama sebelum Anda melakukan transaksi:
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-rose-950 font-medium space-y-2 leading-relaxed">
                  <p>
                    <strong className="text-rose-700 font-bold">1. Ketidaksesuaian Identitas:</strong> Apabila saat penyerahan unit (baik di Store Hub maupun via Kurir Pengantar), fisik 2 identitas yang diserahkan tidak asli, palsu, nama tidak cocok, atau tidak dapat ditunjukkan secara fisik, maka <strong className="text-rose-700 underline">UANG TRANSAKSI SEWA AKAN HANGUS 100%</strong> dan laptop tidak akan diserahkan.
                  </p>
                  <p>
                    <strong className="text-rose-700 font-bold">2. Ketidaksesuaian Deposit:</strong> Jika penyewa memilih opsi uang deposit namun bukti transfer deposit bermasalah atau tidak valid, transaksi dibatalkan dan uang administrasi hangus 100%.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sistem Pinjamlaptop terintegrasi dengan verifikasi database kependudukan nasional untuk mencegah penggelapan aset unit bernilai puluhan juta rupiah.
                  </p>
                </div>

                {/* Mandated Agreement Checkbox */}
                <label className="flex items-start gap-3 p-2.5 rounded-xl bg-rose-100/70 border border-rose-300 cursor-pointer hover:bg-rose-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={agreedToForfeiture}
                    onChange={(e) => setAgreedToForfeiture(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-950">
                    SAYA MENGERTI & MENYETUJUI bahwa jika 2 identitas asli fisik atau uang deposit saya tidak sesuai/palsu, maka seluruh uang transaksi yang saya bayarkan akan HANGUS 100% tanpa pengembalian dana.
                  </span>
                </label>
              </div>

              {/* Rincian Nota Sewa & Metode Pembayaran */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  Rincian Biaya & Pembayaran Online
                </h4>

                {/* Ringkasan Biaya */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Sewa {laptop.name} ({durationDays} Hari)</span>
                    <span className="font-semibold text-slate-900">{formatRupiah(pricing.subtotalRental)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pb-1 border-b border-slate-200/80">
                    <span>Cabang Penyedia & Domisili</span>
                    <span className="font-semibold text-blue-700">
                      {branchInfo.badgeLabel} • Pemesan: {customerCity}
                    </span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Diskon Paket Durasi</span>
                      <span className="font-bold">-{formatRupiah(pricing.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Penyerahan ({deliveryMethod === 'delivery' ? 'Kurir Khusus' : 'Ambil di Hub'})</span>
                    <span className="font-semibold text-slate-900">
                      {pricing.deliveryFee > 0 ? formatRupiah(pricing.deliveryFee) : 'Gratis'}
                    </span>
                  </div>
                  {guaranteeType === 'cash_deposit' && (
                    <div className="flex justify-between text-blue-700 font-medium">
                      <span>Uang Deposit Jaminan (100% Refundable)</span>
                      <span className="font-bold">{formatRupiah(pricing.depositFee)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Total Pembayaran</span>
                    <span className="text-blue-600 text-base">{formatRupiah(pricing.totalPaid)}</span>
                  </div>
                </div>

                {/* Pilihan Metode Bayar Online */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">
                    Pilih Metode Pembayaran Online
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'qris', label: 'QRIS Instan', icon: QrCode },
                      { id: 'bca_va', label: 'BCA Virtual Account', icon: CreditCard },
                      { id: 'mandiri_va', label: 'Mandiri VA', icon: CreditCard },
                      { id: 'bri_va', label: 'BRI Virtual Account', icon: CreditCard },
                      { id: 'gopay', label: 'GoPay / GoPay Later', icon: Banknote },
                      { id: 'shopeepay', label: 'ShopeePay', icon: Banknote }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                          paymentMethod === method.id
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <method.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aturan Denda Keterlambatan Rp 20.000/jam & Surat Perjanjian Resmi */}
                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
                    <Clock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>Ketentuan Denda & Surat Perjanjian Resmi:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed text-amber-900">
                    <li>
                      <strong>Denda berjalan saat masa sewa berakhir</strong> (terhitung sejak jam yang sama saat menerima unit yang disewakan) sebesar <strong>Rp 20.000 / 1 jam</strong> berjalan.
                    </li>
                    <li>
                      <strong>DENDA WAJIB DIBAYARKAN BAGAIMANAPUN SITUASINYA TANPA PENGECUALIAN</strong> (termasuk alasan kemacetan lalu lintas, cuaca buruk/hujan, lupa waktu, maupun urusan mendadak).
                    </li>
                    <li>
                      Setelah pembayaran online Anda terkonfirmasi, <strong>Surat Perjanjian Sewa Menyewa (SPK)</strong> akan langsung diperlihatkan di layar untuk <strong>wajib dibaca dan dicentang secara sadar</strong>.
                    </li>
                    <li>
                      Surat Perjanjian dapat langsung <strong>dicetak ke printer</strong> atau <strong>disimpan sebagai PDF</strong> resmi.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Surat Perjanjian Sewa Menyewa (SPK) Pasca-Pembayaran */}
          {currentStep === 5 && pendingCompletedOrder && (
            <div className="space-y-5 animate-in fade-in">
              {/* Notifikasi Pembayaran Berhasil & Wajib SPK */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm print:hidden">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950">
                      Pembayaran Berhasil Diterima! ({pendingCompletedOrder.id})
                    </h4>
                    <p className="text-xs text-emerald-900 mt-0.5">
                      Langkah Terakhir: Sesuai regulasi hukum, Surat Perjanjian Sewa di bawah ini <strong>wajib dibaca dan dicentang secara sadar</strong> sebelum unit dapat diserahkan.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrintAgreement}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors flex-shrink-0"
                  title="Akses langsung ke printer atau simpan sebagai PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>

              {/* DOKUMEN SURAT PERJANJIAN SEWA MENYEWA (PRINTABLE) */}
              <div
                id="printable-contract"
                className="bg-white border-2 border-slate-300 rounded-2xl p-5 sm:p-7 shadow-sm text-slate-900 space-y-6 text-xs sm:text-sm print:border-none print:shadow-none print:p-0"
              >
                {/* Kop Surat Resmi */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 p-2 flex items-center justify-center shadow-md flex-shrink-0">
                      <PinjamLaptopLogo variant="icon-only" size="sm" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950 leading-tight">
                        PINJAMLAPTOP.ID
                      </h3>
                      <p className="text-xs font-semibold text-blue-600">
                        Layanan Rental Laptop Resmi & Transparan
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
                        Jl. Taman Borobudur Indah B-20 • WhatsApp: 0877-2596-4455 • Website: pinjamlaptop.id
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-600 flex-shrink-0">
                    <p className="font-bold text-slate-900 uppercase">SURAT PERJANJIAN SEWA (SPK)</p>
                    <p className="font-mono">NO: SPK/PL/{new Date().getFullYear()}/{pendingCompletedOrder.id.replace('PL-', '')}</p>
                    <p>Tanggal: {new Date(pendingCompletedOrder.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h4 className="text-sm sm:text-base font-black uppercase text-slate-950 tracking-wide underline underline-offset-4">
                    SURAT PERJANJIAN SEWA MENYEWA LAPTOP
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Perjanjian Pengikatan Hak Guna Pakai Unit Komputer Jinjing & Aksesoris
                  </p>
                </div>

                {/* Para Pihak */}
                <div className="space-y-3 text-xs leading-relaxed">
                  <p className="text-justify">
                    Pada hari ini, tanggal <strong>{new Date(pendingCompletedOrder.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>, telah dibuat dan disepakati perjanjian sewa-menyewa antara:
                  </p>
                  
                  <div className="p-3 bg-slate-50 print:bg-white rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900">1. PIHAK PERTAMA (Pemberi Sewa):</p>
                    <p className="pl-4 text-slate-700">Nama Badan/Penyedia: <strong>PINJAMLAPTOP.ID</strong></p>
                    <p className="pl-4 text-slate-700">Status Operasional: Pemilik sah unit laptop dan aksesoris terdaftar berdomisili di Jl. Taman Borobudur Indah B-20.</p>
                  </div>

                  <div className="p-3 bg-slate-50 print:bg-white rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900">2. PIHAK KEDUA (Penyewa):</p>
                    <div className="pl-4 text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      <p>Nama Lengkap: <strong>{pendingCompletedOrder.customer.fullName}</strong></p>
                      <p>No. WhatsApp: <strong>{pendingCompletedOrder.customer.phone}</strong></p>
                      <p>Identitas Dokumen: <strong>{pendingCompletedOrder.identityDocs ? `${pendingCompletedOrder.identityDocs.doc1Type} (${pendingCompletedOrder.identityDocs.doc1Number})` : 'KTP Fisik Terverifikasi'}</strong></p>
                      <p>Kota / Alamat: <strong>{pendingCompletedOrder.customer.city} • {pendingCompletedOrder.customer.address}</strong></p>
                    </div>
                  </div>
                </div>

                {/* PASAL 1: OBJEK SEWA */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-950 uppercase text-xs border-l-2 border-blue-600 pl-2">
                    PASAL 1 — OBJEK SEWA & SPESIFIKASI UNIT
                  </h5>
                  <div className="p-3 bg-slate-50 print:bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                    <p>PIHAK PERTAMA menyerahkan hak guna pakai laptop berikut kepada PIHAK KEDUA:</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-2 font-medium">
                      <p>• SKU / Kode Unit: <strong className="font-mono text-blue-700">{pendingCompletedOrder.laptop.sku}</strong></p>
                      <p>• Tipe Unit: <strong>{pendingCompletedOrder.laptop.name}</strong></p>
                      <p>• Kategori: <strong>{pendingCompletedOrder.laptop.category.toUpperCase()}</strong></p>
                      <p>• Prosesor: <strong>{pendingCompletedOrder.laptop.processor}</strong></p>
                      <p>• Memori RAM: <strong>{pendingCompletedOrder.laptop.ram}</strong></p>
                      <p>• Media Simpan: <strong>{pendingCompletedOrder.laptop.storage}</strong></p>
                      <p>• Kelengkapan Bawaan: <strong>Unit Laptop, Charger Original, Tas Laptop Resmi</strong></p>
                    </div>
                  </div>
                </div>

                {/* PASAL 2: DURASI & PEMBAYARAN */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-950 uppercase text-xs border-l-2 border-blue-600 pl-2">
                    PASAL 2 — JANGKA WAKTU & BIAYA SEWA (LUNAS)
                  </h5>
                  <div className="p-3 bg-slate-50 print:bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <p>1. Masa sewa disepakati selama <strong>{pendingCompletedOrder.durationDays} Hari</strong>.</p>
                    <p>2. Jam Mulai Sewa: <strong>Mengikuti waktu aktual saat Admin menekan tombol "Mulai Sewa" pada saat serah terima unit</strong> (jadwal estimasi: {new Date(pendingCompletedOrder.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}).</p>
                    <p>3. Batas Pengembalian Sewa: <strong>Tepat {pendingCompletedOrder.durationDays} hari terhitung sejak tombol Mulai Sewa diaktifkan oleh Admin</strong>.</p>
                    <p>4. Total Biaya Sewa yang telah <strong>DIBAYAR LUNAS</strong> oleh PIHAK KEDUA: <strong>{formatRupiah(pendingCompletedOrder.pricing.totalPaid)}</strong> via {pendingCompletedOrder.paymentMethod.toUpperCase()}.</p>
                  </div>
                </div>

                {/* PASAL 3: JAMINAN */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-950 uppercase text-xs border-l-2 border-blue-600 pl-2">
                    PASAL 3 — JAMINAN IDENTITAS / DEPOSIT
                  </h5>
                  <div className="p-3 bg-slate-50 print:bg-white border border-slate-200 rounded-xl text-xs">
                    <p>
                      Bentuk Jaminan: {pendingCompletedOrder.guaranteeType === 'two_identities' ? (
                        <strong>2 Kartu Identitas Fisik Asli (KTP Asli + Dokumen Pendukung). Tanpa Deposit Uang.</strong>
                      ) : (
                        <strong>Uang Deposit Sebesar {formatRupiah(pendingCompletedOrder.laptop.depositAmount || 1500000)} (100% Refundable saat unit kembali aman).</strong>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Jaminan dikembalikan utuh seketika setelah laptop diperiksa tanpa kerusakan fungsi maupun fisik.
                    </p>
                  </div>
                </div>

                {/* PASAL 4: ATURAN DENDA KETERLAMBATAN 20RB/JAM WAJIB DIBAYARKAN BAGAIMANAPUN SITUASINYA */}
                <div className="space-y-2 p-3.5 bg-rose-50/70 print:bg-white border-2 border-rose-300 rounded-xl">
                  <h5 className="font-black text-rose-950 uppercase text-xs border-l-2 border-rose-600 pl-2">
                    PASAL 4 — DENDA KETERLAMBATAN PENGEMBALIAN & PEMBAYARAN
                  </h5>
                  <div className="space-y-1.5 text-xs text-rose-950">
                    <p className="text-justify font-medium">
                      1. Jam Mulai Sewa terhitung sejak jam yang sama saat menerima unit yang disewakan. Batas waktu pengembalian unit sewa adalah paling lambat adalah saat masa sewa habis (terhitung sejak jam yang sama saat menerima unit yang disewakan).
                    </p>
                    <p className="text-justify font-medium">
                      2. <strong>Denda berjalan saat masa sewa berakhir</strong> (terhitung sejak masa sewa habis pada jam yang sama saat menerima unit yang disewakan). Dikenakan <strong>DENDA KETERLAMBATAN SEBESAR Rp 20.000,- (DUA PULUH RIBU RUPIAH) PER 1 (SATU) JAM KETERLAMBATAN BERJALAN</strong> dan terus bertambah setiap jam berjalan.
                    </p>
                    <p className="text-justify font-bold text-rose-900 bg-white/90 p-2 rounded border border-rose-300 leading-relaxed">
                      3. DENDA WAJIB DIBAYARKAN BAGAIMANAPUN SITUASINYA TANPA PENGECUALIAN. PIHAK KEDUA mengerti dan menyepakati bahwa alasan kemacetan lalu lintas, cuaca buruk/hujan lebat, lupa waktu, kesibukan kantor/kuliah mendadak, masalah koneksi, maupun kendala pribadi apapun TIDAK DAPAT dijadikan alasan untuk menghapus atau menunda pembayaran denda keterlambatan.
                    </p>
                    <p className="text-justify font-medium">
                      4. Denda keterlambatan langsung dipotong dari uang deposit jaminan atau wajib ditransfer lunas sebelum 2 kartu identitas fisik asli diserahkan kembali oleh PIHAK PERTAMA.
                    </p>
                  </div>
                </div>

                {/* PASAL 5: KETENTUAN HUKUM PIDANA & PENGGELAPAN */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-950 uppercase text-xs border-l-2 border-blue-600 pl-2">
                    PASAL 5 — KETENTUAN HUKUM & SANKSI PIDANA
                  </h5>
                  <ol className="list-decimal pl-5 space-y-1 text-justify text-xs">
                    <li>
                      <strong>Hak Milik:</strong> Unit laptop dan seluruh aksesoris adalah hak milik mutlak PIHAK PERTAMA.
                    </li>
                    <li>
                      <strong>Larangan Penggelapan (Pasal 372 KUHP):</strong> Dilarang keras menggadaikan, menjual, memindahtangankan, atau membongkar unit laptop sewa. Tindakan tersebut merupakan tindak pidana penggelapan dan akan langsung dilaporkan ke pihak kepolisian.
                    </li>
                    <li>
                      <strong>Klausul Hangus 100%:</strong> Apabila identitas yang diberikan terbukti palsu/fiktif, maka pesanan dibatalkan dan seluruh pembayaran dinyatakan hangus 100% sebagai ganti rugi operasional.
                    </li>
                  </ol>
                </div>

                {/* Tanda Tangan */}
                <div className="pt-5 border-t border-slate-300 space-y-4">
                  <div className="p-2.5 rounded-lg bg-slate-100 print:bg-white text-center text-xs text-slate-700">
                    <p className="font-semibold">
                      Surat Perjanjian Sewa Menyewa ini dibuat dan disepakati secara sadar, tanpa paksaan, oleh kedua belah pihak.
                    </p>
                    {agreementConsciouslyAcknowledged && (
                      <p className="text-emerald-700 font-bold mt-1">
                        ✓ Telah dibaca, dipahami, dan dicentang secara sadar oleh Penyewa ({pendingCompletedOrder.customer.fullName}) pada {new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6 text-center text-xs">
                    <div className="space-y-8">
                      <p className="font-bold text-slate-900">PIHAK PERTAMA (Pemberi Sewa)</p>
                      <div>
                        <span className="px-3 py-1 rounded border-2 border-emerald-600 text-emerald-700 font-extrabold text-[11px] tracking-wider uppercase inline-block rotate-[-3deg]">
                          ✓ RESMI DISETUJUI
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 underline">PINJAMLAPTOP.ID</p>
                        <p className="text-[11px] text-slate-500">Petugas Operasional Resmi</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <p className="font-bold text-slate-900">PIHAK KEDUA (Penyewa)</p>
                      <div>
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-300">
                          {agreementConsciouslyAcknowledged ? '✓ DISETUJUI SECARA SADAR' : '(Menunggu Centang Sadar)'}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 underline">{pendingCompletedOrder.customer.fullName}</p>
                        <p className="text-[11px] text-slate-500">Penyewa Terverifikasi</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHECKBOX PERSETUJUAN SADAR PASCA-BAYAR */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-sm space-y-3 print:hidden">
                <div className="flex items-start gap-3">
                  <input
                    id="ack-conscious-checkbox"
                    type="checkbox"
                    checked={agreementConsciouslyAcknowledged}
                    onChange={(e) => setAgreementConsciouslyAcknowledged(e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded border-slate-400 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                  />
                  <label
                    htmlFor="ack-conscious-checkbox"
                    className="text-xs sm:text-sm font-bold text-slate-950 leading-snug cursor-pointer select-none"
                  >
                    SAYA TELAH MEMBACA DAN MENGETAHUI SELURUH ISI SURAT PERJANJIAN SEWA MENYEWA INI SECARA SADAR, tanpa paksaan dari pihak manapun, serta MENYETUJUI bahwa denda keterlambatan sebesar Rp 20.000 / 1 jam WAJIB DIBAYARKAN BAGAIMANAPUN SITUASINYA.
                  </label>
                </div>
                {!agreementConsciouslyAcknowledged && (
                  <p className="text-xs text-amber-900 font-semibold pl-8">
                    * Wajib dicentang untuk menyelesaikan pemesanan dan mengakses kode PIN / lacak pesanan Anda.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {currentStep === 5 ? (
            <button
              type="button"
              onClick={handlePrintAgreement}
              className="min-h-[48px] px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold text-slate-900 bg-white border-2 border-slate-300 rounded-2xl hover:bg-slate-100 flex items-center gap-2 transition-colors shadow-sm"
              title="Akses langsung dialog printer atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Cetak / Simpan PDF</span>
            </button>
          ) : currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="min-h-[48px] px-5 py-3 text-sm sm:text-base font-bold text-slate-700 bg-white border-2 border-slate-300 rounded-2xl hover:bg-slate-100 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 py-3 text-sm sm:text-base font-bold text-slate-700 bg-white border-2 border-slate-300 rounded-2xl hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
          )}

          <div className="flex items-center gap-3">
            {currentStep < 5 && (
              <div className="text-right hidden sm:block">
                <span className="text-xs text-slate-500 font-bold block">Total Pembayaran</span>
                <span className="text-base sm:text-lg font-black text-blue-700">
                  {formatRupiah(pricing.totalPaid)}
                </span>
              </div>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="min-h-[48px] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-black rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <span>Lanjut Langkah {currentStep + 1}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : currentStep === 4 ? (
              <button
                type="button"
                disabled={!agreedToForfeiture || isProcessingPayment}
                onClick={handleProcessOrder}
                className={`min-h-[48px] px-7 py-3 text-sm sm:text-base font-black rounded-2xl shadow-lg transition-all flex items-center gap-2.5 ${
                  !agreedToForfeiture || isProcessingPayment
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                }`}
              >
                {isProcessingPayment ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses Pembayaran...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Konfirmasi & Bayar {formatRupiah(pricing.totalPaid)}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled={!agreementConsciouslyAcknowledged}
                onClick={handleCompleteAgreement}
                className={`min-h-[48px] px-6 sm:px-8 py-3 text-sm sm:text-base font-black rounded-2xl shadow-lg transition-all flex items-center gap-2.5 ${
                  !agreementConsciouslyAcknowledged
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Saya Setuju & Buka Pelacakan Pesanan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
