import React, { useRef } from 'react';
import { 
  Star, MapPin, ExternalLink, CheckCircle2, 
  ChevronRight, ChevronLeft, Navigation
} from 'lucide-react';
import { STORE_HUBS } from '../data/laptops';
import { GOOGLE_MAPS_REVIEWS } from '../data/reviews';

interface GoogleReviewsSectionProps {
  onNavigateToHubs?: () => void;
}

export const GoogleReviewsSection: React.FC<GoogleReviewsSectionProps> = ({
  onNavigateToHubs
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.max(280, Math.floor(scrollContainerRef.current.clientWidth * 0.8));
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="mt-8 pt-6 border-t border-slate-200/80 space-y-4" id="google-reviews-section">
      {/* Header Minimalis Rating 5.0 Google Maps */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
            5.0
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-amber-300">497+ Ulasan</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Ulasan Google Maps Terverifikasi
            </h3>
            <p className="text-[11px] text-slate-300">
              Pusat Malang • Cabang Sidoarjo • Cabang Bekasi
            </p>
          </div>
        </div>

        {/* Tombol Buka Cabang di Google Maps */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {STORE_HUBS.map((hub) => (
            <a
              key={hub.id}
              href={hub.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all"
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{hub.city}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          ))}
        </div>
      </div>

      {/* Baris Judul & Kontrol Panah */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Testimoni Asli Pelanggan
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            aria-label="Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swipeable List of Reviews */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-none"
      >
        {GOOGLE_MAPS_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="w-[270px] sm:w-[320px] shrink-0 snap-start bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${review.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">
                      {review.authorName}
                    </h4>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {review.hubName}
                    </span>
                  </div>
                </div>

                <div className="flex text-amber-400 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 italic leading-relaxed">
                "{review.comment}"
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                Terverifikasi
              </span>
              <a
                href={review.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>Lihat di Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
