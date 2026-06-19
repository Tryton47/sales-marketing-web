const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve file HTML/CSS/JS kamu

// Koneksi ke PostgreSQL (Neon)
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

db.connect((err, client, release) => {
  if (err) {
    console.error('Gagal koneksi ke database:', err.stack);
    return;
  }
  console.log('BERHASIL KONEK CIHUYYYYY!!!');
  release();
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
app.get('/api/orders', (req, res) => {
  const sql = 'SELECT * FROM orders ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.rows);
  });
});

// Update status order
app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE orders SET status = $1 WHERE id = $2';
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status berhasil diupdate' });
  });
});

// Ambil semua data contacts
app.get('/api/contacts', (req, res) => {
  const sql = 'SELECT * FROM contacts ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.rows);
  });
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
app.get('/api/analytics', async (req, res) => {
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
