import * as XLSX from 'xlsx';
import { Laptop, LaptopCategory, BranchCity } from '../types';
import { generateLaptopSku, generateSerialNumber, formatBrandCode } from '../data/laptops';

// Curated high quality tech & laptop images based on category / brand
const FALLBACK_IMAGES: Record<string, string> = {
  Office: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80',
  Student: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
  Creator: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80',
  Gaming: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80',
  Performance: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=1000&q=80',
  Default: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80'
};

export interface ExcelParseResult {
  success: boolean;
  laptops: Laptop[];
  errors: string[];
  warnings: string[];
  totalRows: number;
}

/**
 * Deteksi otomatis merk laptop dari nama produk
 */
export const detectBrandFromName = (laptopName: string): string => {
  const norm = laptopName.toUpperCase().trim();
  if (norm.includes('LENOVO') || norm.includes('THINKPAD') || norm.includes('IDEAPAD') || norm.includes('YOGA')) return 'Lenovo';
  if (norm.includes('HP') || norm.includes('PAVILION') || norm.includes('PROBOOK') || norm.includes('ELITEBOOK') || norm.includes('OMEN') || norm.includes('VICTUS')) return 'HP';
  if (norm.includes('ASUS') || norm.includes('VIVABOOK') || norm.includes('ZENBOOK') || norm.includes('ROG') || norm.includes('TUF') || norm.includes('EXPERTBOOK')) return 'ASUS';
  if (norm.includes('DELL') || norm.includes('LATITUDE') || norm.includes('INSPIRON') || norm.includes('XPS') || norm.includes('VOSTRO') || norm.includes('ALIENWARE')) return 'Dell';
  if (norm.includes('APPLE') || norm.includes('MACBOOK')) return 'Apple';
  if (norm.includes('ACER') || norm.includes('ASPIRE') || norm.includes('SWIFT') || norm.includes('PREDATOR') || norm.includes('NITRO')) return 'Acer';
  if (norm.includes('MSI')) return 'MSI';
  if (norm.includes('AXIOO') || norm.includes('HYPE') || norm.includes('PONGO')) return 'Axioo';
  if (norm.includes('ADVAN') || norm.includes('WORKPLUS') || norm.includes('SOULMATE')) return 'Advan';
  if (norm.includes('INFINIX') || norm.includes('INBOOK')) return 'Infinix';
  if (norm.includes('HUAWEI') || norm.includes('MATEBOOK')) return 'Huawei';
  if (norm.includes('MICROSOFT') || norm.includes('SURFACE')) return 'Microsoft';
  if (norm.includes('SAMSUNG') || norm.includes('GALAXY BOOK')) return 'Samsung';

  const firstWord = laptopName.trim().split(' ')[0];
  if (firstWord && firstWord.length >= 2) {
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  }
  return 'Laptop';
};

/**
 * Deteksi otomatis kategori laptop dari nama, VGA, dan tarif harian
 */
export const detectCategoryFromNameAndSpecs = (laptopName: string, vga: string, dailyPrice: number): LaptopCategory => {
  const combined = (laptopName + ' ' + vga).toUpperCase();
  if (
    combined.includes('RTX') || 
    combined.includes('GTX') || 
    combined.includes('GAMING') || 
    combined.includes('ROG') || 
    combined.includes('TUF') || 
    combined.includes('PREDATOR') || 
    combined.includes('NITRO') ||
    combined.includes('RADEON RX')
  ) {
    return 'Gaming & AI';
  }

  if (
    combined.includes('MACBOOK') || 
    combined.includes('XPS') || 
    combined.includes('OLED') || 
    combined.includes('CREATOR') || 
    combined.includes('PROMOTION') || 
    combined.includes('RETINA') || 
    combined.includes('ZENBOOK') ||
    combined.includes('LIQUID RETINA')
  ) {
    return 'Desain & Render';
  }

  if (
    combined.includes('THINKPAD') || 
    combined.includes('CORE I7') || 
    combined.includes('RYZEN 7') || 
    combined.includes('CORE I9') ||
    combined.includes('16GB') || 
    combined.includes('32GB') || 
    dailyPrice >= 130000
  ) {
    return 'Programming & Dev';
  }

  return 'Bisnis & Kantor';
};

/**
 * Generate dan unduh file template Excel (.xlsx) acuan untuk upload produk baru
 * Format 16 Kolom Sesuai Ketentuan Resmi PinjamLaptop.id:
 * 1. SKU / Kode Unit (Opsional)
 * 2. Nama Laptop
 * 3. Serial Number
 * 4. Harga Harian (Rp)
 * 5. Harga Mingguan (Rp)
 * 6. Harga Bulanan (Rp)
 * 7. Uang Jaminan / Deposit (Rp)
 * 8. Denda Telat Per Jam (Rp)
 * 9. Stok Unit Fisik
 * 10. Lokasi Unit (Malang/Sidoarjo/Bekasi)
 * 11. Prosesor
 * 12. RAM
 * 13. VGA
 * 14. Layar
 * 15. Deskripsi
 * 16. URL Gambar (Opsional)
 */
export const downloadLaptopExcelTemplate = (): void => {
  const wb = XLSX.utils.book_new();

  // 1. Data Contoh untuk Sheet Katalog (16 Kolom Presisi)
  const sampleData = [
    {
      'SKU / Kode Unit (Opsional)': 'PL-LNV-001',
      'Nama Laptop': 'Lenovo ThinkPad L470 Core i5',
      'Serial Number': 'SN-LNV-001-84291',
      'Harga Harian (Rp)': 50000,
      'Harga Mingguan (Rp)': 300000,
      'Harga Bulanan (Rp)': 950000,
      'Uang Jaminan / Deposit (Rp)': 1000000,
      'Denda Telat Per Jam (Rp)': 20000,
      'Stok Unit Fisik': 5,
      'Lokasi Unit (Malang/Sidoarjo/Bekasi)': 'Malang',
      'Prosesor': 'Intel Core i5-7200U (2.5GHz up to 3.1GHz)',
      'RAM': '8 GB DDR4',
      'VGA': 'Intel HD Graphics 620',
      'Layar': '14.0" HD (1366x768) Anti-Glare',
      'Deskripsi': 'Unit operasional hemat dan tangguh untuk kasir toko, administrasi harian, entri data excel, dan tugas sekolah.',
      'URL Gambar (Opsional)': ''
    },
    {
      'SKU / Kode Unit (Opsional)': 'PL-HP-002',
      'Nama Laptop': 'HP 14s Core i3 Essential SSD',
      'Serial Number': 'SN-HP-002-39201',
      'Harga Harian (Rp)': 65000,
      'Harga Mingguan (Rp)': 390000,
      'Harga Bulanan (Rp)': 1250000,
      'Uang Jaminan / Deposit (Rp)': 1000000,
      'Denda Telat Per Jam (Rp)': 20000,
      'Stok Unit Fisik': 4,
      'Lokasi Unit (Malang/Sidoarjo/Bekasi)': 'Sidoarjo',
      'Prosesor': 'Intel Core i3-1005G1 (1.2GHz up to 3.4GHz)',
      'RAM': '8 GB DDR4 2666MHz',
      'VGA': 'Intel UHD Graphics',
      'Layar': '14.0" HD (1366x768) BrightView',
      'Deskripsi': 'Laptop ringan dan elegan dengan SSD NVMe responsif untuk perkuliahan, presentasi kantor, dan meeting online.',
      'URL Gambar (Opsional)': ''
    },
    {
      'SKU / Kode Unit (Opsional)': 'PL-ASU-003',
      'Nama Laptop': 'ASUS TUF Gaming A15 RTX 3050',
      'Serial Number': 'SN-ASU-003-71829',
      'Harga Harian (Rp)': 165000,
      'Harga Mingguan (Rp)': 990000,
      'Harga Bulanan (Rp)': 3200000,
      'Uang Jaminan / Deposit (Rp)': 2000000,
      'Denda Telat Per Jam (Rp)': 20000,
      'Stok Unit Fisik': 3,
      'Lokasi Unit (Malang/Sidoarjo/Bekasi)': 'Bekasi',
      'Prosesor': 'AMD Ryzen 5 7535HS (6 Cores, 12 Threads)',
      'RAM': '16 GB DDR5 4800MHz',
      'VGA': 'NVIDIA GeForce RTX 3050 4GB GDDR6',
      'Layar': '15.6" FHD 144Hz IPS-Level Adaptive-Sync',
      'Deskripsi': 'Laptop performa tinggi dengan GPU diskrit RTX dan refresh rate 144Hz untuk rendering 3D, video editing, dan gaming.',
      'URL Gambar (Opsional)': ''
    },
    {
      'SKU / Kode Unit (Opsional)': 'PL-APP-004',
      'Nama Laptop': 'Apple MacBook Air 13" M1 Space Grey',
      'Serial Number': 'SN-APP-004-94012',
      'Harga Harian (Rp)': 150000,
      'Harga Mingguan (Rp)': 900000,
      'Harga Bulanan (Rp)': 2900000,
      'Uang Jaminan / Deposit (Rp)': 2000000,
      'Denda Telat Per Jam (Rp)': 20000,
      'Stok Unit Fisik': 2,
      'Lokasi Unit (Malang/Sidoarjo/Bekasi)': 'Malang',
      'Prosesor': 'Apple M1 Chip (8-Core CPU)',
      'RAM': '8 GB Unified Memory',
      'VGA': 'Apple 7-Core GPU',
      'Layar': '13.3" Retina Display (2560x1600) True Tone',
      'Deskripsi': 'Baterai hingga 18 jam, bodi tipis premium tanpa kipas (silent), layar Retina dengan akurasi warna tinggi.',
      'URL Gambar (Opsional)': ''
    }
  ];

  const wsKatalog = XLSX.utils.json_to_sheet(sampleData);

  // Atur lebar 16 kolom agar nyaman dibaca dan diisi
  wsKatalog['!cols'] = [
    { wch: 25 }, // 1. SKU / Kode Unit (Opsional)
    { wch: 34 }, // 2. Nama Laptop
    { wch: 25 }, // 3. Serial Number
    { wch: 18 }, // 4. Harga Harian (Rp)
    { wch: 20 }, // 5. Harga Mingguan (Rp)
    { wch: 20 }, // 6. Harga Bulanan (Rp)
    { wch: 25 }, // 7. Uang Jaminan / Deposit (Rp)
    { wch: 24 }, // 8. Denda Telat Per Jam (Rp)
    { wch: 16 }, // 9. Stok Unit Fisik
    { wch: 32 }, // 10. Lokasi Unit (Malang/Sidoarjo/Bekasi)
    { wch: 38 }, // 11. Prosesor
    { wch: 18 }, // 12. RAM
    { wch: 28 }, // 13. VGA
    { wch: 32 }, // 14. Layar
    { wch: 55 }, // 15. Deskripsi
    { wch: 30 }  // 16. URL Gambar (Opsional)
  ];

  XLSX.utils.book_append_sheet(wb, wsKatalog, 'Data Katalog Laptop');

  // 2. Sheet Panduan Pengisian (Dokumentasi 16 Kolom Lengkap)
  const instructionsData = [
    {
      'No': 1,
      'Nama Kolom': 'SKU / Kode Unit (Opsional)',
      'Status': 'OPSIONAL (OTOMATIS)',
      'Keterangan & Format Pengisian': 'Kode unik identitas unit laptop (contoh: PL-LNV-001). Jika dikosongkan, sistem PinjamLaptop otomatis menerbitkan SKU resmi sesuai merk dan nomor urut.'
    },
    {
      'No': 2,
      'Nama Kolom': 'Nama Laptop',
      'Status': 'WAJIB DIISI',
      'Keterangan & Format Pengisian': 'Nama dan tipe model lengkap laptop. Contoh: "Lenovo ThinkPad L470 Core i5" atau "HP Pavilion 14 Core i5".'
    },
    {
      'No': 3,
      'Nama Kolom': 'Serial Number',
      'Status': 'OPSIONAL (OTOMATIS)',
      'Keterangan & Format Pengisian': 'Nomor seri fisik unik pada unit laptop (contoh: SN-LNV-001-84291). Jika dikosongkan, sistem otomatis menerbitkan Serial Number unik terdaftar.'
    },
    {
      'No': 4,
      'Nama Kolom': 'Harga Harian (Rp)',
      'Status': 'WAJIB DIISI',
      'Keterangan & Format Pengisian': 'Tarif sewa per hari dalam angka murni tanpa titik atau simbol Rp. Contoh: 65000 (kisaran Rp 50.000 s/d Rp 350.000).'
    },
    {
      'No': 5,
      'Nama Kolom': 'Harga Mingguan (Rp)',
      'Status': 'OPSIONAL (OTOMATIS)',
      'Keterangan & Format Pengisian': 'Tarif paket sewa 7 hari. Jika dikosongkan, sistem menghitung otomatis dengan diskon mingguan (Tarif Harian x 6).'
    },
    {
      'No': 6,
      'Nama Kolom': 'Harga Bulanan (Rp)',
      'Status': 'OPSIONAL (OTOMATIS)',
      'Keterangan & Format Pengisian': 'Tarif paket sewa 30 hari. Jika dikosongkan, sistem menghitung otomatis dengan diskon bulanan (Tarif Harian x 20).'
    },
    {
      'No': 7,
      'Nama Kolom': 'Uang Jaminan / Deposit (Rp)',
      'Status': 'OPSIONAL (OTOMATIS)',
      'Keterangan & Format Pengisian': 'Nominal jaminan tunai yang dikembalikan jika penyewa memilih opsi uang deposit. Jika dikosongkan, default adalah Rp 1.000.000.'
    },
    {
      'No': 8,
      'Nama Kolom': 'Denda Telat Per Jam (Rp)',
      'Status': 'OPSIONAL (OTOMATIS)',
      'Keterangan & Format Pengisian': 'Besaran denda keterlambatan pengembalian unit per jam. Standar regulasi resmi PinjamLaptop.id adalah Rp 20.000 per jam berjalan.'
    },
    {
      'No': 9,
      'Nama Kolom': 'Stok Unit Fisik',
      'Status': 'OPSIONAL (DEFAULT: 1)',
      'Keterangan & Format Pengisian': 'Jumlah fisik laptop yang siap disewakan di gudang cabang terkait. Contoh: 3 atau 5.'
    },
    {
      'No': 10,
      'Nama Kolom': 'Lokasi Unit (Malang/Sidoarjo/Bekasi)',
      'Status': 'WAJIB / DISARANKAN',
      'Keterangan & Format Pengisian': 'Penempatan unit cabang sewa. Pilih salah satu: "Malang" (Pusat), "Sidoarjo", atau "Bekasi". Menentukan aturan domisili penyewa.'
    },
    {
      'No': 11,
      'Nama Kolom': 'Prosesor',
      'Status': 'DISARANKAN',
      'Keterangan & Format Pengisian': 'Spesifikasi CPU / Prosesor unit. Contoh: "Intel Core i5-10210U" atau "AMD Ryzen 5 5500U".'
    },
    {
      'No': 12,
      'Nama Kolom': 'RAM',
      'Status': 'DISARANKAN',
      'Keterangan & Format Pengisian': 'Kapasitas dan jenis memori RAM. Contoh: "8 GB DDR4" atau "16 GB DDR5 4800MHz".'
    },
    {
      'No': 13,
      'Nama Kolom': 'VGA',
      'Status': 'DISARANKAN',
      'Keterangan & Format Pengisian': 'Kartu grafis / GPU laptop. Contoh: "Intel Iris Xe Graphics" atau "NVIDIA GeForce RTX 3050 4GB".'
    },
    {
      'No': 14,
      'Nama Kolom': 'Layar',
      'Status': 'DISARANKAN',
      'Keterangan & Format Pengisian': 'Ukuran dan tipe layar monitor. Contoh: "14.0\\" Full HD IPS" atau "15.6\\" 144Hz".'
    },
    {
      'No': 15,
      'Nama Kolom': 'Deskripsi',
      'Status': 'OPSIONAL',
      'Keterangan & Format Pengisian': 'Keterangan keunggulan unit, kondisi fisik, dan kesiapan aplikasi kantor untuk kenyamanan penyewa.'
    },
    {
      'No': 16,
      'Nama Kolom': 'URL Gambar (Opsional)',
      'Status': 'OPSIONAL (OTOMATIS)',
      'Keterangan & Format Pengisian': 'Tautan gambar online laptop (https://...). Jika kosong, sistem otomatis memasang gambar laptop terbaik sesuai merk/kategori.'
    }
  ];

  const wsPanduan = XLSX.utils.json_to_sheet(instructionsData);
  wsPanduan['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 24 },
    { wch: 75 }
  ];

  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Panduan Pengisian');

  // Unduh file secara otomatis ke perangkat pengguna
  XLSX.writeFile(wb, 'Template_Katalog_Laptop_PinjamLaptop.xlsx');
};

/**
 * Ekspor katalog aktif saat ini ke format Excel dengan 16 kolom yang sama
 */
export const exportCurrentCatalogToExcel = (laptops: Laptop[]): void => {
  const wb = XLSX.utils.book_new();

  const exportData = laptops.map((l, index) => ({
    'SKU / Kode Unit (Opsional)': l.sku,
    'Nama Laptop': l.name,
    'Serial Number': l.serialNumber || generateSerialNumber(l, index),
    'Harga Harian (Rp)': l.dailyPrice,
    'Harga Mingguan (Rp)': l.weeklyPrice,
    'Harga Bulanan (Rp)': l.monthlyPrice,
    'Uang Jaminan / Deposit (Rp)': l.depositAmount,
    'Denda Telat Per Jam (Rp)': l.lateFeePerHour,
    'Stok Unit Fisik': l.availableUnits,
    'Lokasi Unit (Malang/Sidoarjo/Bekasi)': l.branchCity || 'Malang',
    'Prosesor': l.processor,
    'RAM': l.ram,
    'VGA': l.gpu,
    'Layar': l.display,
    'Deskripsi': l.description,
    'URL Gambar (Opsional)': l.image
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 25 },
    { wch: 34 },
    { wch: 25 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 25 },
    { wch: 24 },
    { wch: 16 },
    { wch: 32 },
    { wch: 38 },
    { wch: 18 },
    { wch: 28 },
    { wch: 32 },
    { wch: 55 },
    { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Data Katalog PinjamLaptop');
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Katalog_Laptop_PinjamLaptop_${dateStr}.xlsx`);
};

/**
 * Normalisasi string key dari header Excel
 */
const normalizeKey = (key: string): string => {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Parsing angka dari string/number di file Excel
 */
const parseNumeric = (val: unknown, fallback: number = 0): number => {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Parsing file Excel yang diunggah pengguna menjadi array objek Laptop
 * Mendukung format 16 kolom resmi maupun variasi penamaan kolom umum
 */
export const parseLaptopExcelFile = async (file: File): Promise<ExcelParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          resolve({
            success: false,
            laptops: [],
            errors: ['File Excel tidak memiliki lembar kerja (worksheet).'],
            warnings: [],
            totalRows: 0
          });
          return;
        }

        // Ambil sheet pertama (atau sheet dengan nama 'Katalog' jika ada)
        const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('katalog')) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          resolve({
            success: false,
            laptops: [],
            errors: ['Lembar kerja Excel tidak dapat dibaca.'],
            warnings: [],
            totalRows: 0
          });
          return;
        }

        // Konversi sheet ke JSON
        const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          resolve({
            success: false,
            laptops: [],
            errors: ['File Excel kosong atau tidak memiliki baris data produk.'],
            warnings: [],
            totalRows: 0
          });
          return;
        }

        const laptops: Laptop[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];

        rawRows.forEach((row, rowIndex) => {
          const rowNumber = rowIndex + 2; // Baris 1 adalah header di Excel

          // Buat map normalized keys untuk toleransi variasi penamaan kolom
          const normalizedRow: Record<string, unknown> = {};
          Object.keys(row).forEach((k) => {
            normalizedRow[normalizeKey(k)] = row[k];
          });

          // Helper getter
          const getVal = (...keys: string[]): string => {
            for (const key of keys) {
              const nKey = normalizeKey(key);
              if (normalizedRow[nKey] !== undefined && String(normalizedRow[nKey]).trim() !== '') {
                return String(normalizedRow[nKey]).trim();
              }
            }
            return '';
          };

          const getNum = (...keys: string[]): number => {
            for (const key of keys) {
              const nKey = normalizeKey(key);
              if (normalizedRow[nKey] !== undefined && normalizedRow[nKey] !== '') {
                return parseNumeric(normalizedRow[nKey], 0);
              }
            }
            return 0;
          };

          // 1. SKU / Kode Unit (Opsional)
          const rawSku = getVal('skukodeunitopsional', 'skukodeunit', 'sku', 'kodeunit', 'kodeproduk');

          // 2. Nama Laptop (Wajib)
          const name = getVal('namalaptop', 'nama', 'name', 'model', 'tipe');
          if (!name) {
            errors.push(`Baris ${rowNumber}: Kolom 'Nama Laptop' wajib diisi.`);
            return;
          }

          // 3. Serial Number
          const rawSn = getVal('serialnumber', 'sn', 'nomorseri', 'seri', 'serial');

          // Deteksi merk laptop
          const explicitBrand = getVal('brand', 'merk', 'brandmerk', 'merek');
          const brand = explicitBrand || detectBrandFromName(name);

          // 4. Harga Harian (Rp) (Wajib)
          const rawDailyPrice = getNum('hargaharianrp', 'hargaharian', 'hargasewaharian', 'dailyprice', 'harga', 'tarifharian');
          if (rawDailyPrice <= 0) {
            errors.push(`Baris ${rowNumber} ("${name}"): 'Harga Harian (Rp)' wajib diisi dengan nominal lebih dari 0.`);
            return;
          }
          const dailyPrice = Math.round(rawDailyPrice);

          // 5. Harga Mingguan (Rp)
          const rawWeekly = getNum('hargamingguanrp', 'hargamingguan', 'hargasewamingguan', 'weeklyprice', 'tarifmingguan');
          const weeklyPrice = rawWeekly > 0 ? Math.round(rawWeekly) : Math.round(dailyPrice * 6);

          // 6. Harga Bulanan (Rp)
          const rawMonthly = getNum('hargabulananrp', 'hargabulanan', 'hargasewabulanan', 'monthlyprice', 'tarifbulanan');
          const monthlyPrice = rawMonthly > 0 ? Math.round(rawMonthly) : Math.round(dailyPrice * 20);

          // 7. Uang Jaminan / Deposit (Rp)
          const rawDeposit = getNum('uangjaminandepositrp', 'uangjaminan', 'deposit', 'uangjaminandeposit', 'jaminan');
          const depositAmount = rawDeposit > 0 ? Math.round(rawDeposit) : 1000000;

          // 8. Denda Telat Per Jam (Rp)
          const rawLateFee = getNum('dendatelatperjamrp', 'dendatelatperjam', 'dendatelat', 'denda', 'latefee');
          const lateFeePerHour = rawLateFee > 0 ? Math.round(rawLateFee) : 20000;

          // 9. Stok Unit Fisik
          const rawStock = getNum('stokunitfisik', 'stokunit', 'stok', 'stock', 'availableunits');
          const availableUnits = rawStock > 0 ? Math.round(rawStock) : 1;

          // 10. Lokasi Unit (Malang/Sidoarjo/Bekasi)
          const rawLocation = getVal(
            'lokasiunitmalangsidoarjobekasi', 
            'lokasiunit', 
            'lokasifisik', 
            'lokasi', 
            'cabang', 
            'kota', 
            'city', 
            'cabangpenempatan'
          );
          let branchCity: BranchCity = 'Malang';
          const locLower = rawLocation.toLowerCase();
          if (locLower.includes('sidoarjo') || locLower.includes('surabaya')) {
            branchCity = 'Sidoarjo';
          } else if (locLower.includes('bekasi') || locLower.includes('jakarta')) {
            branchCity = 'Bekasi';
          } else {
            branchCity = 'Malang';
          }

          // 11. Prosesor
          const processor = getVal('prosesor', 'processor', 'cpu') || 'Intel Core i5 Multi-Core Processor';

          // 12. RAM
          const ram = getVal('ram', 'memori', 'memory') || '16 GB RAM';

          // 13. VGA
          const gpu = getVal('vga', 'gpu', 'kartugrafis', 'vgacard') || 'Integrated High Definition Graphics';

          // 14. Layar
          const display = getVal('layar', 'display', 'screen') || '14.0" FHD IPS Anti-glare';

          // 15. Deskripsi
          const description = getVal('deskripsi', 'description', 'keterangan') || 
            `Laptop ${brand} ${name} dalam kondisi prima, terpasang sistem operasi asli dan aplikasi siap pakai untuk kebutuhan kerja maupun perkuliahan.`;

          // 16. URL Gambar (Opsional)
          let image = getVal('urlgambaropsional', 'urlgambar', 'gambar', 'image', 'fotolaptop', 'imageurl');
          if (!image || !image.startsWith('http')) {
            const primaryTheme = dailyPrice >= 160000 ? 'Performance' : dailyPrice <= 80000 ? 'Student' : 'Office';
            image = FALLBACK_IMAGES[primaryTheme] || FALLBACK_IMAGES.Default;
          }

          // Kategori Utama & Tema Kategori
          const explicitCategory = getVal('kategoriutama', 'kategori', 'category');
          const category = (explicitCategory as LaptopCategory) || detectCategoryFromNameAndSpecs(name, gpu, dailyPrice);

          const themeCategories: ('Office' | 'Student' | 'Creator' | 'Gaming' | 'Performance')[] = [];
          if (category === 'Gaming & AI') {
            themeCategories.push('Gaming', 'Performance');
          } else if (category === 'Desain & Render') {
            themeCategories.push('Creator', 'Performance');
          } else if (category === 'Programming & Dev') {
            themeCategories.push('Performance', 'Office');
          } else if (dailyPrice <= 95000) {
            themeCategories.push('Office', 'Student');
          } else {
            themeCategories.push('Office');
          }

          // Storage SSD detection from specs / name
          const storage = getVal('storage', 'storagessd', 'ssd', 'harddisk') || '512 GB PCIe NVMe SSD';

          // Aksesoris standar
          const includedAccessories = [
            'Charger Adaptor Original Bergaransi',
            'Tas Laptop Anti-Air Pelindung',
            'Mouse Wireless Silent Siap Pakai'
          ];

          // Generate ID unik, SKU, dan Serial Number
          const sanitizedSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          const id = `lap-excel-${sanitizedSlug}-${Date.now().toString(36).slice(-4)}-${rowIndex + 1}`;
          
          const sku = rawSku || generateLaptopSku({ brand, id: String(rowIndex + 1) }, rowIndex);
          const serialNumber = rawSn || generateSerialNumber({ brand, id: String(rowIndex + 1) }, rowIndex);

          const laptop: Laptop = {
            id,
            sku,
            name,
            serialNumber,
            brand,
            category,
            branchCity,
            branchHubId: branchCity === 'Malang' ? 'hub-malang' : branchCity === 'Sidoarjo' ? 'hub-sidoarjo' : 'hub-bekasi',
            themeCategories,
            processor,
            specCpu: processor.split('(')[0].trim(),
            ram,
            specRam: ram.includes('GB') ? ram.split(' ')[0] + ' ' + (ram.includes('Unified') ? 'Unified' : 'RAM') : ram,
            storage,
            specStorage: storage.includes('GB') || storage.includes('TB') ? storage.split(' ')[0] + ' SSD' : storage,
            gpu,
            display,
            weight: '1.45 kg',
            batteryLife: 'Hingga 8 jam',
            dailyPrice,
            weeklyPrice,
            monthlyPrice,
            depositAmount,
            lateFeePerHour,
            image,
            availableUnits,
            badge: category === 'Gaming & AI' ? 'Performa GPU' : category === 'Desain & Render' ? 'Layar Akurat' : undefined,
            hasOledBadge: display.toUpperCase().includes('OLED') || name.toUpperCase().includes('OLED'),
            includedAccessories,
            description
          };

          laptops.push(laptop);
        });

        resolve({
          success: errors.length === 0 || laptops.length > 0,
          laptops,
          errors,
          warnings,
          totalRows: rawRows.length
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Format file Excel tidak valid.';
        resolve({
          success: false,
          laptops: [],
          errors: [`Gagal membaca file Excel: ${errorMsg}`],
          warnings: [],
          totalRows: 0
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        laptops: [],
        errors: ['Terjadi kesalahan saat membaca file dari komputer Anda.'],
        warnings: [],
        totalRows: 0
      });
    };

    reader.readAsArrayBuffer(file);
  });
};
