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

// Jalankan server
app.listen(process.env.PORT, () => {
  console.log(`Server berjalan di http://localhost:${process.env.PORT}`);
});

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
