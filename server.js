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