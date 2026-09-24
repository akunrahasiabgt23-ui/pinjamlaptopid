import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Cpu, HardDrive, GraduationCap, Gamepad2, Gauge, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Eye, LayoutGrid,
  SlidersHorizontal, ArrowDownWideNarrow, ArrowUpNarrowWide, Tag, RotateCcw,
  FileSpreadsheet, Download, Upload, Check, MapPin, Building2, ShieldAlert
} from 'lucide-react';
import { Laptop, BranchCity } from '../types';
import { formatRupiah, getStoredLaptops, getStoredAdminSession } from '../utils/storage';
import { BRANCH_LOCATIONS } from '../data/laptops';
import { TikTokSection } from './TikTokSection';
import { GoogleReviewsSection } from './GoogleReviewsSection';
import { downloadLaptopExcelTemplate } from '../utils/excelImportExport';
import { ExcelProductUploadModal } from './admin/ExcelProductUploadModal';

interface CatalogSectionProps {
  onSelectLaptop: (laptop: Laptop) => void;
  onViewDetails: (laptop: Laptop) => void;
  isLargeText?: boolean;
  onNavigateToHubs?: () => void;
}

type ThemeCategory = 'Office' | 'Student' | 'Creator' | 'Gaming' | 'Performance' | 'Semua';
type SortOption = 'default' | 'price-asc' | 'price-desc';
type PriceRangeOption = 'all' | '0-99k' | '100k-199k' | '200k-300k' | 'above300k';

// Custom SVG matching the Microsoft Office-style folded tile in the user's design
const OfficeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" fillOpacity="0.12" />
    <path 
      d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5v-11z" 
      fill="currentColor" 
      fillOpacity="0.2" 
    />
    <path 
      d="M6 8L12 5.5V18.5L6 16V8Z" 
      fill="currentColor"
    />
    <path 
      d="M12 5.5L18 8V16L12 18.5V5.5Z" 
      fill="currentColor" 
      fillOpacity="0.85"
    />
    <rect x="8" y="10" width="3.5" height="4" rx="0.75" fill="white" />
  </svg>
);

// Custom SVG matching the stylus pen/creator icon in the screenshot
const CreatorIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    <path d="m15 5 4 4" />
    <circle cx="19" cy="19" r="1" fill="currentColor" />
    <path d="M19 15v1" />
    <path d="M15 19h1" />
  </svg>
);

// Custom RAM module icon matching the microchip in the screenshot
const RamIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <line x1="6" y1="11" x2="6" y2="13" />
    <line x1="10" y1="11" x2="10" y2="13" />
    <line x1="14" y1="11" x2="14" y2="13" />
    <line x1="18" y1="11" x2="18" y2="13" />
    <line x1="6" y1="18" x2="6" y2="19" />
    <line x1="10" y1="18" x2="10" y2="19" />
    <line x1="14" y1="18" x2="14" y2="19" />
    <line x1="18" y1="18" x2="18" y2="19" />
  </svg>
);

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  onSelectLaptop,
  onViewDetails,
  isLargeText = false,
  onNavigateToHubs
}) => {
  const [laptops, setLaptops] = useState<Laptop[]>(() => getStoredLaptops());
  const [selectedBranch, setSelectedBranch] = useState<BranchCity | 'Semua'>('Malang');
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [priceRange, setPriceRange] = useState<PriceRangeOption>('all');
  const [showExcelModal, setShowExcelModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const session = getStoredAdminSession();
    return Boolean(session && session.isAuthenticated);
  });

  useEffect(() => {
    const checkAdminAuth = () => {
      const session = getStoredAdminSession();
      setIsAdminLoggedIn(Boolean(session && session.isAuthenticated));
    };
    checkAdminAuth();
    window.addEventListener('pinjamlaptop_admin_auth_updated', checkAdminAuth);
    return () => {
      window.removeEventListener('pinjamlaptop_admin_auth_updated', checkAdminAuth);
    };
  }, []);

  useEffect(() => {
    const handleCatalogUpdate = () => {
      setLaptops(getStoredLaptops());
    };
    window.addEventListener('pinjamlaptop_catalog_updated', handleCatalogUpdate);
    return () => {
      window.removeEventListener('pinjamlaptop_catalog_updated', handleCatalogUpdate);
    };
  }, []);

  const branchCounts = useMemo(() => {
    const counts: Record<string, number> = { Malang: 0, Sidoarjo: 0, Bekasi: 0 };
    laptops.forEach(item => {
      const b = item.branchCity || 'Malang';
      if (counts[b] !== undefined) counts[b]++;
    });
    return counts;
  }, [laptops]);

  const filteredLaptops = useMemo(() => {
    const list = laptops.filter((item) => {
      // 0. Filter Cabang Kota (Malang Pusat, Sidoarjo, Bekasi)
      if (selectedBranch !== 'Semua') {
        const itemBranch = item.branchCity || 'Malang';
        if (itemBranch !== selectedBranch) return false;
      }

      // 1. If searching, search across all items
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery = (
          item.name.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query) ||
          (item.sku && item.sku.toLowerCase().includes(query)) ||
          item.processor.toLowerCase().includes(query) ||
          (item.specCpu && item.specCpu.toLowerCase().includes(query)) ||
          (item.branchCity && item.branchCity.toLowerCase().includes(query)) ||
          item.gpu.toLowerCase().includes(query)
        );
        if (!matchesQuery) return false;
      } else if (selectedCategory && selectedCategory !== 'Semua') {
        // 2. If category selected, check themeCategories or fallback matching
        let matchesCat = true;
        if (item.themeCategories && item.themeCategories.length > 0) {
          matchesCat = item.themeCategories.includes(selectedCategory as any);
        } else {
          // Fallback matching
          if (selectedCategory === 'Office') matchesCat = true;
          else if (selectedCategory === 'Student') matchesCat = item.dailyPrice <= 200000;
          else if (selectedCategory === 'Creator') matchesCat = item.category === 'Desain & Render' || item.name.includes('Pro') || item.name.includes('OLED');
          else if (selectedCategory === 'Gaming') matchesCat = item.category === 'Gaming & AI' || item.name.includes('ROG') || item.name.includes('Legion');
          else if (selectedCategory === 'Performance') matchesCat = item.dailyPrice >= 250000;
        }
        if (!matchesCat) return false;
      }

      // 3. Filter Rentang Harga
      if (priceRange === '0-99k') {
        if (item.dailyPrice > 99000) return false;
      } else if (priceRange === '100k-199k') {
        if (item.dailyPrice < 100000 || item.dailyPrice > 199000) return false;
      } else if (priceRange === '200k-300k') {
        if (item.dailyPrice < 200000 || item.dailyPrice > 300000) return false;
      } else if (priceRange === 'above300k') {
        if (item.dailyPrice <= 300000) return false;
      }

      return true;
    });

    // 4. Sortir Produk (Harga)
    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.dailyPrice - b.dailyPrice);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.dailyPrice - a.dailyPrice);
    }

    return list;
  }, [laptops, selectedBranch, selectedCategory, searchQuery, priceRange, sortBy]);

  // Pagination Configuration (Maksimal 12 produk per halaman)
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const catalogSectionRef = useRef<HTMLDivElement>(null);

  // Reset ke halaman 1 setiap kali filter atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBranch, searchQuery, selectedCategory, priceRange, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredLaptops.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedLaptops = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredLaptops.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLaptops, safeCurrentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (catalogSectionRef.current) {
      catalogSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate pagination number range with ellipsis for clean display
  const paginationRange = useMemo(() => {
    const delta = 1;
    const range: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  }, [totalPages, safeCurrentPage]);

  return (
    <div className="space-y-5 sm:space-y-6 pb-20">
      {/* 3 Tombol Cabang Kota di Atas Tombol Search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pilih Cabang Pinjam Laptop
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Katalog sesuai ketersediaan unit di cabang kota
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {BRANCH_LOCATIONS.map((loc) => {
            const isSelected = selectedBranch === loc.city;
            const count = branchCounts[loc.city] || 0;

            return (
              <button
                key={loc.city}
                type="button"
                id={`btn-branch-${loc.city.toLowerCase()}`}
                onClick={() => setSelectedBranch(loc.city)}
                className={`relative px-3 py-2.5 sm:py-3 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-100' : 'text-blue-600'}`} />
                    <span className="font-extrabold text-xs sm:text-sm tracking-tight">
                      {loc.city}
                    </span>
                  </div>
                  {loc.isPusat && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
                      isSelected ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Pusat
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between w-full text-[10px] sm:text-xs">
                  <span className={isSelected ? 'text-blue-100' : 'text-slate-500'}>
                    {count} Unit Siap
                  </span>
                  <span className={`font-semibold ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                    {isSelected ? '✓ Aktif' : 'Pilih'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Banner Cabang Terpilih & Syarat Domisili */}
        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900">
              Cabang {selectedBranch} {selectedBranch === 'Malang' ? '(Pusat Pinjam Laptop)' : ''}:
            </span>
            <span>
              {selectedBranch === 'Malang' && 'Melayani domisili Malang Kota, Malang Kabupaten & Kota Batu.'}
              {selectedBranch === 'Sidoarjo' && 'Melayani domisili Sidoarjo & Surabaya.'}
              {selectedBranch === 'Bekasi' && 'Melayani domisili Bekasi Kota/Kabupaten & Semua Jakarta.'}
            </span>
          </div>
          {selectedBranch !== 'Semua' && (
            <button
              type="button"
              onClick={() => setSelectedBranch('Semua')}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold underline cursor-pointer"
            >
              Tampilkan Semua Cabang ({laptops.length})
            </button>
          )}
        </div>
      </div>

      {/* Search Bar - Exactly matching the pill shape with blue circle button */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Cari tipe laptop, merk, atau spesifikasi unit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-5 pr-14 py-3 rounded-full border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
        />
        <button
          type="button"
          onClick={() => {}}
          aria-label="Cari"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Category Icons Selector - Grid of 6 options (Semua + 5 Tema) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {/* Category 0: Semua */}
        <button
          type="button"
          id="cat-semua"
          onClick={() => setSelectedCategory('Semua')}
          className={`rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
            selectedCategory === 'Semua' && !searchQuery.trim()
              ? 'bg-blue-50/80 border border-blue-400 text-blue-600 font-bold shadow-2xs'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 font-medium'
          }`}
        >
          <LayoutGrid className={`w-6 h-6 sm:w-7 sm:h-7 ${selectedCategory === 'Semua' && !searchQuery.trim() ? 'text-blue-600' : 'text-slate-700'}`} />
          <span className="text-xs sm:text-sm">Semua (100)</span>
        </button>

        {/* Category 1: Office */}
        <button
          type="button"
          id="cat-office"
          onClick={() => setSelectedCategory('Office')}
          className={`rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
            selectedCategory === 'Office' && !searchQuery.trim()
              ? 'bg-blue-50/80 border border-blue-400 text-blue-600 font-bold shadow-2xs'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 font-medium'
          }`}
        >
          <OfficeIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${selectedCategory === 'Office' && !searchQuery.trim() ? 'text-blue-600' : 'text-slate-700'}`} />
          <span className="text-xs sm:text-sm">Office</span>
        </button>

        {/* Category 2: Student */}
        <button
          type="button"
          id="cat-student"
          onClick={() => setSelectedCategory('Student')}
          className={`rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
            selectedCategory === 'Student' && !searchQuery.trim()
              ? 'bg-blue-50/80 border border-blue-400 text-blue-600 font-bold shadow-2xs'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 font-medium'
          }`}
        >
          <GraduationCap className={`w-6 h-6 sm:w-7 sm:h-7 ${selectedCategory === 'Student' && !searchQuery.trim() ? 'text-blue-600 stroke-[2.2]' : 'text-slate-700 stroke-[1.8]'}`} />
          <span className="text-xs sm:text-sm">Student</span>
        </button>

        {/* Category 3: Creator */}
        <button
          type="button"
          id="cat-creator"
          onClick={() => setSelectedCategory('Creator')}
          className={`rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
            selectedCategory === 'Creator' && !searchQuery.trim()
              ? 'bg-blue-50/80 border border-blue-400 text-blue-600 font-bold shadow-2xs'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 font-medium'
          }`}
        >
          <CreatorIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${selectedCategory === 'Creator' && !searchQuery.trim() ? 'text-blue-600' : 'text-slate-700'}`} />
          <span className="text-xs sm:text-sm">Creator</span>
        </button>

        {/* Category 4: Gaming */}
        <button
          type="button"
          id="cat-gaming"
          onClick={() => setSelectedCategory('Gaming')}
          className={`rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
            selectedCategory === 'Gaming' && !searchQuery.trim()
              ? 'bg-blue-50/80 border border-blue-400 text-blue-600 font-bold shadow-2xs'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 font-medium'
          }`}
        >
          <Gamepad2 className={`w-6 h-6 sm:w-7 sm:h-7 ${selectedCategory === 'Gaming' && !searchQuery.trim() ? 'text-blue-600 stroke-[2.2]' : 'text-slate-700 stroke-[1.8]'}`} />
          <span className="text-xs sm:text-sm">Gaming</span>
        </button>

        {/* Category 5: Performance */}
        <button
          type="button"
          id="cat-performance"
          onClick={() => setSelectedCategory('Performance')}
          className={`rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
            selectedCategory === 'Performance' && !searchQuery.trim()
              ? 'bg-blue-50/80 border border-blue-400 text-blue-600 font-bold shadow-2xs'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 font-medium'
          }`}
        >
          <Gauge className={`w-6 h-6 sm:w-7 sm:h-7 ${selectedCategory === 'Performance' && !searchQuery.trim() ? 'text-blue-600 stroke-[2.2]' : 'text-slate-700 stroke-[1.8]'}`} />
          <span className="text-xs sm:text-sm">Performance</span>
        </button>
      </div>

      {/* Filter & Sort Bar - Khusus Sortir & Filter Harga */}
      <div id="filter-sort-price-section" className="bg-slate-50/90 rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Info Jumlah Unit & Status Filter */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">Filter & Sortir Produk</span>
                {(priceRange !== 'all' || sortBy !== 'default') && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                    Filter Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Menampilkan <strong className="text-slate-800 font-bold">{filteredLaptops.length}</strong> unit laptop
              </p>
            </div>
          </div>

          {/* Kontrol Sortir Harga */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
              Sortir Harga:
            </span>
            <div className="inline-flex bg-white rounded-xl p-1 border border-slate-200 shadow-2xs text-xs font-medium">
              <button
                type="button"
                id="btn-sort-default"
                onClick={() => setSortBy('default')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                  sortBy === 'default'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Standar
              </button>
              <button
                type="button"
                id="btn-sort-price-asc"
                onClick={() => setSortBy('price-asc')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer text-xs ${
                  sortBy === 'price-asc'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Urutkan dari Harga Termurah"
              >
                <ArrowDownWideNarrow className="w-3.5 h-3.5" />
                <span>Termurah</span>
              </button>
              <button
                type="button"
                id="btn-sort-price-desc"
                onClick={() => setSortBy('price-desc')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer text-xs ${
                  sortBy === 'price-desc'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Urutkan dari Harga Tertinggi"
              >
                <ArrowUpNarrowWide className="w-3.5 h-3.5" />
                <span>Tertinggi</span>
              </button>
            </div>

            {(priceRange !== 'all' || sortBy !== 'default') && (
              <button
                type="button"
                id="btn-reset-filters"
                onClick={() => {
                  setPriceRange('all');
                  setSortBy('default');
                }}
                className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Reset Sortir & Filter Harga"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Rentang Harga */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-xs border-t border-slate-200/70">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap mr-1 flex items-center gap-1 shrink-0">
            <Tag className="w-3 h-3 text-slate-400" />
            Rentang Harga:
          </span>
          <button
            type="button"
            id="filter-price-all"
            onClick={() => setPriceRange('all')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer text-[11px] ${
              priceRange === 'all'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua Harga
          </button>
          <button
            type="button"
            id="filter-price-0-99k"
            onClick={() => setPriceRange('0-99k')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer text-[11px] ${
              priceRange === '0-99k'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            0 - 99.000
          </button>
          <button
            type="button"
            id="filter-price-100k-199k"
            onClick={() => setPriceRange('100k-199k')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer text-[11px] ${
              priceRange === '100k-199k'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            100.000 - 199.000
          </button>
          <button
            type="button"
            id="filter-price-200k-300k"
            onClick={() => setPriceRange('200k-300k')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer text-[11px] ${
              priceRange === '200k-300k'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            200.000 - 300.000
          </button>
          <button
            type="button"
            id="filter-price-above300k"
            onClick={() => setPriceRange('above300k')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer text-[11px] ${
              priceRange === 'above300k'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            &gt; 300.000
          </button>
        </div>

        {/* Baris Tombol Aksi Excel: Hanya Tampil untuk Akun Administrator Terverifikasi */}
        {isAdminLoggedIn && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-200/80 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Manajemen Katalog via Excel</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                    Akses Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Unduh format acuan atau unggah banyak produk baru otomatis</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="btn-download-template-catalog"
                onClick={downloadLaptopExcelTemplate}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Unduh contoh template Excel resmi (.xlsx) sebagai acuan"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download Template Excel</span>
              </button>

              <button
                type="button"
                id="btn-upload-excel-catalog"
                onClick={() => setShowExcelModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Unggah spreadsheet Excel untuk menambahkan produk baru secara otomatis"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Produk Baru Excel</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Catalog Cards Grid - Maksimal 12 Produk per Halaman */}
      <div id="catalog-products-anchor" ref={catalogSectionRef} className="scroll-mt-24 space-y-3.5 pt-1">
        {/* Sub-header status bar ringkas */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>Menampilkan</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {filteredLaptops.length > 0 ? (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredLaptops.length)}
            </span>
            <span>dari total <strong className="text-slate-900">{filteredLaptops.length}</strong> unit laptop</span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="text-slate-500">Halaman</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200/80">
                {safeCurrentPage} / {totalPages}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {paginatedLaptops.map((laptop) => {
          // Specs extraction for high fidelity presentation
          const cpuText = laptop.specCpu || laptop.processor.replace(/Intel®|AMD|Apple|Gen|Core™/g, '').trim().split('(')[0].trim();
          const ramText = laptop.specRam || (laptop.ram.includes('Unified') ? laptop.ram.split(' ')[0] + ' Unified' : laptop.ram.split(' ')[0] + ' RAM');
          const storageText = laptop.specStorage || laptop.storage.split(' ')[0] + ' ' + (laptop.storage.includes('SSD') ? 'SSD' : 'Storage');

          return (
            <div
              key={laptop.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={laptop.image}
                  alt={laptop.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                  loading="lazy"
                />

                {/* Branch Location Badge - Perlihatkan lokasi laptop di Katalog */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] sm:text-[11px] font-bold border border-slate-200/90 shadow-xs flex items-center gap-1.5">
                  <MapPin className={`w-3 h-3 ${laptop.branchCity === 'Malang' ? 'text-amber-600' : 'text-blue-600'}`} />
                  <span>
                    {laptop.branchCity === 'Malang' ? 'Pusat Malang' : `Cabang ${laptop.branchCity || 'Malang'}`}
                  </span>
                </div>

                {/* OLED badge if Dell XPS or hasOledBadge */}
                {(laptop.hasOledBadge || laptop.name.toUpperCase().includes('OLED')) && (
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/90 text-white text-[10px] font-black tracking-wider border border-emerald-400 shadow-sm flex items-center gap-1">
                    <span>OLED</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  {/* Brand & City Row */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {laptop.brand}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5" />
                      {laptop.branchCity || 'Malang'}
                    </span>
                  </div>

                  {/* Laptop Title */}
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 mb-2.5">
                    {laptop.name}
                  </h3>

                  {/* 3 Specs with Icons */}
                  <div className="space-y-1.5 text-xs text-slate-800">
                    <div className="flex items-center gap-3">
                      {/* CPU */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Cpu className="w-3.5 h-3.5 text-slate-700 flex-shrink-0 stroke-[2]" />
                        <span className="font-medium truncate">{cpuText}</span>
                      </div>
                      {/* RAM */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <RamIcon className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
                        <span className="font-medium">{ramText}</span>
                      </div>
                    </div>

                    {/* Storage */}
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-slate-700 flex-shrink-0 stroke-[2]" />
                      <span className="font-medium">{storageText}</span>
                    </div>
                  </div>

                  {/* Stock & Details Link Row */}
                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onViewDetails(laptop)}
                      className="text-blue-600 hover:text-blue-700 text-xs font-semibold underline cursor-pointer"
                    >
                      Lihat Detail
                    </button>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] font-medium">
                      {laptop.badge || `Terbatas! Stok (${laptop.availableUnits}) Unit`}
                    </span>
                  </div>
                </div>

                {/* Pricing & Call to Action */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {formatRupiah(laptop.dailyPrice)}
                    </span>
                    <span className="text-xs font-normal text-slate-500">
                      / bln
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectLaptop(laptop)}
                    className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer text-center"
                  >
                    Sewa Sekarang
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Pagination Controls - Maksimal 12 Produk per Halaman, tombol Next & Prev */}
      {filteredLaptops.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 font-medium order-2 sm:order-1 text-center sm:text-left">
            Menampilkan <strong className="text-slate-900">{paginatedLaptops.length} produk</strong> di halaman {safeCurrentPage} (maksimal 12 per halaman)
          </div>

          <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
            {/* Tombol Sebelumnya */}
            <button
              type="button"
              id="btn-catalog-prev"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                safeCurrentPage <= 1
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs hover:border-slate-400 active:scale-95'
              }`}
              title="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Nomor Halaman */}
            <div className="flex items-center gap-1">
              {paginationRange.map((item, idx) => {
                if (item === '...') {
                  return (
                    <span key={`dots-${idx}`} className="w-7 sm:w-8 h-8 sm:h-9 flex items-center justify-center text-slate-400 text-xs font-bold">
                      ...
                    </span>
                  );
                }
                const pageNum = item as number;
                const isActive = pageNum === safeCurrentPage;
                return (
                  <button
                    key={`page-${pageNum}`}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Tombol Selanjutnya / Next */}
            <button
              type="button"
              id="btn-catalog-next"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                safeCurrentPage >= totalPages
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs hover:shadow'
              }`}
              title="Lihat 12 produk berikutnya"
            >
              <span>Next / Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {filteredLaptops.length === 0 && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
          <p className="text-base font-bold text-slate-800">
            {searchQuery.trim()
              ? `Tidak ada laptop yang sesuai dengan pencarian "${searchQuery}".`
              : 'Tidak ada laptop yang sesuai dengan filter harga atau kategori yang dipilih.'}
          </p>
          <p className="text-xs text-slate-500">
            Coba ubah rentang harga atau pilih kategori laptop lain.
          </p>
          <button
            type="button"
            id="btn-empty-reset-filters"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Office');
              setPriceRange('all');
              setSortBy('default');
            }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Semua Filter &amp; Tampilkan Semua Laptop</span>
          </button>
        </div>
      )}

      {/* Showcase Akun TikTok @sewalaptoptermurah & Video Testimoni Pelanggan */}
      <TikTokSection />

      {/* Ulasan Bintang 5 Google Maps dari Semua Cabang & Tombol Map */}
      <GoogleReviewsSection onNavigateToHubs={onNavigateToHubs} />

      {/* Toast Notifikasi Sukses Impor Excel */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm bg-white border border-emerald-300 text-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div className="text-xs font-semibold leading-relaxed">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Modal Upload Excel & Download Template */}
      <ExcelProductUploadModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onSuccess={(count, mode) => {
          setToastMessage(
            mode === 'replace'
              ? `Katalog berhasil diperbarui dengan ${count} produk baru dari file Excel!`
              : `Berhasil menambahkan ${count} produk laptop baru dari Excel ke katalog!`
          );
          setTimeout(() => setToastMessage(''), 5000);
        }}
      />
    </div>
  );
};
