import React from 'react';
import { STORE_HUBS } from '../data/laptops';
import { 
  MapPin, Phone, Clock, Navigation, ShieldCheck, 
  Building2, PhoneCall, Star, ExternalLink 
} from 'lucide-react';
import { GoogleReviewsSection } from './GoogleReviewsSection';
import { TikTokSection } from './TikTokSection';

export const HubsSection: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in">
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Building2 className="w-4 h-4 text-blue-600" />
          LOKASI KANTOR PUSAT & CABANG RESMI
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Pusat Malang, Cabang Sidoarjo & Cabang Bekasi
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Unit laptop dapat diambil langsung di toko hub terdekat atau kami kirimkan dengan kurir cepat ke alamat rumah/kantor Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STORE_HUBS.map((hub) => (
          <div
            key={hub.id}
            className={`bg-white rounded-2xl p-6 border transition-all space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md ${
              hub.id === 'hub-malang' ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200/90'
            }`}
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                    hub.id === 'hub-malang' ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    {hub.id === 'hub-malang' ? 'Kantor Pusat Resmi' : 'Cabang Resmi'}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {hub.name}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              {/* Rating 5.0 Google Maps Badge */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-amber-900">5.0</span>
                <span className="text-slate-500 text-[11px]">({hub.reviewCount} ulasan di Google Maps)</span>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{hub.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span><strong>Buka:</strong> {hub.operatingHours}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span><strong>CS/WA:</strong> {hub.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              {/* Tombol Map Google Maps - Sesuai Permintaan */}
              <a
                href={hub.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Buka Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href={`tel:${hub.phone.replace(/[^0-9+]/g, '')}`}
                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                <span>Hubungi Cabang</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Showcase Akun TikTok @sewalaptoptermurah & Video Testimoni Pelanggan */}
      <TikTokSection />

      {/* Tampilkan Ulasan Bintang 5 Google Maps dari Semua Cabang */}
      <GoogleReviewsSection />
    </div>
  );
};
