import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { Customer } from '../../types';

interface IdCardViewerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const IdCardViewerModal: React.FC<IdCardViewerModalProps> = ({
  customer,
  isOpen,
  onClose
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [activePhoto, setActivePhoto] = useState<'primary' | 'secondary'>('primary');

  if (!isOpen || !customer) return null;

  const currentPhotoUrl = activePhoto === 'primary' 
    ? (customer.idCardPhotoUrl || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80')
    : (customer.secondIdPhotoUrl || customer.idCardPhotoUrl);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleResetView = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#e5dfd5] shadow-2xl max-w-2xl w-full overflow-hidden text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#e8e2d8] flex items-center justify-between bg-[#faf8f5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-stone-500 uppercase text-[10px]">{customer.idCardType || 'KTP'} Dokumen</span>
              <span className="text-[10px] text-[#1b633d] font-mono font-medium px-2 py-0.5 rounded-full bg-[#eaf4ee] border border-[#cce5d4]">Tervalidasi Asli</span>
            </div>
            <h3 className="font-bold text-sm text-stone-900 mt-0.5">
              {customer.name} &bull; <span className="font-mono">{customer.idCardNumber || 'NIK-BELUM-TERDATA'}</span>
            </h3>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#ede8df] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: KTP vs ID Tambahan */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#e8e2d8] bg-[#fbf9f5]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setActivePhoto('primary'); handleResetView(); }}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                activePhoto === 'primary' ? 'bg-[#4a586e] text-white font-medium' : 'text-stone-600 hover:bg-[#eee9de]'
              }`}
            >
              Foto Utama: {customer.idCardType || 'KTP'}
            </button>
            {customer.secondIdPhotoUrl && (
              <button
                onClick={() => { setActivePhoto('secondary'); handleResetView(); }}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  activePhoto === 'secondary' ? 'bg-[#4a586e] text-white font-medium' : 'text-stone-600 hover:bg-[#eee9de]'
                }`}
              >
                Foto Kedua: {customer.secondIdType || 'SIM'}
              </button>
            )}
          </div>

          {/* Zoom / Rotate Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded-lg border border-[#e5dfd5] hover:bg-[#faf7f2] text-stone-700"
              title="Perbesar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded-lg border border-[#e5dfd5] hover:bg-[#faf7f2] text-stone-700"
              title="Perkecil Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRotate}
              className="p-1 rounded-lg border border-[#e5dfd5] hover:bg-[#faf7f2] text-stone-700"
              title="Putar 90 Derajat"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="px-2.5 py-0.5 rounded-lg border border-[#e5dfd5] text-[11px] hover:bg-[#faf7f2] text-stone-600"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Image Container with Viewport */}
        <div className="flex-1 overflow-auto bg-[#1c1917] flex items-center justify-center p-4 min-h-[320px]">
          <div className="relative transition-transform duration-150">
            <img
              src={currentPhotoUrl}
              alt={`Dokumen Identitas ${customer.name}`}
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
              className="max-h-[50vh] max-w-full object-contain rounded-lg border border-stone-800 shadow-md"
            />
          </div>
        </div>

        {/* Customer Detail Footer */}
        <div className="p-4 border-t border-[#e8e2d8] bg-white grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-[10px] font-mono uppercase text-stone-400">Instansi / Kampus</div>
            <div className="font-medium text-stone-800 mt-0.5">{customer.companyOrCampus || 'Perorangan'}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-stone-400">No. WhatsApp / HP</div>
            <div className="font-mono text-stone-800 mt-0.5">{customer.phone}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-stone-400">Kontak Darurat</div>
            <div className="font-medium text-stone-800 mt-0.5">{customer.emergencyContactName || '-'}</div>
            <div className="text-[10px] text-stone-400 font-mono">{customer.emergencyContactPhone || ''}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-stone-400">Domisili Cabang</div>
            <div className="font-medium text-stone-800 mt-0.5">Cabang {customer.city}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
