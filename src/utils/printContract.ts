import { RentalOrder } from '../types';
import { formatRupiah, formatSpkNumber } from './storage';

export const printOrderAgreement = (
  order: RentalOrder, 
  isAcknowledged: boolean = true
): void => {
  const contractNumber = formatSpkNumber(order);
  const createdDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const dayName = new Date(order.createdAt).toLocaleDateString('id-ID', { weekday: 'long' });

  const isApproved = 
    order.status === 'verified_preparing' || 
    order.status === 'ready_for_pickup' || 
    order.status === 'in_delivery' || 
    order.status === 'active_rental' || 
    order.status === 'completed';

  const guaranteeDesc = order.guaranteeType === 'two_identities'
    ? 'Dokumen jaminan fisik wajib ASLI dan MILIK PRIBADI atas nama penyewa sendiri. Jaminan dikembalikan 100% utuh saat unit kembali aman.'
    : `Uang deposit jaminan sebesar ${formatRupiah(order.laptop.depositAmount || 1500000)} dikembalikan 100% utuh ke rekening penyewa setelah unit diperiksa normal.`;

  const docInfo = order.identityDocs
    ? `${order.identityDocs.doc1Type} (${order.identityDocs.doc1Number}) & ${order.identityDocs.doc2Type} (${order.identityDocs.doc2Number})`
    : '2 Dokumen Identitas Fisik Resmi Terverifikasi';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>SPK - ${contractNumber}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 14mm 12mm 14mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 10pt;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-box {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 18pt;
        }
        .brand-text h1 {
          margin: 0;
          font-size: 14pt;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .brand-text .sub {
          margin: 0;
          font-size: 8.5pt;
          font-weight: 700;
          color: #0284c7;
        }
        .brand-text .meta {
          margin: 2px 0 0 0;
          font-size: 7.5pt;
          color: #475569;
        }
        .doc-no {
          text-align: right;
          font-size: 8pt;
          color: #334155;
        }
        .doc-no .title {
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
        }
        .doc-no .code {
          font-family: monospace;
          font-weight: 700;
          color: #0369a1;
          margin: 2px 0;
        }
        .main-title {
          text-align: center;
          margin-bottom: 12px;
        }
        .main-title h2 {
          margin: 0;
          font-size: 12pt;
          font-weight: 900;
          text-transform: uppercase;
          text-decoration: underline;
          letter-spacing: 0.5px;
        }
        .main-title p {
          margin: 3px 0 0 0;
          font-size: 8pt;
          color: #475569;
        }
        .opening {
          font-size: 8.5pt;
          margin-bottom: 8px;
          text-align: justify;
        }
        .party-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px 10px;
          margin-bottom: 6px;
          font-size: 8.5pt;
          page-break-inside: avoid;
        }
        .party-box strong {
          color: #0f172a;
        }
        .party-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 10px;
          margin-top: 4px;
        }
        .section-header {
          font-size: 9pt;
          font-weight: 800;
          text-transform: uppercase;
          color: #0f172a;
          border-left: 3px solid #0284c7;
          padding-left: 6px;
          margin: 10px 0 6px 0;
        }
        .clause-item {
          display: flex;
          gap: 8px;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #ffffff;
          margin-bottom: 5px;
          font-size: 8pt;
          page-break-inside: avoid;
        }
        .clause-item.highlight {
          background: #fef2f2;
          border-color: #fecaca;
        }
        .clause-item.warning {
          background: #fffbeb;
          border-color: #fde68a;
        }
        .clause-badge {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0284c7;
          color: white;
          font-size: 7pt;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .clause-badge.warn {
          background: #dc2626;
        }
        .clause-body strong {
          display: block;
          color: #0f172a;
          font-size: 8.5pt;
          margin-bottom: 2px;
        }
        .clause-body p {
          margin: 0;
          color: #334155;
          line-height: 1.35;
        }
        .statement-box {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 6px 10px;
          text-align: center;
          font-size: 8pt;
          color: #1e293b;
          margin: 10px 0;
          page-break-inside: avoid;
        }
        .statement-box .acknowledged {
          color: #15803d;
          font-weight: 700;
          margin-top: 3px;
        }
        .signature-table {
          width: 100%;
          margin-top: 10px;
          page-break-inside: avoid;
        }
        .signature-table td {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 6px 12px;
        }
        .sig-title {
          font-weight: 800;
          font-size: 8.5pt;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .sig-stamp-box {
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .stamp-approved {
          display: inline-block;
          padding: 4px 10px;
          border: 2px solid #16a34a;
          color: #15803d;
          font-weight: 800;
          font-size: 8pt;
          border-radius: 4px;
          text-transform: uppercase;
          transform: rotate(-3deg);
        }
        .stamp-pending {
          display: inline-block;
          padding: 4px 8px;
          border: 2px solid #d97706;
          color: #b45309;
          background: #fffbeb;
          font-weight: 700;
          font-size: 8pt;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .stamp-customer {
          display: inline-block;
          padding: 4px 8px;
          border: 1px solid #86efac;
          background: #f0fdf4;
          color: #15803d;
          font-weight: 700;
          font-size: 8pt;
          border-radius: 4px;
        }
        .sig-name {
          font-weight: 800;
          text-decoration: underline;
          color: #0f172a;
          font-size: 8.5pt;
          margin: 0;
        }
        .sig-role {
          font-size: 7.5pt;
          color: #64748b;
          margin: 2px 0 0 0;
        }
      </style>
    </head>
    <body>
      <!-- Header Kop Surat -->
      <div class="header">
        <div class="brand">
          <div class="logo-box">P</div>
          <div class="brand-text">
            <h1>PINJAMLAPTOP.ID</h1>
            <p class="sub">Layanan Rental Laptop Resmi & Transparan</p>
            <p class="meta">Jl. Taman Borobudur Indah B-20 • WhatsApp: 0877-2556-4455 • Email: pinjamlaptopid@gmail.com • Website: pinjamlaptop.id</p>
          </div>
        </div>
        <div class="doc-no">
          <div class="title">Surat Perjanjian Sewa (SPK)</div>
          <div class="code">NO: ${contractNumber}</div>
          <div>Tanggal: ${createdDate}</div>
        </div>
      </div>

      <!-- Judul Dokumen -->
      <div class="main-title">
        <h2>Surat Perjanjian Sewa Menyewa Laptop</h2>
        <p>Nomor: ${contractNumber} • Perjanjian Pengikatan Hak Guna Pakai Unit Komputer Jinjing & Aksesoris</p>
      </div>

      <p class="opening">
        Pada hari ini, tanggal <strong>${dayName}, ${createdDate}</strong>, telah dibuat dan disepakati perjanjian sewa-menyewa unit komputer jinjing (laptop) oleh dan antara pihak-pihak sebagai berikut:
      </p>

      <!-- Para Pihak -->
      <div class="party-box">
        <strong>1. PIHAK PERTAMA (Pemberi Sewa):</strong>
        <div style="margin-top: 2px;">
          <strong>PINJAMLAPTOP.ID</strong>, penyedia resmi persewaan laptop berdomisili di Jl. Taman Borobudur Indah B-20 (selanjutnya disebut <em>"PEMBERI SEWA"</em>).
        </div>
      </div>

      <div class="party-box">
        <strong>2. PIHAK KEDUA (Penyewa):</strong>
        <div class="party-grid">
          <div>Nama Lengkap: <strong>${order.customer.fullName}</strong></div>
          <div>No. WhatsApp: <strong>${order.customer.phone}</strong></div>
          <div>Identitas Dokumen: <strong>${docInfo}</strong></div>
          <div>Alamat Domisili: <strong>${order.customer.address}, ${order.customer.city}</strong></div>
        </div>
      </div>

      <!-- Poin-Poin Kesepakatan -->
      <div class="section-header">Poin-Poin Kesepakatan Sewa Menyewa</div>

      <div class="clause-item">
        <div class="clause-badge">1</div>
        <div class="clause-body">
          <strong>Objek & Kepemilikan Unit</strong>
          <p>Unit <strong>${order.laptop.name}</strong> (${order.laptop.processor}, RAM ${order.laptop.ram}, SSD ${order.laptop.storage}) beserta charger asli & tas adalah hak milik PinjamLaptop. Diserahkan dalam kondisi normal dan siap pakai.</p>
        </div>
      </div>

      <div class="clause-item">
        <div class="clause-badge">2</div>
        <div class="clause-body">
          <strong>Durasi Sewa (${order.durationDays} Hari)</strong>
          <p>Masa sewa dihitung 24 jam per hari sejak unit diterima. Pengembalian wajib tepat waktu sesuai batas tanggal dan jam yang disepakati. Total biaya sewa lunas: <strong>${formatRupiah(order.pricing.totalPaid)}</strong>.</p>
        </div>
      </div>

      <div class="clause-item warning">
        <div class="clause-badge" style="background: #d97706;">3</div>
        <div class="clause-body">
          <strong>Jaminan Wajib Milik Pribadi Penyewa</strong>
          <p>${guaranteeDesc}</p>
        </div>
      </div>

      <div class="clause-item highlight">
        <div class="clause-badge warn">4</div>
        <div class="clause-body">
          <strong>Kehadiran Penyewa Wajib di Lokasi (Tidak Bisa Diwakilkan)</strong>
          <p>Saat serah terima laptop (baik Diantar Kurir maupun Ambil di Hub), <strong>Penyewa Asli WAJIB hadir langsung di lokasi</strong>. Penyerahan unit <strong>TIDAK BISA DIWAKILKAN</strong> kepada siapa pun. Jika penyewa tidak hadir di lokasi, unit tidak bisa diserahkan dan uang transaksi sewa hangus 100%.</p>
        </div>
      </div>

      <div class="clause-item warning">
        <div class="clause-badge" style="background: #d97706;">5</div>
        <div class="clause-body">
          <strong>Denda Keterlambatan: Toleransi 1 Jam (Rp 20.000 / Jam)</strong>
          <p>Terdapat <strong>toleransi pengembalian maksimal 1 jam</strong> untuk mengantisipasi situasi yang tidak bisa diprediksi (cuaca buruk/hujan, musibah, atau kemacetan lalu lintas). Jika pengembalian melebihi batas toleransi 1 jam, dikenakan denda flat <strong>Rp 20.000 / jam berjalan</strong> dan wajib dilunasi saat pengembalian tanpa penundaan.</p>
        </div>
      </div>

      <div class="clause-item">
        <div class="clause-badge">6</div>
        <div class="clause-body">
          <strong>Perawatan & Tanggung Jawab Kerusakan</strong>
          <p>Penyewa wajib merawat unit dengan baik. Kerusakan akibat kelalaian (jatuh, terkena cairan, layar pecah) atau kehilangan sepenuhnya menjadi tanggung jawab penyewa sesuai biaya perbaikan/ganti rugi resmi.</p>
        </div>
      </div>

      <div class="clause-item">
        <div class="clause-badge">7</div>
        <div class="clause-body">
          <strong>Larangan Hukum Pidana (Pasal 372 KUHP)</strong>
          <p>Dilarang keras menggadaikan, menjual, memindahtangankan, atau merusak segel unit. Segala bentuk penggelapan barang akan langsung diproses secara hukum pidana ke kepolisian Republik Indonesia.</p>
        </div>
      </div>

      <!-- Pernyataan Sadar -->
      <div class="statement-box">
        <div>Surat Perjanjian Sewa Menyewa ini dibuat dan disepakati secara sadar, tanpa paksaan, oleh kedua belah pihak.</div>
        ${isAcknowledged || order.agreementReadAndAcknowledged ? `
          <div class="acknowledged">
            ✓ Telah dibaca, dipahami, dan dicentang secara sadar oleh Penyewa (${order.customer.fullName}) pada ${new Date(order.agreementAcknowledgedAt || Date.now()).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
          </div>
        ` : ''}
      </div>

      <!-- Tanda Tangan -->
      <table class="signature-table">
        <tr>
          <td>
            <div class="sig-title">PIHAK PERTAMA (Pemberi Sewa)</div>
            <div class="sig-stamp-box">
              ${isApproved ? `
                <div class="stamp-approved">✓ RESMI DISETUJUI</div>
              ` : `
                <div class="stamp-pending">⏳ Menunggu Approval Petugas</div>
              `}
            </div>
            <p class="sig-name">PINJAMLAPTOP.ID</p>
            <p class="sig-role">Petugas Operasional Resmi</p>
          </td>
          <td>
            <div class="sig-title">PIHAK KEDUA (Penyewa)</div>
            <div class="sig-stamp-box">
              <div class="stamp-customer">
                ${isAcknowledged || order.agreementReadAndAcknowledged ? '✓ DISETUJUI SECARA SADAR' : '(Menunggu Centang Sadar)'}
              </div>
            </div>
            <p class="sig-name">${order.customer.fullName}</p>
            <p class="sig-role">Penyewa Terverifikasi</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Gunakan invisible iframe agar dokumen terisolasi tanpa ada blank page dari layout app
  try {
    const existing = document.getElementById('spk-print-isolated-frame');
    if (existing) existing.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'spk-print-isolated-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-9999';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Tunggu render selesai lalu cetak
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Iframe print error, fallback to window.print', err);
        window.print();
      } finally {
        setTimeout(() => {
          iframe.remove();
        }, 3000);
      }
    }, 300);
  } catch (e) {
    console.error('Error preparing print document', e);
    window.print();
  }
};
