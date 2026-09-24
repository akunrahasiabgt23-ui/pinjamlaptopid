import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Star, MapPin, ExternalLink, CheckCircle2, 
  ChevronRight, ChevronLeft, Sparkles, MessageSquareHeart, Navigation,
  Search, ThumbsUp, Filter, ArrowUpRight, ArrowRight, ArrowLeft
} from 'lucide-react';
import { STORE_HUBS } from '../data/laptops';
import { GOOGLE_MAPS_REVIEWS, GoogleReview } from '../data/reviews';

interface GoogleReviewsSectionProps {
  onNavigateToHubs?: () => void;
}

export const GoogleReviewsSection: React.FC<GoogleReviewsSectionProps> = ({
  onNavigateToHubs
}) => {
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLaptopCategory, setSelectedLaptopCategory] = useState<string>('all');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  // Total Google Maps reviews count across branches
  const branchCounts: Record<string, { label: string; mapsCount: string; url: string }> = {
    all: { label: 'Semua Cabang', mapsCount: '497+ Ulasan Maps', url: 'https://maps.app.goo.gl/HJosVSYaGidCFN9S7' },
    'hub-malang': { label: 'Pusat Malang', mapsCount: '189+ Ulasan Maps', url: 'https://maps.app.goo.gl/HJosVSYaGidCFN9S7' },
    'hub-sidoarjo': { label: 'Cabang Sidoarjo', mapsCount: '146+ Ulasan Maps', url: 'https://maps.app.goo.gl/exAPCUHHH2aj37JR6' },
    'hub-bekasi': { label: 'Cabang Bekasi', mapsCount: '162+ Ulasan Maps', url: 'https://maps.app.goo.gl/h3ngHPLHsZCXLhkr6' },
  };

  const filteredReviews = useMemo(() => {
    return GOOGLE_MAPS_REVIEWS.filter((review) => {
      // Branch filter
      if (selectedBranchFilter !== 'all' && review.hubId !== selectedBranchFilter) {
        return false;
      }
      // Laptop category filter
      if (selectedLaptopCategory !== 'all') {
        const laptopLower = (review.laptopRented || '').toLowerCase();
        if (!laptopLower.includes(selectedLaptopCategory.toLowerCase())) {
          return false;
        }
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesComment = review.comment.toLowerCase().includes(q);
        const matchesAuthor = review.authorName.toLowerCase().includes(q);
        const matchesRole = (review.authorRole || '').toLowerCase().includes(q);
        const matchesLaptop = (review.laptopRented || '').toLowerCase().includes(q);
        const matchesHub = review.hubName.toLowerCase().includes(q);
        return matchesComment || matchesAuthor || matchesRole || matchesLaptop || matchesHub;
      }
      return true;
    });
  }, [selectedBranchFilter, selectedLaptopCategory, searchQuery]);

  // Scroll logic for horizontal Google Maps reviews
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.max(320, Math.floor(scrollContainerRef.current.clientWidth * 0.75));
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollButtons, 320);
    }
  };

  // Reset scroll to left when filters change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    const timer = setTimeout(checkScrollButtons, 150);
    return () => clearTimeout(timer);
  }, [selectedBranchFilter, selectedLaptopCategory, searchQuery]);

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const activeHubObj = STORE_HUBS.find(h => h.id === selectedBranchFilter);
  const activeMapsUrl = activeHubObj ? activeHubObj.mapsUrl : 'https://maps.app.goo.gl/HJosVSYaGidCFN9S7';

  return (
    <section className="mt-14 pt-10 border-t border-slate-200/80 space-y-8 animate-in fade-in" id="google-reviews-section">
      {/* Header & Overall Google Maps Rating */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Semua Ulasan Google Maps Terverifikasi</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ulasan Bintang 5 Google Maps dari Semua Cabang
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Transparansi nyata dari para penyewa. Simak ratusan ulasan asli Google Maps dari cabang <strong className="text-white">Pusat Malang</strong>, <strong className="text-white">Cabang Sidoarjo</strong>, dan <strong className="text-white">Cabang Bekasi</strong>.
            </p>
          </div>

          {/* Big Rating Summary Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex flex-col items-center justify-center text-center shrink-0 min-w-[220px]">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-4xl font-extrabold text-amber-400">5.0</span>
              <div className="flex flex-col items-start text-left">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-slate-300 font-medium">Bintang Sempurna</span>
              </div>
            </div>
            <div className="text-xs text-slate-200 font-bold mt-1">
              Total 497+ Ulasan di Google Maps
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] text-emerald-300 mt-2 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Asli dari Akun Google</span>
            </div>
          </div>
        </div>

        {/* Quick Map Buttons Row */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Buka Profil Resmi & Semua Ulasan di Google Maps:</span>
            </span>
            <span className="text-[11px] text-blue-300 hidden sm:inline-block">Klik tombol untuk verifikasi langsung</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STORE_HUBS.map((hub) => (
              <a
                key={hub.id}
                href={hub.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="group p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-blue-400 transition-all flex items-center justify-between gap-3 text-left"
              >
                <div>
                  <div className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                    <span>{hub.name}</span>
                    <span className="text-amber-400 text-xs flex items-center gap-0.5">
                      ★ 5.0
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {hub.reviewCount} ulasan • {hub.operatingHours.split('(')[0]}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 group-hover:bg-blue-600 text-blue-300 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Control Bar: Filter Tabs, Search & Live Maps Action */}
      <div className="space-y-3 pt-2">
        {/* Branch Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedBranchFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBranchFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              Semua Cabang (497+ di Maps)
            </button>

            <button
              type="button"
              onClick={() => setSelectedBranchFilter('hub-malang')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedBranchFilter === 'hub-malang'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Pusat Malang (189+ Ulasan)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedBranchFilter('hub-sidoarjo')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedBranchFilter === 'hub-sidoarjo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Cabang Sidoarjo (146+ Ulasan)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedBranchFilter('hub-bekasi')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedBranchFilter === 'hub-bekasi'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Cabang Bekasi (162+ Ulasan)</span>
            </button>
          </div>

          {/* Link to Open Live Google Maps for Selected Branch */}
          <a
            href={activeMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs"
          >
            <span>Buka Google Maps Langsung</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Search Input & Quick Tag Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ulasan (contoh: skripsi, macbook, thinkpad, cepat, kantor, kurir)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">Unit:</span>
            {['all', 'ThinkPad', 'MacBook', 'Dell', 'HP', 'ROG'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedLaptopCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-colors ${
                  selectedLaptopCategory === cat
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat === 'all' ? 'Semua' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header Info & Horizontal Scroll Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-600">
              Menampilkan <strong className="text-slate-900">{filteredReviews.length}</strong> ulasan terverifikasi
            </span>
            <span className="text-slate-400">
              ({branchCounts[selectedBranchFilter]?.mapsCount || '497+ total di Maps'})
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
            <ArrowRight className="w-3 h-3 animate-pulse" />
            <span>Scroll / Geser ke kanan untuk melihat ulasan berikutnya</span>
          </div>
        </div>

        {/* Scroll Navigation Buttons (Kiri & Kanan) */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            id="btn-scroll-reviews-left"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              !canScrollLeft
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs hover:border-blue-400 active:scale-95'
            }`}
            title="Geser ulasan ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Sebelumnya</span>
          </button>

          <button
            type="button"
            id="btn-scroll-reviews-right"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              !canScrollRight
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow active:scale-95'
            }`}
            title="Geser ulasan ke kanan"
          >
            <span>Geser Kanan</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {onNavigateToHubs && (
            <button
              type="button"
              onClick={onNavigateToHubs}
              className="ml-1 font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors px-2 py-2"
              title="Lihat Cabang"
            >
              <span className="hidden md:inline">Alamat Cabang</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable Container of Google Maps Reviews */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory focus:outline-none"
        style={{ scrollbarWidth: 'thin' }}
      >
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="w-[290px] sm:w-[340px] md:w-[370px] shrink-0 snap-start bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 relative group"
          >
            <div className="space-y-3">
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${review.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}>
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                      <span>{review.authorName}</span>
                    </h3>
                    {review.isLocalGuide && review.localGuideInfo ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {review.localGuideInfo}
                      </span>
                    ) : review.authorRole ? (
                      <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                        {review.authorRole}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Google Maps Pin Link */}
                <a
                  href={review.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`Buka ulasan di Google Maps (${review.hubName})`}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-rose-500" />
                </a>
              </div>

              {/* Rating Stars & Timestamp */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 ml-1">5.0</span>
                </div>
                <span className="text-[11px] text-slate-400">{review.relativeTime}</span>
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic line-clamp-4 group-hover:line-clamp-none transition-all">
                "{review.comment}"
              </p>
            </div>

            {/* Bottom Tag & Laptop Info */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <a
                  href={review.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                >
                  <MapPin className="w-3 h-3 text-blue-500" />
                  <span>{review.hubName}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                {review.laptopRented && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[10px]">
                    {review.laptopRented}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Ulasan Terverifikasi
                </span>
                {review.likesCount ? (
                  <span className="text-slate-400 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-slate-400" />
                    {review.likesCount} membantu
                  </span>
                ) : (
                  <a
                    href={review.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-blue-600 font-medium hover:underline"
                  >
                    Cek di Maps →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Swipe Bottom Hint Bar */}
      {filteredReviews.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-500 pt-1">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>💡 Tips: Usap layar ponsel atau klik tombol panah kanan untuk melihat ulasan lainnya</span>
          </span>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
          >
            <span>Lihat Ulasan Berikutnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Show Empty state if search has no match */}
      {filteredReviews.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
          <p className="font-bold text-slate-700 text-sm">
            Tidak ada ulasan yang sesuai dengan pencarian "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedLaptopCategory('all');
            }}
            className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
          >
            Reset Filter Pencarian
          </button>
        </div>
      )}

      {/* Google Maps Action Footer Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Lihat 497+ Ulasan Lengkap Langsung di Aplikasi Google Maps
            </h4>
            <p className="text-xs text-slate-600">
              Setiap ulasan adalah pengalaman nyata dari penyewa perorangan, mahasiswa, instansi, dan perusahaan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          <a
            href="https://maps.app.goo.gl/HJosVSYaGidCFN9S7"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>Maps Malang</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
          <a
            href="https://maps.app.goo.gl/exAPCUHHH2aj37JR6"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>Maps Sidoarjo</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
          <a
            href="https://maps.app.goo.gl/h3ngHPLHsZCXLhkr6"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>Maps Bekasi</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>
    </section>
  );
};
