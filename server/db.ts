import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { LAPTOP_CATALOG } from '../src/data/laptops';
import { Laptop, RentalOrder, AdminNotification } from '../src/types';

const DB_PATH = process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'pinjamlaptop.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      role_title TEXT NOT NULL,
      avatar TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      member_id TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      notes TEXT,
      delivery_method TEXT,
      preferred_hub TEXT,
      guarantee_type TEXT DEFAULT 'two_identities',
      doc1_type TEXT,
      doc1_number TEXT,
      doc1_holder_name TEXT,
      doc2_type TEXT,
      doc2_number TEXT,
      doc2_holder_name TEXT,
      emergency1_name TEXT,
      emergency1_relation TEXT,
      emergency1_phone TEXT,
      emergency2_name TEXT,
      emergency2_relation TEXT,
      emergency2_phone TEXT,
      registered_at TEXT NOT NULL,
      last_rental_date TEXT,
      total_rentals INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_type TEXT NOT NULL,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      data_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS laptops (
      id TEXT PRIMARY KEY,
      sku TEXT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      branch_city TEXT,
      branch_hub_id TEXT,
      daily_price INTEGER NOT NULL,
      weekly_price INTEGER NOT NULL,
      monthly_price INTEGER NOT NULL,
      deposit_amount INTEGER NOT NULL,
      late_fee_per_hour INTEGER DEFAULT 20000,
      image TEXT,
      available_units INTEGER DEFAULT 1,
      badge TEXT,
      serial_number TEXT,
      data_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      member_id TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      rental_started_at TEXT,
      duration_days INTEGER NOT NULL,
      delivery_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      total_paid INTEGER NOT NULL,
      data_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      order_ref_json TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
    CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
    CREATE INDEX IF NOT EXISTS idx_orders_member_id ON orders(member_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  `);

  // Purge any leaked legacy accounts if present
  try {
    db.prepare("DELETE FROM users WHERE lower(username) = 'pinjamlaptopid'").run();
  } catch (_e) {}

  seedInitialData();
}

function seedInitialData() {
  // 1. Seed initial admin and staff users if table is empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim();
    const adminPassword = (process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin123456')).trim();

    if (!adminPassword || adminPassword.length < 8) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('[DB Security Error] ADMIN_PASSWORD environment variable must be set with at least 8 characters in production!');
      }
    }

    const insertUser = db.prepare(`
      INSERT INTO users (id, username, password_hash, name, role, role_title, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    // Primary Admin (configured from env)
    insertUser.run(
      'ADM-001',
      adminUsername,
      bcrypt.hashSync(adminPassword, 10),
      'Hendra Wijaya, S.Kom',
      'super_admin',
      'Chief Operations & Systems Admin',
      now
    );

    // Optional Staff accounts if configured in env with strong password
    if (process.env.FINANCE_PASSWORD && process.env.FINANCE_PASSWORD.length >= 8) {
      insertUser.run(
        'ADM-FIN-002',
        'finance',
        bcrypt.hashSync(process.env.FINANCE_PASSWORD.trim(), 10),
        'Siti Rahmania, S.E.',
        'finance_admin',
        'Head of Billing & Financial Ledger',
        now
      );
    }

    if (process.env.OPS_PASSWORD && process.env.OPS_PASSWORD.length >= 8) {
      insertUser.run(
        'ADM-OPS-003',
        'ops',
        bcrypt.hashSync(process.env.OPS_PASSWORD.trim(), 10),
        'Bambang Pratama',
        'ops_admin',
        'Senior Fleet & Hub Coordinator',
        now
      );
    }

    console.log(`[DB] Seeded primary admin user (${adminUsername})`);
  }

  // 2. Seed catalog if table is empty
  const laptopCount = db.prepare('SELECT COUNT(*) as count FROM laptops').get() as { count: number };
  if (laptopCount.count === 0) {
    const insertLaptop = db.prepare(`
      INSERT INTO laptops (
        id, sku, name, brand, category, branch_city, branch_hub_id,
        daily_price, weekly_price, monthly_price, deposit_amount,
        late_fee_per_hour, image, available_units, badge, serial_number, data_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((laptops: Laptop[]) => {
      for (const laptop of laptops) {
        insertLaptop.run(
          laptop.id,
          laptop.sku || '',
          laptop.name,
          laptop.brand,
          laptop.category,
          laptop.branchCity || 'Malang',
          laptop.branchHubId || 'hub-malang',
          laptop.dailyPrice,
          laptop.weeklyPrice,
          laptop.monthlyPrice,
          laptop.depositAmount,
          laptop.lateFeePerHour || 20000,
          laptop.image,
          laptop.availableUnits,
          laptop.badge || '',
          laptop.serialNumber || '',
          JSON.stringify(laptop)
        );
      }
    });

    insertMany(LAPTOP_CATALOG);
    console.log(`[DB] Seeded ${LAPTOP_CATALOG.length} laptops into database`);
  }

  // 3. Seed initial sample orders if table is empty
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  if (orderCount.count === 0) {
    const now = new Date();
    const order1Start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const order1End = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const order2Start = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const order2End = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const order3Start = new Date(now.getTime());
    const order3End = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const initialOrders: RentalOrder[] = [
      {
        id: 'PL-8821-JKT',
        createdAt: order1Start.toISOString(),
        laptop: LAPTOP_CATALOG[0],
        customer: {
          fullName: 'Bagas Aditya Rahman',
          idCardNumber: '3174092408980004',
          phone: '0812-8877-9921',
          email: 'bagas.aditya@gmail.com',
          address: 'Apartemen Sudirman Tower Lt. 14 No. 14B, Setiabudi',
          city: 'Jakarta Selatan',
          district: 'Karet Semanggi'
        },
        durationDays: 3,
        startDate: order1Start.toISOString(),
        endDate: order1End.toISOString(),
        deliveryMethod: 'delivery',
        deliveryAddress: 'Apartemen Sudirman Tower Lt. 14 No. 14B, Setiabudi, Jakarta Selatan',
        guaranteeType: 'two_identities',
        identityDocs: {
          doc1Type: 'KTP',
          doc1Number: '3174092408980004',
          doc1HolderName: 'Bagas Aditya Rahman',
          doc1FileName: 'ktp_bagas_asli.jpg',
          doc2Type: 'SIM',
          doc2Number: '1129-8839-0021',
          doc2HolderName: 'Bagas Aditya Rahman',
          doc2FileName: 'sim_a_bagas.jpg'
        },
        emergencyContacts: [
          { name: 'Hendra Saputra', relationship: 'Saudara Kandung', phone: '0813-2244-8811' },
          { name: 'Rina Kusuma', relationship: 'Rekan Kerja / Manajer', phone: '0857-1122-3344' }
        ],
        warningAgreed100PercentForfeited: true,
        paymentMethod: 'qris',
        paymentStatus: 'paid',
        pricing: {
          dailyRate: 285000,
          durationDays: 3,
          subtotalRental: 855000,
          discount: 0,
          deliveryFee: 35000,
          depositFee: 0,
          totalPaid: 890000
        },
        status: 'active_rental',
        rentalStartedAt: order1Start.toISOString(),
        courierInfo: {
          name: 'Budi Santoso',
          phone: '0812-9900-1122',
          vehicle: 'Honda Vario 160 (Box Khusus Laptop)',
          vehiclePlate: 'B 4129 SHG',
          trackingCode: 'PL-EXP-9921',
          estimatedDeliveryTime: 'Telah Diterima'
        },
        logs: [
          {
            id: 'log-1',
            timestamp: order1Start.toISOString(),
            actor: 'system',
            title: 'Pembayaran Diterima via QRIS',
            message: 'Dana Rp 890.000 terverifikasi otomatis. Status pesanan diteruskan ke tim verifikasi.'
          },
          {
            id: 'log-2',
            timestamp: new Date(order1Start.getTime() + 15 * 60 * 1000).toISOString(),
            actor: 'admin',
            title: 'Verifikasi Berkas Sukses',
            message: 'Admin (Rizky) memvalidasi keaslian 2 Identitas (KTP & SIM A). Data cocok 100%.'
          },
          {
            id: 'log-3',
            timestamp: new Date(order1Start.getTime() + 45 * 60 * 1000).toISOString(),
            actor: 'admin',
            title: 'Unit Diserahkan ke Kurir',
            message: 'Kurir Budi Santoso (B 4129 SHG) membawa unit MacBook Pro 14 M3 menuju alamat penyewa.'
          },
          {
            id: 'log-4',
            timestamp: new Date(order1Start.getTime() + 90 * 60 * 1000).toISOString(),
            actor: 'system',
            title: 'Unit Diterima - Masa Sewa Berjalan',
            message: 'Penyewa telah menandatangani BAST digital. Masa sewa aktif hingga ' + order1End.toLocaleString('id-ID')
          }
        ]
      },
      {
        id: 'PL-8822-BDG',
        createdAt: now.toISOString(),
        laptop: LAPTOP_CATALOG[1],
        customer: {
          fullName: 'Dian Permata Sari',
          idCardNumber: '3273014502950002',
          phone: '0818-0911-2233',
          email: 'dian.permata@techstartup.id',
          address: 'Jl. Tubagus Ismail No. 24, Sekeloa',
          city: 'Bandung',
          district: 'Coblong'
        },
        durationDays: 7,
        startDate: order2Start.toISOString(),
        endDate: order2End.toISOString(),
        deliveryMethod: 'delivery',
        deliveryAddress: 'Jl. Tubagus Ismail No. 24, Sekeloa, Coblong, Kota Bandung',
        guaranteeType: 'two_identities',
        identityDocs: {
          doc1Type: 'KTP',
          doc1Number: '3273014502950002',
          doc1HolderName: 'Dian Permata Sari',
          doc1FileName: 'ktp_dian_permata.jpg',
          doc2Type: 'Ijazah',
          doc2Number: 'IJZ-ITB-2018-9901',
          doc2HolderName: 'Dian Permata Sari',
          doc2FileName: 'ijazah_asli_legalisir.pdf'
        },
        emergencyContacts: [
          { name: 'Iwan Setiawan', relationship: 'Orang Tua / Ayah', phone: '0812-7788-9900' },
          { name: 'Maya Andini', relationship: 'Saudara Kandung', phone: '0878-9988-1122' }
        ],
        warningAgreed100PercentForfeited: true,
        paymentMethod: 'bca_va',
        paymentStatus: 'paid',
        pricing: {
          dailyRate: 165000,
          durationDays: 7,
          subtotalRental: 1155000,
          discount: 165000,
          deliveryFee: 30000,
          depositFee: 0,
          totalPaid: 1020000
        },
        status: 'awaiting_verification',
        logs: [
          {
            id: 'log-201',
            timestamp: now.toISOString(),
            actor: 'system',
            title: 'Pesanan Dibuat & VA BCA Terbayar',
            message: 'Penyewa membayar Rp 1.020.000 via BCA VA. Menunggu verifikasi berkas KTP & Ijazah oleh Admin.'
          }
        ]
      },
      {
        id: 'PL-8823-SBY',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        laptop: LAPTOP_CATALOG[2],
        customer: {
          fullName: 'Fajar Nugroho Pratama',
          idCardNumber: '3578041908970001',
          phone: '0852-3344-7788',
          email: 'fajar.nugroho@gamedev.co.id',
          address: 'Jl. Kertajaya Indah Timur XI No. 8',
          city: 'Surabaya',
          district: 'Sukolilo'
        },
        durationDays: 3,
        startDate: order3Start.toISOString(),
        endDate: order3End.toISOString(),
        deliveryMethod: 'self_pickup',
        storeLocation: 'Pinjamlaptop Hub Surabaya (Gubeng)',
        guaranteeType: 'cash_deposit',
        depositAmount: 4500000,
        emergencyContacts: [
          { name: 'Agus Pratama', relationship: 'Orang Tua', phone: '0812-3322-1100' },
          { name: 'Bayu Wicaksono', relationship: 'Teman Satu Kantor', phone: '0813-8899-7766' }
        ],
        warningAgreed100PercentForfeited: true,
        paymentMethod: 'mandiri_va',
        paymentStatus: 'paid',
        pricing: {
          dailyRate: 340000,
          durationDays: 3,
          subtotalRental: 1020000,
          discount: 0,
          deliveryFee: 0,
          depositFee: 4500000,
          totalPaid: 5520000
        },
        status: 'ready_for_pickup',
        pickupPinCode: '894210',
        logs: [
          {
            id: 'log-301',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            actor: 'system',
            title: 'Pembayaran Sewa + Deposit Diterima',
            message: 'Total pembayaran Rp 5.520.000 (Termasuk deposit Rp 4.500.000) terkonfirmasi.'
          },
          {
            id: 'log-302',
            timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
            actor: 'admin',
            title: 'Unit Siap Diambil di Hub Gubeng Surabaya',
            message: 'Laptop telah di-QC (OS fresh clean, kelengkapan dicek). Kode PIN Pengambilan diterbitkan: 894210'
          }
        ]
      }
    ];

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, member_id, customer_name, customer_phone, customer_email,
        status, created_at, start_date, end_date, rental_started_at,
        duration_days, delivery_method, payment_status, payment_method,
        total_paid, data_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const order of initialOrders) {
      insertOrder.run(
        order.id,
        order.memberId || null,
        order.customer.fullName,
        order.customer.phone,
        order.customer.email,
        order.status,
        order.createdAt,
        order.startDate,
        order.endDate,
        order.rentalStartedAt || null,
        order.durationDays,
        order.deliveryMethod,
        order.paymentStatus,
        order.paymentMethod,
        order.pricing.totalPaid,
        JSON.stringify(order)
      );
    }

    console.log(`[DB] Seeded initial orders`);
  }

  // 4. Seed initial notifications if table is empty
  const notifCount = db.prepare('SELECT COUNT(*) as count FROM notifications').get() as { count: number };
  if (notifCount.count === 0) {
    const now = new Date();
    const initialNotifs: AdminNotification[] = [
      {
        id: 'notif-1',
        orderId: 'PL-8822-BDG',
        type: 'new_order_delivery',
        title: 'Pesanan Baru Perlu Pengiriman (Delivery)',
        message: 'Customer Dian Permata Sari menyewa ThinkPad T14 (7 Hari). Pengiriman ke Tubagus Ismail, Bandung. Harap verifikasi 2 identitas!',
        timestamp: now.toISOString(),
        read: false,
        orderRef: {
          customerName: 'Dian Permata Sari',
          laptopName: 'Lenovo ThinkPad T14 Gen 4',
          deliveryMethod: 'delivery'
        }
      },
      {
        id: 'notif-2',
        orderId: 'PL-8823-SBY',
        type: 'new_order_pickup',
        title: 'Pesanan Ambil di Hub (Self Pick-up)',
        message: 'Fajar Nugroho Pratama telah membayar sewa + deposit Rp 4.500.000. Siap diambil di Hub Gubeng Surabaya dengan PIN 894210.',
        timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
        read: true,
        orderRef: {
          customerName: 'Fajar Nugroho Pratama',
          laptopName: 'ASUS ROG Zephyrus G16',
          deliveryMethod: 'self_pickup'
        }
      }
    ];

    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, order_id, type, title, message, timestamp, read, order_ref_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const notif of initialNotifs) {
      insertNotif.run(
        notif.id,
        notif.orderId,
        notif.type,
        notif.title,
        notif.message,
        notif.timestamp,
        notif.read ? 1 : 0,
        JSON.stringify(notif.orderRef)
      );
    }

    console.log(`[DB] Seeded initial notifications`);
  }
}
