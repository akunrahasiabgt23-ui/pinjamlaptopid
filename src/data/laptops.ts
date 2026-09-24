import { Laptop, BranchCity } from '../types';
import { LAPTOP_BATCH_1 } from './laptopBatch1';
import { LAPTOP_BATCH_2 } from './laptopBatch2';

// 3 Cabang Resmi: Malang (Pusat), Sidoarjo, Bekasi
export const BRANCH_LOCATIONS: {
  city: BranchCity;
  label: string;
  badgeLabel: string;
  isPusat: boolean;
  hubId: string;
  allowedDomiciles: string[];
  description: string;
}[] = [
  {
    city: 'Malang',
    label: 'Malang (Pusat)',
    badgeLabel: 'Pusat Malang',
    isPusat: true,
    hubId: 'hub-malang',
    allowedDomiciles: ['Kota Malang', 'Kabupaten Malang', 'Kota Batu', 'Malang Kota', 'Malang Kabupaten', 'Batu'],
    description: 'Pusat Pinjam Laptop (Melayani Kota Malang, Kabupaten Malang & Kota Batu)'
  },
  {
    city: 'Sidoarjo',
    label: 'Sidoarjo',
    badgeLabel: 'Cabang Sidoarjo',
    isPusat: false,
    hubId: 'hub-sidoarjo',
    allowedDomiciles: ['Sidoarjo', 'Surabaya'],
    description: 'Cabang Sidoarjo (Melayani Sidoarjo & Surabaya)'
  },
  {
    city: 'Bekasi',
    label: 'Bekasi',
    badgeLabel: 'Cabang Bekasi',
    isPusat: false,
    hubId: 'hub-bekasi',
    allowedDomiciles: [
      'Bekasi Kota', 'Bekasi Kabupaten', 'Kota Bekasi', 'Kabupaten Bekasi',
      'Jakarta', 'Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara',
      'Semua Jakarta'
    ],
    description: 'Cabang Bekasi (Melayani Bekasi Kota/Kabupaten & Semua Jakarta)'
  }
];

// Daftar opsi wilayah domisili untuk form pemesanan
export const DOMICILE_OPTIONS_BY_BRANCH: Record<BranchCity, { value: string; label: string }[]> = {
  Malang: [
    { value: 'Malang Kota', label: 'Kota Malang' },
    { value: 'Malang Kabupaten', label: 'Kabupaten Malang' },
    { value: 'Kota Batu', label: 'Kota Batu' },
  ],
  Sidoarjo: [
    { value: 'Sidoarjo', label: 'Sidoarjo' },
    { value: 'Surabaya', label: 'Surabaya' },
  ],
  Bekasi: [
    { value: 'Bekasi Kota', label: 'Kota Bekasi' },
    { value: 'Bekasi Kabupaten', label: 'Kabupaten Bekasi' },
    { value: 'Jakarta Selatan', label: 'Jakarta Selatan' },
    { value: 'Jakarta Pusat', label: 'Jakarta Pusat' },
    { value: 'Jakarta Barat', label: 'Jakarta Barat' },
    { value: 'Jakarta Timur', label: 'Jakarta Timur' },
    { value: 'Jakarta Utara', label: 'Jakarta Utara' },
  ]
};

// Cek apakah domisili penyewa diizinkan untuk menyewa laptop di cabang tertentu
export const isDomicileAllowedForBranch = (
  branchCity: BranchCity | undefined,
  domicileCity: string
): { allowed: boolean; reason?: string } => {
  const branch = branchCity || 'Malang';
  const normDom = domicileCity.toLowerCase().trim();

  if (branch === 'Malang') {
    // Malang: Malang Kota, Malang Kabupaten, dan Kota Batu
    const isMalang = normDom.includes('malang') || normDom.includes('batu');
    if (isMalang) return { allowed: true };
    return {
      allowed: false,
      reason: `Unit ini berlokasi di Pusat Malang dan hanya dapat disewa oleh penyewa berdomisili Malang Kota, Malang Kabupaten, atau Kota Batu (Domisili Anda saat ini: "${domicileCity}").`
    };
  }

  if (branch === 'Sidoarjo') {
    // Sidoarjo: Sidoarjo dan Surabaya
    const isSidoarjoSurabaya = normDom.includes('sidoarjo') || normDom.includes('surabaya');
    if (isSidoarjoSurabaya) return { allowed: true };
    return {
      allowed: false,
      reason: `Unit ini berlokasi di Cabang Sidoarjo dan hanya dapat disewa oleh penyewa berdomisili Sidoarjo atau Surabaya (Domisili Anda saat ini: "${domicileCity}").`
    };
  }

  if (branch === 'Bekasi') {
    // Bekasi: Bekasi kota dan Kabupaten, dan Semua Jakarta
    const isBekasiOrJakarta = normDom.includes('bekasi') || normDom.includes('jakarta');
    if (isBekasiOrJakarta) return { allowed: true };
    return {
      allowed: false,
      reason: `Unit ini berlokasi di Cabang Bekasi dan hanya dapat disewa oleh penyewa berdomisili Bekasi (Kota/Kabupaten) atau Seluruh Wilayah Jakarta (Domisili Anda saat ini: "${domicileCity}").`
    };
  }

  return { allowed: true };
};

// Helper deterministik untuk membagi 100 laptop ke 3 cabang
export const getBranchCityForLaptop = (laptop: Partial<Laptop>, index: number): BranchCity => {
  if (laptop.branchCity) return laptop.branchCity;
  // Distribusi proporsional: 
  // Malang (Pusat) ~ 40 unit, Sidoarjo ~ 30 unit, Bekasi ~ 30 unit
  const mod = index % 10;
  if (mod === 0 || mod === 1 || mod === 4 || mod === 7) {
    return 'Malang'; // 40% (Pusat)
  }
  if (mod === 2 || mod === 5 || mod === 8) {
    return 'Sidoarjo'; // 30%
  }
  return 'Bekasi'; // 30%
};

export const formatBrandCode = (brand: string): string => {
  const b = (brand || '').toUpperCase().trim();
  if (b.includes('LENOVO')) return 'LNV';
  if (b.includes('DELL')) return 'DEL';
  if (b.includes('HP') || b.includes('HEWLETT')) return 'HP';
  if (b.includes('ASUS')) return 'ASU';
  if (b.includes('ACER')) return 'ACR';
  if (b.includes('APPLE') || b.includes('MACBOOK')) return 'APP';
  if (b.includes('MSI')) return 'MSI';
  if (b.includes('ADVAN')) return 'ADV';
  if (b.includes('AXIOO')) return 'AXI';
  if (b.includes('INFINIX')) return 'INF';
  if (b.includes('XIAOMI') || b.includes('REDMIBOOK')) return 'XIA';
  if (b.includes('HUAWEI')) return 'HUA';
  if (b.includes('MICROSOFT') || b.includes('SURFACE')) return 'MSF';
  if (b.includes('SAMSUNG')) return 'SAM';
  return b.replace(/[^A-Z]/g, '').slice(0, 3) || 'GEN';
};

export const generateLaptopSku = (laptop: Partial<Laptop>, index?: number): string => {
  const brandCode = formatBrandCode(laptop.brand || '');
  const idNumMatch = (laptop.id || '').match(/\d+/);
  const num = idNumMatch 
    ? idNumMatch[0].padStart(3, '0') 
    : (index !== undefined ? String(index + 1).padStart(3, '0') : '001');
  return `PL-${brandCode}-${num}`;
};

export const generateSerialNumber = (laptop: Partial<Laptop>, index?: number): string => {
  if (laptop.serialNumber) return laptop.serialNumber;
  const brandCode = formatBrandCode(laptop.brand || '');
  const idNumMatch = (laptop.id || '').match(/\d+/);
  const num = idNumMatch 
    ? idNumMatch[0].padStart(3, '0') 
    : (index !== undefined ? String(index + 1).padStart(3, '0') : '001');
  const seed = (index !== undefined ? index + 1 : parseInt(num, 10) || 1);
  const hash = Math.abs((seed * 9301 + 49297) % 89999 + 10000);
  return `SN-${brandCode}-${num}-${hash}`;
};

// Raw list disatukan dan dipastikan memiliki branchCity & serialNumber
const RAW_LAPTOP_CATALOG: Laptop[] = [
  ...LAPTOP_BATCH_1,
  ...LAPTOP_BATCH_2
];

// Katalog resmi Pinjamlaptop.id dengan total 100 produk variatif tersebar ke 3 cabang kota
export const LAPTOP_CATALOG: Laptop[] = RAW_LAPTOP_CATALOG.map((laptop, index) => {
  const branchCity = getBranchCityForLaptop(laptop, index);
  const serialNumber = laptop.serialNumber || generateSerialNumber(laptop, index);
  return {
    ...laptop,
    serialNumber,
    branchCity,
    branchHubId: branchCity === 'Malang' ? 'hub-malang' : branchCity === 'Sidoarjo' ? 'hub-sidoarjo' : 'hub-bekasi'
  };
});

export const STORE_HUBS = [
  {
    id: 'hub-malang',
    name: 'Pusat Malang',
    fullName: 'PINJAMLAPTOP.ID Pusat Malang',
    city: 'Malang',
    address: 'Jl. Taman Borobudur Indah B-20, Mojolangu, Kec. Lowokwaru, Kota Malang, Jawa Timur 65142',
    operatingHours: '08:00 - 21:00 WIB (Buka Setiap Hari)',
    phone: '0877-2596-4455',
    mapsUrl: 'https://maps.app.goo.gl/HJosVSYaGidCFN9S7',
    rating: 5.0,
    reviewCount: 189
  },
  {
    id: 'hub-sidoarjo',
    name: 'Cabang Sidoarjo',
    fullName: 'PINJAMLAPTOP.ID Cabang Sidoarjo',
    city: 'Sidoarjo',
    address: 'Sidoarjo, Jawa Timur (Melayani Area Sidoarjo, Surabaya, & Sekitarnya)',
    operatingHours: '08:30 - 20:30 WIB (Buka Setiap Hari)',
    phone: '0877-2596-4455',
    mapsUrl: 'https://maps.app.goo.gl/exAPCUHHH2aj37JR6',
    rating: 5.0,
    reviewCount: 146
  },
  {
    id: 'hub-bekasi',
    name: 'Cabang Bekasi',
    fullName: 'PINJAMLAPTOP.ID Cabang Bekasi',
    city: 'Bekasi',
    address: 'Bekasi, Jawa Barat (Melayani Wilayah Bekasi, Jakarta, & Jabodetabek)',
    operatingHours: '08:30 - 20:30 WIB (Buka Setiap Hari)',
    phone: '0877-2596-4455',
    mapsUrl: 'https://maps.app.goo.gl/h3ngHPLHsZCXLhkr6',
    rating: 5.0,
    reviewCount: 162
  }
];
