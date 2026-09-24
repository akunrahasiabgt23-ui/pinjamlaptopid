import React, { useState } from 'react';
import { 
  Play, ExternalLink, Heart, MessageCircle, 
  Sparkles, CheckCircle2, ShieldCheck, 
  X, ChevronRight
} from 'lucide-react';

// Official TikTok SVG Icon
export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.34 6.34 0 0 0 1.86-4.48V8.71a8.18 8.18 0 0 0 4.91 1.63V6.89c-.338-.04-.673-.107-1-.2z"/>
  </svg>
);

interface TikTokVideoItem {
  id: string;
  title: string;
  description: string;
  category: string;
  views: string;
  likes: string;
  comments: string;
  duration: string;
  customerName: string;
  laptopRented: string;
  location: string;
  thumbnailUrl: string;
  tiktokUrl: string;
  date: string;
}

const TIKTOK_VIDEOS: TikTokVideoItem[] = [
  {
    id: 'tt-1',
    title: 'Serah Terima 12 Unit Laptop Core i7 Kantor Event',
    description: 'Dokumentasi tim PinjamLaptop antar 12 unit Lenovo ThinkPad ke event korporat di Malang. Unit sudah include Office & charger original.',
    category: 'Event & Kantor',
    views: '54.8K',
    likes: '4.2K',
    comments: '234',
    duration: '00:54',
    customerName: 'Event Organizer Synergy',
    laptopRented: '12x ThinkPad T490 i7',
    location: 'Hub Malang',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    tiktokUrl: 'https://www.tiktok.com/@sewalaptoptermurah',
    date: '2 hari lalu'
  },
  {
    id: 'tt-2',
    title: 'Testimoni Kak Dinda: Sewa MacBook Pro Buat Sidang Kilat',
    description: '"Laptop lama rusak H-2 sidang skripsi, untung nemu @sewalaptoptermurah langsung diantar ke kosan 2 jam sampai!"',
    category: 'Mahasiswa / Skripsi',
    views: '88.3K',
    likes: '7.6K',
    comments: '412',
    duration: '01:05',
    customerName: 'Dinda Rahmawati (UB Malang)',
    laptopRented: 'MacBook Pro M1 16GB',
    location: 'Cabang Malang',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    tiktokUrl: 'https://www.tiktok.com/@sewalaptoptermurah',
    date: '3 hari lalu'
  },
  {
    id: 'tt-3',
    title: 'Unboxing & QC Ketat Sebelum Pengiriman ke Customer',
    description: 'Bongkar prosedur inspeksi: cek baterai health, keyboard test, layar no-deadpixel, dan segel higienis sebelum kurir berangkat.',
    category: 'Behind The Scene',
    views: '39.1K',
    likes: '3.1K',
    comments: '189',
    duration: '00:48',
    customerName: 'QC Team PinjamLaptop',
    laptopRented: 'Dell Latitude 7490',
    location: 'Hub Sidoarjo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
    tiktokUrl: 'https://www.tiktok.com/@sewalaptoptermurah',
    date: '5 hari lalu'
  },
  {
    id: 'tt-4',
    title: 'Testimoni Sewa ROG Strix Buat Render Video & Turnamen',
    description: 'Kak Kevin sewa unit Asus ROG Strix buat turnamen Valorant & editing deadline proyek film pendek seminggu penuh.',
    category: 'Gaming & Desain',
    views: '71.5K',
    likes: '5.9K',
    comments: '348',
    duration: '01:18',
    customerName: 'Kevin Pratama',
    laptopRented: 'ASUS ROG Strix RTX 3060',
    location: 'Cabang Bekasi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    tiktokUrl: 'https://www.tiktok.com/@sewalaptoptermurah',
    date: '1 minggu lalu'
  },
  {
    id: 'tt-5',
    title: 'Solusi WFH Darurat: Laptop Datang 1 Jam ke Surabaya',
    description: '"Layar laptop kantor mati tiba-tiba, butuh cepat buat Zoom meeting direksi. Pesan lewat WA, sejam sampai di rungkut!"',
    category: 'Bisnis / Darurat',
    views: '46.2K',
    likes: '3.7K',
    comments: '192',
    duration: '00:42',
    customerName: 'Bima Santoso (Manager)',
    laptopRented: 'ThinkPad X1 Carbon',
    location: 'Hub Sidoarjo - Surabaya',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
    tiktokUrl: 'https://www.tiktok.com/@sewalaptoptermurah',
    date: '1 minggu lalu'
  },
  {
    id: 'tt-6',
    title: 'Berapa Sih Biaya Sewa Laptop Harian? Murah Banget!',
    description: 'Rincian harga jujur mulai 50 ribuan/hari tanpa biaya tersembunyi. Bebas deposit jaminan ktp asli amanah!',
    category: 'Edukasi Sewa',
    views: '112.4K',
    likes: '9.8K',
    comments: '605',
    duration: '00:59',
    customerName: 'Tips Hemat Rental',
    laptopRented: 'All Catalog Units',
    location: 'Semua Cabang',
    thumbnailUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
    tiktokUrl: 'https://www.tiktok.com/@sewalaptoptermurah',
    date: '2 minggu lalu'
  }
];

export const TikTokSection: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<TikTokVideoItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Semua Video' },
    { id: 'Mahasiswa / Skripsi', label: 'Testimoni Mahasiswa' },
    { id: 'Event & Kantor', label: 'Event & Kantor' },
    { id: 'Gaming & Desain', label: 'Gaming & Desain' },
    { id: 'Behind The Scene', label: 'QC & Unboxing' },
  ];

  const filteredVideos = filterCategory === 'all'
    ? TIKTOK_VIDEOS
    : TIKTOK_VIDEOS.filter(v => v.category === filterCategory);

  return (
    <div id="tiktok-showcase-section" className="mt-8 mb-6">
      {/* Container utama dengan aksen visual TikTok modern, lebih ringkas & proporsional */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800 text-white shadow-lg relative overflow-hidden">
        
        {/* Subtle decorative glow accents (TikTok cyan & crimson) */}
        <div className="absolute -top-20 -left-20 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Profile Card Banner - Lebih Ringkas & Compact */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            {/* TikTok Avatar with animated ring (smaller size) */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-tr from-[#fe2c55] via-slate-900 to-[#25f4ee] p-[2.5px] shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                  <TikTokIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#fe2c55] text-white p-0.5 rounded-full shadow">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                  Sewa Laptop Termurah
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#fe2c55]/20 text-[#fe2c55] border border-[#fe2c55]/30">
                  <TikTokIcon className="w-2.5 h-2.5 text-[#fe2c55]" />
                  Official
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Aktif
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5">
                <a 
                  id="tiktok-handle-link"
                  href="https://www.tiktok.com/@sewalaptoptermurah" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-xs inline-flex items-center gap-1 group transition-colors"
                >
                  <span>@sewalaptoptermurah</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <span className="text-[11px] text-slate-400 hidden sm:inline">•</span>
                <span className="text-[11px] text-slate-300 line-clamp-1">
                  Dokumentasi serah terima & video testimoni pelanggan
                </span>
              </div>
            </div>
          </div>

          {/* Account Metrics & Follow CTA Button - Compact */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-center text-xs">
              <div>
                <span className="font-extrabold text-white">15.8K</span>
                <span className="text-[10px] text-slate-400 ml-1">Followers</span>
              </div>
              <span className="text-slate-600">|</span>
              <div>
                <span className="font-extrabold text-white">280K+</span>
                <span className="text-[10px] text-slate-400 ml-1">Suka</span>
              </div>
            </div>

            <a
              id="btn-visit-tiktok-profile"
              href="https://www.tiktok.com/@sewalaptoptermurah"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#f41e48] hover:from-[#e01f46] hover:to-[#db143d] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#fe2c55]/20 transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap"
            >
              <TikTokIcon className="w-3.5 h-3.5" />
              <span>Buka TikTok</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>
        </div>

        {/* Section Header & Filter Bar - Compact */}
        <div className="relative z-10 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                Cuplikan Video Dokumentasi & Review
              </h3>
              <p className="text-[11px] text-slate-400 leading-tight">
                Tonton kondisi laptop asli & serah terima unit langsung dari TikTok
              </p>
            </div>
          </div>

          <a
            id="btn-watch-more-tiktok"
            href="https://www.tiktok.com/@sewalaptoptermurah"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors w-fit shrink-0"
          >
            <span>Semua Video</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>

        {/* Category Filter Chips - Small Pill */}
        <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-3 scrollbar-none text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              id={`filter-tiktok-${cat.id}`}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Video Cards Grid - Landscape Layout (Horizontal Row/Card) & Lebih Kecil */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              id={`tiktok-card-${video.id}`}
              className="group bg-slate-800/50 hover:bg-slate-800/80 rounded-xl border border-slate-700/60 hover:border-slate-500/80 transition-all duration-200 flex flex-row overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => setActiveVideo(video)}
            >
              {/* Landscape Thumbnail (Kiri, Aspect Ratio Compact Landscape) */}
              <div className="relative w-36 sm:w-44 flex-shrink-0 bg-slate-950 overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-90 group-hover:brightness-100"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                {/* Small Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#fe2c55]/90 text-white flex items-center justify-center shadow-md transform group-hover:scale-110 group-hover:bg-[#fe2c55] transition-all">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Badge Durasi & Kategori pada Thumbnail */}
                <div className="absolute top-1.5 left-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white flex items-center gap-0.5">
                    <TikTokIcon className="w-2.5 h-2.5 text-[#25f4ee]" />
                    {video.duration}
                  </span>
                </div>

                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px] text-slate-200 font-medium">
                  <span className="flex items-center gap-1 font-mono text-[9px]">
                    <Heart className="w-2.5 h-2.5 text-[#fe2c55] fill-current" />
                    {video.likes}
                  </span>
                  <span className="text-[9px] text-slate-300 font-mono">
                    {video.views}
                  </span>
                </div>
              </div>

              {/* Landscape Card Body (Kanan, Lebih Ringkas & Rapi) */}
              <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-700/60 text-cyan-300 font-semibold text-[9px] truncate">
                      {video.category}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono shrink-0">
                      {video.location}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-white group-hover:text-cyan-400 transition-colors line-clamp-1 leading-snug">
                    {video.title}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                {/* Info Penyewa & Actions */}
                <div className="pt-2 mt-1 border-t border-slate-700/50 flex items-center justify-between gap-2">
                  <div className="text-[10px] truncate text-slate-300 font-medium">
                    <span className="text-slate-400">Unit:</span> {video.laptopRented}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      id={`btn-play-preview-${video.id}`}
                      onClick={() => setActiveVideo(video)}
                      className="py-1 px-2.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5 fill-current text-cyan-400" />
                      <span>Putar</span>
                    </button>

                    <a
                      id={`btn-open-tiktok-${video.id}`}
                      href={video.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Buka di TikTok"
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/70 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Assurance Banner - Lebih Ringkas */}
        <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Video Asli Dokumentasi & Review
            </span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Bebas Reputasi Palsu
            </span>
          </div>

          <a
            id="btn-footer-tiktok-link"
            href="https://www.tiktok.com/@sewalaptoptermurah"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors w-fit text-[11px]"
          >
            <span>Follow @sewalaptoptermurah di TikTok</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Interactive Video Player & Details Modal */}
      {activeVideo && (
        <div 
          id="tiktok-video-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fe2c55] flex items-center justify-center text-white">
                  <TikTokIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">@sewalaptoptermurah</div>
                  <div className="text-[10px] text-slate-400">Cuplikan Video Dokumentasi</div>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-tiktok-modal"
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Display */}
            <div className="relative aspect-[9/16] sm:aspect-video bg-black overflow-hidden flex items-center justify-center">
              <img
                src={activeVideo.thumbnailUrl}
                alt={activeVideo.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

              {/* Simulating Active Play State */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#fe2c55] text-white flex items-center justify-center shadow-xl animate-pulse">
                  <Play className="w-7 h-7 fill-current ml-1" />
                </div>
                <div className="max-w-md">
                  <h4 className="font-black text-white text-base sm:text-lg mb-1 leading-snug">
                    {activeVideo.title}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {activeVideo.description}
                  </p>
                </div>
              </div>

              {/* Interactive Player Controls Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-cyan-400">{activeVideo.duration}</span>
                  <span className="text-[11px] text-slate-300">{activeVideo.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Heart className="w-3.5 h-3.5 text-[#fe2c55] fill-current" />
                    {activeVideo.likes}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                    {activeVideo.comments}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body & Direct Link to TikTok */}
            <div className="p-5 space-y-4 bg-slate-900">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Rincian Unit Sewa:</div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-white">{activeVideo.laptopRented}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-400 font-mono text-[10px] border border-blue-500/30">
                    {activeVideo.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Penyewa: <strong className="text-slate-200">{activeVideo.customerName}</strong> ({activeVideo.location})
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  id="btn-modal-open-tiktok"
                  href={activeVideo.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#e01f46] hover:brightness-110 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#fe2c55]/20"
                >
                  <TikTokIcon className="w-4 h-4" />
                  <span>Tonton Lengkap & Komen di TikTok</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  id="btn-modal-close"
                  onClick={() => setActiveVideo(null)}
                  className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
