const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
// Serve static files EXCEPT override root route below
app.use(express.static('public'));


// ==============================
// KONEKSI DATABASE (PostgreSQL)
// ==============================
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

db.connect(async (err, client, release) => {
  if (err) {
    console.error('Gagal koneksi ke database:', err.stack);
    return;
  }
  console.log('Database connected successfully.');
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        nama VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'tamu',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Paket Catalog Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS paket_catalog (
        id SERIAL PRIMARY KEY,
        kode VARCHAR(50) UNIQUE NOT NULL,
        nama VARCHAR(255) NOT NULL,
        kategori VARCHAR(50) NOT NULL,
        harga INTEGER NOT NULL,
        satuan VARCHAR(50) NOT NULL,
        deskripsi TEXT,
        fitur JSONB,
        is_popular BOOLEAN DEFAULT FALSE,
        urutan INTEGER DEFAULT 0
      )
    `);

    // Seed data if empty
    const count = await client.query('SELECT COUNT(*) FROM paket_catalog');
    if (parseInt(count.rows[0].count) === 0) {
      const seedData = [
        { kode: 'sosmed-starter', nama: 'Sosial Media Starter', kategori: 'bundling', harga: 1500000, satuan: 'bulan', fitur: ['15 Desain Feed & Story Premium','Copywriting berbasis konversi','1x Sesi Liputan Foto Lokasi','Laporan Analitik Bulanan'], popular: false, urutan: 1 },
        { kode: 'sosmed-pro', nama: 'Sosial Media Professional', kategori: 'bundling', harga: 2800000, satuan: 'bulan', fitur: ['25 Desain Feed & Story','2x Video Reels per bulan','Manajemen DM & Komentar','Laporan Analytics Mingguan','Optimasi Hashtag & Caption'], popular: false, urutan: 2 },
        { kode: 'sultan-allin', nama: 'Bundel Sultan All-In', kategori: 'bundling', harga: 5900000, satuan: 'bulan', fitur: ['30 Konten Feed & Story Harian','4x Produksi Video Reels Profesional','Pengelolaan Meta Ads & Google Ads','Dokumentasi Event Utama','1 Landing Page Premium','Laporan ROI Bulanan'], popular: true, urutan: 3 },
        { kode: 'sinematik', nama: 'Paket Sinematik & Dokumentasi', kategori: 'bundling', harga: 3500000, satuan: 'proyek', fitur: ['Full-day Syuting Profesional','Resolusi 4K + Drone Berlisensi','1 Video Company Profile','3 Short Video (Reels/TikTok)','Color Grading Sinematik'], popular: false, urutan: 4 },
        { kode: 'web-bisnis', nama: 'Paket Website Bisnis', kategori: 'bundling', harga: 4500000, satuan: 'proyek', fitur: ['Desain UI/UX Eksklusif & Modern','Domain (.com/.id) + Hosting 1 Tahun','Sistem CMS (Kelola Konten Sendiri)','Optimasi SEO Fundamental','Responsif Mobile & Tablet'], popular: false, urutan: 5 },
        { kode: 'ads-management', nama: 'Manajemen Iklan Digital', kategori: 'bundling', harga: 2200000, satuan: 'bulan', fitur: ['Setup & Optimasi Meta Ads','Setup & Optimasi Google Ads','Target Audience Riset','A/B Testing Iklan','Laporan Performa Mingguan'], popular: false, urutan: 6 },
        { kode: 'logo', nama: 'Desain Logo Profesional', kategori: 'satuan', harga: 500000, satuan: 'proyek', fitur: ['Format Vector (AI, EPS, SVG)','3x Revisi Gratis','Manual Brand Guidelines'], popular: false, urutan: 7 },
        { kode: 'brosur', nama: 'Desain Brosur & Pamflet', kategori: 'satuan', harga: 150000, satuan: 'item', fitur: ['Format siap cetak (CMYK)','Format digital (RGB)','1x Revisi'], popular: false, urutan: 8 },
        { kode: 'edit-video', nama: 'Editing Video Konten', kategori: 'satuan', harga: 300000, satuan: 'video', fitur: ['Durasi raw max 15 menit','Subtitle & Motion Graphic','Color Grading'], popular: false, urutan: 9 },
        { kode: 'ads-setup', nama: 'Setup Iklan Meta/Google', kategori: 'satuan', harga: 800000, satuan: 'proyek', fitur: ['Konfigurasi Pixel/Tag','Pembuatan Materi Iklan','Riset Audience Target'], popular: false, urutan: 10 },
        { kode: 'event-photo', nama: 'Dokumentasi Event (Foto)', kategori: 'satuan', harga: 750000, satuan: 'sesi', fitur: ['Half-day (maks 5 jam)','100+ foto terseleksi','Editing & retouching'], popular: false, urutan: 11 },
        { kode: 'landing-page', nama: 'Landing Page Konversi', kategori: 'satuan', harga: 1500000, satuan: 'proyek', fitur: ['Desain custom 1 halaman panjang','Formulir & CTA terintegrasi','Hosting gratis 6 bulan'], popular: false, urutan: 12 },
        { kode: 'foto-produk', nama: 'Foto Produk Katalog', kategori: 'satuan', harga: 400000, satuan: 'sesi', fitur: ['Maks 20 produk per sesi','Background & properti tersedia','Editing profesional'], popular: false, urutan: 13 },
        { kode: 'custom', nama: 'Paket Custom / Diskusi', kategori: 'satuan', harga: 0, satuan: 'menyesuaikan', fitur: ['Konsultasi gratis terlebih dahulu','Disesuaikan kebutuhan bisnis Anda'], popular: false, urutan: 14 }
      ];

      for (const p of seedData) {
        await client.query(
          `INSERT INTO paket_catalog (kode, nama, kategori, harga, satuan, fitur, is_popular, urutan)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (kode) DO NOTHING`,
          [p.kode, p.nama, p.kategori, p.harga, p.satuan, JSON.stringify(p.fitur), p.popular, p.urutan]
        );
      }
      console.log('Paket catalog seeded successfully.');
    }
  } catch (e) {
    console.error('Gagal inisialisasi tabel:', e);
  }
  release();
});

// ==============================
// KONFIGURASI GOOGLE OAUTH
// ==============================
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const res = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, res.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    proxy: true
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      const res = await db.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
      let user = res.rows[0];
      
      if (!user) {
        const countRes = await db.query('SELECT COUNT(*) FROM users');
        const role = parseInt(countRes.rows[0].count) === 0 ? 'super_admin' : 'tamu';
        
        const insertRes = await db.query(
          'INSERT INTO users (google_id, nama, email, role) VALUES ($1, $2, $3, $4) RETURNING *',
          [profile.id, profile.displayName, profile.emails[0].value, role]
        );
        user = insertRes.rows[0];
      }
      return cb(null, user);
    } catch (err) {
      return cb(err, null);
    }
  }
));

// MIDDLEWARE RBAC
const requireRole = (roles) => (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Belum login' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Akses ditolak' });
  next();
};
const adminRoles = ['super_admin', 'admin', 'anggota'];
const superAdminRoles = ['super_admin'];

// Endpoint Auth
app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated()) res.json({ user: req.user });
  else res.status(401).json({ error: 'Belum login' });
});

// Public endpoint: daftar paket
app.get('/api/paket', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM paket_catalog ORDER BY urutan ASC');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==============================
// ROUTING UTAMA
// ==============================
// GET / → halaman publik home, tidak perlu login
app.get('/', (req, res) => {
  res.redirect('/home.html');
});

// Proteksi server-side untuk admin.html
app.get('/admin.html', (req, res) => {
  if (!req.isAuthenticated() || !adminRoles.includes(req.user.role)) {
    return res.redirect('/admin-login.html?error=access_denied');
  }
  res.sendFile('admin.html', { root: 'public' });
});

// ---- AUTH ROUTES ----

// USER LOGIN (Pelanggan)
app.get('/auth/google', (req, res, next) => {
  req.session.authIntent = 'user';
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

// ADMIN LOGIN (Tim Internal)
app.get('/auth/admin/google', (req, res, next) => {
  req.session.authIntent = 'admin';
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

// CALLBACK tunggal untuk kedua jalur
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html?error=auth_failed' }),
  (req, res) => {
    const intent = req.session.authIntent || 'user';
    delete req.session.authIntent;

    if (intent === 'admin') {
      // Jalur admin portal: hanya izinkan role admin/anggota
      if (adminRoles.includes(req.user.role)) {
        return res.redirect('/admin.html');
      } else {
        // Bukan admin → tolak dan keluarkan
        return req.logout(() => {
          res.redirect('/admin-login.html?error=access_denied');
        });
      }
    } else {
      // Jalur user portal: SEMUA role (termasuk admin) masuk ke sisi user
      // Admin tetap bisa melihat tampilan user jika login dari sini
      return res.redirect('/home.html');
    }
  }
);


// LOGOUT Admin → kembali ke admin-login
app.get('/auth/admin/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/admin-login.html');
  });
});

// LOGOUT User → kembali ke home
app.get('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/home.html');
  });
});


// Endpoint untuk menyimpan order
app.post('/api/orders', (req, res) => {
  const { nama, email, whatsapp, paket } = req.body;
  
  // Validasi input
  if (!nama || !email || !whatsapp || !paket) {
    return res.status(400).json({ error: 'Semua field (nama, email, whatsapp, paket) harus diisi' });
  }

  const query = 'INSERT INTO orders (nama, email, whatsapp, paket) VALUES ($1, $2, $3, $4) RETURNING id';
  db.query(query, [nama, email, whatsapp, paket], (err, results) => {
    if (err) {
      console.error('Gagal menyimpan pesanan:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
    
    res.status(201).json({ 
      message: 'Pesanan berhasil dikirim!', 
      orderId: results.rows[0].id 
    });
  });
});

// Endpoint untuk menyimpan pesan kontak
app.post('/api/contacts', (req, res) => {
  const { nama, email, whatsapp, pesan } = req.body;
  
  // Validasi input
  if (!nama || !email || !whatsapp || !pesan) {
    return res.status(400).json({ error: 'Semua field (nama, email, whatsapp, pesan) harus diisi' });
  }

  const query = 'INSERT INTO contacts (nama, email, whatsapp, pesan) VALUES ($1, $2, $3, $4) RETURNING id';
  db.query(query, [nama, email, whatsapp, pesan], (err, results) => {
    if (err) {
      console.error('Gagal menyimpan pesan kontak:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
    
    res.status(201).json({ 
      message: 'Pesan kontak berhasil dikirim!', 
      contactId: results.rows[0].id 
    });
  });
});

// Ambil semua data orders
app.get('/api/orders', requireRole(adminRoles), (req, res) => {
  const sql = 'SELECT * FROM orders ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.rows);
  });
});

// Update status order
app.put('/api/orders/:id', requireRole(['super_admin', 'admin', 'anggota']), (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE orders SET status = $1 WHERE id = $2';
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status berhasil diupdate' });
  });
});

// Ambil semua data contacts
app.get('/api/contacts', requireRole(['super_admin', 'admin']), (req, res) => {
  const sql = 'SELECT * FROM contacts ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.rows);
  });
});

// ==============================
// ENDPOINT MANAJEMEN USER
// ==============================
app.get('/api/users', requireRole(superAdminRoles), async (req, res) => {
  try {
    const results = await db.query('SELECT id, nama, email, role, created_at FROM users ORDER BY id ASC');
    res.json(results.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/role', requireRole(superAdminRoles), async (req, res) => {
  try {
    const { role } = req.body;
    await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ message: 'Role berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// ENDPOINT TRACKING PENGUNJUNG
// ==============================
const crypto = require('crypto');

// POST /api/track — terima data kunjungan dari frontend
app.post('/api/track', async (req, res) => {
  try {
    const { page, referrer, user_agent, device_type, duration_seconds } = req.body;

    // Dapatkan IP pengunjung
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.connection?.remoteAddress
      || '0.0.0.0';

    // Hash IP untuk privasi (tidak simpan IP asli)
    const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex');

    // Geolocation: Gunakan header Vercel jika tersedia (gratis, tanpa API eksternal)
    // Di local dev, nilainya akan undefined/null
    const country = req.headers['x-vercel-ip-country'] || null;
    const city = req.headers['x-vercel-ip-city']
      ? decodeURIComponent(req.headers['x-vercel-ip-city'])
      : null;

    const query = `
      INSERT INTO page_visits (page, referrer, user_agent, device_type, country, city, duration_seconds, ip_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    await db.query(query, [
      page || 'Unknown',
      referrer || 'Direct / Bookmark',
      user_agent || null,
      device_type || 'Desktop',
      country || null,
      city || null,
      duration_seconds || 0,
      ipHash,
    ]);

    res.status(201).json({ ok: true });
  } catch (err) {
    // Jangan sampai error tracking merusak UX pengunjung
    console.error('Track error:', err.message);
    res.status(500).json({ ok: false });
  }
});

// GET /api/analytics — ringkasan analytics untuk admin dashboard
app.get('/api/analytics', requireRole(adminRoles), async (req, res) => {
  try {
    // 1. Total views hari ini
    const todayViews = await db.query(`
      SELECT COUNT(*) as count FROM page_visits
      WHERE created_at >= NOW() AT TIME ZONE 'Asia/Jakarta' - INTERVAL '1 day'
    `);

    // 2. Total unique visitors (by IP hash) hari ini
    const todayUnique = await db.query(`
      SELECT COUNT(DISTINCT ip_hash) as count FROM page_visits
      WHERE created_at >= NOW() - INTERVAL '1 day'
    `);

    // 3. Total views semua waktu
    const totalViews = await db.query(`SELECT COUNT(*) as count FROM page_visits`);

    // 4. Total unique visitors semua waktu
    const totalUnique = await db.query(`SELECT COUNT(DISTINCT ip_hash) as count FROM page_visits`);

    // 5. Rata-rata durasi baca (dalam detik), abaikan durasi 0
    const avgDuration = await db.query(`
      SELECT ROUND(AVG(duration_seconds)) as avg_dur FROM page_visits
      WHERE duration_seconds > 0
    `);

    // 6. Grafik kunjungan 7 hari terakhir
    const last7Days = await db.query(`
      SELECT
        TO_CHAR(created_at AT TIME ZONE 'Asia/Jakarta', 'DD Mon') as day,
        COUNT(*) as views,
        COUNT(DISTINCT ip_hash) as unique_visitors
      FROM page_visits
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at AT TIME ZONE 'Asia/Jakarta', 'DD Mon'),
               DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Jakarta')
      ORDER BY DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Jakarta') ASC
    `);

    // 7. Halaman terpopuler (Top 6)
    const topPages = await db.query(`
      SELECT page, COUNT(*) as views, COUNT(DISTINCT ip_hash) as unique_visitors
      FROM page_visits
      GROUP BY page
      ORDER BY views DESC
      LIMIT 6
    `);

    // 8. Distribusi device
    const deviceStats = await db.query(`
      SELECT device_type, COUNT(*) as count
      FROM page_visits
      GROUP BY device_type
      ORDER BY count DESC
    `);

    // 9. Sumber referrer (Top 8)
    const referrerStats = await db.query(`
      SELECT referrer, COUNT(*) as count
      FROM page_visits
      WHERE referrer IS NOT NULL
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 8
    `);

    // 10. Kunjungan terbaru (50 terakhir)
    const recentVisits = await db.query(`
      SELECT page, referrer, device_type, country, city, duration_seconds, created_at
      FROM page_visits
      ORDER BY created_at DESC
      LIMIT 50
    `);

    // 11. Negara teratas (Top 5)
    const topCountries = await db.query(`
      SELECT
        COALESCE(country, 'Unknown') as country,
        COUNT(*) as visits
      FROM page_visits
      GROUP BY country
      ORDER BY visits DESC
      LIMIT 5
    `);

    res.json({
      summary: {
        todayViews: parseInt(todayViews.rows[0].count),
        todayUnique: parseInt(todayUnique.rows[0].count),
        totalViews: parseInt(totalViews.rows[0].count),
        totalUnique: parseInt(totalUnique.rows[0].count),
        avgDurationSeconds: parseInt(avgDuration.rows[0].avg_dur) || 0,
      },
      last7Days: last7Days.rows,
      topPages: topPages.rows,
      deviceStats: deviceStats.rows,
      referrerStats: referrerStats.rows,
      recentVisits: recentVisits.rows,
      topCountries: topCountries.rows,
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data analytics' });
  }
});

// Jalankan server hanya jika tidak berjalan di Vercel (dideteksi dari VERCEL env)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;

// ==============================
// KONFIGURASI MINIO
// ==============================
const Minio = require('minio');
const multer = require('multer');

// Setup multer untuk menerima file upload
// multer menyimpan file sementara di memory sebelum dikirim ke MinIO
const upload = multer({ storage: multer.memoryStorage() });

// Buat koneksi ke MinIO server
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = process.env.MINIO_BUCKET;

// Cek koneksi MinIO saat server start
async function initMinio() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME);
      console.log(`Bucket "${BUCKET_NAME}" berhasil dibuat!`);
    }
    console.log('MINIO TERKONEKSI! ✅');
  } catch (err) {
    console.error('Gagal koneksi ke MinIO:', err.message);
  }
}
initMinio();

// ==============================
// API ENDPOINTS MINIO
// ==============================

// UPLOAD FILE — menerima file dari form dan simpan ke MinIO
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    }

    // Buat nama file unik pakai timestamp supaya tidak bentrok
    const fileName = `${Date.now()}-${req.file.originalname}`;

    // Upload file ke MinIO
    await minioClient.putObject(
      BUCKET_NAME,
      fileName,
      req.file.buffer,
      req.file.size,
      { 'Content-Type': req.file.mimetype }
    );

    res.status(201).json({
      message: 'File berhasil diupload!',
      fileName: fileName,
      size: req.file.size,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Gagal upload file' });
  }
});

// LIST FILES — ambil daftar semua file di bucket
app.get('/api/files', async (req, res) => {
  try {
    const files = [];
    const stream = minioClient.listObjects(BUCKET_NAME, '', true);

    stream.on('data', (obj) => {
      files.push({
        name: obj.name,
        size: obj.size,
        lastModified: obj.lastModified,
      });
    });

    stream.on('end', () => {
      res.json(files);
    });

    stream.on('error', (err) => {
      console.error('List error:', err);
      res.status(500).json({ error: 'Gagal mengambil daftar file' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil daftar file' });
  }
});

// DOWNLOAD FILE — ambil file dari MinIO
app.get('/api/files/:fileName', async (req, res) => {
  try {
    const stat = await minioClient.statObject(BUCKET_NAME, req.params.fileName);
    res.setHeader('Content-Type', stat.metaData['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${req.params.fileName}"`);

    const stream = await minioClient.getObject(BUCKET_NAME, req.params.fileName);
    stream.pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    res.status(404).json({ error: 'File tidak ditemukan' });
  }
});

// DELETE FILE — hapus file dari MinIO
app.delete('/api/files/:fileName', async (req, res) => {
  try {
    await minioClient.removeObject(BUCKET_NAME, req.params.fileName);
    res.json({ message: 'File berhasil dihapus' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Gagal menghapus file' });
  }
});
