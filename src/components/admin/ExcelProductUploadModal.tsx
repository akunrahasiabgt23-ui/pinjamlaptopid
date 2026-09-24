import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, Download, Upload, CheckCircle2, AlertCircle, 
  X, AlertTriangle, Layers, Plus, RefreshCw, FileText, ChevronRight,
  Sparkles, Check, ArrowRight
} from 'lucide-react';
import { Laptop } from '../../types';
import { 
  downloadLaptopExcelTemplate, 
  parseLaptopExcelFile, 
  ExcelParseResult 
} from '../../utils/excelImportExport';
import { getStoredLaptops, saveStoredLaptops, formatRupiah } from '../../utils/storage';

interface ExcelProductUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number, mode: 'append' | 'replace') => void;
}

export const ExcelProductUploadModal: React.FC<ExcelProductUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);
    setParseResult(null);

    try {
      const result = await parseLaptopExcelFile(file);
      setParseResult(result);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal membaca file Excel';
      setParseResult({
        success: false,
        laptops: [],
        errors: [errorMsg],
        warnings: [],
        totalRows: 0
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setParseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCommitImport = () => {
    if (!parseResult || parseResult.laptops.length === 0) return;

    setIsSubmitting(true);

    try {
      const currentLaptops = getStoredLaptops();
      let updatedLaptops: Laptop[] = [];

      if (importMode === 'replace') {
        // Gantikan seluruh katalog
        updatedLaptops = parseResult.laptops;
      } else {
        // Gabungkan (tambahkan produk baru di urutan paling atas)
        updatedLaptops = [...parseResult.laptops, ...currentLaptops];
      }

      saveStoredLaptops(updatedLaptops);
      onSuccess(parseResult.laptops.length, importMode);
      onClose();
    } catch (err) {
      console.error('Error importing laptops:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">
                Upload Produk Baru Format Excel
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Impor banyak laptop sekaligus secara otomatis dengan format spreadsheet .xlsx
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 flex-1">
          {/* Section 1: Template Download Banner */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-blue-50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Download className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Unduh Contoh Template Excel Resmi
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  Gunakan file template ini sebagai acuan kolom &amp; format data agar produk masuk secara otomatis ke katalog.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-download-excel-template"
              onClick={downloadLaptopExcelTemplate}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template Excel (.xlsx)</span>
            </button>
          </div>

          {/* Section 2: Drag and Drop Upload Area */}
          {!parseResult && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer select-none ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
                  : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/70 bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-excel-input"
              />

              <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                {isParsing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              {isParsing ? (
                <div className="space-y-1">
                  <p className="font-bold text-sm text-slate-800">Sedang memproses file Excel...</p>
                  <p className="text-xs text-slate-500">Membaca dan memvalidasi kolom spesifikasi laptop</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="font-bold text-sm sm:text-base text-slate-800">
                    Tarik &amp; Letakkan File Excel ke Sini atau <span className="text-emerald-600 underline">Klik untuk Memilih</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Mendukung format file <strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                    Kapasitas hingga ratusan produk sekaligus
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Parse Result & Preview */}
          {parseResult && (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="p-3.5 bg-slate-100/80 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{selectedFile?.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {((selectedFile?.size || 0) / 1024).toFixed(1)} KB • {parseResult.totalRows} baris terdeteksi
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetFile}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  Ganti File
                </button>
              </div>

              {/* Status Alert */}
              {parseResult.laptops.length > 0 ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Berhasil memvalidasi <strong>{parseResult.laptops.length} produk laptop</strong> dari file Excel.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Tidak ada data produk yang valid ditemukan.</p>
                    <p className="text-[11px] mt-0.5">Pastikan kolom Nama Laptop dan Harga Harian telah terisi.</p>
                  </div>
                </div>
              )}

              {/* Warnings / Errors List if any */}
              {parseResult.errors.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1 text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Catatan Kesalahan Baris:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-800 max-h-24 overflow-y-auto">
                    {parseResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              {parseResult.laptops.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Pratinjau Produk Yang Akan Diimpor ({parseResult.laptops.length} item):
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Gulir untuk melihat detail lengkap
                    </span>
                  </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 sticky top-0 font-bold text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">No</th>
                          <th className="py-2.5 px-3">SKU &amp; Serial Number</th>
                          <th className="py-2.5 px-3">Nama Laptop</th>
                          <th className="py-2.5 px-3">Lokasi Cabang</th>
                          <th className="py-2.5 px-3">Kategori</th>
                          <th className="py-2.5 px-3 text-right">Harga Harian</th>
                          <th className="py-2.5 px-3 text-center">Stok</th>
                          <th className="py-2.5 px-3">Spesifikasi Singkat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px]">
                        {parseResult.laptops.map((lap, idx) => (
                          <tr key={lap.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <div className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 whitespace-nowrap inline-block">
                                {lap.sku}
                              </div>
                              {lap.serialNumber && (
                                <div className="font-mono text-[9px] text-slate-500 mt-0.5">
                                  SN: {lap.serialNumber}
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-900 line-clamp-1">{lap.name}</div>
                              <span className="text-[10px] text-slate-500">{lap.brand}</span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] whitespace-nowrap ${
                                lap.branchCity === 'Malang'
                                  ? 'bg-amber-100 text-amber-800'
                                  : lap.branchCity === 'Sidoarjo'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {lap.branchCity || 'Malang'}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px] whitespace-nowrap">
                                {lap.category}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700">
                              {formatRupiah(lap.dailyPrice)}
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-700">
                              {lap.availableUnits} unit
                            </td>
                            <td className="py-2 px-3 text-slate-600 line-clamp-1 max-w-[200px] truncate">
                              {lap.processor} • {lap.ram} • {lap.gpu}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mode Impor Pilihan */}
                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      Pilihan Metode Penyimpanan Katalog:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label 
                        className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                          importMode === 'append'
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">Tambahkan ke Katalog (Rekomendasi)</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Menambahkan {parseResult.laptops.length} laptop baru tanpa menghapus katalog yang sudah ada sebelumnya.
                          </div>
                        </div>
                      </label>

                      <label 
                        className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                          importMode === 'replace'
                            ? 'border-amber-500 bg-amber-50/50 shadow-2xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="mt-0.5 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">Gantikan Seluruh Katalog</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Menggantikan semua unit saat ini dengan {parseResult.laptops.length} produk dari file Excel ini.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
          >
            Batal
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {parseResult && parseResult.laptops.length > 0 && (
              <button
                type="button"
                id="btn-confirm-excel-import"
                disabled={isSubmitting}
                onClick={handleCommitImport}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan ke Katalog...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Impor {parseResult.laptops.length} Produk ke Katalog</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
