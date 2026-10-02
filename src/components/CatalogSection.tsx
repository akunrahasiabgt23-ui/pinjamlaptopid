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
      {/* Switcher Cabang Kota (Minimalis & Mobile Friendly) */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto scrollbar-none">
          {BRANCH_LOCATIONS.map((loc) => {
            const isSelected = selectedBranch === loc.city;
            const count = branchCounts[loc.city] || 0;

            return (
              <button
                key={loc.city}
                type="button"
                id={`btn-branch-${loc.city.toLowerCase()}`}
                onClick={() => setSelectedBranch(loc.city)}
                className={`flex-1 min-w-[95px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                <span>{loc.city}</span>
                {loc.isPusat ? (
                  <span className={`text-[8px] font-black px-1 rounded uppercase ${isSelected ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-800'}`}>
                    Pusat
                  </span>
                ) : (
                  <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedBranch('Semua')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedBranch === 'Semua'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/80'
            }`}
          >
            Semua ({laptops.length})
          </button>
        </div>

        {/* Info Singkat Domisili */}
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
          <span className="truncate">
            📍 {selectedBranch === 'Malang' && 'Melayani Malang Kota, Kab & Batu'}
            {selectedBranch === 'Sidoarjo' && 'Melayani Sidoarjo & Surabaya'}
            {selectedBranch === 'Bekasi' && 'Melayani Bekasi & Semua Jakarta'}
            {selectedBranch === 'Semua' && 'Semua unit di seluruh cabang'}
          </span>
          <span className="font-semibold text-blue-600 shrink-0 ml-2">
            {filteredLaptops.length} Unit
          </span>
        </div>
      </div>

      {/* Search Bar & Kategori Horizontal (Mobile-First Pill Carousel) */}
      <div className="space-y-2.5">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Cari merk atau tipe laptop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-2.5 rounded-full border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
          />
          <button
            type="button"
            aria-label="Cari"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Horizontal Swipeable Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {[
            { id: 'Semua', label: `Semua (${laptops.length})`, icon: LayoutGrid },
            { id: 'Office', label: 'Office', icon: OfficeIcon },
            { id: 'Student', label: 'Student', icon: GraduationCap },
            { id: 'Creator', label: 'Creator', icon: CreatorIcon },
            { id: 'Gaming', label: 'Gaming', icon: Gamepad2 },
            { id: 'Performance', label: 'Performance', icon: Gauge },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id && !searchQuery.trim();
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                id={`cat-${cat.id.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 snap-start ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Sort Bar (Minimalis & Mobile-Friendly) */}
      <div id="filter-sort-price-section" className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-2.5 sm:p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Kontrol Urutan Harga */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-400 hidden xs:inline shrink-0">Urutkan:</span>
            <div className="inline-flex bg-white rounded-xl p-0.5 border border-slate-200 shadow-2xs text-[11px] font-medium">
              <button
                type="button"
                id="btn-sort-default"
                onClick={() => setSortBy('default')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  sortBy === 'price-asc'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownWideNarrow className="w-3 h-3" />
                <span>Termurah</span>
              </button>
              <button
                type="button"
                id="btn-sort-price-desc"
                onClick={() => setSortBy('price-desc')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  sortBy === 'price-desc'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpNarrowWide className="w-3 h-3" />
                <span>Termahal</span>
              </button>
            </div>
          </div>

          {/* Reset Filter Button */}
          {(priceRange !== 'all' || sortBy !== 'default') && (
            <button
              type="button"
              id="btn-reset-filters"
              onClick={() => {
                setPriceRange('all');
                setSortBy('default');
              }}
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Filter Rentang Harga - Horizontal Scrollable Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
          {[
            { id: 'all', label: 'Semua Harga' },
            { id: '0-99k', label: '< 100rb' },
            { id: '100k-199k', label: '100 - 199rb' },
            { id: '200k-300k', label: '200 - 300rb' },
            { id: 'above300k', label: '> 300rb' }
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              id={`filter-price-${p.id}`}
              onClick={() => setPriceRange(p.id as PriceRangeOption)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                priceRange === p.id
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Baris Tombol Aksi Excel: Tampil untuk Administrator */}
        {isAdminLoggedIn && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Kelola Excel
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-download-template-catalog"
                onClick={downloadLaptopExcelTemplate}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1"
              >
                <Download className="w-3 h-3 text-emerald-600" />
                <span>Template</span>
              </button>
              <button
                type="button"
                id="btn-upload-excel-catalog"
                onClick={() => setShowExcelModal(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Excel</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Catalog Products Grid */}
      <div id="catalog-products-anchor" ref={catalogSectionRef} className="scroll-mt-24 space-y-2.5 pt-1">
        {/* Status bar ringkas */}
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
          <span>{filteredLaptops.length} unit laptop tersedia</span>
          {totalPages > 1 && (
            <span className="font-semibold text-slate-700">Hal {safeCurrentPage} / {totalPages}</span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          {paginatedLaptops.map((laptop) => {
          // Specs extraction for high fidelity presentation
          const cpuText = laptop.specCpu || laptop.processor.replace(/Intel®|AMD|Apple|Gen|Core™/g, '').trim().split('(')[0].trim();
          const ramText = laptop.specRam || (laptop.ram.includes('Unified') ? laptop.ram.split(' ')[0] + ' Unified' : laptop.ram.split(' ')[0] + ' RAM');
          const storageText = laptop.specStorage || laptop.storage.split(' ')[0] + ' ' + (laptop.storage.includes('SSD') ? 'SSD' : 'Storage');

          return (
            <div
              key={laptop.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Image Container */}
              <div 
                onClick={() => onViewDetails(laptop)}
                className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={laptop.image}
                  alt={laptop.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                  loading="lazy"
                />

                {/* Branch Location Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-slate-800 text-[9px] sm:text-[11px] font-bold border border-slate-200/90 shadow-2xs flex items-center gap-1">
                  <MapPin className={`w-2.5 h-2.5 ${laptop.branchCity === 'Malang' ? 'text-amber-600' : 'text-blue-600'}`} />
                  <span>
                    {laptop.branchCity || 'Malang'}
                  </span>
                </div>

                {/* OLED badge */}
                {(laptop.hasOledBadge || laptop.name.toUpperCase().includes('OLED')) && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/90 text-white text-[9px] font-bold tracking-wider border border-emerald-400">
                    OLED
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                <div 
                  onClick={() => onViewDetails(laptop)}
                  className="cursor-pointer space-y-1"
                >
                  {/* Brand Row */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                      {laptop.brand}
                    </span>
                    <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 shrink-0">
                      Tersedia
                    </span>
                  </div>

                  {/* Laptop Title */}
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {laptop.name}
                  </h3>

                  {/* Compact Specs: 1 Clean Line */}
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-600 truncate py-0.5">
                    <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-medium truncate">{cpuText}</span>
                    <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-medium shrink-0">{laptop.ram}</span>
                  </div>
                </div>

                {/* Pricing & Call to Action */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <span className="text-xs sm:text-base font-black text-slate-900">
                      {formatRupiah(laptop.dailyPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400 block sm:inline sm:ml-1">
                      / hari
                    </span>
                  </div>

                  <div className="flex items-center gap-1 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => onSelectLaptop(laptop)}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] sm:text-xs font-bold transition-all text-center shadow-2xs cursor-pointer"
                    >
                      Sewa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Pagination Controls - Mobile Friendly & Minimal */}
      {filteredLaptops.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
          {/* Tombol Sebelumnya */}
          <button
            type="button"
            id="btn-catalog-prev"
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              safeCurrentPage <= 1
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Prev</span>
          </button>

          {/* Nomor Halaman */}
          <div className="flex items-center gap-1">
            {paginationRange.map((item, idx) => {
              if (item === '...') {
                return (
                  <span key={`dots-${idx}`} className="w-6 sm:w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold">
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
                  className={`w-7 sm:w-8 h-7 sm:h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              safeCurrentPage >= totalPages
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs'
            }`}
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
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
